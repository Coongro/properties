import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';

import { buildingTable } from '../schema/building.js';
import type { BuildingRow, NewBuildingRow } from '../schema/building.js';
import { certificateTable } from '../schema/certificate.js';
import { unitOwnerTable } from '../schema/unit-owner.js';
import { unitTable } from '../schema/unit.js';
import type { NewUnitRow } from '../schema/unit.js';
import {
  buildingAtSameAddress,
  duplicateMessage,
  findDuplicate,
  insideBuildingMessage,
  type PropertyIdentity,
} from '../services/duplicate-property.js';
import { summarizeOwnership } from '../services/ownership-shares.js';
import { deletionBlockedMessage } from '../services/property-deletion.js';
import { isUnitOnlyType, unitOnlyTypeMessage } from '../services/property-type.js';
import { isSingleUnit, singleUnitName } from '../services/single-unit.js';

/** Días de anticipación con que un certificado empieza a mostrarse "por vencer". */
const DEFAULT_ALERT_DAYS = 30;

/**
 * La dirección de una propiedad armada como se escribe: «Belgrano 1240, Rosario».
 *
 * Se exporta para que quien necesite nombrar una propiedad —el listado, y las unidades que
 * cuelgan de ella— use la MISMA dirección. Dos criterios distintos harían que la misma
 * propiedad se lea de dos maneras según la pantalla.
 *
 * Va calificada con el nombre de la tabla (`${buildingTable}."street"`) para que siga
 * resolviendo bien dentro de un join.
 */
export const buildingAddressSql = sql<string | null>`nullif(trim(concat_ws(', ',
  nullif(trim(concat_ws(' ', ${buildingTable}."street", ${buildingTable}."street_number")), ''),
  ${buildingTable}."city"
)), '')`;

/**
 * Una propiedad con lo que el listado necesita mostrar y que no vive en su fila:
 * la dirección armada, cuántas unidades tiene y cuántas están ocupadas, y si sus
 * certificados están al día.
 */
export interface BuildingListRow extends BuildingRow {
  address: string | null;
  unit_count: number;
  occupied_count: number;
  occupancy: string;
  reference_rent: string;
  certs: 'ok' | 'soon' | 'expired';
}

/**
 * El resumen de una propiedad, con lo que además hace falta cuando ES una sola
 * unidad (una casa, un local).
 *
 * Va todo en la MISMA lectura a propósito. La ficha de una casa muestra su
 * estado de ocupación y cómo está repartida su titularidad —datos que viven en
 * la unidad, no en la propiedad—, y resolverlo encadenando tres llamadas desde
 * la pantalla dejaba al agente sin forma de contestar «¿cómo está esta casa?»:
 * la composición vivía en la UI y él solo veía las piezas sueltas.
 */
export interface BuildingSummaryRow extends BuildingListRow {
  /** La unidad, cuando la propiedad es una sola. `null` en un edificio. */
  single_unit_id: string | null;
  /** Su estado de ocupación, con el mismo vocabulario que la unidad. */
  single_unit_status: string | null;
  /** Cómo está repartido su dominio, en una frase. */
  ownership_summary: string | null;
  /** Cuánto falta para el 100 %. 0 si está completo. */
  ownership_missing: number | null;
  /** Si el dominio llega a 100. */
  ownership_complete: boolean | null;
  /** Cuántas personas figuran como dueñas. */
  ownership_owners: number | null;
}

/**
 * Deja a la propiedad con la unidad que le corresponde por su tipo.
 *
 * Se llama después de crear y de editar, con la fila ya escrita:
 *
 *  - una propiedad que ES una sola unidad y no tiene ninguna, la recibe;
 *  - si le cambiaron el nombre, su unidad lo sigue — pero SOLO si se llamaba
 *    como la propiedad. Una unidad rebautizada a mano («Local del frente») es
 *    una decisión de alguien y no se pisa;
 *  - un edificio nunca recibe nada: sus unidades las carga quien lo administra.
 *
 * No borra ni desactiva nada. Un edificio que pasa a ser casa se queda con las
 * unidades que ya tenía: son contratos y titularidades reales, y decidir cuál
 * sobrevive no es algo que deba resolver un `update` en silencio.
 */
async function syncSingleUnit(
  tx: Parameters<Parameters<ModuleDatabaseAPI['ormQuery']>[0]>[0],
  property: BuildingRow,
  previousName: string | null = null
): Promise<void> {
  if (!isSingleUnit(property.type)) return;

  const name = singleUnitName(property);
  const existing = await tx
    .select({ id: unitTable.id, name: unitTable.name })
    .from(unitTable)
    .where(and(eq(unitTable.building_id, property.id), isNull(unitTable.deleted_at)));

  if (existing.length === 0) {
    await tx.insert(unitTable).values({
      building_id: property.id,
      name,
      status: 'vacante',
    });
    return;
  }

  // Con más de una unidad la propiedad ya no es «una sola» en los hechos
  // —alguien la subdividió— y renombrar cualquiera de ellas sería arbitrario.
  if (existing.length > 1) return;

  const only = existing[0];
  const followedTheName = previousName !== null && only.name === previousName;
  if (followedTheName && only.name !== name) {
    await tx.update(unitTable).set({ name }).where(eq(unitTable.id, only.id));
  }
}

/**
 * Frena el alta o la edición que dejaría la misma propiedad cargada dos veces.
 *
 * Se hace acá, en la escritura, y no solo en el formulario: la misma operación
 * entra por la pantalla, por el canal agentic y por cualquier plugin que la
 * llame, y una regla que vive en una sola de las tres puertas no es una regla.
 *
 * Trae las propiedades vivas con las cuatro columnas que identifican —son pocas
 * y angostas incluso en una cartera grande— y deja la decisión en la función
 * pura: normalizar en SQL y en TypeScript por separado terminaría con dos
 * criterios que se contradicen justo en los casos raros, que son estos.
 */
async function rejectIfAlreadyLoaded(
  tx: Parameters<Parameters<ModuleDatabaseAPI['ormQuery']>[0]>[0],
  property: PropertyIdentity & { type?: string | null }
): Promise<void> {
  // Un departamento no es una propiedad, tenga o no su edificio cargado. Va antes
  // que la comparación con lo existente porque no depende de ella: el chequeo de
  // abajo solo lo agarraba cuando el edificio YA estaba, y con el edificio todavía
  // sin cargar la puerta quedaba abierta.
  if (isUnitOnlyType(property.type)) throw new Error(unitOnlyTypeMessage());

  const existing = await tx
    .select({
      id: buildingTable.id,
      name: buildingTable.name,
      type: buildingTable.type,
      street: buildingTable.street,
      street_number: buildingTable.street_number,
      city: buildingTable.city,
    })
    .from(buildingTable)
    .where(isNull(buildingTable.deleted_at));

  const duplicate = findDuplicate(property, existing);
  if (duplicate) throw new Error(duplicateMessage(duplicate));

  // El otro camino a lo mismo: un departamento cargado como propiedad suelta
  // cuando su edificio YA está en el sistema. No es duplicado de otra propiedad
  // —por eso el chequeo de arriba no lo ve— pero es el mismo inmueble entrando
  // por la puerta equivocada.
  if (isSingleUnit(property.type)) {
    const building = buildingAtSameAddress(property, existing);
    if (building) throw new Error(insideBuildingMessage(building));
  }
}

export class BuildingRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  /**
   * Listado de propiedades. Los agregados se resuelven en la misma consulta —
   * traerlos aparte por cada fila haría N+1 y dejaría la lista inconsistente
   * mientras cargan.
   */
  async list({ alertDays = DEFAULT_ALERT_DAYS }: { alertDays?: number } = {}): Promise<
    BuildingListRow[]
  > {
    return this.selectWithSummary({ alertDays });
  }

  /**
   * Los mismos agregados, para un edificio solo: los KPIs de su ficha. Reusa la
   * consulta del listado para que la ficha y la lista nunca digan cosas distintas
   * del mismo inmueble.
   */
  async getSummary({
    id,
    alertDays = DEFAULT_ALERT_DAYS,
  }: {
    id: string;
    alertDays?: number;
  }): Promise<BuildingSummaryRow | undefined> {
    const rows = await this.selectWithSummary({ alertDays, id });
    const building = rows[0];
    if (!building) return undefined;

    const vacio = {
      single_unit_id: null,
      single_unit_status: null,
      ownership_summary: null,
      ownership_missing: null,
      ownership_complete: null,
      ownership_owners: null,
    };
    if (!isSingleUnit(building.type)) return { ...building, ...vacio };

    // Su única unidad. Con más de una la propiedad ya no es «una sola» en los
    // hechos —alguien la subdividió— y no hay una a la que referirse.
    const units = await this.db.ormQuery((tx) =>
      tx
        .select({ id: unitTable.id, status: unitTable.status })
        .from(unitTable)
        .where(and(eq(unitTable.building_id, id), isNull(unitTable.deleted_at)))
        .limit(2)
    );
    if (units.length !== 1) return { ...building, ...vacio };

    const shares = await this.db.ormQuery((tx) =>
      tx
        .select({ role: unitOwnerTable.role, share_pct: unitOwnerTable.share_pct })
        .from(unitOwnerTable)
        .where(and(eq(unitOwnerTable.unit_id, units[0].id), isNull(unitOwnerTable.deleted_at)))
    );
    const ownership = summarizeOwnership(shares);

    return {
      ...building,
      single_unit_id: units[0].id,
      single_unit_status: units[0].status,
      ownership_summary: ownership.summary,
      ownership_missing: ownership.missing,
      ownership_complete: ownership.complete,
      ownership_owners: ownership.owners,
    };
  }

  private async selectWithSummary({
    alertDays,
    id,
  }: {
    alertDays: number;
    id?: string;
  }): Promise<BuildingListRow[]> {
    // ⚠️ Las subconsultas correlacionadas van con ALIAS y la referencia externa
    // calificada con el nombre de la tabla. Interpolar `${unitTable.building_id}`
    // emite `"building_id"` PELADO: dentro del subquery eso resuelve contra la
    // tabla del FROM, así que `where "building_id" = "id"` comparaba units.id
    // contra sí misma y devolvía siempre 0 sin fallar.
    const b = sql`${buildingTable}."id"`;

    // Certificados que alcanzan a esta propiedad: los suyos y los de sus unidades.
    const reaches = sql`
      c.deleted_at is null
      and (
        c.building_id = ${b}
        or c.unit_id in (
          select u2.id from ${unitTable} u2
          where u2.building_id = ${b} and u2.deleted_at is null
        )
      )`;
    // `expires_at` es un DateKey (YYYY-MM-DD): ordena bien como texto, así que se
    // compara contra la fecha de hoy con el mismo formato en vez de castear a date.
    const expiredBefore = (cutoff: ReturnType<typeof sql>) => sql`exists (
      select 1 from ${certificateTable} c
      where ${reaches} and c.expires_at < ${cutoff}
    )`;
    const today = sql`to_char(now(), 'YYYY-MM-DD')`;
    const horizon = sql`to_char(now() + make_interval(days => ${alertDays}), 'YYYY-MM-DD')`;

    const units = (extra: ReturnType<typeof sql> | null) => sql`(
      select count(*) from ${unitTable} u
      where u.building_id = ${b} and u.deleted_at is null ${extra ?? sql``}
    )`;
    // El estado se guarda con el valor del enum del formulario, que está en español.
    const occupied = units(sql`and u.status = 'ocupada'`);
    const total = units(null);

    return this.db.ormQuery((tx) =>
      tx
        .select({
          ...getTableColumns(buildingTable),
          address: buildingAddressSql,
          unit_count: sql<number>`${total}::int`,
          occupied_count: sql<number>`${occupied}::int`,
          // El listado lo muestra como «5 de 6»; los dos números sueltos van igual
          // por si otra vista los necesita por separado.
          occupancy: sql<string>`${occupied}::text || ' de ' || ${total}::text`,
          reference_rent: sql<string>`(
            select coalesce(sum(u.reference_rent::numeric), 0)::text
            from ${unitTable} u
            where u.building_id = ${b} and u.deleted_at is null
          )`,
          certs: sql<'ok' | 'soon' | 'expired'>`case
            when ${expiredBefore(today)} then 'expired'
            when ${expiredBefore(horizon)} then 'soon'
            else 'ok'
          end`,
        })
        .from(buildingTable)
        .where(
          id
            ? and(isNull(buildingTable.deleted_at), eq(buildingTable.id, id))
            : isNull(buildingTable.deleted_at)
        )
        .orderBy(buildingTable.name)
    );
  }

  async getById({ id }: { id: string }): Promise<BuildingRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(buildingTable).where(eq(buildingTable.id, id)).limit(1)
    );
    return rows[0];
  }

  /**
   * Alta de una propiedad. Si NO es un edificio, nace con su única unidad ya
   * adentro: sin ella no se le puede poner dueño ni firmar un contrato, y quien
   * carga una casa no tiene por qué saber que Coongro alquila unidades. Ver
   * `services/single-unit.ts`.
   *
   * Las dos escrituras van en la MISMA transacción: una propiedad a medio crear
   * —sin su unidad— es justamente el estado roto que esto viene a evitar.
   */
  async create({ data }: { data: NewBuildingRow }): Promise<BuildingRow[]> {
    return this.db.ormQuery(async (tx) => {
      await rejectIfAlreadyLoaded(tx, data);
      const rows = await tx.insert(buildingTable).values(data).returning();
      if (rows[0]) await syncSingleUnit(tx, rows[0]);
      return rows;
    });
  }

  /**
   * Edición de una propiedad. Su unidad única la sigue: si le cambian el nombre,
   * la unidad se renombra con ella —salvo que alguien le haya puesto uno propio—
   * y si pasó a ser una sola (de edificio a casa) y no tenía ninguna, se crea.
   * Sin esto, renombrar «Moreno 55» a «Moreno 55 - Local» dejaba en todos los
   * desplegables una unidad con el nombre viejo.
   */
  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewBuildingRow>;
  }): Promise<BuildingRow[]> {
    return this.db.ormQuery(async (tx) => {
      const previous = await tx
        .select({
          name: buildingTable.name,
          street: buildingTable.street,
          street_number: buildingTable.street_number,
          city: buildingTable.city,
        })
        .from(buildingTable)
        .where(eq(buildingTable.id, id))
        .limit(1);
      // Se valida la propiedad COMO VA A QUEDAR: un update parcial que solo
      // manda el nombre igual puede convertirla en la copia de otra.
      await rejectIfAlreadyLoaded(tx, { ...previous[0], ...data, id });
      const rows = await tx
        .update(buildingTable)
        .set(data)
        .where(eq(buildingTable.id, id))
        .returning();
      if (rows[0]) await syncSingleUnit(tx, rows[0], previous[0]?.name ?? null);
      return rows;
    });
  }

  /**
   * Baja lógica de una propiedad, con las unidades que cuelgan de ella.
   *
   * Las unidades se dan de baja en la MISMA transacción y con la MISMA marca de
   * tiempo. Lo primero porque dejarlas vivas las convertía en unidades sin
   * inmueble, que seguían ofreciéndose en los desplegables que piden elegir una;
   * lo segundo porque esa marca compartida es lo único que después distingue «las
   * que se fueron con la propiedad» de las que ya estaban dadas de baja por su
   * cuenta — y es lo que le permite a `restore` devolver exactamente las mismas.
   *
   * Con una unidad ocupada no se borra nada: hay un contrato vigente que Coongro
   * no puede ver entero —lo administra `leases`— y el inmueble se le desaparecería
   * por abajo.
   */
  async delete({ id }: { id: string }): Promise<BuildingRow[]> {
    return this.db.ormQuery(async (tx) => {
      const [property] = await tx
        .select({ name: buildingTable.name })
        .from(buildingTable)
        .where(and(eq(buildingTable.id, id), isNull(buildingTable.deleted_at)))
        .limit(1);
      if (!property) return [];

      const units = await tx
        .select({ name: unitTable.name, status: unitTable.status })
        .from(unitTable)
        .where(and(eq(unitTable.building_id, id), isNull(unitTable.deleted_at)));

      const blocked = deletionBlockedMessage(property, units);
      if (blocked) throw new Error(blocked);

      const deleted_at = new Date().toISOString();
      await tx
        .update(unitTable)
        .set({ deleted_at, is_active: false } as unknown as Partial<NewUnitRow>)
        .where(and(eq(unitTable.building_id, id), isNull(unitTable.deleted_at)));

      return tx
        .update(buildingTable)
        .set({ deleted_at, is_active: false } as unknown as Partial<NewBuildingRow>)
        .where(eq(buildingTable.id, id))
        .returning();
    });
  }

  /**
   * Deshace la baja, y con ella la de sus unidades.
   *
   * Vuelven solo las que se dieron de baja EN ESA operación —las que comparten su
   * marca de tiempo—. Una unidad que alguien había eliminado antes, a mano, se
   * queda donde estaba: restaurar la propiedad no es motivo para resucitarla.
   */
  async restore({ id }: { id: string }): Promise<BuildingRow[]> {
    return this.db.ormQuery(async (tx) => {
      const [property] = await tx
        .select({ deleted_at: buildingTable.deleted_at })
        .from(buildingTable)
        .where(eq(buildingTable.id, id))
        .limit(1);

      if (property?.deleted_at) {
        await tx
          .update(unitTable)
          .set({ deleted_at: null, is_active: true } as unknown as Partial<NewUnitRow>)
          .where(and(eq(unitTable.building_id, id), eq(unitTable.deleted_at, property.deleted_at)));
      }

      return tx
        .update(buildingTable)
        .set({ deleted_at: null, is_active: true } as unknown as Partial<NewBuildingRow>)
        .where(eq(buildingTable.id, id))
        .returning();
    });
  }
}

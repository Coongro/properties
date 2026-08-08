import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, asc, eq, getTableColumns, isNull, or, sql } from 'drizzle-orm';

import { buildingTable } from '../schema/building.js';
import { certificateTable } from '../schema/certificate.js';
import type { CertificateRow, NewCertificateRow } from '../schema/certificate.js';
import { unitTable } from '../schema/unit.js';
// Días de anticipación con que cada tipo de certificado empieza a mostrarse «por vencer»:
// la tabla vive con los tipos, que son de este plugin, y el barrido de leases la importa.
import {
  CERTIFICATE_HORIZONS,
  DEFAULT_CERTIFICATE_HORIZON,
} from '../services/certificate-horizons.js';
import { scopeMismatchMessage } from '../services/property-scope.js';
import type { PropertyScope } from '../services/property-scope.js';
import { unitLabel } from '../services/unit-identity.js';

const DEFAULT_ALERT_DAYS = DEFAULT_CERTIFICATE_HORIZON;

/** Un certificado con su estado ya resuelto contra la fecha de hoy. */
export interface CertificateWithStatus extends CertificateRow {
  status: 'vigente' | 'por_vencer' | 'vencido';
}

/**
 * Un certificado visto desde una unidad, con de dónde le llega.
 *
 * `scope` no es decorativo: decide qué se puede hacer con él desde ahí. Los de la unidad
 * se editan y se borran; los del edificio se ven, porque tocarlos desde una unidad
 * cambiaría lo que ven todas las demás.
 */
export interface CertificateOfUnit extends CertificateWithStatus {
  scope: PropertyScope;
}

/**
 * Lo que se puede escribir de un certificado.
 *
 * Se declara acá en vez de usar el `NewCertificateRow` de drizzle porque en 0.38.x el
 * `$inferInsert` **deja afuera las columnas nullable**: ese tipo dice `{ type, expires_at }` y
 * nada más, así que `building_id` y `unit_id` —los dos que definen el alcance— no existen para
 * TypeScript. El resto del repositorio lo venía esquivando con `as unknown as`; el problema de
 * castear es que después nadie puede leer un campo que el tipo no tiene, que es exactamente con
 * lo que chocó la validación de alcance.
 *
 * Es asignable a lo que drizzle espera (trae `type` y `expires_at`), así que los `insert`/`update`
 * siguen compilando sin un solo cast.
 */
export interface CertificateInput {
  /** La propiedad. Siempre — ver `services/property-scope.ts`. */
  building_id?: string | null;
  /** La unidad, cuando el control es de una puntual. */
  unit_id?: string | null;
  type: string;
  /** DateKey `YYYY-MM-DD`. Sin esto no hay nada que avisar. */
  expires_at: string;
  done_at?: string | null;
  result?: string | null;
  file_url?: string | null;
  alert_days?: number | null;
  notes?: string | null;
}

export class CertificateRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<CertificateRow[]> {
    return this.db.ormQuery((tx) =>
      tx.select().from(certificateTable).where(isNull(certificateTable.deleted_at))
    );
  }

  /**
   * El estado del certificado, resuelto en la consulta contra la fecha de la base.
   *
   * Sale de acá y no de cada lectura porque `listByBuilding` y `listByUnit` muestran los
   * MISMOS certificados desde dos pantallas: si cada una calculara lo suyo, el mismo
   * matafuegos podría leerse «Vigente» en la propiedad y «Por vencer» en la unidad.
   *
   * En la base y no en el navegador por la misma razón, un escalón más abajo: resolverlo
   * en el cliente haría que dos personas en husos distintos vieran vencimientos distintos.
   */
  private statusSql(alertDays: number) {
    // `expires_at` es un DateKey (YYYY-MM-DD): ordena bien como texto, así que se
    // compara contra hoy en el mismo formato en vez de castear a date.
    const today = sql`to_char(now(), 'YYYY-MM-DD')`;
    // Cuántos días antes se avisa: los propios del certificado si los tiene, si no los
    // de su tipo. El mapa es el MISMO que importa el barrido de vencimientos de leases,
    // así que la ficha y esa lista no pueden decir cosas distintas del mismo certificado.
    const dias = sql.join(
      [
        sql`coalesce(${certificateTable.alert_days}, (case ${certificateTable.type}`,
        ...Object.entries(CERTIFICATE_HORIZONS).map(([tipo, d]) => sql`when ${tipo} then ${d}`),
        // El `::int` no es decorativo: los días viajan como parámetros y Postgres
        // los infiere `text`, así que sin el cast el coalesce choca contra
        // `alert_days` (integer) y la consulta entera falla — la ficha mostraba
        // «sin certificados» aunque los hubiera.
        sql`else ${alertDays} end)::int)`,
      ],
      sql` `
    );
    const horizon = sql`to_char(now() + make_interval(days => ${dias}), 'YYYY-MM-DD')`;

    return sql<'vigente' | 'por_vencer' | 'vencido'>`case
      when ${certificateTable.expires_at} < ${today} then 'vencido'
      when ${certificateTable.expires_at} <= ${horizon} then 'por_vencer'
      else 'vigente'
    end`;
  }

  /**
   * Certificados que alcanzan a un edificio: los suyos y los de sus unidades — para
   * el propietario es una sola lista, no le importa a qué nivel está cargado cada uno.
   */
  async listByBuilding({
    buildingId,
    alertDays = DEFAULT_ALERT_DAYS,
  }: {
    buildingId: string;
    alertDays?: number;
  }): Promise<CertificateWithStatus[]> {
    // Con alias: interpolar `${unitTable.id}` emite `"id"` pelado y, dentro del
    // subquery, esa columna resuelve contra la tabla equivocada.
    const unitsOfBuilding = sql`(
      select u.id from ${unitTable} u
      where u.building_id = ${buildingId} and u.deleted_at is null
    )`;

    return this.db.ormQuery((tx) =>
      tx
        .select({
          ...getTableColumns(certificateTable),
          status: this.statusSql(alertDays),
        })
        .from(certificateTable)
        .where(
          and(
            isNull(certificateTable.deleted_at),
            or(
              eq(certificateTable.building_id, buildingId),
              sql`${certificateTable.unit_id} in ${unitsOfBuilding}`
            )
          )
        )
        // Lo que vence primero es lo que hay que resolver primero.
        .orderBy(asc(certificateTable.expires_at))
    );
  }

  /**
   * Certificados que alcanzan a UNA unidad: los suyos y los del edificio donde está.
   *
   * Las dos mitades responden la pregunta que se hace quien mira la ficha de la unidad
   * —«¿está en regla para alquilarse?»— y ninguna sola alcanza. El gas del 3°B es del
   * 3°B; el ascensor es del edificio y lo cubre igual. Mostrar solo los propios daría a
   * entender que la unidad está al día cuando el ascensor está vencido.
   *
   * Lo que NO entra son los certificados de las unidades hermanas: el gas del 5°A no
   * dice nada del 3°B. Por eso la mitad del edificio pide `unit_id is null` — un
   * certificado del edificio SIN unidad es el que alcanza a todas.
   *
   * `scope` viaja en la fila porque desde acá no se puede tratar a los dos igual: los
   * del edificio se ven, pero se administran desde su propiedad — tocarlos desde una
   * unidad cambiaría lo que ven todas las demás.
   */
  async listByUnit({
    unitId,
    alertDays = DEFAULT_ALERT_DAYS,
  }: {
    unitId: string;
    alertDays?: number;
  }): Promise<CertificateOfUnit[]> {
    if (!unitId) return [];

    const buildingOfUnit = sql`(
      select u.building_id from ${unitTable} u where u.id = ${unitId}
    )`;

    return this.db.ormQuery((tx) =>
      tx
        .select({
          ...getTableColumns(certificateTable),
          status: this.statusSql(alertDays),
          scope: sql<PropertyScope>`case
            when ${certificateTable.unit_id} = ${unitId} then 'unidad'
            else 'edificio'
          end`,
        })
        .from(certificateTable)
        .where(
          and(
            isNull(certificateTable.deleted_at),
            or(
              eq(certificateTable.unit_id, unitId),
              and(
                sql`${certificateTable.building_id} = ${buildingOfUnit}`,
                isNull(certificateTable.unit_id)
              )
            )
          )
        )
        .orderBy(asc(certificateTable.expires_at))
    );
  }

  async getById({ id }: { id: string }): Promise<CertificateRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(certificateTable).where(eq(certificateTable.id, id)).limit(1)
    );
    return rows[0];
  }

  /**
   * Frena el certificado cuya unidad no pertenece a la propiedad elegida.
   *
   * Se hace en la escritura y no en el formulario porque la misma operación entra por
   * la pantalla, por el canal agentic y por cualquier plugin que la llame. Y hace
   * falta: el desplegable de unidades del formulario lista las de TODA la cartera, así
   * que elegir una de otra propiedad es un click, no una rareza.
   *
   * La decisión la toma la función pura; acá solo se le traen los dos datos que no
   * tiene a mano — de qué propiedad es realmente la unidad, y cómo se llama cada una
   * para poder decirlo.
   */
  private async rejectIfScopeDoesNotMatch(certificate: Partial<CertificateInput>): Promise<void> {
    const unitId = String(certificate.unit_id ?? '').trim();
    const buildingId = String(certificate.building_id ?? '').trim();

    const [unit] = unitId
      ? await this.db.ormQuery((tx) =>
          tx
            .select({
              name: unitTable.name,
              building_id: unitTable.building_id,
              building_name: buildingTable.name,
            })
            .from(unitTable)
            .leftJoin(buildingTable, eq(buildingTable.id, unitTable.building_id))
            .where(eq(unitTable.id, unitId))
            .limit(1)
        )
      : [];

    const [building] = buildingId
      ? await this.db.ormQuery((tx) =>
          tx
            .select({ name: buildingTable.name })
            .from(buildingTable)
            .where(eq(buildingTable.id, buildingId))
            .limit(1)
        )
      : [];

    const blocked = scopeMismatchMessage(
      certificate,
      unit
        ? {
            label: unitLabel({
              unitName: unit.name,
              buildingName: unit.building_name,
              buildingAddress: null,
            }),
            buildingId: unit.building_id,
          }
        : undefined,
      building,
      'Un certificado'
    );
    if (blocked) throw new Error(blocked);
  }

  async create({ data }: { data: CertificateInput }): Promise<CertificateRow[]> {
    await this.rejectIfScopeDoesNotMatch(data);
    return this.db.ormQuery((tx) => tx.insert(certificateTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<CertificateInput>;
  }): Promise<CertificateRow[]> {
    // Se valida el certificado COMO VA A QUEDAR: un update parcial que solo cambia la
    // unidad tiene que compararse contra la propiedad que ya tenía guardada.
    const previous = await this.getById({ id });
    await this.rejectIfScopeDoesNotMatch({ ...previous, ...data });

    return this.db.ormQuery((tx) =>
      tx.update(certificateTable).set(data).where(eq(certificateTable.id, id)).returning()
    );
  }

  async delete({ id }: { id: string }): Promise<CertificateRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(certificateTable)
        .set({
          deleted_at: new Date().toISOString(),
          is_active: false,
        } as unknown as Partial<NewCertificateRow>)
        .where(eq(certificateTable.id, id))
        .returning()
    );
  }

  async restore({ id }: { id: string }): Promise<CertificateRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(certificateTable)
        .set({ deleted_at: null, is_active: true } as unknown as Partial<NewCertificateRow>)
        .where(eq(certificateTable.id, id))
        .returning()
    );
  }
}

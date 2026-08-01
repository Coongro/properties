import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, eq, getTableColumns, isNull, sql } from 'drizzle-orm';

import { buildingTable } from '../schema/building.js';
import type { BuildingRow, NewBuildingRow } from '../schema/building.js';
import { certificateTable } from '../schema/certificate.js';
import { unitTable } from '../schema/unit.js';

/** Días de anticipación con que un certificado empieza a mostrarse "por vencer". */
const DEFAULT_ALERT_DAYS = 30;

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
  }): Promise<BuildingListRow | undefined> {
    const rows = await this.selectWithSummary({ alertDays, id });
    return rows[0];
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
          address: sql<string | null>`nullif(trim(concat_ws(', ',
            nullif(trim(concat_ws(' ', ${buildingTable}."street", ${buildingTable}."street_number")), ''),
            ${buildingTable}."city"
          )), '')`,
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

  async create({ data }: { data: NewBuildingRow }): Promise<BuildingRow[]> {
    return this.db.ormQuery((tx) => tx.insert(buildingTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewBuildingRow>;
  }): Promise<BuildingRow[]> {
    return this.db.ormQuery((tx) =>
      tx.update(buildingTable).set(data).where(eq(buildingTable.id, id)).returning()
    );
  }

  async delete({ id }: { id: string }): Promise<BuildingRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(buildingTable)
        .set({
          deleted_at: new Date().toISOString(),
          is_active: false,
        } as unknown as Partial<NewBuildingRow>)
        .where(eq(buildingTable.id, id))
        .returning()
    );
  }

  async restore({ id }: { id: string }): Promise<BuildingRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(buildingTable)
        .set({ deleted_at: null, is_active: true } as unknown as Partial<NewBuildingRow>)
        .where(eq(buildingTable.id, id))
        .returning()
    );
  }
}

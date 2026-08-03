import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, asc, eq, getTableColumns, isNull, or, sql } from 'drizzle-orm';

import { certificateTable } from '../schema/certificate.js';
import type { CertificateRow, NewCertificateRow } from '../schema/certificate.js';
import { unitTable } from '../schema/unit.js';
// Días de anticipación con que cada tipo de certificado empieza a mostrarse «por vencer»:
// la tabla vive con los tipos, que son de este plugin, y el barrido de leases la importa.
import {
  CERTIFICATE_HORIZONS,
  DEFAULT_CERTIFICATE_HORIZON,
} from '../services/certificate-horizons.js';

const DEFAULT_ALERT_DAYS = DEFAULT_CERTIFICATE_HORIZON;

/** Un certificado con su estado ya resuelto contra la fecha de hoy. */
export interface CertificateWithStatus extends CertificateRow {
  status: 'vigente' | 'por_vencer' | 'vencido';
}

export class CertificateRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<CertificateRow[]> {
    return this.db.ormQuery((tx) =>
      tx.select().from(certificateTable).where(isNull(certificateTable.deleted_at))
    );
  }

  /**
   * Certificados que alcanzan a un edificio: los suyos y los de sus unidades — para
   * el propietario es una sola lista, no le importa a qué nivel está cargado cada uno.
   *
   * El estado se calcula en la consulta contra la fecha de la base: si lo resolviera
   * el navegador, dos usuarios en husos distintos verían vencimientos distintos.
   */
  async listByBuilding({
    buildingId,
    alertDays = DEFAULT_ALERT_DAYS,
  }: {
    buildingId: string;
    alertDays?: number;
  }): Promise<CertificateWithStatus[]> {
    // `expires_at` es un DateKey (YYYY-MM-DD): ordena bien como texto, así que se
    // compara contra hoy en el mismo formato en vez de castear a date.
    const today = sql`to_char(now(), 'YYYY-MM-DD')`;
    // Cuántos días antes se avisa: los propios del certificado si los tiene, si no los
    // de su tipo. El mapa es el MISMO que usa el barrido de vencimientos, así que la
    // ficha y la lista no pueden decir cosas distintas del mismo certificado.
    const dias = sql.join(
      [
        sql`coalesce(${certificateTable.alert_days}, case ${certificateTable.type}`,
        ...Object.entries(CERTIFICATE_HORIZONS).map(([tipo, d]) => sql`when ${tipo} then ${d}`),
        sql`else ${alertDays} end)`,
      ],
      sql` `
    );
    const horizon = sql`to_char(now() + make_interval(days => ${dias}), 'YYYY-MM-DD')`;
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
          status: sql<'vigente' | 'por_vencer' | 'vencido'>`case
            when ${certificateTable.expires_at} < ${today} then 'vencido'
            when ${certificateTable.expires_at} <= ${horizon} then 'por_vencer'
            else 'vigente'
          end`,
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

  async getById({ id }: { id: string }): Promise<CertificateRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(certificateTable).where(eq(certificateTable.id, id)).limit(1)
    );
    return rows[0];
  }

  async create({ data }: { data: NewCertificateRow }): Promise<CertificateRow[]> {
    return this.db.ormQuery((tx) => tx.insert(certificateTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewCertificateRow>;
  }): Promise<CertificateRow[]> {
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

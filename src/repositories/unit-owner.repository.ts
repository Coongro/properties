import { contactTable } from '@coongro/contacts/server';
import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';

import { unitOwnerTable } from '../schema/unit-owner.js';
import type { UnitOwnerRow, NewUnitOwnerRow } from '../schema/unit-owner.js';
import { unitTable } from '../schema/unit.js';

/**
 * Un propietario tal como lo muestra su listado. No hay entidad `owner`: es un
 * contacto de `@coongro/contacts` que tiene al menos una unidad a su nombre, más
 * lo que el kit le agrega — el reparto de unidades y los datos de cobro, que viven
 * en `contacts.metadata` para no meter vocabulario de alquileres en un plugin
 * que también usa la veterinaria.
 */
export interface OwnerListRow {
  id: string;
  name: string;
  document: string | null;
  units: string;
  unit_count: number;
  cbu: string | null;
  alias: string | null;
  bank: string | null;
  photo_url: string | null;
}

export class UnitOwnerRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<UnitOwnerRow[]> {
    return this.db.ormQuery((tx) =>
      tx.select().from(unitOwnerTable).where(isNull(unitOwnerTable.deleted_at))
    );
  }

  /**
   * Propietarios con cuántas unidades tienen y con qué participación. El join va en
   * la base y no componiendo dos RPC en el navegador: son dos tablas del mismo
   * schema del tenant y traerlas por separado sería N+1.
   */
  async listOwners(): Promise<OwnerListRow[]> {
    const c = sql`${contactTable}."id"`;
    // Unidades a nombre de este contacto (con alias: ver el gotcha de las
    // subconsultas correlacionadas — sin calificar, la columna resuelve mal).
    const owned = sql`(
      select count(*) from ${unitOwnerTable} o
      join ${unitTable} u on u.id = o.unit_id and u.deleted_at is null
      where o.contact_id = ${c} and o.deleted_at is null
    )`;

    return this.db.ormQuery((tx) =>
      tx
        .select({
          id: contactTable.id,
          name: contactTable.name,
          // «CUIT 27-11402887-3»: el tipo se guarda en minúscula (valor del enum) y
          // acá se muestra como se escribe.
          document: sql<string | null>`nullif(trim(concat_ws(' ',
            upper(${contactTable}."document_type"), ${contactTable}."document_number")), '')`,
          unit_count: sql<number>`${owned}::int`,
          // «4 unidades · 100%»: la participación se promedia porque puede diferir
          // por unidad (una heredada al 50%, otra propia al 100%).
          units: sql<string>`case when ${owned} = 0 then 'Sin unidades' else
            ${owned}::text || ' unidad' || (case when ${owned} = 1 then '' else 'es' end)
            || coalesce(' · ' || (
              select round(avg(o2.share_pct))::text from ${unitOwnerTable} o2
              where o2.contact_id = ${c} and o2.deleted_at is null and o2.share_pct is not null
            ) || '%', '') end`,
          // Los datos de cobro viven en `metadata` del contacto: son vocabulario de
          // alquileres y `contacts` lo comparte con otros kits.
          //
          // La columna muestra el alias si está cargado y, si no, el CBU: con
          // cualquiera de los dos se transfiere, pero el alias es el que la persona
          // reconoce y dicta por teléfono.
          cbu: sql<string | null>`coalesce(
            nullif(${contactTable}."metadata"->>'alias', ''),
            ${contactTable}."metadata"->>'cbu'
          )`,
          alias: sql<string | null>`${contactTable}."metadata"->>'alias'`,
          bank: sql<string | null>`${contactTable}."metadata"->>'bank'`,
          photo_url: contactTable.avatar_url,
        })
        .from(contactTable)
        .where(
          and(
            isNull(contactTable.deleted_at),
            // Los registrados como propietarios aparecen aunque todavía no tengan
            // ninguna unidad — si no, cargás uno y la lista sigue vacía. Y también
            // entra cualquier contacto que figure como titular de una unidad,
            // aunque en `contacts` esté con otro tipo.
            sql`(${contactTable}."type" = 'owner' or ${owned} > 0)`
          )
        )
        .orderBy(asc(contactTable.name))
    );
  }

  async getById({ id }: { id: string }): Promise<UnitOwnerRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(unitOwnerTable).where(eq(unitOwnerTable.id, id)).limit(1)
    );
    return rows[0];
  }

  async create({ data }: { data: NewUnitOwnerRow }): Promise<UnitOwnerRow[]> {
    return this.db.ormQuery((tx) => tx.insert(unitOwnerTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewUnitOwnerRow>;
  }): Promise<UnitOwnerRow[]> {
    return this.db.ormQuery((tx) =>
      tx.update(unitOwnerTable).set(data).where(eq(unitOwnerTable.id, id)).returning()
    );
  }

  async delete({ id }: { id: string }): Promise<UnitOwnerRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(unitOwnerTable)
        .set({
          deleted_at: new Date().toISOString(),
          is_active: false,
        } as unknown as Partial<NewUnitOwnerRow>)
        .where(eq(unitOwnerTable.id, id))
        .returning()
    );
  }

  async restore({ id }: { id: string }): Promise<UnitOwnerRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(unitOwnerTable)
        .set({ deleted_at: null, is_active: true } as unknown as Partial<NewUnitOwnerRow>)
        .where(eq(unitOwnerTable.id, id))
        .returning()
    );
  }
}

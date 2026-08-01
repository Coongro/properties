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

/**
 * Datos de cobro y condición fiscal: son vocabulario de alquileres, y `contacts` es un
 * plugin compartido que también usa la veterinaria. Por eso viajan en `metadata` y no
 * como columnas.
 */
const OWNER_METADATA_KEYS = ['tax_condition', 'bank', 'account', 'cbu', 'alias'] as const;

/** Lo que manda el formulario de propietario: columnas del contacto + sus extras. */
export interface OwnerInput {
  name?: unknown;
  document_type?: unknown;
  document_number?: unknown;
  email?: unknown;
  phone?: unknown;
  address?: unknown;
  tax_condition?: unknown;
  bank?: unknown;
  account?: unknown;
  cbu?: unknown;
  alias?: unknown;
}

const texto = (v: unknown): string => String(v ?? '').trim();

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

  /**
   * Un propietario con la forma que espera su formulario: las columnas del contacto y
   * los datos de cobro sacados de `metadata`, todos al mismo nivel.
   *
   * Aplanar acá y no en la vista es lo que permite que el Copilot lea un propietario
   * igual que la pantalla, sin saber que hay un `metadata` de por medio.
   */
  async getOwner({ id }: { id: string }): Promise<Record<string, unknown>> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select({
          id: contactTable.id,
          name: contactTable.name,
          document_type: contactTable.document_type,
          document_number: contactTable.document_number,
          email: contactTable.email,
          phone: contactTable.phone,
          address: contactTable.address,
          metadata: contactTable.metadata,
        })
        .from(contactTable)
        .where(eq(contactTable.id, id))
        .limit(1)
    );
    const fila = rows[0] as
      | (Record<string, unknown> & { metadata?: Record<string, unknown> })
      | undefined;
    if (!fila) return {};

    const { metadata, ...columnas } = fila;
    const extras: Record<string, unknown> = {};
    for (const clave of OWNER_METADATA_KEYS) {
      const valor = (metadata ?? {})[clave];
      if (valor !== null && valor !== undefined) extras[clave] = valor;
    }
    return { ...columnas, ...extras };
  }

  /**
   * Alta y edición de un propietario, en una sola operación.
   *
   * Es un comando y no un CRUD porque guardar un propietario no es escribir una fila:
   * hay que decidir qué va en columnas y qué en `metadata`, respetar lo que otro rol le
   * puso a ese mismo contacto, y fijar el tipo solo cuando nace. Con CRUD suelto, cada
   * cliente (la web, el Copilot, un import) tendría que repetir esas tres reglas — y la
   * primera vez que una se olvide, se borran datos de alguien.
   */
  async saveOwner({
    id,
    data,
  }: {
    id?: string | null;
    data: OwnerInput;
  }): Promise<{ id: string; created: boolean }> {
    const nombre = texto(data.name);
    if (!nombre) throw new Error('El propietario necesita un nombre.');

    // `metadata` es de todo el contacto, no de este formulario: ahí conviven los datos
    // que le cargó «Inquilino» y lo que guarde cualquier otro kit. Se parte de la
    // actual y solo se tocan las claves propias — vaciar una acá sí la quita.
    const actual = id ? await this.contactoPorId(id) : undefined;
    const metadata: Record<string, unknown> = { ...(actual?.metadata ?? {}) };
    for (const clave of OWNER_METADATA_KEYS) {
      const valor = texto(data[clave]);
      if (valor) metadata[clave] = valor;
      else delete metadata[clave];
    }

    const columnas = {
      name: nombre,
      document_type: texto(data.document_type) || null,
      document_number: texto(data.document_number) || null,
      email: texto(data.email) || null,
      phone: texto(data.phone) || null,
      address: texto(data.address) || null,
      metadata,
    };

    if (id) {
      // Al actualizar NO se toca `type`: la misma persona puede ser propietaria de una
      // unidad e inquilina de otra, y `contacts.type` guarda un solo rol.
      await this.db.ormQuery((tx) =>
        tx
          .update(contactTable)
          .set(columnas as never)
          .where(eq(contactTable.id, id))
      );
      return { id, created: false };
    }

    const creados = await this.db.ormQuery((tx) =>
      tx
        .insert(contactTable)
        .values({
          ...columnas,
          type: 'owner',
          // `is_active` es NOT NULL y no tiene default: sin esto el insert muere.
          is_active: true,
        } as never)
        .returning({ id: contactTable.id })
    );
    const nuevo = creados[0]?.id;
    if (!nuevo) throw new Error('No se pudo crear el propietario.');
    return { id: String(nuevo), created: true };
  }

  /** El contacto crudo, para saber qué había en `metadata` antes de tocarla. */
  private async contactoPorId(
    id: string
  ): Promise<{ metadata?: Record<string, unknown> } | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select({ metadata: contactTable.metadata })
        .from(contactTable)
        .where(eq(contactTable.id, id))
        .limit(1)
    );
    return rows[0] as { metadata?: Record<string, unknown> } | undefined;
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

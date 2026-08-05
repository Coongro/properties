import { ContactRepository, contactTable } from '@coongro/contacts/server';
import type { NewContactRow } from '@coongro/contacts/server';
import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, asc, eq, isNull, ne, sql, type SQL } from 'drizzle-orm';

import { unitOwnerTable } from '../schema/unit-owner.js';
import type { UnitOwnerRow, NewUnitOwnerRow } from '../schema/unit-owner.js';
import { unitTable } from '../schema/unit.js';
import {
  DEFAULT_OWNER_ROLE,
  OWNER_ROLES,
  axisForRole,
  checkOwnershipShares,
  isOwnerRole,
  summarizeOwnership,
} from '../services/ownership-shares.js';
import type { OwnerRole, OwnershipSummary } from '../services/ownership-shares.js';

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
  /** De qué unidad es dueño. Opcional: sin esto se guarda solo la persona. */
  unit_id?: unknown;
  /** Con qué porcentaje figura en esa unidad. */
  share_pct?: unknown;
  /** Con qué carácter: titular, cotitular, usufructuario o nudo propietario. */
  role?: unknown;
}

/**
 * Un dueño de una unidad, como lo muestra la ficha de esa unidad: quién es, con qué parte
 * y con qué carácter.
 */
export interface UnitOwnerListRow {
  /** El id del VÍNCULO, no el de la persona. */
  id: string;
  /**
   * La unidad a la que pertenece este vínculo. Viaja en la fila para que dar de baja a un
   * titular no dependa de qué pantalla lo pide: la acción de fila recibe la fila, no el
   * registro de la vista.
   */
  unit_id: string;
  contact_id: string;
  name: string;
  document: string | null;
  share_pct: string | null;
  /** «50 %», o «Sin definir» cuando la parte todavía no se cargó. */
  share_label: string;
  role: string;
  photo_url: string | null;
}

/** Lo que se va a escribir en el vínculo, ya validado contra el resto de los dueños. */
interface OwnershipPlan {
  unitId: string;
  share: number | null;
  role: OwnerRole;
  /** Cómo quedó la unidad, en una frase. Es lo que se le devuelve a quien guardó. */
  summary: string;
}

const text = (v: unknown): string => String(v ?? '').trim();

const optionalNumber = (v: unknown): number | null => {
  const raw = text(v);
  if (!raw) return null;
  const n = Number(raw.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

export class UnitOwnerRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<UnitOwnerRow[]> {
    return this.db.ormQuery((tx) =>
      tx.select().from(unitOwnerTable).where(isNull(unitOwnerTable.deleted_at))
    );
  }

  /**
   * Quiénes son los dueños de UNA unidad, con su participación y su carácter.
   *
   * Es la lectura que faltaba para poder mirar la titularidad parado en la unidad, que es
   * donde el 100 % significa algo: en la ficha de una persona nunca se ve si a la unidad
   * le falta asignar una parte.
   */
  async listByUnit({ unitId }: { unitId: string }): Promise<UnitOwnerListRow[]> {
    return this.selectOwners(eq(unitOwnerTable.unit_id, unitId));
  }

  /**
   * Los dueños de una PROPIEDAD entera, sin pasar por sus unidades.
   *
   * Existe para la ficha de una casa o un local, que son una sola unidad: ahí la
   * titularidad se mira parado en la propiedad, y quien la mira no tiene por qué
   * saber que por debajo hay una unidad. Resolverlo desde la pantalla —listar las
   * unidades y después preguntar por la primera— dejaba la composición en la UI,
   * donde un agente no la puede repetir: él ve las piezas, no el camino.
   *
   * En un edificio devuelve los dueños de TODAS sus unidades, que es la lectura
   * honesta de la pregunta «¿de quién es esto?».
   */
  async listByBuilding({ buildingId }: { buildingId: string }): Promise<UnitOwnerListRow[]> {
    return this.selectOwners(
      sql`${unitOwnerTable}."unit_id" in (
        select u.id from ${unitTable} u
        where u.building_id = ${buildingId} and u.deleted_at is null
      )`
    );
  }

  /** El select de un dueño, que las dos lecturas comparten para leerse igual. */
  private async selectOwners(scope: SQL): Promise<UnitOwnerListRow[]> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select({
          id: unitOwnerTable.id,
          unit_id: unitOwnerTable.unit_id,
          contact_id: unitOwnerTable.contact_id,
          share_pct: unitOwnerTable.share_pct,
          role: unitOwnerTable.role,
          name: contactTable.name,
          document: sql<string | null>`nullif(trim(concat_ws(' ',
            upper(${contactTable}."document_type"), ${contactTable}."document_number")), '')`,
          photo_url: contactTable.avatar_url,
        })
        .from(unitOwnerTable)
        .innerJoin(contactTable, eq(contactTable.id, unitOwnerTable.contact_id))
        .where(and(scope, isNull(unitOwnerTable.deleted_at)))
        .orderBy(asc(contactTable.name))
    );

    return rows.map((f) => ({
      ...f,
      // «50 %» en vez de «50.00»: la tabla lo muestra tal cual y el Copilot lo lee igual.
      share_label: f.share_pct === null ? 'Sin definir' : `${Number(f.share_pct)} %`,
      role: f.role ?? DEFAULT_OWNER_ROLE,
    }));
  }

  /**
   * Cómo está repartida una unidad: si el dominio llega a 100 y, si no, cuánto falta.
   *
   * Va aparte del listado porque responde otra pregunta —«¿está completa?» en vez de
   * «¿quiénes son?»— y porque la regla del reparto es del servidor: si cada pantalla
   * sumara los porcentajes por su cuenta, la primera que se olvide de separar el usufructo
   * diría que una unidad está al 200 %.
   */
  async ownershipOf({ unitId }: { unitId: string }): Promise<OwnershipSummary> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select({ role: unitOwnerTable.role, share_pct: unitOwnerTable.share_pct })
        .from(unitOwnerTable)
        .where(and(eq(unitOwnerTable.unit_id, unitId), isNull(unitOwnerTable.deleted_at)))
    );
    return summarizeOwnership(rows);
  }

  /**
   * Saca a una persona de la titularidad de una unidad.
   *
   * Es baja lógica: el vínculo queda marcado y se puede volver a cargar con «Guardar un
   * propietario», así que un error de carga se corrige sin perder a la persona —el
   * contacto no se toca, sigue existiendo con sus datos y sus otras unidades.
   *
   * NO se rechaza dejar la unidad sin dueños ni por debajo de 100: quien se equivocó de
   * persona tiene que poder sacarla, y bloquear eso obligaría a inventar un titular falso
   * para poder corregir. Lo que sí se hace es devolver cómo quedó la unidad.
   */
  async removeOwner({
    unitId,
    contactId,
  }: {
    unitId: string;
    contactId: string;
  }): Promise<{ removed: boolean; ownership: string }> {
    const current = await this.currentLink(unitId, contactId);
    if (!current) {
      throw new Error('Esa persona no figura como dueña de esta unidad.');
    }

    await this.db.ormQuery((tx) =>
      tx
        .update(unitOwnerTable)
        .set({
          deleted_at: new Date().toISOString(),
          is_active: false,
        } as unknown as Partial<NewUnitOwnerRow>)
        .where(eq(unitOwnerTable.id, current.id))
    );

    const state = await this.ownershipOf({ unitId });
    return { removed: true, ownership: state.summary };
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
            ${owned}::text || ' unit' || (case when ${owned} = 1 then '' else 'es' end)
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
    const row = rows[0] as
      | (Record<string, unknown> & { metadata?: Record<string, unknown> })
      | undefined;
    if (!row) return {};

    const { metadata, ...columns } = row;
    const extras: Record<string, unknown> = {};
    for (const key of OWNER_METADATA_KEYS) {
      const value = (metadata ?? {})[key];
      if (value !== null && value !== undefined) extras[key] = value;
    }

    // La unidad viene precargada SOLO si tiene una sola: así, editarle el teléfono no le
    // duplica el vínculo ni le cambia el porcentaje sin querer. Con varias, el formulario
    // abre vacío y lo que se cargue agrega o corrige una — nunca toca las otras. Para verlas
    // todas está el listado de propietarios, que dice cuántas y con qué participación.
    const links = await this.linksOf(id);
    const only = links.length === 1 ? links[0] : undefined;

    return {
      ...columns,
      ...extras,
      unit_id: only?.unit_id ?? null,
      share_pct: only?.share_pct ?? null,
      role: only?.role ?? null,
    };
  }

  /** Las unidades a nombre de esta persona, con su participación. */
  private async linksOf(
    contactId: string
  ): Promise<{ unit_id: string; share_pct: string | null; role: string | null }[]> {
    return this.db.ormQuery((tx) =>
      tx
        .select({
          unit_id: unitOwnerTable.unit_id,
          share_pct: unitOwnerTable.share_pct,
          role: unitOwnerTable.role,
        })
        .from(unitOwnerTable)
        .innerJoin(
          unitTable,
          and(eq(unitTable.id, unitOwnerTable.unit_id), isNull(unitTable.deleted_at))
        )
        .where(and(eq(unitOwnerTable.contact_id, contactId), isNull(unitOwnerTable.deleted_at)))
    );
  }

  /**
   * Alta y edición de un propietario, en una sola operación, junto con la unidad de la que
   * es dueño y con qué participación.
   *
   * Es un comando y no un CRUD porque guardar un propietario no es escribir una fila:
   * hay que decidir qué va en columnas y qué en `metadata`, respetar lo que otro rol le
   * puso a ese mismo contacto, fijar el tipo solo cuando nace, y —desde COONG-294— no
   * dejar que las participaciones de una unidad pasen de 100 %. Con CRUD suelto, cada
   * cliente (la web, el Copilot, un import) tendría que repetir esas reglas — y la
   * primera vez que una se olvide, se borran datos de alguien o se gira de más.
   *
   * La unidad es opcional: sin ella se guarda solo la persona, que es lo que hacía esta
   * operación antes. Con ella, el vínculo se crea o se corrige, y NUNCA se tocan los
   * vínculos de esa persona con otras unidades ni los de los demás dueños de esta.
   */
  async saveOwner({
    id,
    data,
  }: {
    id?: string | null;
    data: OwnerInput;
  }): Promise<{ id: string; created: boolean; ownership: string | null }> {
    const name = text(data.name);
    if (!name) throw new Error('El propietario necesita un nombre.');

    // Se valida ANTES de escribir el contacto: si el porcentaje no cierra, la persona no
    // queda creada a medias esperando un vínculo que nunca llegó.
    const plan = await this.planLink({ contactId: id ?? null, data });

    // `metadata` es de todo el contacto, no de este formulario: ahí conviven los datos
    // que le cargó «Inquilino» y lo que guarde cualquier otro kit. Se parte de la
    // actual y solo se tocan las claves propias — vaciar una acá sí la quita.
    const actual = id ? await this.contactoPorId(id) : undefined;
    const metadata: Record<string, unknown> = { ...(actual?.metadata ?? {}) };
    for (const key of OWNER_METADATA_KEYS) {
      const value = text(data[key]);
      if (value) metadata[key] = value;
      else delete metadata[key];
    }

    const columns = {
      name: name,
      document_type: text(data.document_type) || null,
      document_number: text(data.document_number) || null,
      email: text(data.email) || null,
      phone: text(data.phone) || null,
      address: text(data.address) || null,
      metadata,
    };

    // Escribir es del dueño de la entidad: un contacto lo crea y lo edita
    // `ContactRepository`, no esta tabla. Cuando escribíamos el `insert` a mano, cada
    // invariante que agregaba `contacts` nos rompía de a una —primero `is_active`,
    // después `id`— y solo nos enterábamos cuando fallaba un alta.
    //
    // Las LECTURAS de más arriba sí siguen resolviéndose con join: traer el listado de
    // propietarios registro por registro sería una consulta por fila.
    const contactos = new ContactRepository(this.db);

    if (id) {
      // Al actualizar NO se toca `type`: la misma persona puede ser propietaria de una
      // unidad e inquilina de otra, y `contacts.type` guarda un solo rol.
      await contactos.update({ id, data: columns as Partial<NewContactRow> });
      return { id, created: false, ownership: await this.applyLink(id, plan) };
    }

    const inserted = await contactos.create({
      data: { ...columns, type: 'owner' } as NewContactRow,
    });
    const newId = inserted[0]?.id;
    if (!newId) throw new Error('No se pudo crear el propietario.');
    return {
      id: String(newId),
      created: true,
      ownership: await this.applyLink(String(newId), plan),
    };
  }

  /**
   * Decide qué se va a escribir en el vínculo con la unidad, o `null` si no hay unidad.
   *
   * Todo lo que puede fallar se resuelve acá —que la unidad exista, que el rol sea uno de
   * los cuatro, que el porcentaje no pase de 100 entre todos los dueños— para que la
   * escritura de más abajo no tenga forma de dejar las cosas por la mitad.
   */
  private async planLink({
    contactId,
    data,
  }: {
    contactId: string | null;
    data: OwnerInput;
  }): Promise<OwnershipPlan | null> {
    const unitId = text(data.unit_id);
    const share = optionalNumber(data.share_pct);
    const rolPedido = text(data.role);

    if (!unitId) {
      // Mandar participación o rol sin decir de qué unidad no se puede cumplir. Callarlo
      // haría que el Copilot crea que vinculó algo: es más barato el error.
      if (share !== null || rolPedido) {
        throw new Error(
          'Para registrar la participación o el rol hay que indicar de qué unidad se trata.'
        );
      }
      return null;
    }

    if (rolPedido && !isOwnerRole(rolPedido)) {
      throw new Error(`El rol «${rolPedido}» no existe. Opciones: ${OWNER_ROLES.join(', ')}.`);
    }

    const unit = await this.unitById(unitId);
    if (!unit) throw new Error('La unidad indicada no existe o fue eliminada.');

    const current = contactId ? await this.currentLink(unitId, contactId) : undefined;
    // Al editar sin aclarar el rol se conserva el que tenía: cambiar a alguien de titular a
    // cotitular es una decisión, no un efecto de haberle corregido el teléfono.
    const role = (rolPedido || current?.role || DEFAULT_OWNER_ROLE) as OwnerRole;

    const otros = await this.otrosVinculos(unitId, contactId);

    // Sin porcentaje y sin nadie más en ese eje, el dueño es uno solo: el 100 % es el dato,
    // no una suposición. Con otros ya cargados no se inventa nada — queda en «no lo sé» y el
    // resumen avisa cuánto falta.
    const mismoEje = otros.filter((o) => axisForRole(o.role) === axisForRole(role));
    const efectivo =
      share ??
      (current?.share_pct ? Number(current.share_pct) : mismoEje.length === 0 ? 100 : null);

    const veredicto = checkOwnershipShares({
      unitName: unit.name,
      others: otros,
      share: efectivo,
      role,
    });
    if (veredicto.error) throw new Error(veredicto.error);

    return { unitId, share: efectivo, role, summary: veredicto.summary };
  }

  /** Escribe el vínculo ya validado: lo corrige si existía, lo crea si no. */
  private async applyLink(contactId: string, plan: OwnershipPlan | null): Promise<string | null> {
    if (!plan) return null;

    const current = await this.currentLink(plan.unitId, contactId);
    const valores = {
      share_pct: plan.share === null ? null : String(plan.share),
      role: plan.role,
      updated_at: new Date().toISOString(),
    };

    if (current) {
      await this.db.ormQuery((tx) =>
        tx
          .update(unitOwnerTable)
          .set(valores as Partial<NewUnitOwnerRow>)
          .where(eq(unitOwnerTable.id, current.id))
      );
    } else {
      await this.db.ormQuery((tx) =>
        tx.insert(unitOwnerTable).values({
          unit_id: plan.unitId,
          contact_id: contactId,
          ...valores,
        } as NewUnitOwnerRow)
      );
    }

    return plan.summary;
  }

  /** La unidad, solo para nombrarla en los mensajes y confirmar que existe. */
  private async unitById(unitId: string): Promise<{ name: string } | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select({ name: unitTable.name })
        .from(unitTable)
        .where(and(eq(unitTable.id, unitId), isNull(unitTable.deleted_at)))
        .limit(1)
    );
    return rows[0];
  }

  /** El vínculo vigente de esta persona con esta unidad, si ya lo tenía. */
  private async currentLink(
    unitId: string,
    contactId: string
  ): Promise<{ id: string; share_pct: string | null; role: string | null } | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select({
          id: unitOwnerTable.id,
          share_pct: unitOwnerTable.share_pct,
          role: unitOwnerTable.role,
        })
        .from(unitOwnerTable)
        .where(
          and(
            eq(unitOwnerTable.unit_id, unitId),
            eq(unitOwnerTable.contact_id, contactId),
            isNull(unitOwnerTable.deleted_at)
          )
        )
        .limit(1)
    );
    return rows[0];
  }

  /** Los demás dueños de la unidad — contra ellos se mide el 100 %. */
  private async otrosVinculos(
    unitId: string,
    contactId: string | null
  ): Promise<{ role: string | null; share_pct: string | null }[]> {
    return this.db.ormQuery((tx) =>
      tx
        .select({ role: unitOwnerTable.role, share_pct: unitOwnerTable.share_pct })
        .from(unitOwnerTable)
        .where(
          and(
            eq(unitOwnerTable.unit_id, unitId),
            isNull(unitOwnerTable.deleted_at),
            // Al editar, el porcentaje viejo de esta misma persona no puede contarse dos
            // veces: se lo reemplaza, no se lo suma.
            contactId ? ne(unitOwnerTable.contact_id, contactId) : undefined
          )
        )
    );
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

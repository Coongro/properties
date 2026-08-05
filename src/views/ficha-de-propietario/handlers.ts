/**
 * Lógica custom de «Ficha de propietario» (FichaDePropietarioView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 *
 * **Por qué existe esta ficha.** El listado decía «2 unidades» y ahí terminaba: no
 * decía cuáles, y clickear una fila abría el formulario de edición —con la tarjeta
 * de la unidad vacía, porque solo sabe hablar de una—. Quien miraba esa pantalla
 * concluía que la persona no tenía ninguna. Acá se ven todas, cada una con su
 * participación, y editar vuelve a ser un botón como en el resto del sistema.
 */
import type { CustomHandlers } from '@coongro/plugin-sdk';

/** Lo que devuelve `properties.unitOwners.getOwner`: el contacto con sus extras. */
interface OwnerDetail {
  id?: string;
  name?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  tax_condition?: string | null;
  bank?: string | null;
  account?: string | null;
  cbu?: string | null;
  alias?: string | null;
}

/** Cómo se lee cada condición frente al IVA. */
const TAX_LABELS: Record<string, string> = {
  responsable_inscripto: 'Responsable inscripto',
  monotributo: 'Monotributo',
  exento: 'Exento',
  consumidor_final: 'Consumidor final',
};

const text = (v: unknown): string => String(v ?? '').trim();

const pluralize = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** «CUIT 27-11402887-3» — el tipo se guarda en minúscula y se muestra como se escribe. */
const documentOf = (owner: OwnerDetail): string =>
  [text(owner.document_type).toLocaleUpperCase('es-AR'), text(owner.document_number)]
    .filter(Boolean)
    .join(' ');

export const customHandlers: CustomHandlers = {
  /**
   * Encabezado, indicadores y los dos bloques de datos.
   *
   * Sale todo de `getOwner`, que ya devuelve las columnas del contacto y los datos de
   * cobro que el kit guarda en su `metadata`. Cuántas unidades tiene lo trae el registro
   * con el que se abrió la ficha —el listado ya las contó—: pedirlo de nuevo sería una
   * segunda consulta para un número que ya está en la mano.
   */
  loadLiveValues: async ({ execute, record }) => {
    const contactId = record?.id as string | undefined;
    if (!contactId) return {};

    const owner = await execute<OwnerDetail>('properties.unitOwners.getOwner', { id: contactId });
    const units = Number(record?.unit_count ?? 0);
    const document = documentOf(owner);

    // El alias es el que la persona dicta por teléfono; el CBU, el que se pega en el
    // homebanking. Se muestra el que haya, con preferencia por el primero.
    const alias = text(owner.alias);
    const cbu = text(owner.cbu);
    const where = alias || cbu;

    return {
      hdr: {
        name: text(owner.name) || 'Propietario',
        sub: document || 'Sin documento cargado',
        badge: units ? pluralize(units, 'unidad', 'unidades') : 'Sin unidades',
        badgeTone: units ? 'outline' : 'warning',
        avatar: text(owner.name),
      },
      k_unidades: {
        value: String(units),
        sub: units ? 'a su nombre' : 'todavía no tiene ninguna',
        tone: units ? 'neutral' : 'warning',
      },
      k_cobro: {
        value: where || 'Sin datos',
        // Sin CBU ni alias no se le puede girar la liquidación. El indicador lo dice,
        // en vez de dejar un vacío que se lee como «un dato más que falta cargar».
        sub: where ? text(owner.bank) || 'sin banco declarado' : 'no se le puede transferir',
        tone: where ? 'success' : 'warning',
      },
      k_fiscal: {
        value: TAX_LABELS[text(owner.tax_condition)] ?? 'Sin declarar',
        sub: 'para la liquidación',
        tone: 'neutral',
      },
      'kv_cobro.Banco': { value: text(owner.bank) || '—' },
      'kv_cobro.CBU': { value: cbu || '—' },
      'kv_cobro.Alias': { value: alias || '—' },
      'kv_cobro.Tipo y número de cuenta': { value: text(owner.account) || '—' },
      'kv_contacto.Email': { value: text(owner.email) || '—' },
      'kv_contacto.Teléfono': { value: text(owner.phone) || '—' },
      'kv_contacto.Domicilio': { value: text(owner.address) || '—' },
    };
  },

  loadDataFor: {
    /** Las unidades a nombre de ESTA persona, con su participación en cada una. */
    tbl_unidades: ({ execute, record }) => {
      const contactId = record?.id as string | undefined;
      if (!contactId) return Promise.resolve([]);
      return execute<Record<string, unknown>[]>('properties.unitOwners.listUnitsOf', {
        contactId,
      });
    },
  },
};

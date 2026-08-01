/**
 * Lógica custom de «Propietario» (PropietarioView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`propietario.view.ts`,
 * `use-propietario.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import type { CustomHandlers } from '@coongro/plugin-sdk';
/** Campos del formulario que no son columnas de `contacts` y viajan en `metadata`. */
const EN_METADATA = ['tax_condition', 'bank', 'account', 'cbu', 'alias'] as const;

/** Columnas propias de `contacts` que el formulario edita directo. */
const EN_COLUMNAS = ['name', 'document_type', 'document_number', 'email', 'phone', 'address'];

const texto = (v: unknown): string => String(v ?? '').trim();

interface ContactoCompleto {
  id: string;
  metadata?: Record<string, unknown> | null;
  [k: string]: unknown;
}

export const customHandlers: CustomHandlers = {
  /**
   * Al abrir en modo edición, trae el contacto COMPLETO.
   *
   * El formulario no tiene repositorio propio (el propietario vive en `contacts`),
   * así que nadie le vuelca el registro encima: sin esto, «Editar» abre los campos
   * vacíos y guardar borra los datos de cobro que no se volvieron a tipear.
   */
  onInit: async ({ execute, record }) => {
    const id = texto(record?.id);
    if (!id) return {};

    const contacto = await execute<ContactoCompleto | undefined>('contacts.getById', { id });
    if (!contacto) return {};

    const inicial: Record<string, unknown> = {};
    for (const key of EN_COLUMNAS) {
      const v = contacto[key];
      if (v !== null && v !== undefined) inicial[key] = v;
    }
    const metadata = contacto.metadata ?? {};
    for (const key of EN_METADATA) {
      const v = metadata[key];
      if (v !== null && v !== undefined) inicial[key] = v;
    }
    return inicial;
  },

  /**
   * El propietario NO es una entidad de este plugin: es un contacto con
   * `type: 'owner'`. Por eso el alta se hace contra `contacts` y no contra un
   * repositorio propio — así el mismo titular sirve para cualquier otro kit sin
   * quedar duplicado.
   *
   * Los datos de cobro (banco, cuenta, CBU, alias) y la condición de IVA van en
   * `metadata`: son vocabulario de alquileres y `contacts` es un plugin compartido.
   */
  onSubmit: async (values, { execute, editingId }) => {
    // `metadata` es de todo el contacto, no de este formulario: ahí conviven los
    // datos que le puso «Inquilino» y lo que guarde cualquier otro kit. Mandarla
    // armada de cero borraría todo eso, así que se parte de la actual y solo se
    // tocan las claves propias (vaciar una acá sí la quita).
    const actual = editingId
      ? await execute<ContactoCompleto | undefined>('contacts.getById', { id: editingId })
      : undefined;
    const metadata: Record<string, unknown> = { ...(actual?.metadata ?? {}) };
    for (const key of EN_METADATA) {
      const v = texto(values[key]);
      if (v) metadata[key] = v;
      else delete metadata[key];
    }

    const data = {
      name: texto(values.name),
      document_type: texto(values.document_type) || null,
      document_number: texto(values.document_number) || null,
      email: texto(values.email) || null,
      phone: texto(values.phone) || null,
      address: texto(values.address) || null,
      metadata,
    };

    // El aviso de guardado lo da el formulario: agregar otro toast acá los duplica.
    if (editingId) {
      // Al actualizar NO se toca `type`: la misma persona puede ser propietaria de
      // una unidad e inquilina de otra, y `contacts.type` guarda un solo rol.
      // Pisarlo desde acá la borraría de Inquilinos.
      await execute('contacts.update', { id: editingId, data });
      return;
    }
    await execute('contacts.create', {
      data: {
        ...data,
        type: 'owner',
        // `contacts.is_active` es NOT NULL y no tiene default: si no lo mandamos, el
        // insert muere en la base.
        is_active: true,
      },
    });
  },
};

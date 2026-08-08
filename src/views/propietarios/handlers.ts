/**
 * Lógica custom de «Propietarios» (PropietariosView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`propietarios.view.ts`,
 * `use-propietarios.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import type { CustomHandlers } from '@coongro/plugin-sdk';
export const customHandlers: CustomHandlers = {
  /**
   * No hay entidad «propietario»: es un contacto que tiene al menos una unidad a su
   * nombre. `listOwners` resuelve ese cruce y el reparto de unidades en una sola
   * consulta — por eso la lista no se cablea con `source`.
   */
  loadData: ({ execute }) => execute<Record<string, unknown>[]>('properties.unitOwners.listOwners'),

  /**
   * Dar de baja a un propietario cargado por error.
   *
   * La fila de esta lista ES el contacto, así que su `id` es el `contactId` que
   * pide la operación — por eso se mapea acá en vez de dejar que el motor mande
   * `{ id }`, que el repositorio no sabría leer.
   *
   * Si la persona tiene unidades a su nombre el servidor corta y explica por qué;
   * ese mensaje sube tal cual.
   */
  onAction: async (actionId, { execute, record, toast, reload }) => {
    if (actionId === 'properties.unitOwners.deleteOwner') {
      await execute('properties.unitOwners.deleteOwner', { contactId: record?.id });
      toast.success('Propietario dado de baja', '');
      reload();
    }
  },
};

/**
 * Lógica custom de «Propietario» (PropietarioView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`propietario.view.ts`,
 * `use-propietario.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 *
 * **Los dos hooks son adaptadores.** Las reglas de negocio —qué va en columnas y qué en
 * `metadata`, no pisar lo que otro rol le cargó al mismo contacto, fijar el tipo solo al
 * crear— viven en `properties.unitOwners.saveOwner` y `.getOwner`. Así el formulario y
 * el Copilot ejecutan exactamente lo mismo: si la lógica viviera acá, el Copilot tendría
 * que reimplementarla y la primera diferencia sería un dato borrado.
 */

import type { CustomHandlers } from '@coongro/plugin-sdk';

export const customHandlers: CustomHandlers = {
  // Cómo se lee cada unidad en el desplegable —«Belgrano 1240 · 1°A» con su detalle
  // debajo— NO se decide acá: es diseño del campo y se elige en el Builder
  // («Texto de cada opción» y «Subtítulo de cada opción»). Escribirlo como código sería
  // programar la presentación de un campo en vez de diseñarla.

  /** Abre el formulario con el propietario ya cargado, incluidos sus datos de cobro. */
  onInit: ({ execute, editingId }) =>
    editingId
      ? execute<Record<string, unknown>>('properties.unitOwners.getOwner', { id: editingId })
      : Promise.resolve({}),

  onSubmit: (values, { execute, editingId }) =>
    execute('properties.unitOwners.saveOwner', { id: editingId, data: values }),
};

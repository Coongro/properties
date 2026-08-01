/**
 * Lógica custom de «Propiedades» (PropiedadesView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`propiedades.view.ts`,
 * `use-propiedades.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import type { CustomHandlers } from '@coongro/plugin-sdk';
export const customHandlers: CustomHandlers = {
  /**
   * La lista no se cablea con `source` porque cuatro de sus columnas no viven en la
   * fila del edificio: la dirección se arma de varias, y la ocupación, el alquiler de
   * referencia y el estado de los certificados salen de las unidades y los certificados.
   * `properties.buildings.list` ya las resuelve en una sola consulta — traerlas acá por
   * cada fila sería N+1 y la lista se vería inconsistente mientras cargan.
   */
  loadData: ({ execute }) => execute<Record<string, unknown>[]>('properties.buildings.list'),
};

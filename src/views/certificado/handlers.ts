/**
 * Lógica custom de «Certificado» (CertificadoView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`certificado.view.ts`,
 * `use-certificado.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import type { CustomHandlers } from '@coongro/plugin-sdk';

export const customHandlers: CustomHandlers = {
  /**
   * Completa la propiedad cuando el alta se abre parado en una UNIDAD.
   *
   * Abierto desde la ficha de una propiedad no hace falta nada: el edificio llega como
   * `parentRecord` y el codegen carga `building_id`, que es el único campo `ref` hacia esa
   * entidad. Abierto desde la ficha de una unidad, en cambio, el único `ref` que apunta al
   * padre es `unit_id` — así que se llenaba la unidad y la propiedad quedaba vacía, siendo
   * un campo requerido. La persona tenía que elegirla a mano, de un desplegable con las de
   * toda la cartera, para volver a escribir un dato que la unidad ya sabe.
   *
   * De ahí sale `building_id`: de la unidad desde la que se abrió. Y es la unidad la que
   * manda —no lo que se elija después—, porque un certificado de una unidad pertenece
   * siempre a la propiedad donde esa unidad está (`services/certificate-scope.ts`).
   *
   * `onInit` solo rellena lo que está vacío, así que esto no pisa nada escrito ni compite
   * con el auto-fill del codegen. Y no sirve para editar: `record` significa «estás
   * editando» y el alta nunca lo trae.
   */
  onInit: ({ parentRecord }) => {
    const parent = parentRecord as { building_id?: string | null } | undefined;
    const building = String(parent?.building_id ?? '').trim();
    // Sin `building_id` el padre es el edificio mismo, y de eso ya se ocupó el codegen.
    return Promise.resolve(building ? { building_id: building } : {});
  },

  // Cómo se leen la propiedad y la unidad en sus desplegables no se decide acá: es diseño
  // del campo y se elige en el Builder («Texto de cada opción» y «Subtítulo de cada
  // opción»). Antes vivía en este archivo como un `refLabel`, porque el editor no dejaba
  // configurarlo — eso era un bug del Builder, no una decisión (COONG-294).
};

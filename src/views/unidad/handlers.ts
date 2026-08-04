/**
 * Lógica custom de «Unidad» (UnidadView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`unidad.view.ts`,
 * `use-unidad.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import { files, type CustomHandlers } from '@coongro/plugin-sdk';

export const customHandlers: CustomHandlers = {
  // NO va un `onInit` que herede la propiedad desde la ficha: el botón de alta
  // pasa el edificio como `parentRecord` y el codegen del Builder llena solo
  // `building_id` (único campo ref hacia esa entidad). Escribirlo acá sería
  // duplicar ese auto-fill.

  /**
   * Guarda la foto en el storage del tenant y devuelve su dirección.
   *
   * Sin este handler el campo de fotos solo aceptaría pegar direcciones de
   * imágenes que viven en otro servidor — y el día que las borren de ahí, la
   * unidad se queda sin foto.
   */
  uploadImage: (file) => files.upload(file),
};

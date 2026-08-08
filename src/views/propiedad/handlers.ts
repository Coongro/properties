/**
 * Lógica custom de «Propiedad» (PropiedadView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`propiedad.view.ts`,
 * `use-propiedad.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import { files, type CustomHandlers } from '@coongro/plugin-sdk';

export const customHandlers: CustomHandlers = {
  /**
   * Guarda la foto en el storage del tenant y devuelve su dirección.
   *
   * Sin este handler el campo de fotos solo aceptaría pegar direcciones de
   * imágenes que viven en otro servidor — y el día que las borren de ahí, la
   * propiedad se queda sin foto.
   */
  uploadImage: (file) => files.upload(file),
};

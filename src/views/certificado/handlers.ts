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
  // El vínculo con la propiedad NO se llena acá: cuando el alta se abre desde la
  // ficha, el edificio llega como `parentRecord` y el codegen del Builder carga
  // solo `building_id` (único campo ref hacia esa entidad). Un `onInit` que lea
  // `record` para esto está muerto — `record` significa «estás editando» y el
  // alta nunca lo trae.
  // Cómo se leen la propiedad y la unidad en sus desplegables tampoco se decide acá:
  // es diseño del campo y se elige en el Builder («Texto de cada opción» y «Subtítulo de
  // cada opción»). Antes vivía en este archivo como un `refLabel`, porque el editor no
  // dejaba configurarlo — eso era un bug del Builder, no una decisión (COONG-294).
};

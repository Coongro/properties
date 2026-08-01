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
   * Cuando el alta se abre desde la ficha de una propiedad, esa propiedad ya está
   * elegida: pedirla de nuevo es hacer repetir un dato que la pantalla sabe.
   *
   * El campo igual existe y es obligatorio, porque el certificado tiene que saber a qué
   * inmueble pertenece aunque se cargue desde otro lado —y porque así también lo ve
   * quien no tiene pantalla. Un certificado sin propiedad no aparece en ninguna ficha
   * ni en ningún vencimiento: queda cargado y perdido.
   *
   * Al editar no se toca nada: los valores son los del certificado guardado.
   */
  onInit: ({ editingId, record }) => {
    if (editingId || !record?.id) return Promise.resolve({});
    return Promise.resolve({ building_id: String(record.id) });
  },

  /**
   * Cómo se lee una propiedad o una unidad en el desplegable. Sin esto el select
   * muestra el UUID, que no le dice nada a nadie.
   */
  refLabel: (row) => {
    const nombre = String(row.name ?? '').trim();
    const donde = String(row.address ?? '').trim();
    if (nombre && donde) return `${nombre} — ${donde}`;
    return nombre || donde || String(row.id ?? '');
  },
};

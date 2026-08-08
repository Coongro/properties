/**
 * @coongro/properties — Entry point principal (browser-safe)
 *
 * Exportar aquí: hooks, componentes, tipos, utilidades.
 * NO exportar schema tables ni repositories (usan drizzle-orm, solo backend).
 * Para exports server-only → usar server.ts
 */

export {
  CERTIFICATE_HORIZONS,
  DEFAULT_CERTIFICATE_HORIZON,
  horizonForCertificate,
} from './services/certificate-horizons.js';

// La regla de alcance de lo que cuelga de un inmueble. Se exporta porque no es solo de acá:
// `maintenance` la necesita para sus órdenes de trabajo, que tienen la misma forma —propiedad
// siempre, unidad como precisión— y solo properties sabe de qué edificio es una unidad.
export {
  scopeOf,
  scopeMismatchMessage,
  type PropertyScope,
  type UnitOfRecord,
} from './services/property-scope.js';

// Cómo se nombra una unidad fuera de su propiedad («Belgrano 1240 · 1°A»). Se exporta por la
// misma razón que la regla de alcance: quien tenga que nombrar una unidad en un mensaje —el
// rechazo de una orden de trabajo, por ejemplo— tiene que leerla igual que el resto del sistema.
export { unitLabel, unitDetail } from './services/unit-identity.js';

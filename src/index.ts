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

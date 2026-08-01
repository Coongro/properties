/**
 * @coongro/properties — Plugin lifecycle entry point
 *
 * activate() se invoca cuando el plugin se carga en un tenant.
 * Usar para seeds, listeners, o inicialización one-time.
 */

import type { ModuleActivationContext } from '@coongro/plugin-sdk';

// Sigue devolviendo una promesa (el loader la espera), pero sin `async`: hoy no hay
// nada que aguardar y eslint marca el `async` sin `await`.
export function activate({ api }: ModuleActivationContext): Promise<void> {
  api.logger.info('Plugin activated');
  return Promise.resolve();
}

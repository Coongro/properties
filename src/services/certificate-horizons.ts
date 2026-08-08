/**
 * Con cuánta anticipación se avisa de cada tipo de certificado.
 *
 * Vive acá y no en quien pregunta porque los tipos de certificado son de este plugin:
 * si el número saliera de cada consumidor, la ficha de la propiedad y el barrido de
 * vencimientos dirían cosas distintas del mismo certificado —uno «Vigente» y el otro
 * «Por vencer»— y una de las dos pantallas estaría mintiendo.
 *
 * Los días salen de cuánto tarda en la práctica resolver cada trámite: un matafuegos se
 * recarga en días, un ascensor necesita coordinar visita con la empresa, y renovar un
 * seguro es una llamada. Un único número para todo llega tarde para lo lento y molesta
 * durante semanas con lo rápido.
 *
 * Cada certificado puede pedir el suyo (`alert_days`) cuando su caso no entra en el
 * default: un edificio con un ascensor viejo puede querer 90 días.
 */

export const CERTIFICATE_HORIZONS: Record<string, number> = {
  matafuegos: 30,
  gas: 45,
  ascensor: 60,
  electricidad: 45,
  seguro: 30,
  otro: 30,
};

/** El default cuando el tipo no está en la tabla. */
export const DEFAULT_CERTIFICATE_HORIZON = 30;

/** Con cuántos días de anticipación se avisa de este certificado. */
export function horizonForCertificate(type: string, override?: number | null): number {
  const propio = Number(override);
  if (Number.isFinite(propio) && propio > 0) return propio;
  return CERTIFICATE_HORIZONS[type] ?? DEFAULT_CERTIFICATE_HORIZON;
}

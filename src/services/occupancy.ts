/**
 * Si una unidad está ocupada hoy.
 *
 * La ocupación no se guarda: se deriva de las fechas del contrato que `leases` deja en la
 * unidad. Guardarla obligaba a que algo la actualizara —al firmar, al empezar, al
 * terminar— y ese algo no existía: una unidad quedaba ocupada desde la firma aunque el
 * contrato empezara el mes siguiente, y no se liberaba nunca al vencer.
 *
 * Es el mismo criterio que usa `billing` con «vencido»: un cálculo sobre hechos guardados
 * en vez de un estado que hay que mantener al día.
 */

import { sql } from 'drizzle-orm';

/** Estados que decide quien administra. Ganan sobre lo que digan las fechas. */
const DECIDIDOS_A_MANO = ['no_disponible', 'en_recambio', 'con_preaviso'] as const;
const A_MANO = new Set<string>(DECIDIDOS_A_MANO);

/**
 * El MISMO criterio, para las consultas que cuentan unidades en la base.
 *
 * Vive al lado de `isOccupied` a propósito: son dos escrituras de una sola regla y la
 * única forma de que no se separen es que quien toque una vea la otra.
 */
export function occupiedInSql(alias: string, today: ReturnType<typeof sql>) {
  const u = sql.raw(alias);
  const manuales = sql.raw(DECIDIDOS_A_MANO.map((s) => `'${s}'`).join(', '));
  return sql`${u}.occupied_from is not null and ${u}.occupied_from <= ${today}
    and (${u}.occupied_until is null or ${u}.occupied_until >= ${today})
    and ${u}.status not in (${manuales})`;
}

export interface UnitOccupancy {
  status?: string | null;
  occupied_from?: string | null;
  occupied_until?: string | null;
}

/**
 * El estado que hay que mostrar. `today` en `YYYY-MM-DD`.
 *
 * Una unidad marcada a mano como no disponible sigue estándolo aunque tenga contrato: esa
 * es una decisión de la persona y el sistema no la pisa. Para el resto manda el contrato.
 */
export function effectiveStatus(unit: UnitOccupancy, today: string): string {
  const declarado = String(unit.status ?? '');
  if (A_MANO.has(declarado)) return declarado;
  return isOccupied(unit, today) ? 'ocupada' : 'vacante';
}

/** Si hoy cae dentro del período comprometido. Sin fechas, no está ocupada. */
export function isOccupied(unit: UnitOccupancy, today: string): boolean {
  const desde = String(unit.occupied_from ?? '');
  if (!desde || desde > today) return false;
  const hasta = String(unit.occupied_until ?? '');
  // Sin fecha de fin el compromiso sigue abierto: un contrato sin vencimiento cargado
  // ocupa hasta que alguien lo termine, que es lo que pasa hoy en la pantalla.
  return !hasta || hasta >= today;
}

/**
 * Cuándo empieza un compromiso que todavía no arrancó, para poder decirlo.
 *
 * «Vacante» a secas esconde que la unidad ya está prometida y alguien la puede volver a
 * ofrecer. Devuelve `null` si está libre de verdad o si ya está ocupada.
 */
export function reservedFrom(unit: UnitOccupancy, today: string): string | null {
  const desde = String(unit.occupied_from ?? '');
  if (!desde || desde <= today) return null;
  const hasta = String(unit.occupied_until ?? '');
  if (hasta && hasta < desde) return null;
  return desde;
}

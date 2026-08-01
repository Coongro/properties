/**
 * AUTO-GENERADO por Coongro Builder — NO editar a mano.
 * Se regenera al guardar la página de settings desde /dev/builder.
 * La lógica de negocio va en un hook de dominio que consume esto.
 */
/* eslint-disable */

import { useSettings } from '@coongro/plugin-sdk';

function toNum(v: unknown, fallback: number): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return fallback;
}

/** Tipo de cada setting por su key punteada (para getSetting). */
export interface PropertiesSettingsByKey {
  'properties.certificates.alertDays': number;
}

/** Settings del plugin con defaults aplicados y coerción por tipo. */
export interface PropertiesSettings {
  /** Avisar con esta anticipación — Cuántos días antes del vencimiento un certificado empieza a marcarse como «por vencer». Con 30 te enterás el mes anterior, que suele alcanzar para pedir turno; si tu municipio o el service tardan más, subí el número. · `properties.certificates.alertDays` · default: `30` */
  readonly certificatesAlertDays: number;
}

/** Nombre de prop → key punteada del manifest. */
export const SETTING_KEYS = {
  certificatesAlertDays: 'properties.certificates.alertDays',
} as const;

/** Valores por defecto (los mismos del manifest). */
export const SETTING_DEFAULTS = {
  'properties.certificates.alertDays': 30,
} as const;

const COERCE: {
  [K in keyof PropertiesSettingsByKey]: (
    values: Record<string, unknown>
  ) => PropertiesSettingsByKey[K];
} = {
  'properties.certificates.alertDays': (values) =>
    toNum(values['properties.certificates.alertDays'], 30),
};

/** Lee UNA setting tipada desde los valores crudos del tenant (para handlers). */
export function getSetting<K extends keyof PropertiesSettingsByKey>(
  values: Record<string, unknown>,
  key: K
): PropertiesSettingsByKey[K] {
  return COERCE[key](values);
}

/** Construye el objeto tipado desde los valores crudos (sin hook: handlers/tests). */
export function readPropertiesSettings(values: Record<string, unknown>): PropertiesSettings {
  return {
    certificatesAlertDays: COERCE['properties.certificates.alertDays'](values),
  };
}

/**
 * Hook reactivo: settings tipadas del plugin con defaults aplicados.
 * Envolvé esto en un hook de dominio si necesitás lógica de negocio.
 */
export function usePropertiesSettings(): { settings: PropertiesSettings; loading: boolean } {
  const { values, loading } = useSettings('properties.');
  return { settings: readPropertiesSettings(values), loading };
}

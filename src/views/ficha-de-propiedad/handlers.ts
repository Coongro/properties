/**
 * Lógica custom de «Ficha de propiedad» (FichaDePropiedadView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`ficha-de-propiedad.view.ts`,
 * `use-ficha-de-propiedad.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import { formatMoney, type CustomHandlers } from '@coongro/plugin-sdk';
/** Ambientes y superficie en una línea: «3 ambientes · 72 m²». */
function unitDetail(u: Record<string, unknown>): string {
  const partes: string[] = [];
  const amb = Number(u.rooms ?? 0);
  if (amb > 0) partes.push(`${amb} ambiente${amb === 1 ? '' : 's'}`);
  const banios = Number(u.bathrooms ?? 0);
  if (banios > 0) partes.push(`${banios} baño${banios === 1 ? '' : 's'}`);
  const sup = Number(u.surface_m2 ?? 0);
  if (sup > 0) partes.push(`${sup} m²`);
  return partes.join(' · ');
}

/** Resumen que devuelve `properties.buildings.getSummary` — los mismos agregados del listado. */
interface BuildingSummary {
  name?: string;
  type?: string;
  address?: string | null;
  cadastral_ref?: string | null;
  unit_count?: number;
  occupied_count?: number;
  occupancy?: string;
  reference_rent?: string;
  certs?: 'ok' | 'soon' | 'expired';
}

const TIPOS: Record<string, string> = {
  edificio: 'Edificio',
  departamento: 'Departamento',
  casa: 'Casa',
  local: 'Local',
  oficina: 'Oficina',
  galpon: 'Galpón',
  cochera: 'Cochera',
  baulera: 'Baulera',
};

export const customHandlers: CustomHandlers = {
  /**
   * La cabecera y los cuatro indicadores salen del mismo resumen que alimenta el
   * listado, así la ficha y la lista nunca dicen cosas distintas del mismo inmueble.
   */
  loadLiveValues: async ({ execute, record }) => {
    const buildingId = record?.id as string | undefined;
    if (!buildingId) return {};
    const s = await execute<BuildingSummary | undefined>('properties.buildings.getSummary', {
      id: buildingId,
    });
    if (!s) return {};

    const total = Number(s.unit_count ?? 0);
    const ocupadas = Number(s.occupied_count ?? 0);
    const libres = total - ocupadas;
    const certs = {
      ok: 'Todos al día',
      soon: 'Hay uno por vencer',
      expired: 'Hay uno vencido',
    };

    const nombre = s.name ?? 'Propiedad';
    // Subtítulo del encabezado: tipo · dirección · partida, salteando lo que falte.
    const subtitulo = [
      TIPOS[s.type ?? ''] ?? s.type,
      s.address,
      s.cadastral_ref && `Partida ${s.cadastral_ref}`,
    ]
      .filter(Boolean)
      .join(' · ');

    return {
      hdr: {
        name: nombre,
        sub: subtitulo,
        badge: total === 1 ? '1 unidad' : `${total} unidades`,
        // El avatar toma la inicial del nombre de la propiedad.
        avatar: nombre,
      },
      k1: {
        value: String(total),
        sub: total === 1 ? 'una unidad' : `${total} unidades registradas`,
      },
      k2: {
        value: s.occupancy ?? `${ocupadas} de ${total}`,
        sub: libres > 0 ? `${libres} sin alquilar` : 'todas alquiladas',
      },
      k3: {
        value: formatMoney(Number(s.reference_rent ?? 0)),
        sub: 'suma de las unidades',
      },
      k4: {
        // El KPI cuenta el estado del conjunto: el detalle por certificado está
        // en la tabla de abajo, con su fecha.
        value: s.certs === 'ok' ? 'Al día' : s.certs === 'soon' ? 'Por vencer' : 'Vencido',
        sub: certs[s.certs ?? 'ok'],
      },
    };
  },

  loadDataFor: {
    /** Las unidades DE ESTE edificio: `.list` traería las de todos. */
    tbl_unidades: async ({ execute, record }) => {
      const buildingId = record?.id as string | undefined;
      if (!buildingId) return [];
      const unidades = await execute<Record<string, unknown>[]>('properties.units.listByBuilding', {
        buildingId,
      });
      // `detail` no es una columna: se arma acá para que la tarjeta lo muestre
      // bajo el nombre de la unidad. El inquilino llega en F2, con los contratos.
      return unidades.map((u) => ({ ...u, detail: unitDetail(u) }));
    },

    /** Certificados del edificio y de sus unidades, con el estado ya resuelto. */
    tbl_certs: ({ execute, record }) => {
      const buildingId = record?.id as string | undefined;
      if (!buildingId) return Promise.resolve([]);
      return execute<Record<string, unknown>[]>('properties.certificates.listByBuilding', {
        buildingId,
      });
    },

    // Las órdenes de trabajo llegan con el plugin `maintenance` (F5). Hasta
    // entonces la sección muestra su estado vacío, que ya dice qué va a aparecer.
    tbl_ot: () => Promise.resolve([]),
  },
};

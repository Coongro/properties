/**
 * Lógica custom de «Ficha de propiedad» (FichaDePropiedadView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`ficha-de-propiedad.view.ts`,
 * `use-ficha-de-propiedad.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import { formatMoney, type CustomHandlers } from '@coongro/plugin-sdk';

/**
 * Resumen que devuelve `properties.buildings.getSummary`: los agregados del
 * listado más, cuando la propiedad ES una sola unidad, el estado y el reparto de
 * esa unidad — para que la ficha de una casa salga de UNA lectura.
 */
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
  single_unit_id?: string | null;
  single_unit_status?: string | null;
  ownership_summary?: string | null;
  ownership_missing?: number | null;
  ownership_complete?: boolean | null;
  ownership_owners?: number | null;
}

/**
 * Los tipos de propiedad que CONTIENEN unidades. Hoy solo el edificio — misma
 * regla que `services/single-unit.ts`, que es quien crea la unidad de las demás.
 */
const MULTI_UNIT_TYPES = ['edificio'];

const isSingleUnit = (type?: string | null) =>
  !MULTI_UNIT_TYPES.includes(String(type ?? '').trim());

/** Cómo se lee cada estado de ocupación, con el tono que le corresponde. */
const STATUS_LABELS: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  ocupada: { label: 'Ocupada', tone: 'success' },
  vacante: { label: 'Vacante', tone: 'warning' },
  en_recambio: { label: 'En recambio', tone: 'neutral' },
  con_preaviso: { label: 'Con preaviso', tone: 'warning' },
  no_disponible: { label: 'No disponible', tone: 'neutral' },
};

/** «50 %», «33,33 %» — sin decimales cuando es redondo. */
const formatPercent = (n: number) => `${String(Math.round(n * 100) / 100).replace('.', ',')} %`;

const pluralize = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

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

    // Una propiedad que ES una sola unidad no se cuenta por unidades: lo que
    // importa de una casa es si está alquilada y de quién es. Los dos primeros
    // indicadores cambian de sujeto (el spec decide cuál se ve, con `showWhen`).
    //
    // Todo eso viene en el MISMO resumen: encadenar tres lecturas acá dejaba la
    // composición del lado de la pantalla, donde un agente no la puede repetir.
    const single = isSingleUnit(s.type);
    const status = STATUS_LABELS[String(s.single_unit_status ?? '')] ?? {
      label: '—',
      tone: 'neutral' as const,
    };

    return {
      hdr: {
        name: nombre,
        sub: subtitulo,
        // En una casa «1 unidad» no dice nada: el tipo sí.
        badge: single
          ? (TIPOS[s.type ?? ''] ?? 'Propiedad')
          : total === 1
            ? '1 unidad'
            : `${total} unidades`,
        // El avatar toma la inicial del nombre de la propiedad.
        avatar: nombre,
      },
      k1: {
        value: String(total),
        sub: total === 1 ? 'una unidad' : `${total} unidades registradas`,
      },
      k1_unica: {
        value: status.label,
        sub: s.single_unit_status === 'ocupada' ? 'según el contrato' : 'sin contrato vigente',
        tone: status.tone,
      },
      k2: {
        value: s.occupancy ?? `${ocupadas} de ${total}`,
        sub: libres > 0 ? `${libres} sin alquilar` : 'todas alquiladas',
      },
      k2_unica: {
        value: s.ownership_complete
          ? 'Completa'
          : `Falta ${formatPercent(Number(s.ownership_missing ?? 100))}`,
        sub: s.ownership_owners
          ? pluralize(Number(s.ownership_owners), 'titular cargado', 'titulares cargados')
          : 'sin titulares cargados',
        tone: s.ownership_complete ? 'success' : 'warning',
      },
      k3: {
        value: formatMoney(Number(s.reference_rent ?? 0)),
        // En una casa el número no es una suma de nada: es su propio alquiler.
        sub: single ? 'valor de publicación' : 'suma de las unidades',
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
      // `detail` ya viene armado desde el repositorio: se componía acá, y por eso el
      // catálogo agentic prometía un campo que solo existía dentro de esta vista — un
      // agente que llamara `units.list` nunca lo recibía. El inquilino llega en F2.
      return execute<Record<string, unknown>[]>('properties.units.listByBuilding', {
        buildingId,
      });
    },

    /** Certificados del edificio y de sus unidades, con el estado ya resuelto. */
    tbl_certs: ({ execute, record }) => {
      const buildingId = record?.id as string | undefined;
      if (!buildingId) return Promise.resolve([]);
      return execute<Record<string, unknown>[]>('properties.certificates.listByBuilding', {
        buildingId,
      });
    },

    /** Las liquidaciones DE ESTE edificio: `.list` traería las de todos. */
    tbl_expensas: ({ execute, record }) => {
      const buildingId = record?.id as string | undefined;
      if (!buildingId) return Promise.resolve([]);
      return execute<Record<string, unknown>[]>('properties.buildingExpenses.forBuilding', {
        buildingId,
      });
    },

    /**
     * Los titulares de una propiedad que ES una sola unidad.
     *
     * La titularidad siempre cuelga de una unidad; lo que cambia acá es que quien
     * mira una casa no tiene por qué saberlo. Por eso se resuelve la unidad y se
     * pregunta por ella, en vez de pedirle a la persona que entre a una pantalla
     * intermedia que para su inmueble no significa nada.
     */
    tbl_titulares_prop: ({ execute, record }) => {
      const buildingId = record?.id as string | undefined;
      if (!buildingId) return Promise.resolve([]);
      return execute<Record<string, unknown>[]>('properties.unitOwners.listByBuilding', {
        buildingId,
      });
    },

    // Las órdenes de trabajo llegan con el plugin `maintenance` (F5). Hasta
    // entonces la sección muestra su estado vacío, que ya dice qué va a aparecer.
    tbl_ot: () => Promise.resolve([]),
  },

  /**
   * Sacar a alguien de la titularidad.
   *
   * La unidad y la persona salen de la FILA, no del registro de la vista: acá el
   * registro es la PROPIEDAD, y `listByUnit` devuelve el `unit_id` justamente
   * para que la baja no dependa de desde qué pantalla se la pida.
   */
  onAction: async (actionId, { execute, record, reload }) => {
    if (actionId === 'properties.unitOwners.removeOwner') {
      await execute('properties.unitOwners.removeOwner', {
        unitId: record?.unit_id,
        contactId: record?.contact_id,
      });
      reload();
    }
  },
};

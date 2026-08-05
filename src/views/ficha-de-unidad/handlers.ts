/**
 * Lógica custom de «Ficha de unidad» (FichaDeUnidadView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`ficha-de-unidad.view.ts`,
 * `use-ficha-de-unidad.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 *
 * **Los tres hooks son adaptadores.** El reparto de una unidad —cuánto está asignado, cuánto
 * falta, qué cuenta como dominio y qué como usufructo— lo resuelve el servidor en
 * `properties.unitOwners.ownershipOf`. Si esta pantalla sumara los porcentajes por su
 * cuenta, la primera vez que se olvide de separar el usufructo mostraría una unidad al
 * 200 %, y el Copilot contestaría distinto de lo que se ve.
 */
import { formatMoney, type CustomHandlers } from '@coongro/plugin-sdk';

/** Lo que devuelve `properties.unitOwners.ownershipOf`. */
interface OwnershipSummary {
  assigned: number;
  missing: number;
  usufruct: number;
  complete: boolean;
  owners: number;
  summary: string;
}

/** Cómo se lee cada estado de ocupación, con el tono que le corresponde. */
const STATUS_LABELS: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  ocupada: { label: 'Ocupada', tone: 'success' },
  vacante: { label: 'Vacante', tone: 'warning' },
  en_recambio: { label: 'En recambio', tone: 'neutral' },
  con_preaviso: { label: 'Con preaviso', tone: 'warning' },
  no_disponible: { label: 'No disponible', tone: 'neutral' },
};

const pluralize = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/** «50 %», «33,33 %» — sin decimales cuando es redondo. */
const formatPercent = (n: number) => `${String(Math.round(n * 100) / 100).replace('.', ',')} %`;

export const customHandlers: CustomHandlers = {
  /**
   * Encabezado y los tres indicadores con los datos de esta unidad.
   *
   * El registro ya llega con la unidad identificada (`label` = «Belgrano 1240 · 3°B») y su
   * detalle; lo único que hay que ir a buscar es cómo está repartida.
   */
  loadLiveValues: async ({ execute, record }) => {
    const unitId = record?.id as string | undefined;
    if (!unitId) return {};

    const ownership = await execute<OwnershipSummary>('properties.unitOwners.ownershipOf', {
      unitId,
    });

    const status = STATUS_LABELS[String(record?.status ?? '')] ?? {
      label: '—',
      tone: 'neutral' as const,
    };
    const rent = Number(record?.reference_rent ?? 0);

    return {
      hdr: {
        name: String(record?.label ?? record?.name ?? 'Unidad'),
        sub: String(record?.detail ?? ''),
        badge: status.label,
        badgeTone: status.tone,
      },
      k_estado: {
        value: status.label,
        // El contrato vive en `leases`: mientras no esté cableado, la ficha dice de dónde
        // sale el estado en vez de insinuar que miró un contrato.
        sub: record?.status === 'ocupada' ? 'según el contrato' : 'sin contrato vigente',
      },
      k_renta: {
        value: rent > 0 ? formatMoney(rent) : 'Sin definir',
        sub: 'valor de publicación',
      },
      k_titularidad: {
        // Un indicador muestra un valor, no una frase: «Falta 50 %», no «Falta asignar
        // 50 % del dominio.». El detalle va abajo, que es donde se lee sin competir con
        // los otros dos números.
        value: ownership.complete ? 'Completa' : `Falta ${formatPercent(ownership.missing)}`,
        sub: ownership.owners
          ? pluralize(ownership.owners, 'titular cargado', 'titulares cargados')
          : 'sin titulares cargados',
      },
    };
  },

  loadDataFor: {
    /** Quiénes figuran como dueños de ESTA unidad. */
    tbl_titulares: ({ execute, record }) => {
      const unitId = record?.id as string | undefined;
      if (!unitId) return Promise.resolve([]);
      return execute<Record<string, unknown>[]>('properties.unitOwners.listByUnit', { unitId });
    },
  },

  /**
   * Sacar a alguien de la titularidad.
   *
   * La unidad y la persona salen de la FILA, no del registro de la vista: una acción de fila
   * recibe su fila, y `listByUnit` devuelve el `unit_id` justamente para que esto no dependa
   * de desde qué pantalla se la llame.
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

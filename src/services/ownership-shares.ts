/**
 * Con qué participación figura cada persona en una unidad, y hasta dónde puede sumar.
 *
 * Vive acá y no dentro del repositorio porque es una regla de negocio con fuentes, no una
 * consulta: quien la escriba desde una pantalla, desde el Copilot o desde un import tiene
 * que obtener exactamente el mismo veredicto, y así además se testea sin base.
 *
 * **Por qué el tope importa.** El porcentaje no reparte solo el giro: la renta de un
 * inmueble en condominio se atribuye a cada condómino *según su parte indivisa*, y con eso
 * cada uno declara su primera categoría (CCyC 1983 + criterio de atribución en Ganancias).
 * Una unidad al 130 % no es un dato feo — es plata girada de más y renta declarada que no
 * existe. Por eso pasarse es un error y no una advertencia.
 *
 * **Por qué quedar por debajo NO es un error.** Los dueños se cargan de a uno: el primer
 * cotitular de un matrimonio deja la unidad al 50 % durante los diez segundos que tarda
 * cargar al segundo. Rechazar ahí haría imposible el alta. Lo que sí hace falta es que el
 * sistema lo diga, porque una unidad que quedó al 60 % reparte mal en silencio hasta que
 * alguien lo nota en la liquidación.
 *
 * **Por qué son dos ejes y no uno.** El usufructo no le saca dominio a nadie: lo desmembra.
 * El nudo propietario conserva su parte indivisa del dominio aunque no perciba un peso, y
 * el usufructuario percibe los frutos sin tener parte del dominio. Sumarlos en la misma
 * bolsa daría 200 % en un usufructo perfectamente normal. Cada eje llega hasta 100 por su
 * cuenta.
 *
 * A quién se le gira efectivamente el alquiler —el usufructuario cobra los frutos, el nudo
 * propietario no cobra nada— lo resuelve la liquidación en `leases`. Acá solo se registra
 * con qué carácter figura cada uno.
 */

/** Con qué carácter figura alguien en una unidad. */
export const OWNER_ROLES = ['titular', 'cotitular', 'usufructuario', 'nudo_propietario'] as const;

export type OwnerRole = (typeof OWNER_ROLES)[number];

/** El rol con el que se registra a alguien si no se aclara: el caso de siempre es un dueño único. */
export const DEFAULT_OWNER_ROLE: OwnerRole = 'titular';

/**
 * Los dos ejes que suman por separado. `dominio` es la parte indivisa —lo que se hereda, se
 * vende y se declara—; `usufructo` es el derecho a percibir los frutos.
 */
export type ShareAxis = 'dominio' | 'usufructo';

const ROLE_AXIS: Record<OwnerRole, ShareAxis> = {
  titular: 'dominio',
  cotitular: 'dominio',
  nudo_propietario: 'dominio',
  usufructuario: 'usufructo',
};

const AXIS_LABEL: Record<ShareAxis, string> = {
  dominio: 'dominio',
  usufructo: 'usufructo',
};

/** Tolerancia al comparar contra 100: tres herederos a 33,33 % suman 99,99 y están completos. */
const EPSILON = 0.011;

/** Un vínculo ya cargado en la unidad, tal como sale de la tabla (`numeric` viaja como texto). */
export interface ExistingShare {
  role: string | null;
  share_pct: string | number | null;
}

export interface OwnershipCheck {
  /** El eje al que va este vínculo. */
  axis: ShareAxis;
  /** Cuánto suma el eje contando este vínculo. */
  total: number;
  /** Cuánto falta para completar el eje. 0 si está completo o si el eje está vacío. */
  missing: number;
  /** Por qué no se puede guardar, o `null` si se puede. */
  error: string | null;
  /** Cómo contarlo en una frase — la misma para la pantalla y para el Copilot. */
  summary: string;
}

/** Cómo está repartida una unidad, mirando todos sus vínculos a la vez. */
export interface OwnershipSummary {
  /** Cuánto del dominio está asignado (titular + cotitular + nudo propietario). */
  assigned: number;
  /** Cuánto falta para completar el dominio. 0 si está completo. */
  missing: number;
  /** Cuánto usufructo hay declarado. 0 si nadie lo tiene. */
  usufruct: number;
  /** Si el dominio llega a 100. Con la unidad sin dueños es `false`: no hay nada asignado. */
  complete: boolean;
  /** Cuántas personas figuran en la unidad, contando todos los caracteres. */
  owners: number;
  /** La misma frase para la pantalla y para el Copilot. */
  summary: string;
}

/**
 * El estado del reparto de una unidad.
 *
 * Es lo que hay que poder mirar de un vistazo parado en la unidad: si el dominio está
 * completo, y si no, cuánto falta. En la ficha de un propietario esto no se puede ver —el
 * 100 % es por unidad, no por persona— y por eso vive acá.
 */
export function summarizeOwnership(shares: ExistingShare[]): OwnershipSummary {
  const sumOf = (axis: ShareAxis) =>
    shares
      .filter((s) => axisForRole(s.role) === axis)
      .reduce((acc, s) => acc + (toNumber(s.share_pct) ?? 0), 0);

  const assigned = sumOf('dominio');
  const usufruct = sumOf('usufructo');
  const complete = assigned >= 100 - EPSILON;
  const missing = complete ? 0 : 100 - assigned;

  let summary: string;
  if (shares.length === 0) summary = 'Sin titulares cargados.';
  else if (complete) summary = 'Titularidad completa (100 %).';
  else summary = `Falta asignar ${formatPercent(missing)} del dominio.`;
  if (usufruct > 0) summary += ` Con usufructo declarado (${formatPercent(usufruct)}).`;

  return { assigned, missing, usufruct, complete, owners: shares.length, summary };
}

/** Sin decimales si es redondo: «50 %», no «50,00 %». */
function formatPercent(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return `${String(rounded).replace('.', ',')} %`;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** El eje de un rol. Un rol desconocido cuenta como dominio: es lo que era antes del enum. */
export function axisForRole(role: string | null | undefined): ShareAxis {
  return ROLE_AXIS[(role ?? DEFAULT_OWNER_ROLE) as OwnerRole] ?? 'dominio';
}

/** Si el rol es uno de los cuatro que el sistema entiende. */
export function isOwnerRole(role: unknown): role is OwnerRole {
  return OWNER_ROLES.includes(role as OwnerRole);
}

/**
 * Qué pasa si a esta unidad se le agrega (o se le corrige) un vínculo con esta participación.
 *
 * `others` son los vínculos vigentes de la unidad SIN el que se está guardando: al editar, el
 * porcentaje viejo de esa misma persona no puede contarse dos veces.
 *
 * `share` en `null` significa «no lo sé»: no rompe nada, suma 0 y el resumen avisa que falta.
 */
export function checkOwnershipShares({
  unitName,
  others,
  share,
  role,
}: {
  unitName: string;
  others: ExistingShare[];
  share: number | null;
  role: OwnerRole;
}): OwnershipCheck {
  const axis = axisForRole(role);
  const axisLabel = AXIS_LABEL[axis];

  if (share !== null && (share <= 0 || share > 100)) {
    return {
      axis,
      total: 0,
      missing: 0,
      error: `La participación tiene que estar entre 0 y 100 %; llegó ${formatPercent(share)}.`,
      summary: '',
    };
  }

  const othersTotal = others
    .filter((o) => axisForRole(o.role) === axis)
    .reduce((acc, o) => acc + (toNumber(o.share_pct) ?? 0), 0);

  const total = othersTotal + (share ?? 0);

  if (total > 100 + EPSILON) {
    return {
      axis,
      total,
      missing: 0,
      error:
        `«${unitName}» ya tiene ${formatPercent(othersTotal)} de ${axisLabel} asignado; sumar ` +
        `${formatPercent(share ?? 0)} daría ${formatPercent(total)}. Las participaciones de una ` +
        `unidad no pueden pasar de 100 %.`,
      summary: '',
    };
  }

  const missing = total >= 100 - EPSILON ? 0 : 100 - total;

  return {
    axis,
    total,
    missing,
    error: null,
    summary: missing
      ? `«${unitName}» quedó con ${formatPercent(total)} de ${axisLabel} asignado: falta ${formatPercent(missing)}.`
      : `«${unitName}» quedó con el ${axisLabel} completo (100 %).`,
  };
}

/**
 * Cuándo una propiedad ES su propia unidad.
 *
 * En Coongro todo lo alquilable es una UNIDAD: el contrato, la titularidad y el estado de
 * ocupación cuelgan de ahí. Eso está bien para un edificio —seis departamentos, seis
 * inquilinos— pero deja afuera al caso más común de una inmobiliaria chica: la casa, el
 * local o la cochera que se alquilan enteros. Cargados como propiedad y sin ninguna unidad
 * adentro, no se les podía poner un dueño ni firmar un contrato: quedaban como una ficha
 * decorativa. En el tenant de prueba, «Moreno 55» (un local) llevaba semanas así.
 *
 * La salida no es cambiar el modelo —que la titularidad viva en dos lugares distintos sería
 * peor— sino que esa unidad exista sin que nadie tenga que crearla ni enterarse: **para quien
 * usa el sistema, le pone el inquilino a la casa**. Por eso la unidad se llama igual que la
 * propiedad: así `unitLabel` no la repite y en todos los desplegables se lee «Moreno 55», no
 * «Moreno 55 · Moreno 55».
 *
 * Es una función pura y no una constante suelta porque la pregunta —«¿esto contiene varias
 * unidades?»— la van a hacer también la ficha y las validaciones, y tienen que contestarla
 * todas igual.
 */

/**
 * Los tipos de propiedad que CONTIENEN varias unidades.
 *
 * Hoy solo el edificio. Está como lista y no como `type === 'edificio'` porque el día que
 * entre un PH o un complejo la regla cambia acá y no en cada consumidor.
 */
export const MULTI_UNIT_TYPES = ['edificio'] as const;

/** Si la propiedad contiene unidades (un edificio) o ES una sola (una casa, un local). */
export function hasMultipleUnits(type?: string | null): boolean {
  return MULTI_UNIT_TYPES.includes(String(type ?? '').trim() as (typeof MULTI_UNIT_TYPES)[number]);
}

/** Al revés, que es como se lee en la mayoría de los usos. */
export function isSingleUnit(type?: string | null): boolean {
  return !hasMultipleUnits(type);
}

/** Lo que hace falta de una propiedad para fabricarle su unidad. */
export interface SingleUnitInput {
  name?: string | null;
  type?: string | null;
  street?: string | null;
  street_number?: string | null;
}

/**
 * Cómo se llama la unidad de una propiedad que es una sola.
 *
 * El mismo nombre de la propiedad, para que no se lea dos veces. Si la propiedad no tiene
 * nombre se usa su dirección, y si tampoco la tiene, el tipo con mayúscula («Casa»): un
 * nombre vacío dejaría un renglón en blanco en todos los desplegables.
 */
export function singleUnitName({ name, type, street, street_number }: SingleUnitInput): string {
  const own = String(name ?? '').trim();
  if (own) return own;

  const address = [street, street_number]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ');
  if (address) return address;

  const kind = String(type ?? '').trim();
  return kind ? kind.charAt(0).toLocaleUpperCase('es-AR') + kind.slice(1) : 'Unidad';
}

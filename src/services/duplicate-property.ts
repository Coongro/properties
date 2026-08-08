/**
 * Cuándo dos propiedades cargadas son en realidad la misma.
 *
 * En el tenant de prueba «Laprida 2340 2°C» estaba dos veces, y ninguna de las dos pantallas
 * lo delataba: en el listado son dos tarjetas idénticas, y en los desplegables que piden
 * elegir una unidad aparecían dos renglones escritos igual. El problema no es el desorden —
 * es que a partir de ahí todo se parte en dos: el contrato queda en una y el titular en la
 * otra, la liquidación mira una sola y ninguna de las dos muestra la realidad del inmueble.
 *
 * **Misma dirección NO alcanza para ser duplicado.** «Laprida 2340 2°C» y «Laprida 2340 4°A»
 * comparten calle y altura y son dos departamentos distintos del mismo edificio: es el caso
 * normal de una inmobiliaria que administra unidades sueltas. Lo que sí es duplicado es la
 * misma propiedad cargada otra vez: **mismo nombre y misma dirección**.
 *
 * La comparación es tolerante a cómo se escribe cada carga: mayúsculas, acentos, el símbolo
 * de grado, guiones y espacios de más. Nadie escribe dos veces igual con seis meses de
 * diferencia, y una detección que exija coincidencia exacta no encuentra el duplicado que
 * está buscando.
 */

/** Lo que hace falta de una propiedad para saber si ya está cargada. */
export interface PropertyIdentity {
  id?: string;
  name?: string | null;
  street?: string | null;
  street_number?: string | null;
  city?: string | null;
}

/**
 * Texto comparable: sin acentos, sin puntuación y en minúscula.
 *
 * El «°» de «2°C» se cae junto con guiones y puntos, así que «2°C», «2ºC» y «2 C» se leen
 * igual. Es a propósito: dos formas de escribir el mismo departamento no deberían pasar por
 * dos departamentos distintos.
 */
function normalize(value?: string | null): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLocaleLowerCase('es-AR')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** La dirección como clave comparable: «laprida 2340 rosario». */
function addressKey({ street, street_number, city }: PropertyIdentity): string {
  return [street, street_number, city].map(normalize).filter(Boolean).join(' ');
}

/**
 * Si las dos filas son la misma propiedad cargada dos veces.
 *
 * Con dirección en ambas, tienen que coincidir el nombre Y la dirección. Sin dirección
 * —una carga incompleta— alcanza el nombre: dos «Casa de la abuela» sin más datos son con
 * mucha más probabilidad un duplicado que dos inmuebles distintos.
 *
 * Sin nombre no se afirma nada: la dirección sola es justamente lo que comparten las
 * unidades de un mismo edificio.
 */
export function isSameProperty(a: PropertyIdentity, b: PropertyIdentity): boolean {
  if (a.id && b.id && a.id === b.id) return false;

  const nameA = normalize(a.name);
  const nameB = normalize(b.name);
  if (!nameA || !nameB || nameA !== nameB) return false;

  const addressA = addressKey(a);
  const addressB = addressKey(b);
  if (!addressA || !addressB) return true;
  return addressA === addressB;
}

/** La primera propiedad ya cargada que es esta misma, si la hay. */
export function findDuplicate(
  property: PropertyIdentity,
  existing: readonly PropertyIdentity[]
): PropertyIdentity | undefined {
  return existing.find((other) => isSameProperty(property, other));
}

/**
 * Qué se le dice a quien está cargando.
 *
 * Nombra la propiedad que ya existe —para que se entienda que no es un error de tipeo sino
 * un choque con algo real— y dice qué hacer con las dos salidas legítimas: si de verdad es
 * otra unidad del mismo edificio, distinguirla en el nombre.
 */
/**
 * El edificio ya cargado en esa misma dirección, si lo hay.
 *
 * Es el otro camino por el que el mismo inmueble entra dos veces, y el que la comparación
 * entre propiedades no ve: un departamento se puede cargar como propiedad suelta **o** como
 * unidad de un edificio, y son dos pantallas que no se conocen. Con «Belgrano 1240» cargado
 * como edificio y su 3°B adentro, nada impedía cargar además un departamento llamado
 * «Belgrano 1240 3°B» — el mismo inmueble en dos lugares, cada uno con su contrato y su
 * titular, y ninguna pantalla mostrando la contradicción.
 *
 * La regla es del negocio, no del dato: **si en esa dirección ya hay un edificio, lo que se
 * alquila ahí es una de sus unidades.** No importa si el nombre coincide con alguna que ya
 * exista: la que falte se agrega adentro, que es donde el sistema sabe contarla.
 */
export function buildingAtSameAddress<T extends PropertyIdentity & { type?: string | null }>(
  property: PropertyIdentity,
  existing: readonly T[]
): T | undefined {
  const address = addressKey(property);
  if (!address) return undefined;
  return existing.find(
    (other) =>
      other.id !== property.id &&
      normalize(other.type) === 'edificio' &&
      addressKey(other) === address
  );
}

/**
 * Qué se le dice a quien está cargando un departamento donde ya hay un edificio.
 *
 * No alcanza con negarse: hay un lugar correcto para eso y hay que decir cuál, porque la
 * persona no tiene por qué saber que Coongro modela los departamentos de un edificio como
 * unidades. Por eso el mensaje nombra el edificio y el botón exacto que hay que apretar.
 */
export function insideBuildingMessage(building: PropertyIdentity): string {
  const name = String(building.name ?? '').trim() || 'el que ya está cargado';
  return `En esa dirección ya está cargado el edificio «${name}»: lo que se alquila ahí es una de sus unidades. Agregala desde su ficha con «Nueva unidad», y así el contrato, el dueño y las expensas quedan contra el mismo inmueble.`;
}

export function duplicateMessage(existing: PropertyIdentity): string {
  const name = String(existing.name ?? '').trim();
  const address = [existing.street, existing.street_number, existing.city]
    .map((part) => String(part ?? '').trim())
    .filter(Boolean)
    .join(' ');

  const where = address ? ` en ${address}` : '';
  return `Ya existe una propiedad llamada «${name}»${where}. Si es otra unidad del mismo edificio, distinguila en el nombre; si es la misma, editá la que ya está cargada en vez de crear otra.`;
}

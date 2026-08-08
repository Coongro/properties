/**
 * Cuándo dos contactos cargados son la misma persona.
 *
 * En el tenant de prueba «Ricardo Beltrán» estaba dos veces con el mismo DNI, cargado el 3
 * y el 4 de agosto. No es desprolijidad: a partir de ahí la persona se parte en dos —los
 * datos de cobro en una, las unidades en la otra— y la liquidación le gira a media persona.
 * Es el mismo daño que hacía la propiedad duplicada, sobre el otro lado del vínculo.
 *
 * **El documento es lo que identifica a una persona**, no el nombre: hay dos «Ricardo
 * Beltrán» en cualquier ciudad, pero un solo 14.892.331. Por eso el formulario ya lo exige
 * —sin CUIT o DNI no se le puede liquidar a nadie— y por eso alcanza para detectar el
 * duplicado.
 *
 * **Un CUIT contiene al DNI.** «20-11402887-3» y «11402887» son la misma persona: el CUIT se
 * arma con un prefijo de género/tipo, el número de documento y un dígito verificador. Quien
 * cargó a alguien con DNI y lo vuelve a cargar con CUIT —o al revés— no está creando otra
 * persona, y el sistema tampoco debería creerlo.
 */

/** Lo que hace falta de un contacto para saber si ya está cargado. */
export interface PersonIdentity {
  id?: string;
  name?: string | null;
  document_type?: string | null;
  document_number?: string | null;
}

/**
 * El documento como clave comparable: solo los dígitos, y de un CUIT/CUIL el número de
 * documento que lleva adentro.
 *
 * Devuelve cadena vacía cuando no hay con qué comparar — y sin documento **no se afirma
 * nada**: dos personas sin datos no son la misma por tener el mismo nombre.
 */
export function documentKey({ document_number }: PersonIdentity): string {
  const digits = String(document_number ?? '').replace(/\D/g, '');
  if (!digits) return '';
  // Un CUIT/CUIL son 11 dígitos: 2 de prefijo + documento + 1 verificador. Con 10 se
  // contempla el que se cargó sin el cero a la izquierda, que pasa más de lo que parece.
  if (digits.length >= 10 && digits.length <= 11) {
    return digits.slice(2, -1).replace(/^0+/, '');
  }
  return digits.replace(/^0+/, '');
}

/** Si los dos contactos son la misma persona cargada dos veces. */
export function isSamePerson(a: PersonIdentity, b: PersonIdentity): boolean {
  if (a.id && b.id && a.id === b.id) return false;
  const keyA = documentKey(a);
  const keyB = documentKey(b);
  return Boolean(keyA) && keyA === keyB;
}

/** La primera persona ya cargada que es esta misma, si la hay. */
export function findSamePerson(
  person: PersonIdentity,
  existing: readonly PersonIdentity[]
): PersonIdentity | undefined {
  return existing.find((other) => isSamePerson(person, other));
}

/**
 * Qué se le dice a quien está cargando.
 *
 * Nombra a la persona que ya existe y con qué documento figura —puede estar cargada con
 * CUIT y estarse escribiendo el DNI, y sin decirlo el aviso parecería un error del
 * sistema—. Y dice qué hacer: editar la que está, no crear otra.
 */
export function samePersonMessage(existing: PersonIdentity): string {
  const name = String(existing.name ?? '').trim() || 'otra persona';
  const type = String(existing.document_type ?? '')
    .trim()
    .toLocaleUpperCase('es-AR');
  const number = String(existing.document_number ?? '').trim();
  const document = [type, number].filter(Boolean).join(' ');

  const con = document ? ` con ${document}` : '';
  return `Ese documento ya es de «${name}»${con}. Es la misma persona: editala en vez de cargarla de nuevo, así sus unidades y sus datos de cobro quedan todos juntos.`;
}

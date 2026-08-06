/**
 * Cómo se nombra y se describe una unidad fuera de su propiedad.
 *
 * **El nombre de una unidad no identifica nada por sí solo.** «1°A» existe en todos los
 * edificios de la ciudad, y adentro de Coongro también: en el tenant de prueba había dos,
 * uno en Belgrano 1240 y otro en Salta 870, y los cuatro formularios que piden elegir una
 * unidad —contrato, propietario, certificado y orden de trabajo— mostraban las dos opciones
 * escritas igual. Elegir era tirar una moneda, y equivocarse no daba ningún error: el
 * contrato quedaba firmado contra el inmueble de otro dueño.
 *
 * Por eso el nombre calificado se arma acá, en el plugin que es dueño de las unidades, y no
 * en cada consumidor: si cada vista lo compusiera a su manera, la misma unidad se leería
 * distinta en cada pantalla y el próximo formulario volvería a nacer con el problema.
 *
 * Es una función pura y no SQL porque las reglas son de presentación —qué se omite cuando
 * sería redundante, qué se hace si falta un dato— y así se prueban sin base.
 */

/** Lo que hace falta saber de una unidad para nombrarla sin ambigüedad. */
export interface UnitIdentityInput {
  unitName?: string | null;
  buildingName?: string | null;
  buildingAddress?: string | null;
}

/** Ambientes, baños y superficie de una unidad, tal como salen de su fila. */
export interface UnitDetailInput {
  rooms?: number | string | null;
  bathrooms?: number | string | null;
  surface_m2?: number | string | null;
}

const text = (v: unknown): string => String(v ?? '').trim();

const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Cómo se lee una unidad en una lista donde no se sabe de qué propiedad es:
 * «Belgrano 1240 · 1°A».
 *
 * La propiedad va PRIMERO porque es lo que desambigua: con el nombre de la unidad adelante,
 * una lista de veinte «1°A» obliga a leer hasta el final de cada renglón para distinguirlas.
 *
 * Se prefiere el nombre de la propiedad sobre su dirección porque es como la nombra su
 * dueño («Belgrano 1240» ya suele SER la dirección); la dirección entra solo cuando la
 * propiedad no tiene nombre.
 */
export function unitLabel({ unitName, buildingName, buildingAddress }: UnitIdentityInput): string {
  const unit = text(unitName);
  const property = text(buildingName) || text(buildingAddress);

  if (!property) return unit;
  if (!unit) return property;

  // Un departamento suelto suele llamarse igual que su única unidad («Laprida 2340 2°C»
  // con la unidad «2°C» adentro). Repetirlo —«Laprida 2340 2°C · 2°C»— hace ruido y no
  // agrega nada: si el nombre de la propiedad ya termina con el de la unidad, alcanza.
  if (endsWithUnitName(property, unit)) return property;

  return `${property} · ${unit}`;
}

/** Si el nombre de la propiedad ya termina con el de la unidad, como palabra aparte. */
function endsWithUnitName(property: string, unit: string): boolean {
  const p = property.toLocaleLowerCase('es-AR');
  const u = unit.toLocaleLowerCase('es-AR');
  if (!p.endsWith(u)) return false;

  const prefix = p.slice(0, p.length - u.length);
  // La propiedad se llama exactamente igual que su unidad.
  if (prefix === '') return true;
  // Con algo delante, tiene que cortar en un separador: «Laprida 2340 2°C» contiene la
  // unidad «2°C», pero «Pasaje 12°C» NO — ahí el «2°C» es parte del número de la calle.
  return /[\s·,-]$/.test(prefix);
}

/** Ambientes, baños y superficie en una línea: «3 ambientes · 2 baños · 72 m²». */
export function unitDetail({ rooms, bathrooms, surface_m2 }: UnitDetailInput): string {
  const parts: string[] = [];

  const roomCount = num(rooms);
  if (roomCount > 0) parts.push(`${roomCount} ambiente${roomCount === 1 ? '' : 's'}`);

  const bathCount = num(bathrooms);
  if (bathCount > 0) parts.push(`${bathCount} baño${bathCount === 1 ? '' : 's'}`);

  const surface = num(surface_m2);
  if (surface > 0) parts.push(`${surface} m²`);

  return parts.join(' · ');
}

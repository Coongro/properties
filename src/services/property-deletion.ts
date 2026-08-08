/**
 * Cuándo una propiedad se puede dar de baja, y qué se lleva puesto.
 *
 * Hasta ahora no se podía borrar ninguna: la lógica estaba escrita de punta a punta —la
 * acción, el repositorio, el diálogo de confirmación— pero ninguna vista mostraba el botón,
 * así que una propiedad cargada por error se quedaba en el listado para siempre. Al
 * destaparlo aparece la otra mitad de la pregunta, que nadie había tenido que contestar:
 * **qué pasa con lo que cuelga de ella.**
 *
 * Dos respuestas distintas según de quién sea el dato:
 *
 *  - **Las unidades son de la propiedad** y se dan de baja con ella. Dejarlas vivas las
 *    convertía en unidades sin inmueble: seguían apareciendo en los cuatro desplegables que
 *    piden elegir una, y elegirlas ataba un contrato nuevo a una propiedad que ya no está.
 *  - **La ocupación no es nuestra.** La escribe `leases` cuando hay un contrato vigente, y es
 *    lo único que `properties` puede ver de él. Una unidad ocupada es un contrato vivo, y
 *    borrar el inmueble por abajo lo dejaría apuntando a la nada. Ahí no se borra: se explica.
 *
 * La baja es lógica (`deleted_at`), así que un borrado equivocado se revierte. Pero eso no
 * hace inocuo borrar con un contrato vigente: entre la baja y el arreglo, la liquidación del
 * mes mira una cartera a la que le falta un inmueble.
 */

/** Lo que hace falta de una unidad para saber si frena la baja. */
export interface UnitToDelete {
  name?: string | null;
  status?: string | null;
}

/** El estado con que `leases` marca la unidad que tiene contrato vigente. */
const OCCUPIED = 'ocupada';

/** Las unidades de la propiedad que están ocupadas. */
export function occupiedUnits(units: readonly UnitToDelete[]): UnitToDelete[] {
  return units.filter(
    (unit) =>
      String(unit.status ?? '')
        .trim()
        .toLocaleLowerCase('es-AR') === OCCUPIED
  );
}

/**
 * Por qué no se puede borrar ESTA unidad, o `null` si se puede.
 *
 * La misma regla que frena la baja de una propiedad, aplicada a una sola unidad: es el mismo
 * contrato vivo el que se rompería, se pida la baja desde el edificio o desde la unidad.
 */
export function unitDeletionBlockedMessage(unit: UnitToDelete): string | null {
  if (occupiedUnits([unit]).length === 0) return null;
  const name = String(unit.name ?? '').trim() || 'Esta unidad';
  return `La unidad «${name}» está ocupada: mientras haya un contrato vigente no se puede eliminar. Terminá el contrato desde Contratos y volvé a intentar.`;
}

/** «1°B, 2°A y 3°C» — como se enumera en castellano, con «y» antes del último. */
function enumerate(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

/**
 * Por qué no se puede borrar esta propiedad, o `null` si se puede.
 *
 * Nombra las unidades ocupadas —no basta con decir que hay contratos vivos, hay que decir
 * cuáles para saber a dónde ir— salvo cuando la propiedad ES su única unidad y se llaman
 * igual: repetir «"Salta 870" tiene la unidad "Salta 870" ocupada» es ruido, no información.
 */
export function deletionBlockedMessage(
  property: { name?: string | null },
  units: readonly UnitToDelete[]
): string | null {
  const occupied = occupiedUnits(units);
  if (occupied.length === 0) return null;

  const propertyName = String(property.name ?? '').trim() || 'Esta propiedad';
  const names = occupied
    .map((unit) => String(unit.name ?? '').trim())
    .filter((name) => name && name !== propertyName);

  const what =
    names.length === 0
      ? 'está ocupada'
      : names.length === 1
        ? `tiene la unidad «${names[0]}» ocupada`
        : `tiene ${occupied.length} unidades ocupadas (${enumerate(names)})`;

  return `«${propertyName}» ${what}: mientras haya un contrato vigente el inmueble no se puede eliminar. Terminá el contrato desde Contratos y volvé a intentar.`;
}

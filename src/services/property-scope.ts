/**
 * A qué inmueble pertenece un registro que cuelga de uno.
 *
 * Vale para todo lo que se cuelga de un inmueble y puede además apuntar a una unidad: un
 * certificado, una orden de trabajo, lo que venga después. La regla es la misma y por eso
 * vive una sola vez, en el plugin dueño de edificios y unidades — que es el único que puede
 * contestar de qué propiedad es realmente una unidad.
 *
 *   **El registro siempre pertenece a una propiedad. La unidad es una precisión, no una
 *   alternativa.**
 *
 * No hay caso al revés. El ascensor es del edificio y de ninguna unidad; la instalación de gas
 * del 3°B es del 3°B **y** del edificio en el que está. Un registro colgando de una unidad sin
 * propiedad no describe nada: la unidad ya vive adentro de una.
 *
 * Que sea jerárquico y no excluyente es lo que hace que «los certificados de esta propiedad»
 * —o sus órdenes de trabajo— sea una sola consulta: los suyos más los de sus unidades.
 *
 * ## Lo que esto viene a frenar
 *
 * Los `create` de certificados y de órdenes eran `insert` pelados: se podía guardar un registro
 * con la propiedad «Belgrano 1240» y una unidad de «Laprida 2340». Nada lo impedía, y el
 * resultado no era un dato raro sino **contradictorio**: la lectura por propiedad lo mostraba en
 * las DOS, porque una lo toma por `building_id` y la otra por `unit_id`. Dos fichas afirmando
 * que el mismo matafuegos es suyo.
 *
 * Los formularios ayudan a equivocarse: su desplegable de unidades lista las de TODA la cartera,
 * sin filtrar por la propiedad elegida. Lo único que atenúa es que la unidad se muestra
 * calificada («Belgrano 1240 · 1°A»), así que se nota si uno mira. Filtrar ese desplegable por
 * el valor de otro campo es una perilla que el Builder todavía no tiene — por eso la regla vive
 * acá, que es donde igual tiene que estar: la escritura entra por la pantalla, por el canal
 * agentic y por cualquier plugin que la llame.
 *
 * ## Lo que el plano agentic ya sabía
 *
 * El grafo declara esta invariante como `rule: 'requires'` (no `xor`) para los dos `create`, con
 * su nota. O sea que la pregunta ya estaba contestada ahí y el comentario del schema seguía
 * diciendo lo contrario. Lo que ningún gate puede ver es lo que esta regla agrega: que las dos
 * referencias **concuerden**. Eso no se deduce del schema —las claves foráneas ni siquiera están
 * declaradas, a propósito, para no atar las migraciones de un plugin a las de otro— y solo puede
 * vivir en la escritura.
 */

/** El alcance de un registro, como se lee en pantalla. */
export type PropertyScope = 'edificio' | 'unidad';

/** Si el registro alcanza a una unidad puntual o a toda la propiedad. */
export function scopeOf(record: { unit_id?: string | null }): PropertyScope {
  return String(record.unit_id ?? '').trim() ? 'unidad' : 'edificio';
}

/** Lo que hace falta saber de la unidad elegida para validar el alcance. */
export interface UnitOfRecord {
  /** Cómo se lee la unidad fuera de su propiedad: «Belgrano 1240 · 1°A». */
  label?: string | null;
  /** La propiedad a la que de verdad pertenece. */
  buildingId?: string | null;
}

/**
 * Por qué este registro no puede guardarse con ese alcance, o `null` si puede.
 *
 * `subject` es cómo se nombra la cosa en el mensaje —«Un certificado», «Una orden de trabajo»—
 * para que el reproche hable del dominio y no de una tabla.
 *
 * Nombra las dos puntas —la unidad y la propiedad elegida— porque el error es justamente que no
 * coinciden, y con una sola no se entiende cuál cambiar.
 */
export function scopeMismatchMessage(
  record: { building_id?: string | null; unit_id?: string | null },
  unit: UnitOfRecord | undefined,
  building: { name?: string | null } | undefined,
  subject: string
): string | null {
  const buildingId = String(record.building_id ?? '').trim();
  if (!buildingId) {
    return `${subject} pertenece siempre a una propiedad. Elegí a cuál antes de guardarlo.`;
  }

  if (scopeOf(record) === 'edificio') return null;

  // Sin la unidad a la vista no se puede afirmar nada: es una referencia que no existe, y ese
  // es un error distinto —lo contesta la base, no esta regla.
  if (!unit) return null;

  const suya = String(unit.buildingId ?? '').trim();
  if (!suya || suya === buildingId) return null;

  const cual = String(unit.label ?? '').trim() || 'La unidad elegida';
  const donde = String(building?.name ?? '').trim();
  const propiedad = donde ? `«${donde}»` : 'la propiedad elegida';
  return `${cual} no pertenece a ${propiedad}. ${subject} de una unidad es también de la propiedad donde esa unidad está: elegí una unidad de ${propiedad}, o cambiá la propiedad por la que corresponde.`;
}

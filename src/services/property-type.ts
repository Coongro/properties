/**
 * Qué clase de inmueble se carga como propiedad, y cuál no.
 *
 * El formulario de propiedad ofrecía «departamento» y la ficha de un edificio ofrece crear
 * unidades: el mismo departamento entraba por dos puertas y el sistema lo trataba distinto
 * según cuál se hubiera usado, sin decirle a nadie que estaba eligiendo. En el tenant de
 * prueba «Belgrano 1240 3°B» terminó cargado dos veces —una como propiedad suelta, otra como
 * unidad del edificio—, cada copia con su contrato y su titular, y ninguna pantalla mostrando
 * la contradicción.
 *
 * El primer intento cerró solo la mitad: rechazaba el departamento **si ya había un edificio
 * en esa dirección** (ver `buildingAtSameAddress`). Con el edificio todavía sin cargar la
 * puerta seguía abierta, y el duplicado aparecía meses después, cuando el contrato ya estaba
 * firmado contra la copia equivocada.
 *
 * La regla es más simple que su excepción: **un departamento es una unidad de su edificio,
 * siempre**. No existe departamento sin edificio; si el edificio no está cargado, se carga.
 * Así el `type` de una propiedad contesta una sola pregunta —«¿qué clase de inmueble se
 * alquila entero acá?»— en vez de mezclarla con «¿contiene otras unidades?», que es lo que
 * hacía cuando «edificio» y «departamento» convivían en la misma lista.
 */

/**
 * Los tipos que el alta de propiedades ofrece.
 *
 * `edificio` contiene unidades; los demás SON una sola (ver `single-unit.ts`). La lista está
 * acá y no en el spec de la vista porque la misma pregunta la contestan la pantalla, el canal
 * agentic y cualquier plugin que cree una propiedad — y una regla que vive en una sola de las
 * tres puertas no es una regla.
 */
export const PROPERTY_TYPES = [
  'edificio',
  'casa',
  'local',
  'oficina',
  'galpon',
  'cochera',
  'baulera',
] as const;

/**
 * Los tipos que NO son una propiedad sino una unidad adentro de una.
 *
 * Hoy solo el departamento. Queda como lista —y no como `type === 'departamento'`— porque el
 * día que entre «piso» o «monoambiente» la regla cambia acá y no en cada consumidor.
 */
export const UNIT_ONLY_TYPES = ['departamento'] as const;

/** Si lo que están cargando es en realidad una unidad de un edificio. */
export function isUnitOnlyType(type?: string | null): boolean {
  return UNIT_ONLY_TYPES.includes(
    String(type ?? '')
      .trim()
      .toLocaleLowerCase('es-AR') as (typeof UNIT_ONLY_TYPES)[number]
  );
}

/**
 * Qué se le dice a quien está cargando un departamento como propiedad.
 *
 * No alcanza con negarse: hay un lugar correcto y hay que decir cuál, porque quien carga no
 * tiene por qué saber que Coongro modela los departamentos como unidades. Por eso el mensaje
 * nombra el botón exacto y explica qué se gana — que el contrato, el dueño y las expensas
 * queden contra el mismo inmueble— en vez de recitar la restricción.
 */
export function unitOnlyTypeMessage(): string {
  return 'Un departamento es una unidad de su edificio, no una propiedad aparte. Cargá el edificio con su dirección y agregá el departamento desde su ficha con «Nueva unidad»: así el contrato, el dueño y las expensas quedan contra el mismo inmueble.';
}

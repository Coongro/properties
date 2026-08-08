---
'@coongro/properties': minor
---

Lo que se carga por error ahora se puede sacar, y un certificado no puede quedar entre dos propiedades.

**Borrado.** El listado de propiedades, las unidades, los certificados, las expensas y los propietarios ganan su acción de eliminar. La lógica ya existía completa —el hook, la acción, el repositorio— y solo faltaba el botón, así que el kit entero no tenía forma de deshacer un alta equivocada. Se niega cuando corresponde y lo explica: una propiedad con unidades ocupadas, una unidad con contrato vigente, un propietario con unidades a su nombre. Lo que es parte del registro cae con él en la misma transacción y con la misma marca de tiempo, que es lo que después le permite a `restore` devolver exactamente eso.

**Un departamento ya no se carga como propiedad.** Es una unidad de su edificio, siempre: el alta lo rechaza diciendo dónde va, y la migración 0004 convierte los que ya estaban.

**El alcance de un certificado.** La propiedad va siempre y la unidad la precisa —no es excluyente, como decía el schema—. La escritura verifica que la unidad pertenezca a esa propiedad: antes se podía guardar uno que aparecía en las fichas de dos propiedades a la vez. La migración 0005 normaliza lo viejo.

**La ficha de una unidad muestra sus certificados**, los suyos y los del edificio que la cubren, con su alcance a la vista. Solo los propios se administran desde ahí.

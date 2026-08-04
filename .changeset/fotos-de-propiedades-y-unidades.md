---
'@coongro/properties': minor
---

feat: fotos de verdad, y tres cosas que estaban rotas sin que se notara (COONG-275)

## Fotos

`photo_url` era un texto donde había que pegar la dirección de una imagen
publicada en otro servidor. Llegó a producción **sin una sola foto cargada** en
ninguna propiedad ni unidad, que es lo que pasa cuando cargar algo exige un paso
que nadie va a dar.

Ahora `building` y `unit` tienen `photos`: una lista de `{ url, caption }`. Se
suben arrastrando, eligiendo el archivo o con Ctrl+V, y quedan guardadas en el
storage del tenant. La migración pasa lo que hubiera en `photo_url` a la lista
antes de borrar la columna — `drizzle-kit` genera el DDL pero nunca los datos, y
sin ese `UPDATE` la migración se llevaba puestas las fotos existentes.

El listado muestra la primera; con varias, la tarjeta las pasa con flechas al
poner el mouse encima y se pueden ver completas.

**No se toca `propietarios`**: ahí `photo_url` es el `avatar_url` de un contacto,
que es la foto de una persona y vive en otro plugin.

## La ficha nunca mostró los certificados

`listByBuilding` fallaba con `COALESCE types integer and text cannot be matched`.
Los días de aviso viajan como parámetros y Postgres los infiere `text`, que no
se puede mezclar con el `alert_days` entero. La consulta entera moría, así que la
ficha decía «Sin certificados cargados» mientras el listado marcaba «Certificado
vencido» del mismo edificio. Se castea el `case` a `int`.

Belgrano 1240 tenía cinco certificados cargados desde julio y ninguno se veía.

## Dos helpers privados eran invocables por HTTP

`selectWithSummary` y `contactoPorId` son `private` en TypeScript y estaban
declarados en la lista `actions` del manifest. `private` desaparece al compilar:
lo único que decide qué se expone es esa lista. Es el mismo agujero que se cerró
en `leases`, que acá nunca se había aplicado.

Salen del manifest. Sus operaciones públicas —`list`, `getSummary`, `saveOwner`—
siguen intactas.

## Alta de unidades

La ficha de una propiedad no tenía forma de agregarle una unidad: solo se podían
editar las que ya existían. Ahora hay botón, y la propiedad viene precargada
desde la ficha en la que estás.

---
'@coongro/properties': patch
---

Tres datos que el sistema guardaba y no mostraba en ninguna pantalla

**Una unidad comprometida se veía igual que una libre.** El repositorio calcula
`reserved_from` —desde cuándo está tomada por un contrato que todavía no empezó— y su
comentario dice para qué existe: «sin esto, "vacante" esconde que ya está prometida y
alguien la vuelve a ofrecer». Ninguna vista lo leía, así que el problema que el campo vino
a resolver seguía intacto. Ahora las unidades muestran «Comprometida desde».

**Un certificado rechazado se veía igual que uno apto.** El formulario pide el resultado
del control —lo más importante de una inspección— y las tres tablas mostraban solo tipo,
estado y vencimiento. Un «rechazado» pintaba con el mismo verde de «vigente» mientras no
se le venciera el plazo. Ahora el resultado se ve en la lista, en rojo cuando corresponde.

**`sent_at` era una columna fantasma.** La fecha en que llegó la liquidación del consorcio
existía en la base y no estaba en ningún formulario: quedaba siempre vacía. Se carga junto
a la de pago.

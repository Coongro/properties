---
'@coongro/properties': patch
---

Una fila abre el registro que muestra, y el formulario de la unidad carga lo que está guardado

Tres cosas que se rompían por separado eran la misma: las listas no devolvían el registro
que la pantalla promete, y las vistas las usaban como si lo hicieran.

Entrando a una unidad **desde la ficha de un propietario** no funcionaba nada: la ficha se
abría con el id del vínculo de titularidad en vez del de la unidad, así que sus titulares y
sus certificados venían vacíos, «Editar unidad» abría el formulario en blanco y «Registrar
certificado» no podía completar la propiedad. Ahora la fila ES la unidad, con la
titularidad anotada encima.

Lo mismo pasaba con la tabla **«Titulares»**: la fila se veía clickeable y no llevaba a
ningún lado, porque pedía la ficha del propietario con una clave que no existe entre los
contactos. Ahora la fila lleva el id de la persona, y las dos tablas de titulares —la de la
unidad y la de la propiedad— abren a quien muestran.

Y el **estado de la unidad**: la lista pisaba el estado guardado con la ocupación derivada
de las fechas del contrato. Ese valor llegaba al formulario como prefill, así que guardar
escribía «ocupada» en la columna — el estado guardado que COONG-300 había sacado
justamente porque a los dos días miente. Ahora la ocupación viaja aparte, en `occupancy`, y
`status` es lo que alguien decidió.

De ahí salieron dos arreglos más:

- El formulario de la unidad ofrecía cinco estados cuando solo tres se podían guardar, y
  volver a «vacante» estaba bloqueado: una unidad marcada «no disponible» no tenía forma de
  volver atrás. Guardar «vacante» no libera nada —eso lo deciden las fechas—, así que ahora
  se acepta como «sacar la marca», y el campo ofrece únicamente lo que alguien decide.
- El freno que impide borrar una unidad con contrato vigente leía la columna, que desde
  COONG-300 dice «vacante» en toda unidad alquilada: no frenaba nada. Ahora mira la
  ocupación derivada.

---
'@coongro/properties': minor
---

Un propietario tiene ficha, y ni las personas ni los departamentos se cargan dos veces

**Ahora un propietario tiene ficha.** El listado decía «2 unidades» y ahí terminaba —no decía
cuáles— y clickear la fila abría el formulario de edición, con la tarjeta de la unidad
**vacía** porque solo sabe hablar de una: quien miraba esa pantalla concluía que la persona
no tenía ninguna, y si elegía una para «corregir» en realidad agregaba una tercera. La ficha
muestra sus unidades con la participación y el carácter en cada una, dónde se le paga y cómo
ubicarlo; editar volvió a ser un botón, como en el resto del sistema.

Y cuando la persona tiene varias unidades, el formulario ya no muestra la tarjeta vacía: dice
que las tiene y dónde verlas.

**El porcentaje del listado se fue.** Era el PROMEDIO de las participaciones, y promediar
partes de cosas distintas no significa nada: alguien con el 50 % de un departamento y el
100 % de otro figuraba con «75 %», que no es su parte de nada. La participación es por unidad
y se lee en la ficha, al lado de cada una.

**No se puede cargar dos veces a la misma persona.** En el tenant de prueba había dos
«Ricardo Beltrán» con el mismo DNI: a partir de ahí los datos de cobro quedan en una ficha y
las unidades en la otra, y la liquidación le gira a media persona. El documento es lo que
identifica a alguien —hay dos Ricardo Beltrán en cualquier ciudad, un solo 14.892.331— y por
eso el formulario ya lo exigía. Además **un CUIT contiene al DNI**: cargar «20-11402887-3» y
después «11402887» es la misma persona, y el sistema ya no cree que son dos.

**Y un departamento no se carga como propiedad cuando su edificio ya existe.** El mismo
inmueble podía entrar por dos puertas —como propiedad tipo departamento, o como unidad de un
edificio— y quedaba dos veces, cada uno con su contrato y su titular. Si en esa dirección ya
hay un edificio, lo que se alquila ahí es una de sus unidades, y el mensaje dice desde dónde
agregarla. Una casa en otra dirección no se frena.

**«Banco» pasó de texto libre a lista.** Escrito a mano entraba como «Santander», «Banco
Santander» y «santander rio»: los datos de cobro quedaban repartidos en tres bancos que son
uno solo. La lista tiene las entidades que operan con personas en Argentina y las billeteras,
y cierra con «Otro» para no dejar a nadie sin poder guardar.

Al catálogo agentic entra «Unidades de un propietario», que era la mitad que faltaba: sabía
decir quiénes son los dueños de una unidad, pero no de qué es dueño alguien.

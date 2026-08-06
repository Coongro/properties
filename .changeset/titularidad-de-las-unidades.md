---
'@coongro/properties': minor
---

Titularidad de las unidades: asignar, ver y elegir sin adivinar

Cinco cosas que se descubrieron tirando del mismo hilo: no se podía decir de quién es una
unidad.

**Un propietario se guarda junto con la unidad de la que es dueño, y con qué participación.**
La tabla del vínculo existía y se leía —«Listar propietarios» promete decir cuántas unidades
tiene cada uno— pero **nadie la escribía**: ni una de las ocho vistas la tocaba, y
`saveOwner` guardaba solo la persona. Todo propietario cargado quedaba huérfano y la
liquidación por participación no tenía con qué repartir. Ahora `unitOwners.saveOwner` acepta
`unit_id`, `share_pct` y `role` en la misma operación, y el formulario gana la tarjeta «Qué
unidad le pertenece».

**Los porcentajes de una unidad no pueden pasar de 100.** No es prolijidad: la renta de un
inmueble en condominio se atribuye a cada condómino según su parte indivisa (CCyC 1983), así
que una unidad al 130 % es plata girada de más y renta declarada que no existe. Quedar **por
debajo** sí se permite —los dueños se cargan de a uno— pero la respuesta dice cuánto falta,
para que una unidad al 60 % no reparta mal en silencio hasta la liquidación. El carácter es
un enum cerrado (`titular`, `cotitular`, `usufructuario`, `nudo_propietario`) y **el
usufructo suma aparte del dominio**: no le saca dominio a nadie, lo desmembra — en una sola
bolsa, un usufructo normal daría 200 %.

**Elegir una unidad deja de ser tirar una moneda.** «1°A» existe en todos los edificios de la
ciudad, y en el tenant de prueba había dos: uno en Belgrano 1240 y otro en Salta 870. Los
cuatro formularios que piden elegir una unidad —contrato, propietario, certificado y orden de
trabajo— mostraban dos renglones escritos igual, y equivocarse no daba ningún error: el
contrato quedaba firmado contra el inmueble de otro dueño. Ahora la unidad se lee
«Belgrano 1240 · 1°A», con su detalle debajo, y el nombre calificado lo arma el plugin dueño
de las unidades para que se lea igual en todas las pantallas.

**La titularidad se mira parado en la unidad**, que es donde el 100 % significa algo: en la
ficha de una persona nunca se ve si a una unidad le falta asignar una parte. La ficha de
unidad muestra estado, alquiler de referencia y cómo está repartida, con sus titulares y la
baja de un titular —que pide confirmación y **no borra a la persona**: queda sin esa unidad a
su nombre y se la puede volver a cargar.

**Una casa, un local o una cochera ya sirven para algo.** Todo lo alquilable es una unidad,
así que una propiedad cargada sin ninguna no podía tener dueño ni contrato: quedaba como una
ficha decorativa. Ahora nace con su única unidad, con el mismo nombre para que no se lea dos
veces, y la migración `0003` se la agrega a las que ya estaban. Para quien usa el sistema no
cambia nada: le pone el inquilino a la casa. Su ficha tampoco habla de unidades — muestra
directo su estado y sus titulares.

**Y la misma propiedad no se carga dos veces.** «Laprida 2340 2°C» estaba duplicada y ninguna
pantalla lo delataba; a partir de ahí todo se parte en dos: el contrato en una y el titular
en la otra. Ahora el alta y la edición se rechazan con un mensaje que dice contra qué chocó y
qué hacer. Misma dirección con nombre distinto **sí** se permite: son dos departamentos del
mismo edificio, que es el caso normal de una inmobiliaria.

Al catálogo agentic entran tres lecturas nuevas —los titulares de una unidad, los de una
propiedad y cómo está repartida— y la baja de un titular, que por ser destructiva se publica
solo con ejecución verificada contra un tenant sandbox y validación humana de su semántica.

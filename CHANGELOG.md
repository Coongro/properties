# @coongro/properties

## 0.2.0

### Minor Changes

- 3f52ade: Las operaciones de properties declaran su contrato, y el catálogo agentic se arma con eso

  Hasta ahora lo que un agente podía hacer con properties se infería de las pantallas: el
  generador miraba el formulario y publicaba lo que ese formulario mandaba. Eso alcanza
  mientras el que llama es la pantalla, y falla apenas no lo es — cuatro consultas
  (`buildings.getSummary`, `units.listByBuilding`, `certificates.listByBuilding`,
  `buildingExpenses.forBuilding`) quedaban publicadas **sin ningún parámetro**, porque en
  la interfaz la propiedad la pone el contexto de apertura y el formulario nunca la
  muestra. Un cliente sin ese contexto las llamaba sin filtro.

  Ahora cada operación declara su `defineAction` en `src/agentic/contracts.ts`: el mismo
  objeto que valida en runtime es el que se publica, así que no pueden desincronizarse.
  Lo que eso corrigió:

  - Las cuatro consultas de arriba piden la propiedad, y la piden **tipada**: el runtime
    comprueba que ese registro sea del tenant en vez de aceptar cualquier UUID.
  - `buildingExpenses.forPeriod` estaba declarada como escritura con confirmación. Es un
    `select` por mes; se corrigió a lectura.
  - `unitOwners.saveOwner` no exponía `id`, así que solo se podía crear un propietario,
    nunca editar uno. Y devolvía los campos del listado, que no son los que devuelve.
  - `unitOwners.getOwner` prometía las columnas del listado (unidades, CBU armado) y
    devuelve las del contacto aplanadas: se declaró lo que realmente sale.

  Los cinco `delete` quedan fuera del catálogo, con la razón escrita en el grafo: son
  soft-deletes de cuatro líneas que marcan `deleted_at` sin mirar qué cuelga del registro.
  Borrar una propiedad deja sus unidades, contratos y certificados apuntando a algo que
  para el resto del sistema ya no existe. La pantalla tiene el mismo problema —eso es un
  bug de producto aparte—, pero ahí hay una persona que puede dudar.

  Tampoco se publica el CRUD de `unitOwners`: escribe la tabla de vínculo salteando las
  tres reglas que `saveOwner` respeta.

- 272cb76: feat: cargar la liquidación de expensas del consorcio, mes a mes (COONG-275)

  La tabla de expensas por período existía desde el principio y no había forma de cargarla desde la
  app: quedaba vacía para siempre y los cargos se facturaban con el monto fijo del contrato.

  - Sección **Expensas** en la ficha de la propiedad, junto a Certificados y Órdenes: el histórico de
    meses con su total y su estado, y «Cargar mes» para dar de alta el que llegó.
  - Formulario **Expensas del mes**: propiedad, período, total liquidado, estado (recibida / pagada),
    fecha de pago, y el respaldo (link a la liquidación y observaciones).
  - `properties.buildingExpenses.forPeriod` devuelve las liquidaciones de un período filtrando en la
    base — lo consume `leases` al generar los cargos. Con un edificio da igual; con cincuenta, no.

  La alícuota de cada unidad («Alícuota de expensas (%)») ya existía en el formulario de unidad y
  ahora tiene para qué: es el porcentaje con el que se reparte ese total.

- de82a1b: Un propietario tiene ficha, y ni las personas ni los departamentos se cargan dos veces

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

- deb36bc: feat: fotos de verdad, y tres cosas que estaban rotas sin que se notara (COONG-275)

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

- cf4a208: Lo que se carga por error ahora se puede sacar, y un certificado no puede quedar entre dos propiedades.

  **Borrado.** El listado de propiedades, las unidades, los certificados, las expensas y los propietarios ganan su acción de eliminar. La lógica ya existía completa —el hook, la acción, el repositorio— y solo faltaba el botón, así que el kit entero no tenía forma de deshacer un alta equivocada. Se niega cuando corresponde y lo explica: una propiedad con unidades ocupadas, una unidad con contrato vigente, un propietario con unidades a su nombre. Lo que es parte del registro cae con él en la misma transacción y con la misma marca de tiempo, que es lo que después le permite a `restore` devolver exactamente eso.

  **Un departamento ya no se carga como propiedad.** Es una unidad de su edificio, siempre: el alta lo rechaza diciendo dónde va, y la migración 0004 convierte los que ya estaban.

  **El alcance de un certificado.** La propiedad va siempre y la unidad la precisa —no es excluyente, como decía el schema—. La escritura verifica que la unidad pertenezca a esa propiedad: antes se podía guardar uno que aparecía en las fichas de dos propiedades a la vez. La migración 0005 normaliza lo viejo.

  **La ficha de una unidad muestra sus certificados**, los suyos y los del edificio que la cubren, con su alcance a la vista. Solo los propios se administran desde ahí.

- 1d17dd4: Titularidad de las unidades: asignar, ver y elegir sin adivinar

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

### Patch Changes

- 1df8b50: El alta de propietarios escribe por el repositorio de contactos, no por su tabla

  `saveOwner` insertaba y actualizaba `module_contacts_contacts` directamente, así que
  cada invariante que agregaba `contacts` rompía acá de a una: primero `is_active`, que
  quedó parchado en el insert, después `id`, que dejó el alta de propietarios caída
  tanto por la interfaz como por MCP.

  Ahora escribe con `ContactRepository`, que es el dueño de esas reglas. Las lecturas
  siguen resolviéndose con join: listar propietarios registro por registro sería una
  consulta por fila.

  Además, el formulario de unidad expone `building_id` como referencia a la propiedad.
  Antes solo llegaba por el contexto de apertura (se abre desde la ficha del edificio),
  así que la operación era imposible de completar para cualquier cliente sin ese
  contexto.

- 272cb76: fix: la ficha de la propiedad no inventa datos que no tiene (COONG-275)

  - La tabla de unidades traía una columna **«Inquilino» que siempre decía «Sin inquilino»**: quién
    alquila es un hecho de los contratos y `properties` no lo conoce (la dependencia va al revés). Se
    quita hasta que `leases` pueda aportarlo por contribución — mostrar una columna que nunca se puede
    llenar es peor que no tenerla.
  - La columna de precio pasa a llamarse **«Alquiler de referencia»**, igual que en la lista: es el
    valor con el que se ofrece la unidad, no lo que paga el contrato vigente. Con el rótulo a secas
    parecía contradecir al contrato.

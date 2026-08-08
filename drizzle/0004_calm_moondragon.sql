-- Los departamentos cargados como propiedad pasan a ser lo que siempre fueron:
-- una unidad de su edificio.
--
-- El alta ofrecía «departamento» como tipo de propiedad y la ficha de un edificio
-- ofrece crear unidades: el mismo inmueble entraba por dos puertas y el sistema lo
-- trataba distinto según cuál se hubiera usado. Desde ahora la puerta equivocada
-- está cerrada (services/property-type.ts); esto acomoda lo que ya entró por ella.
--
-- El movimiento es más chico de lo que parece porque el modelo ya guardaba la mitad
-- correcta: toda propiedad que no es edificio tiene su unidad (migración 0003), y el
-- contrato, la titularidad y la ocupación cuelgan de ESA unidad. Así que no se mueve
-- ningún vínculo — solo se corrigen el tipo y los nombres.
--
--   «Laprida 2340 2°C» (departamento)        →  «Laprida 2340» (edificio)
--     └ unidad «Laprida 2340 2°C»                └ unidad «2°C»  ← el contrato sigue acá
--
-- Es reversible: la única baja que hace es lógica.

-- 1 · La unidad toma el distintivo del departamento.
--
-- El nombre del departamento repetía su dirección («Laprida 2340 2°C»); adentro del
-- edificio eso se lee dos veces, así que se le saca el prefijo y queda «2°C».
--
-- Solo toca la unidad que se llama IGUAL que la propiedad, que es la que 0003 le creó
-- siguiendo su nombre. Una unidad rebautizada a mano es una decisión de alguien y no
-- se pisa — mismo criterio que syncSingleUnit. Y si al sacar el prefijo no queda nada
-- (el nombre ERA la dirección), se deja como estaba: un nombre vacío dejaría un
-- renglón en blanco en todos los desplegables.
UPDATE "module_properties_units" u
SET "name" = s."designation"
FROM (
  SELECT
    b."id" AS "building_id",
    b."name" AS "property_name",
    btrim(substr(btrim(b."name"), length(btrim(concat_ws(' ', b."street", b."street_number"))) + 1)) AS "designation"
  FROM "module_properties_buildings" b
  WHERE b."deleted_at" IS NULL
    AND lower(btrim(b."type")) = 'departamento'
    AND btrim(concat_ws(' ', b."street", b."street_number")) <> ''
    AND left(lower(btrim(b."name")), length(btrim(concat_ws(' ', b."street", b."street_number"))))
        = lower(btrim(concat_ws(' ', b."street", b."street_number")))
) s
WHERE u."building_id" = s."building_id"
  AND u."deleted_at" IS NULL
  AND btrim(u."name") = btrim(s."property_name")
  AND s."designation" <> '';

-- 2 · El departamento cuyo edificio YA está cargado se muda adentro.
--
-- Este es el caso que destapó todo: «Belgrano 1240» cargado como edificio y, aparte,
-- un departamento «Belgrano 1240 3°B» — el mismo inmueble dos veces, cada copia con
-- su contrato y su titular.
--
-- Solo se muda cuando NO hay ambigüedad: si el edificio ya tiene una unidad que se
-- llama igual, las dos podrían tener contrato y elegir cuál sobrevive no es algo que
-- deba resolver una migración en silencio. Esos quedan afuera y el paso 3 los deja
-- como edificio propio, visibles para que alguien los resuelva a mano.
WITH "target" AS (
  SELECT DISTINCT ON (d."id")
    d."id" AS "flat_id",
    b."id" AS "building_id"
  FROM "module_properties_buildings" d
  JOIN "module_properties_buildings" b
    ON b."id" <> d."id"
   AND b."deleted_at" IS NULL
   AND lower(btrim(b."type")) = 'edificio'
   AND lower(btrim(coalesce(b."street", ''))) = lower(btrim(coalesce(d."street", '')))
   AND lower(btrim(coalesce(b."street_number", ''))) = lower(btrim(coalesce(d."street_number", '')))
   AND lower(btrim(coalesce(b."city", ''))) = lower(btrim(coalesce(d."city", '')))
  WHERE d."deleted_at" IS NULL
    AND lower(btrim(d."type")) = 'departamento'
    AND btrim(coalesce(d."street", '')) <> ''
    AND NOT EXISTS (
      SELECT 1
      FROM "module_properties_units" mine
      JOIN "module_properties_units" theirs
        ON theirs."building_id" = b."id"
       AND theirs."deleted_at" IS NULL
       AND lower(btrim(theirs."name")) = lower(btrim(mine."name"))
      WHERE mine."building_id" = d."id" AND mine."deleted_at" IS NULL
    )
  ORDER BY d."id", b."created_at"
)
UPDATE "module_properties_units" u
SET "building_id" = t."building_id"
FROM "target" t
WHERE u."building_id" = t."flat_id" AND u."deleted_at" IS NULL;

-- Y la propiedad que quedó vacía se da de baja: sus unidades ya viven en el edificio.
UPDATE "module_properties_buildings" d
SET "deleted_at" = now(), "is_active" = false
WHERE d."deleted_at" IS NULL
  AND lower(btrim(d."type")) = 'departamento'
  AND NOT EXISTS (
    SELECT 1 FROM "module_properties_units" u
    WHERE u."building_id" = d."id" AND u."deleted_at" IS NULL
  );

-- 3 · El resto pasa a ser el edificio de su dirección.
--
-- Un propietario particular con un solo departamento no administra el edificio entero,
-- y no hace falta que lo haga: la propiedad es el contenedor —la dirección— y la
-- titularidad en Coongro siempre fue por unidad. Su ficha va a decir «1 de 1», que es
-- exactamente lo que tiene.
UPDATE "module_properties_buildings" b
SET
  "type" = 'edificio',
  "name" = COALESCE(
    NULLIF(btrim(concat_ws(' ', b."street", b."street_number")), ''),
    b."name"
  )
WHERE b."deleted_at" IS NULL
  AND lower(btrim(b."type")) = 'departamento';

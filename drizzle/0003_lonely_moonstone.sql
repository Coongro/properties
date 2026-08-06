-- Las propiedades que NO son edificios reciben su única unidad.
--
-- Todo lo alquilable en Coongro es una unidad: el contrato, la titularidad y el
-- estado de ocupación cuelgan de ahí. Una casa o un local cargados sin ninguna
-- unidad adentro quedaban inutilizables — no se les podía poner dueño ni firmar
-- nada. Desde ahora el alta la crea sola (BuildingRepository.create); esto
-- arregla las que ya estaban cargadas.
--
-- La unidad se llama IGUAL que la propiedad para que no se lea dos veces
-- («Moreno 55», no «Moreno 55 · Moreno 55») — mismo criterio que
-- services/single-unit.ts. Sin nombre cae a la dirección, y sin dirección al
-- tipo: un nombre vacío dejaría un renglón en blanco en los desplegables.
--
-- Solo toca a las que no tienen NINGUNA unidad viva, así que correrla de nuevo
-- no duplica nada.
INSERT INTO "module_properties_units" ("building_id", "name", "status")
SELECT
  b."id",
  COALESCE(
    NULLIF(btrim(b."name"), ''),
    NULLIF(btrim(concat_ws(' ', b."street", b."street_number")), ''),
    NULLIF(initcap(btrim(b."type")), ''),
    'Unidad'
  ),
  'vacante'
FROM "module_properties_buildings" b
WHERE b."deleted_at" IS NULL
  AND btrim(b."type") <> 'edificio'
  AND NOT EXISTS (
    SELECT 1
    FROM "module_properties_units" u
    WHERE u."building_id" = b."id" AND u."deleted_at" IS NULL
  );

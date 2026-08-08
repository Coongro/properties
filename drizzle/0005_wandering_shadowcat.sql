-- Todo certificado de una unidad pertenece también a la propiedad de esa unidad.
--
-- El schema decía «uno de los dos alcances está seteado», como si fuera excluyente, y el
-- formulario hacía otra cosa: exige la propiedad siempre y deja la unidad opcional. La
-- que está bien es la segunda —el ascensor es del edificio y de ninguna unidad; el gas
-- del 3°B es del 3°B Y del edificio— y desde ahora la escritura la hace cumplir
-- (services/certificate-scope.ts).
--
-- Esto acomoda lo que pueda haber quedado del criterio anterior: una fila cargada contra
-- la unidad y sin propiedad. No es cosmético. La validación nueva mira el certificado
-- COMO VA A QUEDAR, así que sin este relleno una fila así quedaría **imposible de
-- editar**: cualquier cambio chocaría contra «un certificado pertenece siempre a una
-- propiedad», que es un reproche que quien lo cargó no puede resolver desde la pantalla.
--
-- Incluye las dadas de baja a propósito: una baja se puede revertir, y volver a la vida
-- en un estado que el sistema ya no acepta es peor que no volver.
UPDATE "module_properties_certificates" c
SET "building_id" = u."building_id"
FROM "module_properties_units" u
WHERE c."building_id" IS NULL
  AND c."unit_id" = u."id"
  AND u."building_id" IS NOT NULL;

-- No se agrega NOT NULL a `building_id` a propósito. Sería el invariante más fuerte, pero
-- una restricción alcanza a TODAS las filas, incluidas las dadas de baja hace meses cuya
-- unidad ya no existe y que por lo tanto no se pueden rellenar. Poner la restricción
-- obligaría a borrarlas de verdad para que la migración no falle, y no vale destruir
-- historia para ganar una garantía que el repositorio ya da en las tres puertas de
-- escritura (pantalla, canal agentic y cualquier plugin que llame).

---
'@coongro/properties': minor
---

Las operaciones de properties declaran su contrato, y el catálogo agentic se arma con eso

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

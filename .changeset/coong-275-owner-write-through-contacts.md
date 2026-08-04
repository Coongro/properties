---
'@coongro/properties': patch
---

El alta de propietarios escribe por el repositorio de contactos, no por su tabla

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

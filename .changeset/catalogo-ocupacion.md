---
'@coongro/properties': patch
---

El catálogo del Copilot describía una columna que ya no existe

Cuando la ocupación pasó a derivarse de las fechas del contrato, el campo que la informa
se llamó `occupancy` y `status` quedó para la marca que pone una persona. El catálogo
agentic siguió declarando `status` como el estado de la unidad, así que el Copilot leía
un campo que ya no viene y creía que «ocupada» era un valor que podía escribir — cuando
el repositorio lo rechaza justamente para que nadie marque a mano algo que sale del
contrato.

Ahora las seis acciones de unidades informan `occupancy`, el alta y la edición ofrecen
sólo lo que se puede escribir (con «vacante» explicado como «sacar la marca»), y
`status` deja de ser obligatorio al crear: una unidad nace sin marca.

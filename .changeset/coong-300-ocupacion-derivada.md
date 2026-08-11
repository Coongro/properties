---
'@coongro/properties': patch
---

La unidad guarda desde y hasta cuándo está comprometida, y la ocupación se calcula

Una unidad figuraba ocupada desde que se FIRMABA el contrato, no desde que empezaba: un
contrato que arrancaba el mes siguiente la marcaba alquilada al instante, así que no se
podía ofrecer una unidad que en realidad estaba libre tres semanas más. Y del otro lado no
existía nada que la liberara al vencer el contrato — quedaba ocupada para siempre.

Ahora la unidad guarda `occupied_from` y `occupied_until` (los escribe `leases`, que es
quien firma) y el estado se deriva comparándolos contra hoy. No hace falta ningún proceso
diario que mantenga nada al día: un hecho no caduca, un estado sí. Es el mismo criterio
que `billing` usa para «vencido».

Lo que decide quien administra sigue mandando: `no_disponible`, `en_recambio` y
`con_preaviso` no los pisa el contrato. Y una unidad comprometida a futuro ahora puede
decir desde cuándo, en vez de aparecer como vacante a secas.

---
'@coongro/properties': patch
---

Catálogo agentic republicado: las tres huellas coinciden y las exclusiones vencidas quedaron reevaluadas

El catálogo se había publicado antes de que existiera la huella de runtime, así que
`verify_catalog` lo daba por no fresco. Republicado con la certificación live corrida: las
tres huellas —grafo, catálogo y runtime— coinciden y `fresh` es verdadero por primera vez.

Las tres exclusiones que se habían escrito con una condición de re-evaluación quedaron
revisadas leyendo cada handler. `buildings.delete` y `units.delete` cumplieron su
condición —hoy validan dependencias y cascadean— pero se mantienen excluidas por una razón
distinta y deliberada: dar de baja un inmueble de la cartera es decisión de quien
administra, no algo que convenga automatizar. `certificates.delete` sigue excluida porque
su handler nunca cambió: la pantalla existe, pero el borrado sigue dejando huérfana la
alerta de vencimiento. Las tres con su huella estampada, así que la próxima vez que un
handler cambie el gate las devuelve a la mesa solo.

Ninguna capability se agregó ni se quitó y ninguna cambió de contenido: el diff grande es
reformateo del manifest. Lo que cambió son las huellas y los niveles de evidencia.

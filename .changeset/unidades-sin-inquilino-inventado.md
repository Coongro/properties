---
'@coongro/properties': patch
---

fix: la ficha de la propiedad no inventa datos que no tiene (COONG-275)

- La tabla de unidades traía una columna **«Inquilino» que siempre decía «Sin inquilino»**: quién
  alquila es un hecho de los contratos y `properties` no lo conoce (la dependencia va al revés). Se
  quita hasta que `leases` pueda aportarlo por contribución — mostrar una columna que nunca se puede
  llenar es peor que no tenerla.
- La columna de precio pasa a llamarse **«Alquiler de referencia»**, igual que en la lista: es el
  valor con el que se ofrece la unidad, no lo que paga el contrato vigente. Con el rótulo a secas
  parecía contradecir al contrato.

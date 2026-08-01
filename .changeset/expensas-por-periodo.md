---
'@coongro/properties': minor
---

feat: cargar la liquidación de expensas del consorcio, mes a mes (COONG-275)

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

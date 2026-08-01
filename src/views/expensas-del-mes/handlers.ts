/**
 * Lógica custom de «Expensas del mes» (ExpensasDelMesView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`expensas-del-mes.view.ts`,
 * `use-expensas-del-mes.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 *
 * El contrato completo (con la documentación de cada punto) está en
 * `CustomHandlers` de `@coongro/plugin-sdk`. De ahí salen también
 * `formatMoney`, `formatDateKey`, `periodLabel`, `plural` y `sharedLoad`
 * (comparte una consulta entre los bloques que se montan a la vez).
 */
import type { CustomHandlers } from '@coongro/plugin-sdk';

export const customHandlers: CustomHandlers = {
  // Reemplaza el guardado por defecto:
  // onSubmit: async (values, { execute, record }) => {
  //   await execute('<prefix>.create', { data: { building_id: values.building_id } });
  // },
  // Valores con los que abre el formulario (solo rellenan lo vacío):
  // onInit: async ({ execute, record }) => ({ building_id: record?.building_id ?? '' }),
  // Botones con acción de servidor (`record` = la fila, si es acción de fila):
  // onAction: async (actionId, { execute, record, toast, reload }) => { ... },
};

import { sql } from 'drizzle-orm';
import { boolean, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Expensas del consorcio, por período. Es un gasto del propietario: no se cobra
 * desde acá — quien liquida la plata es `billing`.
 */
export const buildingExpenseTable = pgTable('module_properties_building_expenses', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  building_id: uuid('building_id').notNull(),
  /** Período `YYYY-MM`. Las expensas son mensuales y se comparan mes contra mes. */
  period: text('period').notNull(),
  amount: numeric('amount').notNull(),
  status: text('status').notNull(),
  /** Fechas de calendario (DateKey `YYYY-MM-DD`): el día que llegó y el día que se pagó. */
  sent_at: text('sent_at'),
  paid_at: text('paid_at'),
  document_url: text('document_url'),
  notes: text('notes'),
  created_at: timestamp('created_at', { mode: 'string' })
    .notNull()
    .default(sql`now()`),
  updated_at: timestamp('updated_at', { mode: 'string' })
    .notNull()
    .default(sql`now()`),
  is_active: boolean('is_active').notNull().default(true),
  deleted_at: timestamp('deleted_at', { mode: 'string' }),
});

export type BuildingExpenseRow = typeof buildingExpenseTable.$inferSelect;
export type NewBuildingExpenseRow = typeof buildingExpenseTable.$inferInsert;

import { sql } from 'drizzle-orm';
import { boolean, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Propietarios de una unidad. Es una tabla aparte y no una columna porque un inmueble
 * heredado o de un matrimonio suele tener varios dueños con porcentajes distintos,
 * y la liquidación se reparte según esos porcentajes.
 */
export const unitOwnerTable = pgTable('module_properties_unit_owners', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  unit_id: uuid('unit_id').notNull(),
  /** Apunta a un contacto de `@coongro/contacts` — el dueño de la persona es ese plugin. */
  contact_id: uuid('contact_id').notNull(),
  /** Porcentaje de titularidad. Los de una misma unidad deberían sumar 100. */
  share_pct: numeric('share_pct'),
  /** Titular, cotitular, usufructuario. */
  role: text('role'),
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

export type UnitOwnerRow = typeof unitOwnerTable.$inferSelect;
export type NewUnitOwnerRow = typeof unitOwnerTable.$inferInsert;

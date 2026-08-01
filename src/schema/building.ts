import { sql } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const buildingTable = pgTable('module_properties_buildings', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  street: text('street'),
  street_number: text('street_number'),
  city: text('city'),
  province: text('province'),
  zip_code: text('zip_code'),
  cadastral_ref: text('cadastral_ref'),
  ownership_mode: text('ownership_mode'),
  /** Año de construcción — pesa en la antigüedad declarada y en qué certificados exige el municipio. */
  year_built: integer('year_built'),
  admin_name: text('admin_name'),
  admin_phone: text('admin_phone'),
  admin_email: text('admin_email'),
  photo_url: text('photo_url'),
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

export type BuildingRow = typeof buildingTable.$inferSelect;
export type NewBuildingRow = typeof buildingTable.$inferInsert;

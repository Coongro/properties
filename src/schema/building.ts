import { sql } from 'drizzle-orm';
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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
  /**
   * Fotos de la propiedad, en orden: `[{ url, caption? }]`. La primera es la que
   * muestra la tarjeta del listado.
   *
   * Reemplaza al `photo_url` original —una sola dirección escrita a mano—, que
   * llegó a producción sin una sola foto cargada: pegarla exigía tener la imagen
   * publicada en otro lado.
   */
  photos: jsonb('photos').$type<{ url: string; caption?: string }[]>(),
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

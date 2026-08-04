import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

/** Unidad alquilable dentro de un edificio. En una casa suelta, el edificio tiene una sola. */
export const unitTable = pgTable(
  'module_properties_units',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    building_id: uuid('building_id').notNull(),
    name: text('name').notNull(),
    /** Ambientes, como se cuenta en Argentina (un 2 ambientes = comedor + 1 dormitorio). */
    rooms: integer('rooms'),
    /** Baños. Va aparte de los ambientes: acá no cuentan como ambiente y el aviso siempre los declara. */
    bathrooms: integer('bathrooms'),
    surface_m2: numeric('surface_m2'),
    /** Porcentual de la unidad en el consorcio — reparte las expensas del edificio. */
    share_pct: numeric('share_pct'),
    status: text('status').notNull(),
    /** Valor de referencia para publicar o proponer un alquiler. El precio real lo fija el contrato. */
    reference_rent: numeric('reference_rent'),
    /** Fotos de la unidad, en orden: `[{ url, caption? }]`. La primera va en la tarjeta. */
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
  },
  (t) => ({
    // Las dos lecturas de siempre: las unidades de un edificio y las que están libres.
    buildingIdx: index('idx_properties_units_building').on(t.building_id),
    statusIdx: index('idx_properties_units_status').on(t.status),
  })
);

export type UnitRow = typeof unitTable.$inferSelect;
export type NewUnitRow = typeof unitTable.$inferInsert;

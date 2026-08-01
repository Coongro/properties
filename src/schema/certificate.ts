import { sql } from 'drizzle-orm';
import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Certificados con vencimiento del inmueble (gas, electricidad, ascensor, matafuegos…).
 * Uno de los dos alcances está seteado: `building_id` si aplica a todo el edificio,
 * `unit_id` si es de una unidad puntual.
 */
export const certificateTable = pgTable(
  'module_properties_certificates',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    building_id: uuid('building_id'),
    unit_id: uuid('unit_id'),
    type: text('type').notNull(),
    /** Fecha de realización (DateKey `YYYY-MM-DD`): es un día de calendario, no un instante. */
    done_at: text('done_at'),
    /** Vencimiento (DateKey). Es lo único obligatorio: sin esto no hay nada que avisar. */
    expires_at: text('expires_at').notNull(),
    /** Resultado del control — apto, apto con observaciones, rechazado. */
    result: text('result'),
    file_url: text('file_url'),
    /**
     * Días de anticipación del aviso, cuando este certificado necesita uno distinto del general.
     * Vacío = usa el default configurado en las settings del plugin.
     */
    alert_days: integer('alert_days'),
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
    // El aviso barre por vencimiento; las fichas listan por inmueble.
    expiresIdx: index('idx_properties_certificates_expires').on(t.expires_at),
    buildingIdx: index('idx_properties_certificates_building').on(t.building_id),
    unitIdx: index('idx_properties_certificates_unit').on(t.unit_id),
  })
);

export type CertificateRow = typeof certificateTable.$inferSelect;
export type NewCertificateRow = typeof certificateTable.$inferInsert;

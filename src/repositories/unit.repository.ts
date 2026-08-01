import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, asc, eq, isNull } from 'drizzle-orm';

import { unitTable } from '../schema/unit.js';
import type { UnitRow, NewUnitRow } from '../schema/unit.js';

export class UnitRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<UnitRow[]> {
    return this.db.ormQuery((tx) =>
      tx.select().from(unitTable).where(isNull(unitTable.deleted_at))
    );
  }

  /** Unidades de un edificio, para su ficha. Ordenadas por nombre (3°B después de 1°A). */
  async listByBuilding({ buildingId }: { buildingId: string }): Promise<UnitRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .select()
        .from(unitTable)
        .where(and(eq(unitTable.building_id, buildingId), isNull(unitTable.deleted_at)))
        .orderBy(asc(unitTable.name))
    );
  }

  async getById({ id }: { id: string }): Promise<UnitRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(unitTable).where(eq(unitTable.id, id)).limit(1)
    );
    return rows[0];
  }

  async create({ data }: { data: NewUnitRow }): Promise<UnitRow[]> {
    return this.db.ormQuery((tx) => tx.insert(unitTable).values(data).returning());
  }

  async update({ id, data }: { id: string; data: Partial<NewUnitRow> }): Promise<UnitRow[]> {
    return this.db.ormQuery((tx) =>
      tx.update(unitTable).set(data).where(eq(unitTable.id, id)).returning()
    );
  }

  async delete({ id }: { id: string }): Promise<UnitRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(unitTable)
        .set({
          deleted_at: new Date().toISOString(),
          is_active: false,
        } as unknown as Partial<NewUnitRow>)
        .where(eq(unitTable.id, id))
        .returning()
    );
  }

  async restore({ id }: { id: string }): Promise<UnitRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(unitTable)
        .set({ deleted_at: null, is_active: true } as unknown as Partial<NewUnitRow>)
        .where(eq(unitTable.id, id))
        .returning()
    );
  }
}

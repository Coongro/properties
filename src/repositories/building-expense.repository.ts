import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { buildingExpenseTable } from '../schema/building-expense.js';
import type { BuildingExpenseRow, NewBuildingExpenseRow } from '../schema/building-expense.js';

export class BuildingExpenseRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  async list(): Promise<BuildingExpenseRow[]> {
    return this.db.ormQuery((tx) =>
      tx.select().from(buildingExpenseTable).where(isNull(buildingExpenseTable.deleted_at))
    );
  }

  /**
   * Liquidaciones de un período, por edificio.
   *
   * La usa la generación de cargos: el total que liquidó el consorcio para ese mes
   * es lo que después se reparte entre las unidades según su alícuota. Se filtra en
   * la base y no trayendo todo: con un edificio da igual, con cincuenta no.
   */
  async forPeriod({ period }: { period: string }): Promise<BuildingExpenseRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .select()
        .from(buildingExpenseTable)
        .where(
          and(eq(buildingExpenseTable.period, period), isNull(buildingExpenseTable.deleted_at))
        )
    );
  }

  /**
   * Las liquidaciones de UN edificio, de la más reciente a la más vieja — lo que
   * muestra su ficha. Ordenar por período descendente es lo que espera quien mira:
   * el mes que acaba de llegar arriba.
   */
  async forBuilding({ buildingId }: { buildingId: string }): Promise<BuildingExpenseRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .select()
        .from(buildingExpenseTable)
        .where(
          and(
            eq(buildingExpenseTable.building_id, buildingId),
            isNull(buildingExpenseTable.deleted_at)
          )
        )
        .orderBy(desc(buildingExpenseTable.period))
    );
  }

  async getById({ id }: { id: string }): Promise<BuildingExpenseRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(buildingExpenseTable).where(eq(buildingExpenseTable.id, id)).limit(1)
    );
    return rows[0];
  }

  async create({ data }: { data: NewBuildingExpenseRow }): Promise<BuildingExpenseRow[]> {
    return this.db.ormQuery((tx) => tx.insert(buildingExpenseTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewBuildingExpenseRow>;
  }): Promise<BuildingExpenseRow[]> {
    return this.db.ormQuery((tx) =>
      tx.update(buildingExpenseTable).set(data).where(eq(buildingExpenseTable.id, id)).returning()
    );
  }

  async delete({ id }: { id: string }): Promise<BuildingExpenseRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(buildingExpenseTable)
        .set({
          deleted_at: new Date().toISOString(),
          is_active: false,
        } as unknown as Partial<NewBuildingExpenseRow>)
        .where(eq(buildingExpenseTable.id, id))
        .returning()
    );
  }

  async restore({ id }: { id: string }): Promise<BuildingExpenseRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(buildingExpenseTable)
        .set({ deleted_at: null, is_active: true } as unknown as Partial<NewBuildingExpenseRow>)
        .where(eq(buildingExpenseTable.id, id))
        .returning()
    );
  }
}

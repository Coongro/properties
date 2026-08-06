import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { and, asc, eq, getTableColumns, inArray, isNull, type SQL } from 'drizzle-orm';

import { buildingTable } from '../schema/building.js';
import { unitTable } from '../schema/unit.js';
import type { UnitRow, NewUnitRow } from '../schema/unit.js';
import { unitDetail, unitLabel } from '../services/unit-identity.js';

import { buildingAddressSql } from './building.repository.js';

/**
 * Una unidad con lo que hace falta para reconocerla fuera de su propiedad.
 *
 * `label` es el dato que faltaba: hasta COONG-294 las unidades salían de acá con su nombre
 * pelado —«1°A»— y los cuatro formularios que piden elegir una (contrato, propietario,
 * certificado, orden de trabajo) mostraban ese nombre en un desplegable. Con dos edificios
 * que tienen un 1°A, elegir era adivinar. El nombre calificado se arma acá, en el dueño de
 * las unidades, para que las cuatro pantallas lean la misma cosa.
 *
 * `detail` estaba declarado en el catálogo agentic pero lo armaba UNA vista a mano, así que
 * el agente que llamaba `units.list` nunca lo recibía. Ahora lo produce el repositorio, que
 * es lo que el catálogo venía prometiendo.
 */
export interface UnitListRow extends UnitRow {
  /** Cómo se llama la propiedad a la que pertenece. */
  building_name: string | null;
  /** La dirección de esa propiedad, con el mismo criterio que el listado de propiedades. */
  building_address: string | null;
  /** Nombre calificado: «Belgrano 1240 · 1°A». Lo que se muestra al elegir una unidad. */
  label: string;
  /** Ambientes, baños y superficie en una línea: «3 ambientes · 2 baños · 72 m²». */
  detail: string;
}

export class UnitRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  /**
   * Todas las unidades de la cartera. Es la que alimenta los desplegables de «elegir una
   * unidad», así que viene ordenada por propiedad y después por unidad: agrupadas, el
   * desplegable se recorre como se piensa («las de Belgrano», «las de Salta»).
   */
  async list(): Promise<UnitListRow[]> {
    return this.selectWithBuilding(isNull(unitTable.deleted_at));
  }

  /** Unidades de un edificio, para su ficha. Ordenadas por nombre (3°B después de 1°A). */
  async listByBuilding({ buildingId }: { buildingId: string }): Promise<UnitListRow[]> {
    return this.selectWithBuilding(
      and(eq(unitTable.building_id, buildingId), isNull(unitTable.deleted_at))
    );
  }

  async getById({ id }: { id: string }): Promise<UnitListRow | undefined> {
    const rows = await this.selectWithBuilding(eq(unitTable.id, id));
    return rows[0];
  }

  /**
   * La consulta de siempre, con la propiedad al lado.
   *
   * El join es `left` a propósito: una unidad cuyo edificio fue borrado tiene que seguir
   * apareciendo con su nombre, no desaparecer del listado sin explicación.
   */
  private async selectWithBuilding(where: SQL | undefined): Promise<UnitListRow[]> {
    const rows = await this.db.ormQuery((tx) =>
      tx
        .select({
          ...getTableColumns(unitTable),
          building_name: buildingTable.name,
          building_address: buildingAddressSql,
        })
        .from(unitTable)
        .leftJoin(buildingTable, eq(buildingTable.id, unitTable.building_id))
        .where(where)
        .orderBy(asc(buildingTable.name), asc(unitTable.name))
    );

    return rows.map((row) => ({
      ...row,
      label: unitLabel({
        unitName: row.name,
        buildingName: row.building_name,
        buildingAddress: row.building_address,
      }),
      detail: unitDetail(row),
    }));
  }

  /**
   * Las filas recién escritas, releídas con la forma completa.
   *
   * `returning()` devuelve la fila cruda de la tabla, sin la propiedad ni los campos
   * compuestos — y el catálogo agentic promete esos campos también en las escrituras. Una
   * consulta más por alta o edición es barato al lado de publicar un contrato que miente.
   */
  private async reread(rows: UnitRow[]): Promise<UnitListRow[]> {
    const ids = rows.map((f) => f.id).filter(Boolean);
    if (ids.length === 0) return [];
    return this.selectWithBuilding(inArray(unitTable.id, ids));
  }

  async create({ data }: { data: NewUnitRow }): Promise<UnitListRow[]> {
    const rows = await this.db.ormQuery((tx) => tx.insert(unitTable).values(data).returning());
    return this.reread(rows);
  }

  async update({ id, data }: { id: string; data: Partial<NewUnitRow> }): Promise<UnitListRow[]> {
    const rows = await this.db.ormQuery((tx) =>
      tx.update(unitTable).set(data).where(eq(unitTable.id, id)).returning()
    );
    return this.reread(rows);
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

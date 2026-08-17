import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { describe, expect, it, vi } from 'vitest';

/**
 * La ocupación no se fija a mano.
 *
 * `ocupada`/`vacante` se derivan de `occupied_from`/`occupied_until`, que escribe
 * `leases` al firmar. El update los aceptaba igual: guardaba la columna, releía la
 * unidad y devolvía el estado derivado de siempre — respondía «listo» sin haber
 * cambiado nada. Lo encontró el agente ciego, que pidió marcar una unidad como
 * ocupada, confirmó, y leyó «Estado: Vacante» en la misma respuesta.
 */
vi.mock('@coongro/contacts/server', () => ({
  ContactRepository: class {},
  contactTable: { id: 'id', name: 'name' },
}));

const { UnitRepository } = await import('./unit.repository.js');

const baseVacia = () => ({ ormQuery: vi.fn(async () => []) }) as unknown as ModuleDatabaseAPI;

describe('editar una unidad', () => {
  it('se niega a que le fijen «ocupada» y dice dónde está la palanca real', async () => {
    const db = baseVacia();

    await expect(
      new UnitRepository(db).update({ id: 'u-1', data: { status: 'ocupada' } as never })
    ).rejects.toThrow(/no se fija a mano|firmá el contrato/i);
  });

  it('se niega también con «vacante»: liberar es rescindir, no editar', async () => {
    const db = baseVacia();

    await expect(
      new UnitRepository(db).update({ id: 'u-1', data: { status: 'vacante' } as never })
    ).rejects.toThrow(/no se fija a mano/i);
  });

  it('deja pasar la disponibilidad, que sí la decide quien administra', async () => {
    const db = baseVacia();

    await expect(
      new UnitRepository(db).update({ id: 'u-1', data: { status: 'no_disponible' } as never })
    ).resolves.toEqual([]);
  });

  it('no se mete con una edición que no toca el estado', async () => {
    const db = baseVacia();

    await expect(
      new UnitRepository(db).update({ id: 'u-1', data: { name: '1° A' } as never })
    ).resolves.toEqual([]);
  });
});

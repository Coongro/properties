import { describe, expect, it } from 'vitest';

import {
  deletionBlockedMessage,
  occupiedUnits,
  unitDeletionBlockedMessage,
} from './property-deletion.js';

describe('occupiedUnits', () => {
  it('solo las ocupadas frenan la baja', () => {
    const units = [
      { name: '1°A', status: 'vacante' },
      { name: '1°B', status: 'ocupada' },
      { name: '2°A', status: 'vacante' },
    ];
    expect(occupiedUnits(units).map((u) => u.name)).toEqual(['1°B']);
  });

  it('no se cuelga de cómo esté escrito el estado', () => {
    expect(occupiedUnits([{ name: '1°B', status: ' Ocupada ' }])).toHaveLength(1);
  });

  it('sin estado no se asume ocupada: bloquearía una baja legítima', () => {
    expect(occupiedUnits([{ name: '1°B' }, { name: '2°A', status: null }])).toHaveLength(0);
  });
});

describe('deletionBlockedMessage', () => {
  it('una propiedad sin unidades ocupadas se puede borrar', () => {
    expect(
      deletionBlockedMessage({ name: 'Moreno 55' }, [{ name: 'Moreno 55', status: 'vacante' }])
    ).toBeNull();
    expect(deletionBlockedMessage({ name: 'Moreno 55' }, [])).toBeNull();
  });

  it('nombra la unidad ocupada, que es a dónde hay que ir', () => {
    const message = deletionBlockedMessage({ name: 'Belgrano 1240' }, [
      { name: '1°A', status: 'vacante' },
      { name: '1°B', status: 'ocupada' },
    ]);
    expect(message).toContain('«Belgrano 1240»');
    expect(message).toContain('«1°B»');
    expect(message).toContain('Contratos');
  });

  it('con varias, las enumera en castellano', () => {
    const message = deletionBlockedMessage({ name: 'Belgrano 1240' }, [
      { name: '1°B', status: 'ocupada' },
      { name: '2°A', status: 'ocupada' },
      { name: '3°C', status: 'ocupada' },
    ]);
    expect(message).toContain('3 unidades ocupadas (1°B, 2°A y 3°C)');
  });

  it('no repite el nombre cuando la propiedad ES su única unidad', () => {
    // Una casa y su unidad se llaman igual a propósito (ver single-unit.ts). Decir
    // «"Salta 870" tiene la unidad "Salta 870" ocupada» es ruido, no información.
    const message = deletionBlockedMessage({ name: 'Salta 870' }, [
      { name: 'Salta 870', status: 'ocupada' },
    ]);
    expect(message).toContain('«Salta 870» está ocupada');
    expect(message).not.toContain('la unidad');
  });

  it('sin nombre no deja un hueco en la frase', () => {
    const message = deletionBlockedMessage({ name: '  ' }, [{ name: '1°B', status: 'ocupada' }]);
    expect(message).toContain('«Esta propiedad»');
  });
});

describe('unitDeletionBlockedMessage', () => {
  it('una unidad vacante se puede borrar', () => {
    expect(unitDeletionBlockedMessage({ name: '1°B', status: 'vacante' })).toBeNull();
  });

  it('una unidad ocupada no, y dice a dónde ir', () => {
    const message = unitDeletionBlockedMessage({ name: '1°B', status: 'ocupada' });
    expect(message).toContain('«1°B»');
    expect(message).toContain('Contratos');
  });

  it('frena por la MISMA razón que la baja del edificio', () => {
    // Da igual desde qué pantalla se pida: lo que se rompería es el mismo contrato.
    const unit = { name: '1°B', status: 'ocupada' };
    expect(unitDeletionBlockedMessage(unit)).not.toBeNull();
    expect(deletionBlockedMessage({ name: 'Belgrano 1240' }, [unit])).not.toBeNull();
  });

  it('sin nombre no deja un hueco en la frase', () => {
    expect(unitDeletionBlockedMessage({ status: 'ocupada' })).toContain('«Esta unidad»');
  });
});

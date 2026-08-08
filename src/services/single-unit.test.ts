import { describe, expect, it } from 'vitest';

import { hasMultipleUnits, isSingleUnit, singleUnitName } from './single-unit.js';
import { unitLabel } from './unit-identity.js';

describe('hasMultipleUnits', () => {
  it('solo un edificio contiene varias unidades', () => {
    expect(hasMultipleUnits('edificio')).toBe(true);
  });

  it('una casa, un local o una cochera son una sola unidad', () => {
    for (const kind of ['casa', 'local', 'departamento', 'oficina', 'galpon', 'cochera', 'baulera'])
      expect(isSingleUnit(kind)).toBe(true);
  });

  it('sin tipo se asume una sola: es lo que no deja la propiedad inutilizable', () => {
    expect(isSingleUnit(null)).toBe(true);
    expect(isSingleUnit('')).toBe(true);
  });

  it('no se cuelga de espacios de más', () => {
    expect(hasMultipleUnits('  edificio  ')).toBe(true);
  });
});

describe('singleUnitName', () => {
  it('usa el nombre de la propiedad', () => {
    expect(singleUnitName({ name: 'Moreno 55', type: 'local' })).toBe('Moreno 55');
  });

  it('sin nombre cae a la dirección', () => {
    expect(
      singleUnitName({ name: '  ', type: 'casa', street: 'Mitre', street_number: '840' })
    ).toBe('Mitre 840');
  });

  it('sin nombre ni dirección, el tipo con mayúscula — nunca vacío', () => {
    expect(singleUnitName({ type: 'cochera' })).toBe('Cochera');
    expect(singleUnitName({})).toBe('Unidad');
  });

  it('el nombre elegido hace que la unidad NO se lea dos veces', () => {
    // Es la razón de que la unidad se llame igual que la propiedad: en los cuatro
    // desplegables que piden elegir una unidad se lee «Moreno 55», no
    // «Moreno 55 · Moreno 55».
    const property = { name: 'Moreno 55', type: 'local' };
    expect(
      unitLabel({
        unitName: singleUnitName(property),
        buildingName: property.name,
        buildingAddress: 'Moreno 55, Rosario',
      })
    ).toBe('Moreno 55');
  });
});

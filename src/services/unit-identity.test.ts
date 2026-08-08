import { describe, it, expect } from 'vitest';

import { unitDetail, unitLabel } from './unit-identity.js';

describe('unitLabel — que dos unidades con el mismo nombre no se lean igual', () => {
  it('antepone la propiedad: es lo que las distingue', () => {
    expect(unitLabel({ unitName: '1°A', buildingName: 'Belgrano 1240' })).toBe(
      'Belgrano 1240 · 1°A'
    );
  });

  it('el caso que motivó todo: los dos «1°A» quedan distinguibles', () => {
    const belgrano = unitLabel({ unitName: '1°A', buildingName: 'Belgrano 1240' });
    const salta = unitLabel({ unitName: '1°A', buildingName: 'Salta 870' });
    expect(belgrano).not.toBe(salta);
  });

  it('y el que va a pasar siempre: dos casas cuya unidad se llama «Casa»', () => {
    const una = unitLabel({ unitName: 'Casa', buildingName: 'Moreno 55' });
    const otra = unitLabel({ unitName: 'Casa', buildingName: 'Rioja 3120' });
    expect(una).toBe('Moreno 55 · Casa');
    expect(una).not.toBe(otra);
  });

  it('usa la dirección cuando la propiedad no tiene nombre', () => {
    expect(
      unitLabel({ unitName: '3°B', buildingName: '', buildingAddress: 'Laprida 2340, Rosario' })
    ).toBe('Laprida 2340, Rosario · 3°B');
  });

  it('prefiere el nombre sobre la dirección: es como lo llama su dueño', () => {
    expect(
      unitLabel({
        unitName: '3°B',
        buildingName: 'Belgrano 1240',
        buildingAddress: 'Belgrano 1240, Rosario',
      })
    ).toBe('Belgrano 1240 · 3°B');
  });
});

describe('unitLabel — sin repetir lo que ya está dicho', () => {
  it('no dice dos veces lo mismo en un departamento suelto', () => {
    expect(unitLabel({ unitName: '2°C', buildingName: 'Laprida 2340 2°C' })).toBe(
      'Laprida 2340 2°C'
    );
  });

  it('tampoco cuando la propiedad se llama igual que su única unidad', () => {
    expect(unitLabel({ unitName: 'Casa', buildingName: 'Casa' })).toBe('Casa');
  });

  it('ignora mayúsculas al comparar', () => {
    expect(unitLabel({ unitName: '2°c', buildingName: 'Laprida 2340 2°C' })).toBe(
      'Laprida 2340 2°C'
    );
  });

  it('pero NO se traga la unidad cuando es parte de otra palabra', () => {
    // «Pasaje 12°C» termina con «2°C» por casualidad: ahí el 2°C es del número de calle.
    expect(unitLabel({ unitName: '2°C', buildingName: 'Pasaje 12°C' })).toBe('Pasaje 12°C · 2°C');
  });
});

describe('unitLabel — datos incompletos', () => {
  it('una unidad sin propiedad se lee por su nombre', () => {
    expect(unitLabel({ unitName: '1°A' })).toBe('1°A');
  });

  it('una propiedad sin unidad se lee por el suyo', () => {
    expect(unitLabel({ unitName: null, buildingName: 'Moreno 55' })).toBe('Moreno 55');
  });

  it('sin nada, texto vacío — nunca «undefined» en pantalla', () => {
    expect(unitLabel({})).toBe('');
    expect(unitLabel({ unitName: '  ', buildingName: null, buildingAddress: undefined })).toBe('');
  });
});

describe('unitDetail', () => {
  it('arma ambientes, baños y superficie', () => {
    expect(unitDetail({ rooms: 3, bathrooms: 2, surface_m2: '72' })).toBe(
      '3 ambientes · 2 baños · 72 m²'
    );
  });

  it('singulariza', () => {
    expect(unitDetail({ rooms: 1, bathrooms: 1 })).toBe('1 ambiente · 1 baño');
  });

  it('omite lo que no está cargado en vez de mostrar ceros', () => {
    expect(unitDetail({ rooms: 2, bathrooms: null, surface_m2: 0 })).toBe('2 ambientes');
    expect(unitDetail({})).toBe('');
  });

  it('aguanta valores no numéricos sin romper', () => {
    expect(unitDetail({ rooms: 'ninguno', surface_m2: '48' })).toBe('48 m²');
  });
});

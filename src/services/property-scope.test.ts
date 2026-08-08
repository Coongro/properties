import { describe, expect, it } from 'vitest';

import { scopeMismatchMessage, scopeOf } from './property-scope.js';

const BELGRANO = 'b-1';
const LAPRIDA = 'b-2';
const CERTIFICADO = 'Un certificado';

describe('scopeOf', () => {
  it('sin unidad, el registro es de toda la propiedad', () => {
    expect(scopeOf({})).toBe('edificio');
    expect(scopeOf({ unit_id: null })).toBe('edificio');
    expect(scopeOf({ unit_id: '  ' })).toBe('edificio');
  });

  it('con unidad, es de esa unidad', () => {
    expect(scopeOf({ unit_id: 'u-1' })).toBe('unidad');
  });
});

describe('scopeMismatchMessage', () => {
  it('el ascensor del edificio se guarda sin unidad', () => {
    expect(
      scopeMismatchMessage(
        { building_id: BELGRANO },
        undefined,
        { name: 'Belgrano 1240' },
        CERTIFICADO
      )
    ).toBeNull();
  });

  it('el gas de una unidad de ESA propiedad se guarda', () => {
    expect(
      scopeMismatchMessage(
        { building_id: BELGRANO, unit_id: 'u-1' },
        { label: 'Belgrano 1240 · 3°B', buildingId: BELGRANO },
        { name: 'Belgrano 1240' },
        CERTIFICADO
      )
    ).toBeNull();
  });

  it('una unidad de OTRA propiedad se rechaza, y nombra las dos puntas', () => {
    // El caso que se podía guardar: el registro terminaba apareciendo en las fichas de las
    // dos propiedades, porque una lo toma por building_id y la otra por unit_id.
    const message = scopeMismatchMessage(
      { building_id: BELGRANO, unit_id: 'u-9' },
      { label: 'Laprida 2340 · 2°C', buildingId: LAPRIDA },
      { name: 'Belgrano 1240' },
      CERTIFICADO
    );
    expect(message).toContain('Laprida 2340 · 2°C');
    expect(message).toContain('«Belgrano 1240»');
  });

  it('el mensaje habla del dominio, no de la tabla', () => {
    // La misma regla la usan certificados y órdenes de trabajo: el sujeto viaja con la
    // llamada para que el reproche se lea como lo que la persona estaba cargando.
    const orden = scopeMismatchMessage(
      { building_id: BELGRANO, unit_id: 'u-9' },
      { label: 'Laprida 2340 · 2°C', buildingId: LAPRIDA },
      { name: 'Belgrano 1240' },
      'Una orden de trabajo'
    );
    expect(orden).toContain('Una orden de trabajo de una unidad');
    expect(orden).not.toContain('certificado');
  });

  it('sin propiedad no se guarda nada', () => {
    expect(scopeMismatchMessage({ unit_id: 'u-1' }, undefined, undefined, CERTIFICADO)).toContain(
      'pertenece siempre a una propiedad'
    );
  });

  it('una unidad que no existe no es problema de esta regla', () => {
    // Es una referencia rota, y eso lo contesta la base con su propio error.
    expect(
      scopeMismatchMessage(
        { building_id: BELGRANO, unit_id: 'u-fantasma' },
        undefined,
        { name: 'Belgrano 1240' },
        CERTIFICADO
      )
    ).toBeNull();
  });

  it('sin saber de qué propiedad es la unidad, no se afirma nada', () => {
    expect(
      scopeMismatchMessage(
        { building_id: BELGRANO, unit_id: 'u-1' },
        { label: '3°B', buildingId: null },
        { name: 'Belgrano 1240' },
        CERTIFICADO
      )
    ).toBeNull();
  });

  it('sin nombres la frase igual se lee', () => {
    const message = scopeMismatchMessage(
      { building_id: BELGRANO, unit_id: 'u-9' },
      { buildingId: LAPRIDA },
      undefined,
      CERTIFICADO
    );
    expect(message).toContain('La unidad elegida');
    expect(message).toContain('la propiedad elegida');
  });
});

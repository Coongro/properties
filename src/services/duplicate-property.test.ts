import { describe, expect, it } from 'vitest';

import { duplicateMessage, findDuplicate, isSameProperty } from './duplicate-property.js';

const laprida = {
  id: 'a',
  name: 'Laprida 2340 2°C',
  street: 'Laprida',
  street_number: '2340',
  city: 'Rosario',
};

describe('isSameProperty', () => {
  it('el caso que originó esto: la misma cargada dos veces', () => {
    expect(isSameProperty({ ...laprida, id: 'b' }, laprida)).toBe(true);
  });

  it('NO son duplicadas dos unidades distintas del mismo edificio', () => {
    // El caso normal de una inmobiliaria: comparten calle, altura y ciudad.
    const otra = { ...laprida, id: 'b', name: 'Laprida 2340 4°A' };
    expect(isSameProperty(otra, laprida)).toBe(false);
  });

  it('tolera cómo se escribió cada carga', () => {
    const variantes = [
      'laprida 2340 2°C',
      'LAPRIDA 2340 2°C',
      'Laprida  2340  2°C',
      'Laprida 2340 2ºC', // masculina en vez del símbolo de grado
      'Laprida 2340 2-C',
    ];
    for (const name of variantes)
      expect(isSameProperty({ ...laprida, id: 'b', name }, laprida)).toBe(true);
  });

  it('ignora acentos: «Güemes» y «Guemes» son la misma calle', () => {
    const con = { id: 'a', name: 'Güemes 1200', street: 'Güemes', street_number: '1200' };
    const sin = { id: 'b', name: 'Guemes 1200', street: 'Guemes', street_number: '1200' };
    expect(isSameProperty(sin, con)).toBe(true);
  });

  it('mismo nombre en otra dirección NO es duplicado', () => {
    const enOtraCiudad = { ...laprida, id: 'b', city: 'Santa Fe' };
    expect(isSameProperty(enOtraCiudad, laprida)).toBe(false);
  });

  it('sin dirección en alguna de las dos, alcanza el nombre', () => {
    const aMedias = { id: 'b', name: 'Laprida 2340 2°C' };
    expect(isSameProperty(aMedias, laprida)).toBe(true);
  });

  it('sin nombre no se afirma nada: la dirección sola la comparten las unidades', () => {
    const sinNombre = { id: 'b', name: '', street: 'Laprida', street_number: '2340' };
    expect(isSameProperty(sinNombre, laprida)).toBe(false);
  });

  it('una propiedad no choca consigo misma al editarla', () => {
    expect(isSameProperty(laprida, laprida)).toBe(false);
  });
});

describe('findDuplicate', () => {
  it('devuelve la que ya estaba cargada', () => {
    const encontrada = findDuplicate({ ...laprida, id: 'nueva' }, [
      { id: 'x', name: 'Belgrano 1240', street: 'Belgrano', street_number: '1240' },
      laprida,
    ]);
    expect(encontrada?.id).toBe('a');
  });

  it('sin choque, no devuelve nada', () => {
    expect(findDuplicate({ id: 'n', name: 'Mitre 840' }, [laprida])).toBeUndefined();
  });
});

describe('duplicateMessage', () => {
  it('nombra la que ya existe y dice qué hacer con las dos salidas', () => {
    const message = duplicateMessage(laprida);
    expect(message).toContain('Laprida 2340 2°C');
    expect(message).toContain('Laprida 2340 Rosario');
    expect(message).toContain('otra unidad del mismo edificio');
  });

  it('sin dirección cargada, no inventa un lugar', () => {
    const message = duplicateMessage({ name: 'Casa de la abuela' });
    expect(message).toContain('«Casa de la abuela».');
  });
});

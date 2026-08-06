import { describe, expect, it } from 'vitest';

import {
  buildingAtSameAddress,
  duplicateMessage,
  findDuplicate,
  insideBuildingMessage,
  isSameProperty,
} from './duplicate-property.js';

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

describe('buildingAtSameAddress — el departamento va DENTRO de su edificio', () => {
  const edificio = {
    id: 'e1',
    name: 'Belgrano 1240',
    type: 'edificio',
    street: 'Belgrano',
    street_number: '1240',
    city: 'Rosario',
  };

  it('el caso que originó esto: cargar un depto donde ya está el edificio', () => {
    const depto = {
      id: 'nuevo',
      name: 'Belgrano 1240 3°B',
      type: 'departamento',
      street: 'Belgrano',
      street_number: '1240',
      city: 'Rosario',
    };
    expect(buildingAtSameAddress(depto, [edificio])?.id).toBe('e1');
  });

  it('no hace falta que el nombre coincida con una unidad: la dirección alcanza', () => {
    const otro = { ...edificio, id: 'nuevo', name: 'Depto del fondo', type: 'departamento' };
    expect(buildingAtSameAddress(otro, [edificio])).toBeDefined();
  });

  it('otra dirección no se frena', () => {
    const lejos = {
      id: 'nuevo',
      name: 'Mitre 840',
      type: 'casa',
      street: 'Mitre',
      street_number: '840',
      city: 'Rosario',
    };
    expect(buildingAtSameAddress(lejos, [edificio])).toBeUndefined();
  });

  it('misma calle y altura en OTRA ciudad no es el mismo edificio', () => {
    const otraCiudad = { ...edificio, id: 'nuevo', type: 'departamento', city: 'Santa Fe' };
    expect(buildingAtSameAddress(otraCiudad, [edificio])).toBeUndefined();
  });

  it('sin dirección cargada no se afirma nada: frenar a ciegas sería peor', () => {
    const sinDireccion = { id: 'n', name: 'Depto', type: 'departamento' };
    expect(buildingAtSameAddress(sinDireccion, [edificio])).toBeUndefined();
  });

  it('un edificio no se choca consigo mismo al editarlo', () => {
    expect(buildingAtSameAddress(edificio, [edificio])).toBeUndefined();
  });

  it('dos edificios en la misma dirección no los mira: eso ya lo ve el duplicado', () => {
    const otroEdificio = { ...edificio, id: 'e2', name: 'Belgrano 1240 bis' };
    // La regla solo aplica a lo que ES una sola unidad; el repositorio la llama
    // únicamente en ese caso, y acá se documenta que la función no discrimina sola.
    expect(buildingAtSameAddress(otroEdificio, [edificio])?.id).toBe('e1');
  });

  it('el mensaje dice DÓNDE va, no solo que no se puede', () => {
    const texto = insideBuildingMessage(edificio);
    expect(texto).toContain('Belgrano 1240');
    expect(texto).toContain('Nueva unidad');
  });
});

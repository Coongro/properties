import { describe, expect, it } from 'vitest';

import {
  documentKey,
  findSamePerson,
  isSamePerson,
  samePersonMessage,
} from './duplicate-person.js';

const ricardo = {
  id: 'a',
  name: 'Ricardo Beltrán',
  document_type: 'dni',
  document_number: '14892331',
};

describe('documentKey', () => {
  it('ignora puntos, guiones y espacios', () => {
    expect(documentKey({ document_number: '14.892.331' })).toBe('14892331');
    expect(documentKey({ document_number: ' 14 892 331 ' })).toBe('14892331');
  });

  it('de un CUIT saca el documento que lleva adentro', () => {
    expect(documentKey({ document_number: '20-11402887-3' })).toBe('11402887');
    expect(documentKey({ document_number: '27114028873' })).toBe('11402887');
  });

  it('sin documento no hay clave', () => {
    expect(documentKey({ document_number: '' })).toBe('');
    expect(documentKey({ document_number: null })).toBe('');
    expect(documentKey({})).toBe('');
  });
});

describe('isSamePerson', () => {
  it('el caso que originó esto: el mismo DNI cargado dos veces', () => {
    expect(isSamePerson({ ...ricardo, id: 'b' }, ricardo)).toBe(true);
  });

  it('el mismo escrito con puntos también', () => {
    expect(isSamePerson({ id: 'b', document_number: '14.892.331' }, ricardo)).toBe(true);
  });

  it('cargado con CUIT y con DNI es la MISMA persona', () => {
    const conCuit = {
      id: 'b',
      name: 'Ana María Ruiz',
      document_type: 'cuit',
      document_number: '27-11402887-3',
    };
    const conDni = { id: 'c', name: 'Ana Ruiz', document_type: 'dni', document_number: '11402887' };
    expect(isSamePerson(conDni, conCuit)).toBe(true);
  });

  it('otro documento es otra persona, aunque se llamen igual', () => {
    const tocayo = { ...ricardo, id: 'b', document_number: '30111222' };
    expect(isSamePerson(tocayo, ricardo)).toBe(false);
  });

  it('sin documento NO se afirma nada: dos homónimos no son la misma persona', () => {
    const sinDoc = { id: 'b', name: 'Ricardo Beltrán' };
    expect(isSamePerson(sinDoc, { id: 'c', name: 'Ricardo Beltrán' })).toBe(false);
  });

  it('no se choca consigo misma al editarla', () => {
    expect(isSamePerson(ricardo, ricardo)).toBe(false);
  });
});

describe('findSamePerson', () => {
  it('devuelve la que ya estaba cargada', () => {
    const hallada = findSamePerson({ id: 'nueva', document_number: '14892331' }, [
      { id: 'x', name: 'Otra', document_number: '30111222' },
      ricardo,
    ]);
    expect(hallada?.id).toBe('a');
  });

  it('sin choque no devuelve nada', () => {
    expect(findSamePerson({ id: 'n', document_number: '99887766' }, [ricardo])).toBeUndefined();
  });
});

describe('samePersonMessage', () => {
  it('dice quién es y con qué documento figura', () => {
    // Puede estar cargada con CUIT y estarse escribiendo el DNI: sin decirlo, el aviso
    // parecería un error del sistema.
    const texto = samePersonMessage({
      name: 'Ana María Ruiz',
      document_type: 'cuit',
      document_number: '27-11402887-3',
    });
    expect(texto).toContain('Ana María Ruiz');
    expect(texto).toContain('CUIT 27-11402887-3');
    expect(texto).toContain('editala');
  });

  it('sin nombre no deja el mensaje colgado', () => {
    expect(samePersonMessage({ document_number: '14892331' })).toContain('otra persona');
  });
});

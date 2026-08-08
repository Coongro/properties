import { describe, expect, it } from 'vitest';

import {
  PROPERTY_TYPES,
  UNIT_ONLY_TYPES,
  isUnitOnlyType,
  unitOnlyTypeMessage,
} from './property-type.js';
import { hasMultipleUnits } from './single-unit.js';

describe('isUnitOnlyType', () => {
  it('un departamento no es una propiedad: es una unidad de su edificio', () => {
    expect(isUnitOnlyType('departamento')).toBe(true);
  });

  it('lo que se alquila entero sí es una propiedad', () => {
    for (const kind of PROPERTY_TYPES) expect(isUnitOnlyType(kind)).toBe(false);
  });

  it('no se cuelga de mayúsculas ni de espacios de más', () => {
    // El valor llega del formulario, del canal agentic y de un import: los tres escriben
    // distinto y la regla tiene que contestarles igual.
    expect(isUnitOnlyType('  Departamento ')).toBe(true);
    expect(isUnitOnlyType('DEPARTAMENTO')).toBe(true);
  });

  it('sin tipo no afirma nada — el «requerido» es problema del formulario', () => {
    expect(isUnitOnlyType(null)).toBe(false);
    expect(isUnitOnlyType('')).toBe(false);
  });
});

describe('las dos listas no se pisan', () => {
  it('ningún tipo es propiedad y unidad a la vez', () => {
    for (const kind of UNIT_ONLY_TYPES)
      expect(PROPERTY_TYPES).not.toContain(kind as unknown as (typeof PROPERTY_TYPES)[number]);
  });

  it('solo el edificio contiene varias unidades; el resto se alquila entero', () => {
    expect(PROPERTY_TYPES.filter(hasMultipleUnits)).toEqual(['edificio']);
  });
});

describe('unitOnlyTypeMessage', () => {
  it('dice dónde va, no solo que no', () => {
    // Quien carga no tiene por qué saber que Coongro modela los departamentos como
    // unidades: un «no se puede» a secas lo deja sin salida.
    const message = unitOnlyTypeMessage();
    expect(message).toContain('Nueva unidad');
    expect(message).toContain('edificio');
  });
});

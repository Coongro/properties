import { describe, expect, it } from 'vitest';

import { effectiveStatus, isOccupied, reservedFrom } from './occupancy.js';

const HOY = '2026-08-11';

describe('una unidad está ocupada según su contrato, no según cuándo se firmó', () => {
  // El caso que destapó todo: se firmó hoy un contrato que arranca el 1 de septiembre y
  // la unidad quedó ocupada al instante. Estaba libre tres semanas más.
  it('un contrato que empieza el mes que viene NO la ocupa todavía', () => {
    const unit = { status: 'vacante', occupied_from: '2026-09-01', occupied_until: '2029-08-31' };
    expect(isOccupied(unit, HOY)).toBe(false);
    expect(effectiveStatus(unit, HOY)).toBe('vacante');
  });

  it('y se puede decir desde cuándo está comprometida', () => {
    const unit = { status: 'vacante', occupied_from: '2026-09-01', occupied_until: '2029-08-31' };
    expect(reservedFrom(unit, HOY)).toBe('2026-09-01');
  });

  it('un contrato en curso la ocupa', () => {
    const unit = { status: 'vacante', occupied_from: '2025-08-01', occupied_until: '2027-07-31' };
    expect(effectiveStatus(unit, HOY)).toBe('ocupada');
    expect(reservedFrom(unit, HOY)).toBeNull();
  });

  // El otro extremo, que tampoco funcionaba: nada devolvía la unidad a vacante.
  it('un contrato que ya terminó la libera sola, sin que corra nada', () => {
    const unit = { status: 'ocupada', occupied_from: '2024-01-01', occupied_until: '2026-07-31' };
    expect(effectiveStatus(unit, HOY)).toBe('vacante');
  });

  it('el último día todavía cuenta como ocupada', () => {
    const unit = { status: 'vacante', occupied_from: '2025-01-01', occupied_until: HOY };
    expect(isOccupied(unit, HOY)).toBe(true);
  });

  it('sin fecha de fin sigue ocupada hasta que alguien la termine', () => {
    const unit = { status: 'vacante', occupied_from: '2025-01-01', occupied_until: null };
    expect(isOccupied(unit, HOY)).toBe(true);
  });

  it('una unidad sin contrato está vacante', () => {
    expect(effectiveStatus({ status: 'ocupada' }, HOY)).toBe('vacante');
  });
});

describe('lo que decide quien administra manda', () => {
  it('«no disponible» sigue estándolo aunque haya contrato', () => {
    const unit = {
      status: 'no_disponible',
      occupied_from: '2025-01-01',
      occupied_until: '2027-01-01',
    };
    expect(effectiveStatus(unit, HOY)).toBe('no_disponible');
  });

  it('«en recambio» y «con preaviso» tampoco se pisan', () => {
    for (const status of ['en_recambio', 'con_preaviso']) {
      expect(effectiveStatus({ status }, HOY)).toBe(status);
    }
  });
});

import { describe, it, expect } from 'vitest';

import {
  axisForRole,
  checkOwnershipShares,
  isOwnerRole,
  summarizeOwnership,
} from './ownership-shares.js';

const unit = (others: { role: string | null; share_pct: string | null }[] = []) => ({
  unitName: 'Depto 3°B',
  others,
});

describe('checkOwnershipShares — el tope de 100 %', () => {
  it('deja pasar el primer dueño al 100 %', () => {
    const r = checkOwnershipShares({ ...unit(), share: 100, role: 'titular' });
    expect(r.error).toBeNull();
    expect(r.total).toBe(100);
    expect(r.missing).toBe(0);
  });

  it('rechaza cuando la suma se pasa, y dice con qué números', () => {
    const r = checkOwnershipShares({
      ...unit([{ role: 'titular', share_pct: '80' }]),
      share: 50,
      role: 'cotitular',
    });
    expect(r.error).toContain('130 %');
    expect(r.error).toContain('Depto 3°B');
  });

  it('permite quedar por debajo de 100, porque los dueños se cargan de a uno', () => {
    const r = checkOwnershipShares({ ...unit(), share: 50, role: 'cotitular' });
    expect(r.error).toBeNull();
    expect(r.missing).toBe(50);
    expect(r.summary).toContain('falta 50 %');
  });

  it('cierra en 100 al cargar al segundo cónyuge', () => {
    const r = checkOwnershipShares({
      ...unit([{ role: 'cotitular', share_pct: '50' }]),
      share: 50,
      role: 'cotitular',
    });
    expect(r.error).toBeNull();
    expect(r.missing).toBe(0);
    expect(r.summary).toContain('completo');
  });

  it('da por completa la herencia de tres a 33,33 % (no exige el centavo)', () => {
    const r = checkOwnershipShares({
      ...unit([
        { role: 'cotitular', share_pct: '33.33' },
        { role: 'cotitular', share_pct: '33.33' },
      ]),
      share: 33.33,
      role: 'cotitular',
    });
    expect(r.error).toBeNull();
    expect(r.missing).toBe(0);
  });

  it('rechaza un porcentaje fuera de rango antes de mirar la unit', () => {
    expect(checkOwnershipShares({ ...unit(), share: 0, role: 'titular' }).error).toContain(
      'entre 0 y 100'
    );
    expect(checkOwnershipShares({ ...unit(), share: 140, role: 'titular' }).error).toContain(
      'entre 0 y 100'
    );
  });

  it('acepta que no se sepa la participación: suma 0 y avisa que missing todo', () => {
    const r = checkOwnershipShares({ ...unit(), share: null, role: 'titular' });
    expect(r.error).toBeNull();
    expect(r.total).toBe(0);
    expect(r.missing).toBe(100);
  });
});

describe('checkOwnershipShares — el usufruct no le saca assigned a nadie', () => {
  it('deja al usufructuario al 100 % aunque el assigned ya esté complete', () => {
    const r = checkOwnershipShares({
      ...unit([{ role: 'titular', share_pct: '100' }]),
      share: 100,
      role: 'usufructuario',
    });
    expect(r.error).toBeNull();
    expect(r.axis).toBe('usufructo');
    expect(r.total).toBe(100);
  });

  it('el nudo propietario sí ocupa assigned: con un titular al 100 %, se pasa', () => {
    const r = checkOwnershipShares({
      ...unit([{ role: 'titular', share_pct: '100' }]),
      share: 100,
      role: 'nudo_propietario',
    });
    expect(r.error).toContain('no pueden pasar de 100');
  });

  it('dos usufructuarios tampoco pueden pasar de 100 entre ellos', () => {
    const r = checkOwnershipShares({
      ...unit([{ role: 'usufructuario', share_pct: '60' }]),
      share: 60,
      role: 'usufructuario',
    });
    expect(r.error).toContain('usufructo');
  });
});

describe('summarizeOwnership — cómo está repartida una unit', () => {
  it('sin owners lo dice, en vez de mostrar 0 %', () => {
    const s = summarizeOwnership([]);
    expect(s.complete).toBe(false);
    expect(s.assigned).toBe(0);
    expect(s.summary).toBe('Sin titulares cargados.');
  });

  it('con el assigned complete no pide nada más', () => {
    const s = summarizeOwnership([
      { role: 'cotitular', share_pct: '50' },
      { role: 'cotitular', share_pct: '50' },
    ]);
    expect(s.complete).toBe(true);
    expect(s.missing).toBe(0);
    expect(s.summary).toBe('Titularidad completa (100 %).');
  });

  it('cuando missing, dice cuánto', () => {
    const s = summarizeOwnership([{ role: 'titular', share_pct: '60' }]);
    expect(s.complete).toBe(false);
    expect(s.missing).toBe(40);
    expect(s.summary).toContain('Falta asignar 40 %');
  });

  it('el usufruct se informa aparte: no completa ni descuenta el assigned', () => {
    const s = summarizeOwnership([
      { role: 'titular', share_pct: '100' },
      { role: 'usufructuario', share_pct: '100' },
    ]);
    expect(s.complete).toBe(true);
    expect(s.usufruct).toBe(100);
    expect(s.summary).toContain('usufructo declarado');
  });

  it('un usufruct NO tapa que el assigned esté incompleto', () => {
    const s = summarizeOwnership([
      { role: 'titular', share_pct: '50' },
      { role: 'usufructuario', share_pct: '100' },
    ]);
    expect(s.complete).toBe(false);
    expect(s.summary).toContain('Falta asignar 50 %');
    expect(s.summary).toContain('usufructo');
  });

  it('tres herederos a 33,33 % cuentan como complete', () => {
    const s = summarizeOwnership([
      { role: 'cotitular', share_pct: '33.33' },
      { role: 'cotitular', share_pct: '33.33' },
      { role: 'cotitular', share_pct: '33.33' },
    ]);
    expect(s.complete).toBe(true);
  });

  it('un titular sin porcentaje cargado no suma nada, y se nota', () => {
    const s = summarizeOwnership([{ role: 'titular', share_pct: null }]);
    expect(s.assigned).toBe(0);
    expect(s.missing).toBe(100);
  });
});

describe('roles', () => {
  it('sabe a qué eje va cada rol', () => {
    expect(axisForRole('titular')).toBe('dominio');
    expect(axisForRole('cotitular')).toBe('dominio');
    expect(axisForRole('nudo_propietario')).toBe('dominio');
    expect(axisForRole('usufructuario')).toBe('usufructo');
  });

  it('un rol viejo o desconocido cuenta como assigned — que es lo que era antes del enum', () => {
    expect(axisForRole(null)).toBe('dominio');
    expect(axisForRole('propietario')).toBe('dominio');
    expect(isOwnerRole('propietario')).toBe(false);
    expect(isOwnerRole('cotitular')).toBe(true);
  });
});

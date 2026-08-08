/**
 * Ficha de propietario — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, useIsMobile, views } from '@coongro/plugin-sdk';

import { useFichaDePropietarioView } from './use-ficha-de-propietario.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function FichaDePropietarioView() {
  const isMobile = useIsMobile();
  // Tono del badge: el que devuelven los datos, y si no el del diseño.
  // ⚠️ MISMO mapa que el TONE_VARIANT de las tablas: el mismo estado tiene
  // que pintarse igual en la lista y en la ficha (neutral era 'secondary'
  // acá y 'neutral-soft' en la tabla — el mismo contrato, dos grises).
  const badgeVariant = (tone: string, fallback: string): string =>
    ({
      neutral: 'neutral-soft',
      success: 'success-soft',
      warning: 'warning-soft',
      danger: 'danger-soft',
      outline: 'outline',
    })[tone] ?? fallback;
  const {
    pendingConfirm,
    askConfirm,
    cancelConfirm,
    runConfirmed,
    loading,
    visibleRows,
    COLUMNS,
    sort,
    onSortChange,
    cellValue,
    search,
    setSearch,
    clearFilters,
    page,
    setPage,
    pagedRows,
    runServerAction,
    metric,
  } = useFichaDePropietarioView();

  const cellText = (row: any, c: any) => {
    const v = cellValue(row, c);
    return v === null || v === undefined
      ? ''
      : typeof v === 'object'
        ? JSON.stringify(v)
        : String(v);
  };
  const TONE_VARIANT: Record<string, string> = {
    neutral: 'neutral-soft',
    success: 'success-soft',
    warning: 'warning-soft',
    danger: 'danger-soft',
    outline: 'outline',
  };
  const enumVal = (c: any, raw: string) => (c.values ?? []).find((e: any) => e.value === raw);
  const renderCell = (row: any, c: any) => {
    const raw = cellText(row, c);
    const ev = enumVal(c, raw);
    const label = ev?.label ?? raw;
    const shown = raw !== '' ? (c.prefix ?? '') + label + (c.suffix ?? '') : label;
    if (c.display === 'avatar') {
      const initial = (String(raw).trim().charAt(0) || '?').toUpperCase();
      return h(
        'span',
        { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 } },
        h(
          'span',
          {
            style: {
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--cg-gold-soft)',
              border: '1px solid var(--cg-gold-lt)',
              color: 'var(--cg-gold-deep)',
              fontWeight: 700,
              fontSize: '11px',
            },
          },
          initial
        ),
        h('span', null, shown)
      );
    }
    const iconName = ev?.icon;
    const icon = iconName ? h(UI.DynamicIcon, { icon: iconName, size: 16 }) : null;
    if (c.display === 'pill') {
      return label
        ? h(
            UI.Badge,
            {
              variant: TONE_VARIANT[ev?.tone ?? c.tone ?? 'neutral'] ?? 'neutral-soft',
              size: 'compact',
              icon,
            },
            label
          )
        : '';
    }
    if (c.display === 'progress') {
      const n = Math.max(0, Math.min(100, Number(cellValue(row, c)) || 0));
      return h(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '90px' } },
        h(
          'div',
          {
            style: {
              flex: '1 1 0',
              height: '6px',
              borderRadius: '999px',
              background: 'var(--cg-bg-secondary)',
              overflow: 'hidden',
            },
          },
          h('div', {
            style: {
              width: n + '%',
              height: '100%',
              borderRadius: '999px',
              background: 'var(--cg-gold)',
            },
          })
        ),
        h(
          'span',
          { style: { fontSize: '12px', color: 'var(--cg-text-muted)' } },
          Math.round(n) + '%'
        )
      );
    }
    if (c.display === 'mono')
      return h(
        'span',
        { style: { fontFamily: 'ui-monospace, monospace', fontSize: '12px' } },
        shown
      );
    return icon
      ? h(
          'span',
          { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
          icon,
          shown
        )
      : shown;
  };
  const ROW_ACTIONS = [
    {
      label: 'Quitar',
      variant: 'destructive' as const,
      icon: 'UserMinus',
      onClick: (row: any) => {
        askConfirm(
          'Quitar',
          '¿Sacarle esta unidad de las que tiene a su nombre? La unidad no se borra: queda sin esta persona como titular, y se la puede volver a cargar.',
          'Quitar',
          () => {
            ((row: any) => {
              void runServerAction('properties.unitOwners.removeOwner', { id: row.id }, row);
            })(row);
          }
        );
      },
    },
  ];
  const renderTable = () =>
    h(
      'div',
      {
        style: {
          background: 'var(--cg-bg)',
          border: '1px solid var(--cg-border)',
          borderRadius: '14px',
          padding: '20px',
        },
      },
      h(UI.DataTable, {
        data: pagedRows,
        rowKey: (row: any) => String(row.id ?? JSON.stringify(row)),
        loading,
        columns: COLUMNS.map((c) => ({
          key: c.key,
          header: c.label,
          sortable: true,
          render: (row: any) => renderCell(row, c),
        })),
        searchPlaceholder: 'Buscar…',
        searchValue: search,
        onSearchChange: setSearch,
        sortKey: sort?.k ?? null,
        sortDirection: sort ? (sort.d > 0 ? 'asc' : 'desc') : null,
        onSortChange,
        pagination: { page, pageSize: 20, total: visibleRows.length },
        onPageChange: setPage,
        onRowClick: (row: any) => {
          views.open('properties.ficha-de-unidad.open', { record: row });
        },
        actions: ROW_ACTIONS,
        mobileRender: (row: any) =>
          h(
            'div',
            { style: { display: 'flex', flexDirection: 'column' as const, gap: '6px' } },
            h(
              'div',
              { style: { fontSize: '14px', fontWeight: 600, color: 'var(--cg-text)' } },
              renderCell(row, COLUMNS[0])
            ),
            ...COLUMNS.slice(1).map((c) =>
              h(
                'div',
                {
                  key: c.key,
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '13px',
                  },
                },
                h('span', { style: { color: 'var(--cg-text-muted)', flexShrink: 0 } }, c.label),
                h(
                  'span',
                  {
                    style: {
                      textAlign: 'right' as const,
                      minWidth: 0,
                      flex: '1 1 auto',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    },
                  },
                  renderCell(row, c)
                )
              )
            ),
            h(
              'div',
              {
                style: {
                  display: 'flex',
                  gap: '4px',
                  justifyContent: 'flex-end',
                  borderTop: '1px solid var(--cg-border-light)',
                  paddingTop: '8px',
                  marginTop: '2px',
                },
              },
              ...ROW_ACTIONS.filter((a2: any) => !a2.hidden?.(row)).map((a2: any) =>
                h(
                  UI.Button,
                  {
                    key: a2.label,
                    size: 'sm' as const,
                    variant:
                      a2.variant === 'destructive' ? ('destructive' as const) : ('ghost' as const),
                    onClick: (e: any) => {
                      e.stopPropagation();
                      a2.onClick(row);
                    },
                  },
                  a2.label
                )
              )
            )
          ),
        onClearFilters: () => {
          clearFilters();
        },
        emptyState: {
          title: 'Todavía no tiene unidades a su nombre',
          description:
            'La titularidad se carga parado en la unidad, que es donde se ve si el 100 % está completo.',
          filteredTitle: 'Sin resultados',
          filteredDescription: 'Probá con otros términos o ajustá los filtros.',
        },
      })
    );

  return h(
    'div',
    {
      style: {
        minHeight: '100%',
        backgroundColor: 'var(--cg-bg-secondary)',
        padding: isMobile ? '16px' : '24px',
      },
    },
    h(
      'div',
      { style: { width: '100%', display: 'flex', flexDirection: 'column' as const, gap: '18px' } },
      h(
        'div',
        { 'data-cg-block-id': 'hdr', style: { display: 'contents' } },
        h(
          'header',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '8px',
              flexWrap: 'wrap' as const,
            },
          },
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 } },
            h(
              'button',
              {
                type: 'button',
                onClick: () => {
                  views.back();
                },
                title: 'Volver',
                style: {
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  border: '1px solid var(--cg-border)',
                  background: 'var(--cg-surface)',
                  cursor: 'pointer',
                  color: 'var(--cg-text-secondary)',
                },
              },
              '←'
            ),
            h(UI.Avatar, { name: metric('hdr', 'avatar', 'AR'), size: 'lg' }),
            h(
              'div',
              { style: { minWidth: 0 } },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    flexWrap: 'wrap' as const,
                  },
                },
                h(
                  'h1',
                  {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      color: 'var(--cg-text)',
                      margin: 0,
                    },
                  },
                  metric('hdr', 'name', 'Ana María Ruiz')
                ),
                h(
                  UI.Badge,
                  { variant: badgeVariant(metric('hdr', 'badgeTone', ''), 'outline') },
                  metric('hdr', 'badge', '2 unidades')
                )
              ),
              h(
                'p',
                {
                  style: {
                    fontSize: '13.5px',
                    color: 'var(--cg-text-secondary)',
                    margin: '2px 0 0',
                  },
                },
                metric('hdr', 'sub', 'CUIT 27-11402887-3')
              )
            )
          ),
          h(
            'div',
            { style: { display: 'flex', gap: '9px', flexShrink: 0 } },
            h(
              UI.Button,
              {
                variant: 'secondary',
                onClick: () => {
                  views.open(
                    'properties.propietario.open',
                    { record: (views.params as any)?.record ?? null },
                    { mode: 'dialog' }
                  );
                },
              },
              'Editar propietario'
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'row_kpi', style: { display: 'contents' } },
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : 'minmax(0, 0.34fr) minmax(0, 0.33fr) minmax(0, 0.33fr)',
              gap: '2%',
              alignItems: 'stretch',
            },
          },
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'k_unidades', style: { display: 'contents' } },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--cg-bg)',
                    border: '1px solid var(--cg-border)',
                    boxShadow: 'var(--cg-shadow-card, 0 1px 2px rgba(0,0,0,.05))',
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                  h(
                    'span',
                    {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        color: 'var(--cg-text-muted)',
                        background: 'var(--cg-bg-secondary)',
                        flexShrink: 0,
                      },
                    },
                    h(UI.DynamicIcon, { icon: 'DoorOpen', size: 17 })
                  ),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '.02em',
                        textTransform: 'uppercase',
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'Unidades a su nombre'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: 'var(--cg-text)',
                      marginTop: '8px',
                    },
                  },
                  metric('k_unidades', 'value', '2')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_unidades', 'sub', 'en 1 propiedad')
                )
              )
            )
          ),
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'k_cobro', style: { display: 'contents' } },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--cg-bg)',
                    border: '1px solid var(--cg-border)',
                    boxShadow: 'var(--cg-shadow-card, 0 1px 2px rgba(0,0,0,.05))',
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                  h(
                    'span',
                    {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        color: 'var(--cg-green)',
                        background: 'var(--cg-green-bg)',
                        flexShrink: 0,
                      },
                    },
                    h(UI.DynamicIcon, { icon: 'Wallet', size: 17 })
                  ),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '.02em',
                        textTransform: 'uppercase',
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'Dónde cobra'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: 'var(--cg-text)',
                      marginTop: '8px',
                    },
                  },
                  metric('k_cobro', 'value', 'ana.ruiz.mp')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_cobro', 'sub', 'Banco Galicia')
                )
              )
            )
          ),
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'k_fiscal', style: { display: 'contents' } },
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'var(--cg-bg)',
                    border: '1px solid var(--cg-border)',
                    boxShadow: 'var(--cg-shadow-card, 0 1px 2px rgba(0,0,0,.05))',
                  },
                },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                  h(
                    'span',
                    {
                      style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        color: 'var(--cg-text-muted)',
                        background: 'var(--cg-bg-secondary)',
                        flexShrink: 0,
                      },
                    },
                    h(UI.DynamicIcon, { icon: 'FileText', size: 17 })
                  ),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '.02em',
                        textTransform: 'uppercase',
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'Condición frente al IVA'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      fontSize: '24px',
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      color: 'var(--cg-text)',
                      marginTop: '8px',
                    },
                  },
                  metric('k_fiscal', 'value', 'Responsable inscripto')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_fiscal', 'sub', 'para la liquidación')
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'sec_unidades', style: { display: 'contents' } },
        h(
          'section',
          null,
          h(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
            h('span', {
              style: {
                width: '16px',
                height: '2px',
                background: 'var(--cg-accent)',
                borderRadius: '2px',
              },
            }),
            h(UI.DynamicIcon, {
              icon: 'DoorOpen',
              size: 15,
              style: { color: 'var(--cg-text-muted)' },
            }),
            h(
              'span',
              {
                style: {
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--cg-text-muted)',
                },
              },
              'Unidades a su nombre'
            )
          ),
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'stretch',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'tbl_unidades', style: { display: 'contents' } },
              renderTable()
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'row_datos', style: { display: 'contents' } },
        h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 0.5fr) minmax(0, 0.5fr)',
              gap: '2%',
              alignItems: 'stretch',
            },
          },
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'sec_cobro', style: { display: 'contents' } },
              h(
                'section',
                null,
                h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    },
                  },
                  h('span', {
                    style: {
                      width: '16px',
                      height: '2px',
                      background: 'var(--cg-accent)',
                      borderRadius: '2px',
                    },
                  }),
                  h(UI.DynamicIcon, {
                    icon: 'Wallet',
                    size: 15,
                    style: { color: 'var(--cg-text-muted)' },
                  }),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 500,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase' as const,
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'Dónde se le paga'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      alignItems: 'stretch',
                    },
                  },
                  h(
                    'div',
                    { 'data-cg-block-id': 'kv_cobro', style: { display: 'contents' } },
                    h(
                      'div',
                      {
                        style: {
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr',
                          columnGap: '18px',
                        },
                      },
                      h(
                        React.Fragment,
                        { key: 'Banco' },
                        h(
                          'div',
                          {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12.5px',
                              fontWeight: 400,
                              color: 'var(--cg-text-muted)',
                              padding: '8px 0',
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          h(UI.DynamicIcon, { icon: 'Landmark', size: 14 }),
                          h('span', null, 'Banco')
                        ),
                        h(
                          'div',
                          {
                            style: {
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: 'var(--cg-text)',
                              padding: '8px 0',
                              textAlign: 'right' as const,
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          metric('kv_cobro.Banco', 'value', 'Banco Galicia')
                        )
                      ),
                      h(
                        React.Fragment,
                        { key: 'CBU' },
                        h(
                          'div',
                          {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12.5px',
                              fontWeight: 400,
                              color: 'var(--cg-text-muted)',
                              padding: '8px 0',
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          h(UI.DynamicIcon, { icon: 'Hash', size: 14 }),
                          h('span', null, 'CBU')
                        ),
                        h(
                          'div',
                          {
                            style: {
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: 'var(--cg-text)',
                              padding: '8px 0',
                              textAlign: 'right' as const,
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          metric('kv_cobro.CBU', 'value', '0070123430004001234567')
                        )
                      ),
                      h(
                        React.Fragment,
                        { key: 'Alias' },
                        h(
                          'div',
                          {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12.5px',
                              fontWeight: 400,
                              color: 'var(--cg-text-muted)',
                              padding: '8px 0',
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          h(UI.DynamicIcon, { icon: 'AtSign', size: 14 }),
                          h('span', null, 'Alias')
                        ),
                        h(
                          'div',
                          {
                            style: {
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: 'var(--cg-text)',
                              padding: '8px 0',
                              textAlign: 'right' as const,
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          metric('kv_cobro.Alias', 'value', 'ana.ruiz.mp')
                        )
                      ),
                      h(
                        React.Fragment,
                        { key: 'Tipo y número de cuenta' },
                        h(
                          'div',
                          {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12.5px',
                              fontWeight: 400,
                              color: 'var(--cg-text-muted)',
                              padding: '8px 0',
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          h(UI.DynamicIcon, { icon: 'CreditCard', size: 14 }),
                          h('span', null, 'Tipo y número de cuenta')
                        ),
                        h(
                          'div',
                          {
                            style: {
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: 'var(--cg-text)',
                              padding: '8px 0',
                              textAlign: 'right' as const,
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          metric(
                            'kv_cobro.Tipo y número de cuenta',
                            'value',
                            'Caja de ahorro 1234/5'
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          ),
          h(
            'div',
            {
              style: {
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column' as const,
                justifyContent: 'flex-start',
                gap: '16px',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'sec_contacto', style: { display: 'contents' } },
              h(
                'section',
                null,
                h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    },
                  },
                  h('span', {
                    style: {
                      width: '16px',
                      height: '2px',
                      background: 'var(--cg-accent)',
                      borderRadius: '2px',
                    },
                  }),
                  h(UI.DynamicIcon, {
                    icon: 'Contact',
                    size: 15,
                    style: { color: 'var(--cg-text-muted)' },
                  }),
                  h(
                    'span',
                    {
                      style: {
                        fontSize: '11px',
                        fontWeight: 500,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase' as const,
                        color: 'var(--cg-text-muted)',
                      },
                    },
                    'Cómo ubicarlo'
                  )
                ),
                h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      alignItems: 'stretch',
                    },
                  },
                  h(
                    'div',
                    { 'data-cg-block-id': 'kv_contacto', style: { display: 'contents' } },
                    h(
                      'div',
                      {
                        style: {
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr',
                          columnGap: '18px',
                        },
                      },
                      h(
                        React.Fragment,
                        { key: 'Email' },
                        h(
                          'div',
                          {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12.5px',
                              fontWeight: 400,
                              color: 'var(--cg-text-muted)',
                              padding: '8px 0',
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          h(UI.DynamicIcon, { icon: 'Mail', size: 14 }),
                          h('span', null, 'Email')
                        ),
                        h(
                          'div',
                          {
                            style: {
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: 'var(--cg-text)',
                              padding: '8px 0',
                              textAlign: 'right' as const,
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          metric('kv_contacto.Email', 'value', 'ana.ruiz@gmail.com')
                        )
                      ),
                      h(
                        React.Fragment,
                        { key: 'Teléfono' },
                        h(
                          'div',
                          {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12.5px',
                              fontWeight: 400,
                              color: 'var(--cg-text-muted)',
                              padding: '8px 0',
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          h(UI.DynamicIcon, { icon: 'Phone', size: 14 }),
                          h('span', null, 'Teléfono')
                        ),
                        h(
                          'div',
                          {
                            style: {
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: 'var(--cg-text)',
                              padding: '8px 0',
                              textAlign: 'right' as const,
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          metric('kv_contacto.Teléfono', 'value', '341 555-9090')
                        )
                      ),
                      h(
                        React.Fragment,
                        { key: 'Domicilio' },
                        h(
                          'div',
                          {
                            style: {
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '12.5px',
                              fontWeight: 400,
                              color: 'var(--cg-text-muted)',
                              padding: '8px 0',
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          h(UI.DynamicIcon, { icon: 'MapPin', size: 14 }),
                          h('span', null, 'Domicilio')
                        ),
                        h(
                          'div',
                          {
                            style: {
                              fontSize: '13.5px',
                              fontWeight: 500,
                              color: 'var(--cg-text)',
                              padding: '8px 0',
                              textAlign: 'right' as const,
                              borderBottom: '1px solid var(--cg-border-light)',
                            },
                          },
                          metric('kv_contacto.Domicilio', 'value', 'Córdoba 1234, Rosario')
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    ),
    h(UI.ConfirmDialog, {
      open: !!pendingConfirm,
      onOpenChange: (o: boolean) => {
        if (!o) cancelConfirm();
      },
      title: pendingConfirm?.title ?? '',
      description: pendingConfirm?.message ?? '',
      confirmLabel: pendingConfirm?.confirmLabel ?? 'Confirmar',
      onConfirm: () => {
        runConfirmed();
      },
    })
  );
}

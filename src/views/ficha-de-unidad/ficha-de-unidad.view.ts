/**
 * Ficha de unidad — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, useIsMobile, views } from '@coongro/plugin-sdk';

import { useFichaDeUnidadView } from './use-ficha-de-unidad.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function FichaDeUnidadView() {
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
    t1,
    t2,
    runServerAction,
    metric,
  } = useFichaDeUnidadView();

  // ── tabla 1 — properties.units: render propio sobre su estado t1 ──
  const renderTable1 = (() => {
    const {
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
    } = t1;
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
      if (raw === '' && c.emptyLabel) {
        return h(
          'span',
          {
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--cg-text-muted)',
            },
          },
          c.emptyIcon ? h(UI.DynamicIcon, { icon: c.emptyIcon, size: 15 }) : null,
          c.emptyLabel
        );
      }
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
            '¿Sacar a esta persona de la titularidad de la unidad? La persona no se borra: queda sin esta unidad a su nombre, y se la puede volver a cargar.',
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
    // eslint-disable-next-line sonarjs/prefer-immediate-return
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
              )
            ),
          onClearFilters: () => {
            clearFilters();
          },
          emptyState: {
            title: 'Esta unidad no tiene titulares cargados',
            description: 'Sin dueño cargado no hay a quién liquidarle lo que se cobra.',
            filteredTitle: 'Sin resultados',
            filteredDescription: 'Probá con otros términos o ajustá los filtros.',
          },
        })
      );
    return renderTable;
  })();
  // ── tabla 2 — properties.units: render propio sobre su estado t2 ──
  const renderTable2 = (() => {
    const {
      loading,
      visibleRows,
      sort,
      onSortChange,
      cellValue,
      search,
      setSearch,
      clearFilters,
      page,
      setPage,
      pagedRows,
      SUB_COL,
      ITEM_COLS,
    } = t2;
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
    const formatDate = (fmt: string, raw: string) => {
      const s = String(raw ?? '');
      const only = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
      if (only) return only[3] + '/' + only[2] + '/' + only[1];
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      const p = (n: number) => String(n).padStart(2, '0');
      const dmy = p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
      const hm = p(d.getHours()) + ':' + p(d.getMinutes());
      return fmt === 'datetime' ? dmy + ' ' + hm : fmt === 'time' ? hm : dmy;
    };
    const renderCell = (row: any, c: any) => {
      const raw = cellText(row, c);
      const ev = enumVal(c, raw);
      const label = c.format ? formatDate(c.format, raw) : (ev?.label ?? raw);
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
        label: 'Eliminar',
        variant: 'destructive' as const,
        icon: 'Trash2',
        onClick: (row: any) => {
          askConfirm('Eliminar', 'El certificado se elimina de esta unidad.', 'Eliminar', () => {
            ((row: any) => {
              void runServerAction('properties.certificates.delete', { id: row.id }, row);
            })(row);
          });
        },
        hidden: (row: any) => !['unidad'].includes(String(row?.['scope'] ?? '')),
      },
    ];
    // eslint-disable-next-line sonarjs/prefer-immediate-return
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
          columns: ITEM_COLS.map((c, ci) => ({
            key: c.key,
            header: c.label,
            sortable: true,
            render: (row: any) =>
              ci === 0 && SUB_COL
                ? h(
                    'div',
                    { style: { display: 'flex', flexDirection: 'column' as const, gap: '2px' } },
                    h('div', null, renderCell(row, c)),
                    h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-text-muted)' } },
                      renderCell(row, SUB_COL)
                    )
                  )
                : renderCell(row, c),
          })),
          searchPlaceholder: 'Buscar…',
          searchValue: search,
          onSearchChange: setSearch,
          sortKey: sort?.k ?? null,
          sortDirection: sort ? (sort.d > 0 ? 'asc' : 'desc') : null,
          onSortChange,
          pagination: { page, pageSize: 10, total: visibleRows.length },
          onPageChange: setPage,
          onRowClick: (row: any) => {
            views.open('properties.certificado.open', { record: row }, { mode: 'sheet' });
          },
          actions: ROW_ACTIONS,
          view: 'list' as const,
          renderItem: (row: any) =>
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 } },
              h(
                'div',
                {
                  style: {
                    minWidth: 0,
                    flex: '1 1 auto',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: '2px',
                  },
                },
                h(
                  'div',
                  null,
                  h(
                    'div',
                    { style: { fontSize: '14px', fontWeight: 600, color: 'var(--cg-text)' } },
                    renderCell(row, ITEM_COLS[0])
                  ),
                  SUB_COL
                    ? h(
                        'div',
                        {
                          style: {
                            fontSize: '12px',
                            color: 'var(--cg-text-muted)',
                            marginTop: '1px',
                          },
                        },
                        renderCell(row, SUB_COL)
                      )
                    : null
                ),
                ITEM_COLS.length > 2
                  ? h(
                      'div',
                      {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap' as const,
                          fontSize: '12.5px',
                          color: 'var(--cg-text-muted)',
                        },
                      },
                      ...ITEM_COLS.slice(1, ITEM_COLS.length - 1).map((c) =>
                        h(
                          'span',
                          { key: c.key, style: { display: 'inline-flex', minWidth: 0 } },
                          renderCell(row, c)
                        )
                      )
                    )
                  : null
              ),
              ITEM_COLS.length > 1
                ? h(
                    'div',
                    { style: { flexShrink: 0, display: 'flex', alignItems: 'center' } },
                    renderCell(row, ITEM_COLS[ITEM_COLS.length - 1])
                  )
                : null,
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
                        a2.variant === 'destructive'
                          ? ('destructive' as const)
                          : ('ghost' as const),
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
            title: 'Sin certificados que alcancen a esta unidad',
            description:
              'Se ven los suyos y los del edificio: cargá el primero para que te avise antes del vencimiento.',
            filteredTitle: 'Sin resultados',
            filteredDescription: 'Probá con otros términos o ajustá los filtros.',
          },
        })
      );
    return renderTable;
  })();

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
            h(UI.Avatar, { name: metric('hdr', 'avatar', 'A'), size: 'lg' }),
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
                  metric('hdr', 'name', 'Belgrano 1240 · 3°B')
                ),
                h(
                  UI.Badge,
                  { variant: badgeVariant(metric('hdr', 'badgeTone', ''), 'outline') },
                  metric('hdr', 'badge', 'Vacante')
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
                metric('hdr', 'sub', '3 ambientes · 2 baños · 72 m²')
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
                    'properties.unidad.open',
                    { record: (views.params as any)?.record ?? null },
                    { mode: 'sheet' }
                  );
                },
              },
              'Editar unidad'
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
              { 'data-cg-block-id': 'k_estado', style: { display: 'contents' } },
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
                        color: 'var(--cg-gold-deep)',
                        background: 'var(--cg-gold-soft)',
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
                    'Estado'
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
                  metric('k_estado', 'value', 'Vacante')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_estado', 'sub', 'sin contrato vigente')
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
              { 'data-cg-block-id': 'k_renta', style: { display: 'contents' } },
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
                    'Alquiler de referencia'
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
                  metric('k_renta', 'value', '$485.000')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_renta', 'sub', 'valor de publicación')
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
              { 'data-cg-block-id': 'k_titularidad', style: { display: 'contents' } },
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
                        color: 'var(--cg-gold-deep)',
                        background: 'var(--cg-gold-soft)',
                        flexShrink: 0,
                      },
                    },
                    h(UI.DynamicIcon, { icon: 'Users', size: 17 })
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
                    'Titularidad'
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
                  metric('k_titularidad', 'value', 'Falta 50 %')
                ),
                h(
                  'div',
                  { style: { fontSize: '12px', color: 'var(--cg-text-muted)', marginTop: '2px' } },
                  metric('k_titularidad', 'sub', '1 titular cargado')
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'sec_titulares', style: { display: 'contents' } },
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
              icon: 'Users',
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
              'Titulares'
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
              { 'data-cg-block-id': 'btn_titular', style: { display: 'contents' } },
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'flex-end' } },
                h(
                  UI.Button,
                  {
                    variant: 'secondary',
                    onClick: () => {
                      views.open('properties.propietario.open', undefined, { mode: 'dialog' });
                    },
                  },
                  'Agregar titular'
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'tbl_titulares', style: { display: 'contents' } },
              renderTable1()
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'sec_certificados', style: { display: 'contents' } },
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
              icon: 'ShieldCheck',
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
              'Certificados'
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
              { 'data-cg-block-id': 'btn_cert', style: { display: 'contents' } },
              h(
                'div',
                { style: { display: 'flex', justifyContent: 'flex-end' } },
                h(
                  UI.Button,
                  {
                    variant: 'secondary',
                    onClick: () => {
                      views.open(
                        'properties.certificado.open',
                        {
                          parentRecord: (views.params as any)?.record ?? null,
                          parentEntity: 'properties.units',
                        },
                        { mode: 'sheet' }
                      );
                    },
                  },
                  'Registrar certificado'
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'tbl_certificados', style: { display: 'contents' } },
              renderTable2()
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

/**
 * Expensas del mes — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { useExpensasDelMesView } from './use-expensas-del-mes.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function ExpensasDelMesView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, refOptions, refLabel, submit, editingId } =
    useExpensasDelMesView();

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const } },
    h(
      'div',
      {
        style: { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      },
      h(
        'div',
        { 'data-cg-block-id': 'sec_liq', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Receipt', title: 'Liquidación del consorcio' },
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
              { 'data-cg-block-id': 'f_building', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'building_id', style: { display: 'block', marginBottom: '6px' } },
                  'Propiedad',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['building_id'] ?? ''),
                    onValueChange: (v: string) => setField('building_id', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  ...(refOptions['building_id'] ?? []).map((r: any) =>
                    h(UI.SelectItem, { key: String(r.id), value: String(r.id) }, refLabel(r))
                  )
                ),
                errors['building_id']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['building_id']
                    )
                  : null
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_period', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'period', style: { display: 'block', marginBottom: '6px' } },
                    'Período',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'period',
                    type: 'text',
                    value: String(values['period'] ?? ''),
                    placeholder: 'Ej: 2026-09',
                    onChange: (e: any) => setField('period', e.target.value),
                  }),
                  errors['period']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['period']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_amount', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'amount', style: { display: 'block', marginBottom: '6px' } },
                    'Total liquidado',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(
                    'div',
                    { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
                    h(
                      'span',
                      {
                        style: {
                          position: 'absolute',
                          left: '11px',
                          color: 'var(--cg-text-muted)',
                          fontSize: '13px',
                          pointerEvents: 'none',
                        },
                      },
                      '$'
                    ),
                    h(UI.Input, {
                      id: 'amount',
                      type: 'number',
                      inputMode: 'decimal',
                      value: values['amount'] ?? '',
                      placeholder: 'Ej: 900000',
                      onChange: (e: any) =>
                        setField('amount', e.target.value === '' ? null : Number(e.target.value)),
                      style: { paddingLeft: '22px', textAlign: 'right' as const },
                    })
                  ),
                  errors['amount']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['amount']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_status', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'status', style: { display: 'block', marginBottom: '6px' } },
                    'Estado'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['status'] ?? ''),
                      onValueChange: (v: string) => setField('status', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(
                      UI.SelectItem,
                      {
                        key: 'recibida',
                        value: 'recibida',
                        icon: h(UI.DynamicIcon, { icon: 'Inbox', size: 16 }),
                      },
                      'Recibida'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'pagada',
                        value: 'pagada',
                        icon: h(UI.DynamicIcon, { icon: 'CircleCheck', size: 16 }),
                      },
                      'Pagada'
                    )
                  ),
                  errors['status']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['status']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_paid', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'paid_at', style: { display: 'block', marginBottom: '6px' } },
                    'Fecha de pago'
                  ),
                  h(UI.Input, {
                    id: 'paid_at',
                    type: 'date',
                    value: String(values['paid_at'] ?? ''),
                    onChange: (e: any) => setField('paid_at', e.target.value),
                  }),
                  errors['paid_at']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['paid_at']
                      )
                    : null
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 'sec_resp', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Paperclip', title: 'Respaldo' },
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
              { 'data-cg-block-id': 'f_doc', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'document_url', style: { display: 'block', marginBottom: '6px' } },
                  'Link a la liquidación'
                ),
                h(UI.Input, {
                  id: 'document_url',
                  type: 'text',
                  value: String(values['document_url'] ?? ''),
                  placeholder: 'Ej: https://drive.google.com/…',
                  onChange: (e: any) => setField('document_url', e.target.value),
                }),
                errors['document_url']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['document_url']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_notes', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'notes', style: { display: 'block', marginBottom: '6px' } },
                  'Observaciones'
                ),
                h(UI.Input, {
                  id: 'notes',
                  type: 'text',
                  value: String(values['notes'] ?? ''),
                  placeholder: 'Ej: incluye fondo de reserva extraordinario',
                  onChange: (e: any) => setField('notes', e.target.value),
                }),
                errors['notes']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['notes']
                    )
                  : null
              )
            )
          )
        )
      )
    ),
    h(
      UI.DialogFooter,
      null,
      h(
        UI.Button,
        {
          variant: 'ghost',
          onClick: () => {
            closeDialog();
          },
        },
        'Cancelar'
      ),
      h(
        UI.Button,
        {
          onClick: () => {
            void submit();
          },
        },
        editingId ? 'Actualizar' : 'Guardar'
      )
    )
  );
}

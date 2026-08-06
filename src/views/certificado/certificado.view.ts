/**
 * Certificado — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { customHandlers } from './handlers.js';
import { useCertificadoView } from './use-certificado.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function CertificadoView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, refOptions, refLabel, submit, editingId } =
    useCertificadoView();

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
        { 'data-cg-block-id': 's0', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Building2', title: 'De qué inmueble' },
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
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_building', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
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
                      h(
                        UI.SelectItem,
                        {
                          key: String(r.id),
                          value: String(r.id),
                          subtitle: String(r['address'] ?? ''),
                        },
                        String(r['name'] ?? refLabel(r))
                      )
                    )
                  ),
                  errors['building_id']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['building_id']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_unit', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'unit_id', style: { display: 'block', marginBottom: '6px' } },
                    'Unidad'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['unit_id'] ?? ''),
                      onValueChange: (v: string) => setField('unit_id', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    ...(refOptions['unit_id'] ?? []).map((r: any) =>
                      h(
                        UI.SelectItem,
                        {
                          key: String(r.id),
                          value: String(r.id),
                          subtitle: String(r['detail'] ?? ''),
                        },
                        String(r['label'] ?? refLabel(r))
                      )
                    )
                  ),
                  errors['unit_id']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['unit_id']
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
        { 'data-cg-block-id': 's1', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'ShieldCheck', title: 'El certificado' },
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
              { 'data-cg-block-id': 'f_type', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'type', style: { display: 'block', marginBottom: '6px' } },
                  'Tipo',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['type'] ?? ''),
                    onValueChange: (v: string) => setField('type', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  h(
                    UI.SelectItem,
                    {
                      key: 'matafuegos',
                      value: 'matafuegos',
                      icon: h(UI.DynamicIcon, { icon: 'FireExtinguisher', size: 16 }),
                    },
                    'Matafuegos'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'gas',
                      value: 'gas',
                      icon: h(UI.DynamicIcon, { icon: 'Flame', size: 16 }),
                    },
                    'Instalación de gas'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'ascensor',
                      value: 'ascensor',
                      icon: h(UI.DynamicIcon, { icon: 'MoveVertical', size: 16 }),
                    },
                    'Ascensor'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'electricidad',
                      value: 'electricidad',
                      icon: h(UI.DynamicIcon, { icon: 'Zap', size: 16 }),
                    },
                    'Instalación eléctrica'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'seguro',
                      value: 'seguro',
                      icon: h(UI.DynamicIcon, { icon: 'Umbrella', size: 16 }),
                    },
                    'Seguro del inmueble'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'otro',
                      value: 'otro',
                      icon: h(UI.DynamicIcon, { icon: 'FileText', size: 16 }),
                    },
                    'Otro'
                  )
                ),
                errors['type']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['type']
                    )
                  : null
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_done', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'done_at', style: { display: 'block', marginBottom: '6px' } },
                    'Fecha de realización'
                  ),
                  h(UI.Input, {
                    id: 'done_at',
                    type: 'date',
                    value: String(values['done_at'] ?? ''),
                    onChange: (e: any) => setField('done_at', e.target.value),
                  }),
                  errors['done_at']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['done_at']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_expires', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'expires_at', style: { display: 'block', marginBottom: '6px' } },
                    'Vence',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'expires_at',
                    type: 'date',
                    value: String(values['expires_at'] ?? ''),
                    onChange: (e: any) => setField('expires_at', e.target.value),
                  }),
                  errors['expires_at']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['expires_at']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_result', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'result', style: { display: 'block', marginBottom: '6px' } },
                  'Resultado'
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['result'] ?? ''),
                    onValueChange: (v: string) => setField('result', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  h(
                    UI.SelectItem,
                    {
                      key: 'apto',
                      value: 'apto',
                      icon: h(UI.DynamicIcon, { icon: 'CircleCheck', size: 16 }),
                    },
                    'Apto'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'apto_con_observaciones',
                      value: 'apto_con_observaciones',
                      icon: h(UI.DynamicIcon, { icon: 'CircleAlert', size: 16 }),
                    },
                    'Apto con observaciones'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'rechazado',
                      value: 'rechazado',
                      icon: h(UI.DynamicIcon, { icon: 'CircleX', size: 16 }),
                    },
                    'Rechazado'
                  )
                ),
                errors['result']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['result']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_file', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'file_url', style: { display: 'block', marginBottom: '6px' } },
                  'Certificado'
                ),
                h(UI.ImageInput, {
                  id: 'file_url',
                  multiple: false,
                  value: values['file_url'] ?? null,
                  onChange: (v: any) => setField('file_url', v),
                  onUpload: customHandlers.uploadImage,
                }),
                errors['file_url']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['file_url']
                    )
                  : null
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 's2', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'BellRing', title: 'Aviso' },
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
              { 'data-cg-block-id': 'f_alert', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'alert_days', style: { display: 'block', marginBottom: '6px' } },
                  'Avisarme con (días de anticipación)'
                ),
                h(UI.Input, {
                  id: 'alert_days',
                  type: 'number',
                  value: values['alert_days'] ?? '',
                  placeholder: 'Ej: 30',
                  onChange: (e: any) =>
                    setField('alert_days', e.target.value === '' ? null : Number(e.target.value)),
                }),
                errors['alert_days']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['alert_days']
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
                  placeholder: 'Ej: lo hace la empresa del consorcio',
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

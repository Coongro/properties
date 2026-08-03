/**
 * Unidad — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { useUnidadView } from './use-unidad.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function UnidadView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, refOptions, refLabel, submit, editingId } = useUnidadView();

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
        { 'data-cg-block-id': 's1', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'DoorOpen', title: 'La unidad' },
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
              { 'data-cg-block-id': 'f_name', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'name', style: { display: 'block', marginBottom: '6px' } },
                  'Nombre o número',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                ),
                h(UI.Input, {
                  id: 'name',
                  type: 'text',
                  value: String(values['name'] ?? ''),
                  placeholder: 'Ej: 3°B',
                  onChange: (e: any) => setField('name', e.target.value),
                }),
                errors['name']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['name']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_rooms', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'rooms', style: { display: 'block', marginBottom: '6px' } },
                  'Ambientes'
                ),
                h(UI.Input, {
                  id: 'rooms',
                  type: 'number',
                  value: values['rooms'] ?? '',
                  placeholder: 'Ej: 3',
                  onChange: (e: any) =>
                    setField('rooms', e.target.value === '' ? null : Number(e.target.value)),
                }),
                errors['rooms']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['rooms']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_bathrooms', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'bathrooms', style: { display: 'block', marginBottom: '6px' } },
                  'Baños'
                ),
                h(UI.Input, {
                  id: 'bathrooms',
                  type: 'number',
                  value: values['bathrooms'] ?? '',
                  placeholder: 'Ej: 1',
                  onChange: (e: any) =>
                    setField('bathrooms', e.target.value === '' ? null : Number(e.target.value)),
                }),
                errors['bathrooms']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['bathrooms']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_surface', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'surface_m2', style: { display: 'block', marginBottom: '6px' } },
                  'Superficie (m²)'
                ),
                h(UI.Input, {
                  id: 'surface_m2',
                  type: 'number',
                  value: values['surface_m2'] ?? '',
                  placeholder: 'Ej: 72',
                  onChange: (e: any) =>
                    setField('surface_m2', e.target.value === '' ? null : Number(e.target.value)),
                }),
                errors['surface_m2']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['surface_m2']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_share', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'share_pct', style: { display: 'block', marginBottom: '6px' } },
                  'Alícuota de expensas (%)'
                ),
                h(UI.Input, {
                  id: 'share_pct',
                  type: 'number',
                  value: values['share_pct'] ?? '',
                  placeholder: 'Ej: 4.5',
                  onChange: (e: any) =>
                    setField('share_pct', e.target.value === '' ? null : Number(e.target.value)),
                }),
                errors['share_pct']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['share_pct']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_photo', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'photo_url', style: { display: 'block', marginBottom: '6px' } },
                  'Foto (URL)'
                ),
                h(UI.Input, {
                  id: 'photo_url',
                  type: 'text',
                  value: String(values['photo_url'] ?? ''),
                  placeholder: 'https://…',
                  onChange: (e: any) => setField('photo_url', e.target.value),
                }),
                errors['photo_url']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['photo_url']
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
          { icon: 'Activity', title: 'Situación' },
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
              { 'data-cg-block-id': 'f_status', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'status', style: { display: 'block', marginBottom: '6px' } },
                  'Estado',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
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
                      key: 'vacante',
                      value: 'vacante',
                      icon: h(UI.DynamicIcon, { icon: 'DoorOpen', size: 16 }),
                    },
                    'Vacante'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'ocupada',
                      value: 'ocupada',
                      icon: h(UI.DynamicIcon, { icon: 'UserCheck', size: 16 }),
                    },
                    'Ocupada'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'en_recambio',
                      value: 'en_recambio',
                      icon: h(UI.DynamicIcon, { icon: 'Paintbrush', size: 16 }),
                    },
                    'En recambio'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'con_preaviso',
                      value: 'con_preaviso',
                      icon: h(UI.DynamicIcon, { icon: 'BellRing', size: 16 }),
                    },
                    'Con preaviso'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'no_disponible',
                      value: 'no_disponible',
                      icon: h(UI.DynamicIcon, { icon: 'Ban', size: 16 }),
                    },
                    'No disponible'
                  )
                ),
                errors['status']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['status']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_rent', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'reference_rent', style: { display: 'block', marginBottom: '6px' } },
                  'Alquiler de referencia'
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
                    id: 'reference_rent',
                    type: 'number',
                    inputMode: 'decimal',
                    value: values['reference_rent'] ?? '',
                    placeholder: 'Ej: 485000',
                    onChange: (e: any) =>
                      setField(
                        'reference_rent',
                        e.target.value === '' ? null : Number(e.target.value)
                      ),
                    style: { paddingLeft: '22px', textAlign: 'right' as const },
                  })
                ),
                errors['reference_rent']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['reference_rent']
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
                  'Notas'
                ),
                h(UI.Input, {
                  id: 'notes',
                  type: 'text',
                  value: String(values['notes'] ?? ''),
                  placeholder: 'Ej: cochera incluida',
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

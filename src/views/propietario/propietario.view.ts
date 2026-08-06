/**
 * Propietario — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { usePropietarioView } from './use-propietario.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function PropietarioView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, refOptions, refLabel, submit } = usePropietarioView();

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
          { icon: 'User', title: 'Quién es' },
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
                { 'data-cg-block-id': 'f_name', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'name', style: { display: 'block', marginBottom: '6px' } },
                    'Nombre y apellido o razón social',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'name',
                    type: 'text',
                    value: String(values['name'] ?? ''),
                    placeholder: 'Ej: Ana María Ruiz',
                    onChange: (e: any) => setField('name', e.target.value),
                  }),
                  errors['name']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['name']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_doc_type', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'document_type', style: { display: 'block', marginBottom: '6px' } },
                    'Documento',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['document_type'] ?? ''),
                      onValueChange: (v: string) => setField('document_type', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(UI.SelectItem, { key: 'cuit', value: 'cuit' }, 'CUIT'),
                    h(UI.SelectItem, { key: 'cuil', value: 'cuil' }, 'CUIL'),
                    h(UI.SelectItem, { key: 'dni', value: 'dni' }, 'DNI')
                  ),
                  errors['document_type']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['document_type']
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
                { 'data-cg-block-id': 'f_doc', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    {
                      htmlFor: 'document_number',
                      style: { display: 'block', marginBottom: '6px' },
                    },
                    'Número',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'document_number',
                    type: 'text',
                    value: String(values['document_number'] ?? ''),
                    placeholder: 'Ej: 27-11402887-3',
                    onChange: (e: any) => setField('document_number', e.target.value),
                  }),
                  errors['document_number']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['document_number']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_tax', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'tax_condition', style: { display: 'block', marginBottom: '6px' } },
                    'Condición frente al IVA'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['tax_condition'] ?? ''),
                      onValueChange: (v: string) => setField('tax_condition', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(UI.SelectItem, { key: 'monotributo', value: 'monotributo' }, 'Monotributo'),
                    h(
                      UI.SelectItem,
                      { key: 'responsable_inscripto', value: 'responsable_inscripto' },
                      'Responsable inscripto'
                    ),
                    h(UI.SelectItem, { key: 'exento', value: 'exento' }, 'Exento'),
                    h(
                      UI.SelectItem,
                      { key: 'consumidor_final', value: 'consumidor_final' },
                      'Consumidor final'
                    )
                  ),
                  errors['tax_condition']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['tax_condition']
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
        { 'data-cg-block-id': 's2', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Phone', title: 'Contacto' },
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
                { 'data-cg-block-id': 'f_email', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'email', style: { display: 'block', marginBottom: '6px' } },
                    'Email'
                  ),
                  h(UI.Input, {
                    id: 'email',
                    type: 'text',
                    value: String(values['email'] ?? ''),
                    placeholder: 'Ej: ana.ruiz@gmail.com',
                    onChange: (e: any) => setField('email', e.target.value),
                  }),
                  errors['email']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['email']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_phone', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'phone', style: { display: 'block', marginBottom: '6px' } },
                    'Teléfono'
                  ),
                  h(UI.Input, {
                    id: 'phone',
                    type: 'text',
                    value: String(values['phone'] ?? ''),
                    placeholder: 'Ej: 341 555-1234',
                    onChange: (e: any) => setField('phone', e.target.value),
                  }),
                  errors['phone']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['phone']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_address', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'address', style: { display: 'block', marginBottom: '6px' } },
                  'Domicilio'
                ),
                h(UI.Input, {
                  id: 'address',
                  type: 'text',
                  value: String(values['address'] ?? ''),
                  placeholder: 'Ej: Pellegrini 1450, Rosario',
                  onChange: (e: any) => setField('address', e.target.value),
                }),
                errors['address']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['address']
                    )
                  : null
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 's4', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'DoorOpen', title: 'Qué unidad le pertenece' },
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
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_share', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'share_pct', style: { display: 'block', marginBottom: '6px' } },
                    'Participación (%)'
                  ),
                  h(UI.Input, {
                    id: 'share_pct',
                    type: 'number',
                    value: values['share_pct'] ?? '',
                    placeholder: 'Ej: 50 · vacío = 100 %',
                    onChange: (e: any) =>
                      setField('share_pct', e.target.value === '' ? null : Number(e.target.value)),
                  }),
                  errors['share_pct']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['share_pct']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_role', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'role', style: { display: 'block', marginBottom: '6px' } },
                  'Carácter'
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['role'] ?? ''),
                    onValueChange: (v: string) => setField('role', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  h(
                    UI.SelectItem,
                    {
                      key: 'titular',
                      value: 'titular',
                      icon: h(UI.DynamicIcon, { icon: 'UserCheck', size: 16 }),
                    },
                    'Titular'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'cotitular',
                      value: 'cotitular',
                      icon: h(UI.DynamicIcon, { icon: 'Users', size: 16 }),
                    },
                    'Cotitular'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'usufructuario',
                      value: 'usufructuario',
                      icon: h(UI.DynamicIcon, { icon: 'HandCoins', size: 16 }),
                    },
                    'Usufructuario'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'nudo_propietario',
                      value: 'nudo_propietario',
                      icon: h(UI.DynamicIcon, { icon: 'KeyRound', size: 16 }),
                    },
                    'Nudo propietario'
                  )
                ),
                errors['role']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['role']
                    )
                  : null
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 's3', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Landmark', title: 'Dónde cobra' },
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
                { 'data-cg-block-id': 'f_bank', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'bank', style: { display: 'block', marginBottom: '6px' } },
                    'Banco'
                  ),
                  h(UI.Input, {
                    id: 'bank',
                    type: 'text',
                    value: String(values['bank'] ?? ''),
                    placeholder: 'Ej: Banco Galicia',
                    onChange: (e: any) => setField('bank', e.target.value),
                  }),
                  errors['bank']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['bank']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_account', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'account', style: { display: 'block', marginBottom: '6px' } },
                    'Tipo y número de cuenta'
                  ),
                  h(UI.Input, {
                    id: 'account',
                    type: 'text',
                    value: String(values['account'] ?? ''),
                    placeholder: 'Ej: Caja de ahorro 4001234-5',
                    onChange: (e: any) => setField('account', e.target.value),
                  }),
                  errors['account']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['account']
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
                { 'data-cg-block-id': 'f_cbu', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'cbu', style: { display: 'block', marginBottom: '6px' } },
                    'CBU'
                  ),
                  h(UI.Input, {
                    id: 'cbu',
                    type: 'text',
                    value: String(values['cbu'] ?? ''),
                    placeholder: '22 dígitos',
                    onChange: (e: any) => setField('cbu', e.target.value),
                  }),
                  errors['cbu']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['cbu']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_alias', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'alias', style: { display: 'block', marginBottom: '6px' } },
                    'Alias'
                  ),
                  h(UI.Input, {
                    id: 'alias',
                    type: 'text',
                    value: String(values['alias'] ?? ''),
                    placeholder: 'Ej: ana.ruiz.mp',
                    onChange: (e: any) => setField('alias', e.target.value),
                  }),
                  errors['alias']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['alias']
                      )
                    : null
                )
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
        'Guardar'
      )
    )
  );
}

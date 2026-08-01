/**
 * Propiedad — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { usePropiedadView } from './use-propiedad.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function PropiedadView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, submit, editingId } = usePropiedadView();

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
          { icon: 'Building2', title: 'La propiedad' },
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
                { 'data-cg-block-id': 'f_type', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
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
                        key: 'edificio',
                        value: 'edificio',
                        icon: h(UI.DynamicIcon, { icon: 'Building2', size: 16 }),
                      },
                      'Edificio'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'departamento',
                        value: 'departamento',
                        icon: h(UI.DynamicIcon, { icon: 'Building', size: 16 }),
                      },
                      'Departamento'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'casa',
                        value: 'casa',
                        icon: h(UI.DynamicIcon, { icon: 'House', size: 16 }),
                      },
                      'Casa'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'local',
                        value: 'local',
                        icon: h(UI.DynamicIcon, { icon: 'Store', size: 16 }),
                      },
                      'Local'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'oficina',
                        value: 'oficina',
                        icon: h(UI.DynamicIcon, { icon: 'Briefcase', size: 16 }),
                      },
                      'Oficina'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'galpon',
                        value: 'galpon',
                        icon: h(UI.DynamicIcon, { icon: 'Warehouse', size: 16 }),
                      },
                      'Galpón'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'cochera',
                        value: 'cochera',
                        icon: h(UI.DynamicIcon, { icon: 'Car', size: 16 }),
                      },
                      'Cochera'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'baulera',
                        value: 'baulera',
                        icon: h(UI.DynamicIcon, { icon: 'Package', size: 16 }),
                      },
                      'Baulera'
                    )
                  ),
                  errors['type']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['type']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_name', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'name', style: { display: 'block', marginBottom: '6px' } },
                    'Nombre',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'name',
                    type: 'text',
                    value: String(values['name'] ?? ''),
                    placeholder: 'Ej: Belgrano 1240',
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
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_desc', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'description', style: { display: 'block', marginBottom: '6px' } },
                  'Descripción'
                ),
                h(UI.Input, {
                  id: 'description',
                  type: 'text',
                  value: String(values['description'] ?? ''),
                  placeholder: 'Ej: edificio de 6 unidades, entrada por Belgrano',
                  onChange: (e: any) => setField('description', e.target.value),
                }),
                errors['description']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['description']
                    )
                  : null
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_photo', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
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
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['photo_url']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_year', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'year_built', style: { display: 'block', marginBottom: '6px' } },
                    'Año de construcción'
                  ),
                  h(UI.Input, {
                    id: 'year_built',
                    type: 'number',
                    value: values['year_built'] ?? '',
                    placeholder: 'Ej: 1998',
                    onChange: (e: any) =>
                      setField('year_built', e.target.value === '' ? null : Number(e.target.value)),
                  }),
                  errors['year_built']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['year_built']
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
          { icon: 'MapPin', title: 'Dirección' },
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
                { 'data-cg-block-id': 'f_street', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'street', style: { display: 'block', marginBottom: '6px' } },
                    'Calle',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'street',
                    type: 'text',
                    value: String(values['street'] ?? ''),
                    placeholder: 'Ej: Belgrano',
                    onChange: (e: any) => setField('street', e.target.value),
                  }),
                  errors['street']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['street']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_number', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'street_number', style: { display: 'block', marginBottom: '6px' } },
                    'Altura',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'street_number',
                    type: 'text',
                    value: String(values['street_number'] ?? ''),
                    placeholder: 'Ej: 1240',
                    onChange: (e: any) => setField('street_number', e.target.value),
                  }),
                  errors['street_number']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['street_number']
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
                { 'data-cg-block-id': 'f_city', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'city', style: { display: 'block', marginBottom: '6px' } },
                    'Localidad',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(UI.Input, {
                    id: 'city',
                    type: 'text',
                    value: String(values['city'] ?? ''),
                    placeholder: 'Ej: Rosario',
                    onChange: (e: any) => setField('city', e.target.value),
                  }),
                  errors['city']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['city']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_zip', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'zip_code', style: { display: 'block', marginBottom: '6px' } },
                    'Código postal'
                  ),
                  h(UI.Input, {
                    id: 'zip_code',
                    type: 'text',
                    value: String(values['zip_code'] ?? ''),
                    placeholder: 'Ej: S2000',
                    onChange: (e: any) => setField('zip_code', e.target.value),
                  }),
                  errors['zip_code']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['zip_code']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_province', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'province', style: { display: 'block', marginBottom: '6px' } },
                  'Provincia'
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['province'] ?? ''),
                    onValueChange: (v: string) => setField('province', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  h(UI.SelectItem, { key: 'buenos_aires', value: 'buenos_aires' }, 'Buenos Aires'),
                  h(
                    UI.SelectItem,
                    { key: 'caba', value: 'caba' },
                    'Ciudad Autónoma de Buenos Aires'
                  ),
                  h(UI.SelectItem, { key: 'catamarca', value: 'catamarca' }, 'Catamarca'),
                  h(UI.SelectItem, { key: 'chaco', value: 'chaco' }, 'Chaco'),
                  h(UI.SelectItem, { key: 'chubut', value: 'chubut' }, 'Chubut'),
                  h(UI.SelectItem, { key: 'cordoba', value: 'cordoba' }, 'Córdoba'),
                  h(UI.SelectItem, { key: 'corrientes', value: 'corrientes' }, 'Corrientes'),
                  h(UI.SelectItem, { key: 'entre_rios', value: 'entre_rios' }, 'Entre Ríos'),
                  h(UI.SelectItem, { key: 'formosa', value: 'formosa' }, 'Formosa'),
                  h(UI.SelectItem, { key: 'jujuy', value: 'jujuy' }, 'Jujuy'),
                  h(UI.SelectItem, { key: 'la_pampa', value: 'la_pampa' }, 'La Pampa'),
                  h(UI.SelectItem, { key: 'la_rioja', value: 'la_rioja' }, 'La Rioja'),
                  h(UI.SelectItem, { key: 'mendoza', value: 'mendoza' }, 'Mendoza'),
                  h(UI.SelectItem, { key: 'misiones', value: 'misiones' }, 'Misiones'),
                  h(UI.SelectItem, { key: 'neuquen', value: 'neuquen' }, 'Neuquén'),
                  h(UI.SelectItem, { key: 'rio_negro', value: 'rio_negro' }, 'Río Negro'),
                  h(UI.SelectItem, { key: 'salta', value: 'salta' }, 'Salta'),
                  h(UI.SelectItem, { key: 'san_juan', value: 'san_juan' }, 'San Juan'),
                  h(UI.SelectItem, { key: 'san_luis', value: 'san_luis' }, 'San Luis'),
                  h(UI.SelectItem, { key: 'santa_cruz', value: 'santa_cruz' }, 'Santa Cruz'),
                  h(UI.SelectItem, { key: 'santa_fe', value: 'santa_fe' }, 'Santa Fe'),
                  h(
                    UI.SelectItem,
                    { key: 'santiago_del_estero', value: 'santiago_del_estero' },
                    'Santiago del Estero'
                  ),
                  h(
                    UI.SelectItem,
                    { key: 'tierra_del_fuego', value: 'tierra_del_fuego' },
                    'Tierra del Fuego'
                  ),
                  h(UI.SelectItem, { key: 'tucuman', value: 'tucuman' }, 'Tucumán')
                ),
                errors['province']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['province']
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
          { icon: 'FileText', title: 'Datos registrales' },
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
                { 'data-cg-block-id': 'f_cadastral', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'cadastral_ref', style: { display: 'block', marginBottom: '6px' } },
                    'Partida inmobiliaria'
                  ),
                  h(UI.Input, {
                    id: 'cadastral_ref',
                    type: 'text',
                    value: String(values['cadastral_ref'] ?? ''),
                    placeholder: 'Ej: 11-22-334455',
                    onChange: (e: any) => setField('cadastral_ref', e.target.value),
                  }),
                  errors['cadastral_ref']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['cadastral_ref']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_ownership', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'ownership_mode', style: { display: 'block', marginBottom: '6px' } },
                    'Modo de tenencia'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['ownership_mode'] ?? ''),
                      onValueChange: (v: string) => setField('ownership_mode', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(UI.SelectItem, { key: 'propia', value: 'propia' }, 'Propia'),
                    h(UI.SelectItem, { key: 'condominio', value: 'condominio' }, 'Condominio'),
                    h(UI.SelectItem, { key: 'sucesion', value: 'sucesion' }, 'Sucesión')
                  ),
                  errors['ownership_mode']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['ownership_mode']
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
        { 'data-cg-block-id': 's4', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Users', title: 'Administración del consorcio' },
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
              { 'data-cg-block-id': 'f_admin', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'admin_name', style: { display: 'block', marginBottom: '6px' } },
                  'Administrador'
                ),
                h(UI.Input, {
                  id: 'admin_name',
                  type: 'text',
                  value: String(values['admin_name'] ?? ''),
                  placeholder: 'Ej: Consorcio Belgrano SRL',
                  onChange: (e: any) => setField('admin_name', e.target.value),
                }),
                errors['admin_name']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['admin_name']
                    )
                  : null
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_admin_phone', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'admin_phone', style: { display: 'block', marginBottom: '6px' } },
                    'Teléfono'
                  ),
                  h(UI.Input, {
                    id: 'admin_phone',
                    type: 'text',
                    value: String(values['admin_phone'] ?? ''),
                    placeholder: 'Ej: 341 555-1234',
                    onChange: (e: any) => setField('admin_phone', e.target.value),
                  }),
                  errors['admin_phone']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['admin_phone']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_admin_email', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'admin_email', style: { display: 'block', marginBottom: '6px' } },
                    'Email'
                  ),
                  h(UI.Input, {
                    id: 'admin_email',
                    type: 'text',
                    value: String(values['admin_email'] ?? ''),
                    placeholder: 'Ej: admin@consorcio.com.ar',
                    onChange: (e: any) => setField('admin_email', e.target.value),
                  }),
                  errors['admin_email']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['admin_email']
                      )
                    : null
                )
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
                  placeholder: 'Ej: la llave del portón la tiene el encargado',
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

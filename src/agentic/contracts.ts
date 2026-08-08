/**
 * Action Contracts de properties.
 *
 * El contrato vive JUNTO al handler y es el MISMO objeto que valida en
 * runtime: por eso lo que se publica no puede desincronizarse de lo que la
 * implementación acepta. Un input vacío se declara con `none()`; no poder
 * inferir los parámetros es un error, no un schema vacío.
 */

import { defineAction, none } from '@coongro/plugin-sdk/agentic';

// Los tipos que se pueden crear salen de la regla, no de una copia: si mañana entra un
// «PH», el modelo se entera por el mismo lugar que la pantalla. La lista NO incluye
// «departamento» a propósito — es una unidad de su edificio, no una propiedad.
import { PROPERTY_TYPES } from '../services/property-type.js';

export const listCertificates = defineAction({
  id: 'properties.certificates.list',
  title: 'Listar certificados',
  description:
    'Todos los certificados obligatorios cargados —matafuegos, gas, ascensor, instalación eléctrica, seguro— con la fecha en que vencen. Para los de una propiedad puntual conviene «Certificados de una propiedad», que además resuelve si cada uno está vigente, por vencer o vencido.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Cantidad de resultados a devolver. Default 20; máximo 50.',
      },
      offset: {
        type: 'integer',
        description: 'Cantidad de resultados a saltear para pedir la página siguiente.',
      },
    },
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'type',
        name: 'type',
        label: 'Certificado',
        format: 'text',
        values: [
          {
            value: 'matafuegos',
            label: 'Matafuegos',
          },
          {
            value: 'gas',
            label: 'Instalación de gas',
          },
          {
            value: 'ascensor',
            label: 'Ascensor',
          },
          {
            value: 'electricidad',
            label: 'Instalación eléctrica',
          },
          {
            value: 'seguro',
            label: 'Seguro del inmueble',
          },
          {
            value: 'otro',
            label: 'Otro',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'vigente',
            label: 'Vigente',
          },
          {
            value: 'por_vencer',
            label: 'Por vencer',
          },
          {
            value: 'vencido',
            label: 'Vencido',
          },
        ],
      },
      {
        key: 'expires_at',
        name: 'expiresAt',
        label: 'Vence',
        format: 'date',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 10,
    maxLimit: 50,
  },
});

export const getByIdCertificates = defineAction({
  id: 'properties.certificates.getById',
  title: 'Ver un certificado',
  description:
    'Un certificado por su id: de qué es, cuándo se hizo, cuándo vence, con qué resultado y las observaciones que se le cargaron.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'El certificado que se quiere ver.',
        ref: { resource: 'properties.certificates' },
      },
    },
    required: ['id'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'type',
        name: 'type',
        label: 'Certificado',
        format: 'text',
        values: [
          {
            value: 'matafuegos',
            label: 'Matafuegos',
          },
          {
            value: 'gas',
            label: 'Instalación de gas',
          },
          {
            value: 'ascensor',
            label: 'Ascensor',
          },
          {
            value: 'electricidad',
            label: 'Instalación eléctrica',
          },
          {
            value: 'seguro',
            label: 'Seguro del inmueble',
          },
          {
            value: 'otro',
            label: 'Otro',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'vigente',
            label: 'Vigente',
          },
          {
            value: 'por_vencer',
            label: 'Por vencer',
          },
          {
            value: 'vencido',
            label: 'Vencido',
          },
        ],
      },
      {
        key: 'expires_at',
        name: 'expiresAt',
        label: 'Vence',
        format: 'date',
      },
    ],
    identifierKey: 'id',
  },
});

export const createCertificates = defineAction({
  id: 'properties.certificates.create',
  title: 'Registrar un certificado',
  description:
    'Deja asentado un certificado de seguridad que YA se hizo, sobre una propiedad o sobre una unidad. Es el registro de algo que pasó, no un pedido de inspección: la fecha de vencimiento que se cargue acá es la que después dispara los avisos.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Datos del certificado a registrar.',
        properties: {
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'La propiedad a la que pertenece el certificado.',
            ref: { resource: 'properties.buildings' },
          },
          unit_id: {
            type: 'string',
            format: 'uuid',
            description:
              'Solo si el certificado es de UNA unidad y no de la propiedad entera. En ese caso va junto con la propiedad a la que esa unidad pertenece.',
            ref: { resource: 'properties.units' },
          },
          type: {
            type: 'string',
            enum: ['matafuegos', 'gas', 'ascensor', 'electricidad', 'seguro', 'otro'],
            description:
              'Tipo. Opciones: matafuegos (Matafuegos), gas (Instalación de gas), ascensor (Ascensor), electricidad (Instalación eléctrica), seguro (Seguro del inmueble), otro (Otro).',
          },
          done_at: {
            type: 'string',
            format: 'date',
            description: 'Fecha de realización',
          },
          expires_at: {
            type: 'string',
            format: 'date',
            description: 'Vence',
          },
          result: {
            type: 'string',
            enum: ['apto', 'apto_con_observaciones', 'rechazado'],
            description:
              'Resultado. Opciones: apto (Apto), apto_con_observaciones (Apto con observaciones), rechazado (Rechazado).',
          },
          file_url: {
            type: 'string',
            description: 'Certificado (URL)',
          },
          alert_days: {
            type: 'integer',
            description: 'Avisarme con (días de anticipación)',
          },
          notes: {
            type: 'string',
            description: 'Observaciones',
          },
        },
        required: ['building_id', 'type', 'expires_at'],
        additionalProperties: false,
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'type',
        name: 'type',
        label: 'Certificado',
        format: 'text',
        values: [
          {
            value: 'matafuegos',
            label: 'Matafuegos',
          },
          {
            value: 'gas',
            label: 'Instalación de gas',
          },
          {
            value: 'ascensor',
            label: 'Ascensor',
          },
          {
            value: 'electricidad',
            label: 'Instalación eléctrica',
          },
          {
            value: 'seguro',
            label: 'Seguro del inmueble',
          },
          {
            value: 'otro',
            label: 'Otro',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'vigente',
            label: 'Vigente',
          },
          {
            value: 'por_vencer',
            label: 'Por vencer',
          },
          {
            value: 'vencido',
            label: 'Vencido',
          },
        ],
      },
      {
        key: 'expires_at',
        name: 'expiresAt',
        label: 'Vence',
        format: 'date',
      },
    ],
    identifierKey: 'id',
  },
});

export const updateCertificates = defineAction({
  id: 'properties.certificates.update',
  title: 'Corregir un certificado',
  description:
    'Modifica un certificado ya registrado — típicamente para corregir la fecha de vencimiento o el resultado. Una renovación NO va acá: el certificado nuevo se registra aparte, así queda el historial de qué se hizo y cuándo.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'El certificado a corregir.',
        ref: { resource: 'properties.certificates' },
      },
      data: {
        type: 'object',
        description: 'Los campos del certificado que se quieren cambiar.',
        properties: {
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'La propiedad a la que pertenece el certificado.',
            ref: { resource: 'properties.buildings' },
          },
          unit_id: {
            type: 'string',
            format: 'uuid',
            description:
              'Solo si el certificado es de UNA unidad y no de la propiedad entera. En ese caso va junto con la propiedad a la que esa unidad pertenece.',
            ref: { resource: 'properties.units' },
          },
          type: {
            type: 'string',
            enum: ['matafuegos', 'gas', 'ascensor', 'electricidad', 'seguro', 'otro'],
            description:
              'Tipo. Opciones: matafuegos (Matafuegos), gas (Instalación de gas), ascensor (Ascensor), electricidad (Instalación eléctrica), seguro (Seguro del inmueble), otro (Otro).',
          },
          done_at: {
            type: 'string',
            format: 'date',
            description: 'Fecha de realización',
          },
          expires_at: {
            type: 'string',
            format: 'date',
            description: 'Vence',
          },
          result: {
            type: 'string',
            enum: ['apto', 'apto_con_observaciones', 'rechazado'],
            description:
              'Resultado. Opciones: apto (Apto), apto_con_observaciones (Apto con observaciones), rechazado (Rechazado).',
          },
          file_url: {
            type: 'string',
            description: 'Certificado (URL)',
          },
          alert_days: {
            type: 'integer',
            description: 'Avisarme con (días de anticipación)',
          },
          notes: {
            type: 'string',
            description: 'Observaciones',
          },
        },
        additionalProperties: false,
      },
    },
    required: ['id', 'data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'type',
        name: 'type',
        label: 'Certificado',
        format: 'text',
        values: [
          {
            value: 'matafuegos',
            label: 'Matafuegos',
          },
          {
            value: 'gas',
            label: 'Instalación de gas',
          },
          {
            value: 'ascensor',
            label: 'Ascensor',
          },
          {
            value: 'electricidad',
            label: 'Instalación eléctrica',
          },
          {
            value: 'seguro',
            label: 'Seguro del inmueble',
          },
          {
            value: 'otro',
            label: 'Otro',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'vigente',
            label: 'Vigente',
          },
          {
            value: 'por_vencer',
            label: 'Por vencer',
          },
          {
            value: 'vencido',
            label: 'Vencido',
          },
        ],
      },
      {
        key: 'expires_at',
        name: 'expiresAt',
        label: 'Vence',
        format: 'date',
      },
    ],
    identifierKey: 'id',
  },
});

export const listBuildings = defineAction({
  id: 'properties.buildings.list',
  title: 'Listar propiedades',
  description:
    'La cartera completa: cada propiedad con su dirección, cuántas unidades tiene, cuántas están ocupadas, el alquiler de referencia sumado y si sus certificados están al día.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Cantidad de resultados a devolver. Default 20; máximo 50.',
      },
      offset: {
        type: 'integer',
        description: 'Cantidad de resultados a saltear para pedir la página siguiente.',
      },
    },
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'address',
        name: 'address',
        label: 'Dirección',
        format: 'text',
      },
      {
        key: 'certs',
        name: 'certs',
        label: 'Certificados',
        format: 'text',
        values: [
          {
            value: 'ok',
            label: 'Al día',
          },
          {
            value: 'soon',
            label: 'Certificado por vencer',
          },
          {
            value: 'expired',
            label: 'Certificado vencido',
          },
        ],
      },
      {
        key: 'type',
        name: 'type',
        label: 'Tipo',
        format: 'text',
        values: [
          {
            value: 'edificio',
            label: 'Edificio',
          },
          {
            value: 'departamento',
            label: 'Departamento',
          },
          {
            value: 'casa',
            label: 'Casa',
          },
          {
            value: 'local',
            label: 'Local',
          },
          {
            value: 'oficina',
            label: 'Oficina',
          },
          {
            value: 'galpon',
            label: 'Galpón',
          },
          {
            value: 'cochera',
            label: 'Cochera',
          },
          {
            value: 'baulera',
            label: 'Baulera',
          },
        ],
      },
      {
        key: 'occupancy',
        name: 'occupancy',
        label: 'Ocupación',
        format: 'text',
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

export const getByIdBuildings = defineAction({
  id: 'properties.buildings.getById',
  title: 'Ver una propiedad',
  description:
    'Los datos cargados de una propiedad: tipo, dirección, partida inmobiliaria, modo de tenencia, administración y notas. No trae unidades ni ocupación — para eso está «Resumen de una propiedad».',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'La propiedad que se quiere ver.',
        ref: { resource: 'properties.buildings' },
      },
    },
    required: ['id'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'address',
        name: 'address',
        label: 'Dirección',
        format: 'text',
      },
      {
        key: 'certs',
        name: 'certs',
        label: 'Certificados',
        format: 'text',
        values: [
          {
            value: 'ok',
            label: 'Al día',
          },
          {
            value: 'soon',
            label: 'Certificado por vencer',
          },
          {
            value: 'expired',
            label: 'Certificado vencido',
          },
        ],
      },
      {
        key: 'type',
        name: 'type',
        label: 'Tipo',
        format: 'text',
        values: [
          {
            value: 'edificio',
            label: 'Edificio',
          },
          {
            value: 'departamento',
            label: 'Departamento',
          },
          {
            value: 'casa',
            label: 'Casa',
          },
          {
            value: 'local',
            label: 'Local',
          },
          {
            value: 'oficina',
            label: 'Oficina',
          },
          {
            value: 'galpon',
            label: 'Galpón',
          },
          {
            value: 'cochera',
            label: 'Cochera',
          },
          {
            value: 'baulera',
            label: 'Baulera',
          },
        ],
      },
      {
        key: 'occupancy',
        name: 'occupancy',
        label: 'Ocupación',
        format: 'text',
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
  },
});

export const createBuildings = defineAction({
  id: 'properties.buildings.create',
  title: 'Dar de alta una propiedad',
  description:
    'Registra una propiedad en la cartera: un edificio, una casa, un local, una cochera. Las unidades que se alquilan NO se crean acá — se agregan después, una por una, con «Dar de alta una unidad».',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Datos de Propiedad a crear.',
        properties: {
          type: {
            type: 'string',
            enum: [...PROPERTY_TYPES],
            description:
              'Tipo. Opciones: edificio (Edificio), casa (Casa), local (Local), oficina (Oficina), galpon (Galpón), cochera (Cochera), baulera (Baulera). Un departamento NO se carga acá: es una unidad de su edificio y se agrega con «Dar de alta una unidad».',
          },
          name: {
            type: 'string',
            description: 'Nombre',
          },
          description: {
            type: 'string',
            description: 'Descripción',
          },
          year_built: {
            type: 'integer',
            description: 'Año de construcción',
          },
          photos: {
            type: 'array',
            items: {
              type: 'object',
              description: 'Una foto de la lista.',
              properties: {
                url: {
                  type: 'string',
                  description: 'Dirección de la foto, no el archivo.',
                },
                caption: {
                  type: 'string',
                  description: 'Qué se ve en la foto.',
                },
              },
              required: ['url'],
              additionalProperties: false,
            },
            description: 'Fotos (lista de fotos, en orden: la primera es la principal)',
          },
          street: {
            type: 'string',
            description: 'Calle',
          },
          street_number: {
            type: 'string',
            description: 'Altura',
          },
          city: {
            type: 'string',
            description: 'Localidad',
          },
          zip_code: {
            type: 'string',
            description: 'Código postal',
          },
          province: {
            type: 'string',
            enum: [
              'buenos_aires',
              'caba',
              'catamarca',
              'chaco',
              'chubut',
              'cordoba',
              'corrientes',
              'entre_rios',
              'formosa',
              'jujuy',
              'la_pampa',
              'la_rioja',
              'mendoza',
              'misiones',
              'neuquen',
              'rio_negro',
              'salta',
              'san_juan',
              'san_luis',
              'santa_cruz',
              'santa_fe',
              'santiago_del_estero',
              'tierra_del_fuego',
              'tucuman',
            ],
            description:
              'Provincia. Opciones: buenos_aires (Buenos Aires), caba (Ciudad Autónoma de Buenos Aires), catamarca (Catamarca), chaco (Chaco), chubut (Chubut), cordoba (Córdoba), corrientes (Corrientes), entre_rios (Entre Ríos), formosa (Formosa), jujuy (Jujuy), la_pampa (La Pampa), la_rioja (La Rioja), mendoza (Mendoza), misiones (Misiones), neuquen (Neuquén), rio_negro (Río Negro), salta (Salta), san_juan (San Juan), san_luis (San Luis), santa_cruz (Santa Cruz), santa_fe (Santa Fe), sant…',
          },
          cadastral_ref: {
            type: 'string',
            description: 'Partida inmobiliaria',
          },
          ownership_mode: {
            type: 'string',
            enum: ['propia', 'condominio', 'sucesion'],
            description:
              'Modo de tenencia. Opciones: propia (Propia), condominio (Condominio), sucesion (Sucesión).',
          },
          admin_name: {
            type: 'string',
            description: 'Administrador',
          },
          admin_phone: {
            type: 'string',
            description: 'Teléfono',
          },
          admin_email: {
            type: 'string',
            description: 'Email',
          },
          notes: {
            type: 'string',
            description: 'Notas',
          },
        },
        required: ['type', 'name', 'street', 'street_number', 'city'],
        additionalProperties: false,
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'address',
        name: 'address',
        label: 'Dirección',
        format: 'text',
      },
      {
        key: 'certs',
        name: 'certs',
        label: 'Certificados',
        format: 'text',
        values: [
          {
            value: 'ok',
            label: 'Al día',
          },
          {
            value: 'soon',
            label: 'Certificado por vencer',
          },
          {
            value: 'expired',
            label: 'Certificado vencido',
          },
        ],
      },
      {
        key: 'type',
        name: 'type',
        label: 'Tipo',
        format: 'text',
        values: [
          {
            value: 'edificio',
            label: 'Edificio',
          },
          {
            value: 'departamento',
            label: 'Departamento',
          },
          {
            value: 'casa',
            label: 'Casa',
          },
          {
            value: 'local',
            label: 'Local',
          },
          {
            value: 'oficina',
            label: 'Oficina',
          },
          {
            value: 'galpon',
            label: 'Galpón',
          },
          {
            value: 'cochera',
            label: 'Cochera',
          },
          {
            value: 'baulera',
            label: 'Baulera',
          },
        ],
      },
      {
        key: 'occupancy',
        name: 'occupancy',
        label: 'Ocupación',
        format: 'text',
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
  },
});

export const updateBuildings = defineAction({
  id: 'properties.buildings.update',
  title: 'Editar una propiedad',
  description:
    'Cambia los datos de una propiedad ya cargada: dirección, administración, partida inmobiliaria, notas o fotos.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'La propiedad a editar.',
        ref: { resource: 'properties.buildings' },
      },
      data: {
        type: 'object',
        description: 'Los campos de la propiedad que se quieren cambiar.',
        properties: {
          type: {
            type: 'string',
            enum: [...PROPERTY_TYPES],
            description:
              'Tipo. Opciones: edificio (Edificio), casa (Casa), local (Local), oficina (Oficina), galpon (Galpón), cochera (Cochera), baulera (Baulera). Un departamento NO se carga acá: es una unidad de su edificio y se agrega con «Dar de alta una unidad».',
          },
          name: {
            type: 'string',
            description: 'Nombre',
          },
          description: {
            type: 'string',
            description: 'Descripción',
          },
          year_built: {
            type: 'integer',
            description: 'Año de construcción',
          },
          photos: {
            type: 'array',
            items: {
              type: 'object',
              description: 'Una foto de la lista.',
              properties: {
                url: {
                  type: 'string',
                  description: 'Dirección de la foto, no el archivo.',
                },
                caption: {
                  type: 'string',
                  description: 'Qué se ve en la foto.',
                },
              },
              required: ['url'],
              additionalProperties: false,
            },
            description: 'Fotos (lista de fotos, en orden: la primera es la principal)',
          },
          street: {
            type: 'string',
            description: 'Calle',
          },
          street_number: {
            type: 'string',
            description: 'Altura',
          },
          city: {
            type: 'string',
            description: 'Localidad',
          },
          zip_code: {
            type: 'string',
            description: 'Código postal',
          },
          province: {
            type: 'string',
            enum: [
              'buenos_aires',
              'caba',
              'catamarca',
              'chaco',
              'chubut',
              'cordoba',
              'corrientes',
              'entre_rios',
              'formosa',
              'jujuy',
              'la_pampa',
              'la_rioja',
              'mendoza',
              'misiones',
              'neuquen',
              'rio_negro',
              'salta',
              'san_juan',
              'san_luis',
              'santa_cruz',
              'santa_fe',
              'santiago_del_estero',
              'tierra_del_fuego',
              'tucuman',
            ],
            description:
              'Provincia. Opciones: buenos_aires (Buenos Aires), caba (Ciudad Autónoma de Buenos Aires), catamarca (Catamarca), chaco (Chaco), chubut (Chubut), cordoba (Córdoba), corrientes (Corrientes), entre_rios (Entre Ríos), formosa (Formosa), jujuy (Jujuy), la_pampa (La Pampa), la_rioja (La Rioja), mendoza (Mendoza), misiones (Misiones), neuquen (Neuquén), rio_negro (Río Negro), salta (Salta), san_juan (San Juan), san_luis (San Luis), santa_cruz (Santa Cruz), santa_fe (Santa Fe), sant…',
          },
          cadastral_ref: {
            type: 'string',
            description: 'Partida inmobiliaria',
          },
          ownership_mode: {
            type: 'string',
            enum: ['propia', 'condominio', 'sucesion'],
            description:
              'Modo de tenencia. Opciones: propia (Propia), condominio (Condominio), sucesion (Sucesión).',
          },
          admin_name: {
            type: 'string',
            description: 'Administrador',
          },
          admin_phone: {
            type: 'string',
            description: 'Teléfono',
          },
          admin_email: {
            type: 'string',
            description: 'Email',
          },
          notes: {
            type: 'string',
            description: 'Notas',
          },
        },
        additionalProperties: false,
      },
    },
    required: ['id', 'data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'address',
        name: 'address',
        label: 'Dirección',
        format: 'text',
      },
      {
        key: 'certs',
        name: 'certs',
        label: 'Certificados',
        format: 'text',
        values: [
          {
            value: 'ok',
            label: 'Al día',
          },
          {
            value: 'soon',
            label: 'Certificado por vencer',
          },
          {
            value: 'expired',
            label: 'Certificado vencido',
          },
        ],
      },
      {
        key: 'type',
        name: 'type',
        label: 'Tipo',
        format: 'text',
        values: [
          {
            value: 'edificio',
            label: 'Edificio',
          },
          {
            value: 'departamento',
            label: 'Departamento',
          },
          {
            value: 'casa',
            label: 'Casa',
          },
          {
            value: 'local',
            label: 'Local',
          },
          {
            value: 'oficina',
            label: 'Oficina',
          },
          {
            value: 'galpon',
            label: 'Galpón',
          },
          {
            value: 'cochera',
            label: 'Cochera',
          },
          {
            value: 'baulera',
            label: 'Baulera',
          },
        ],
      },
      {
        key: 'occupancy',
        name: 'occupancy',
        label: 'Ocupación',
        format: 'text',
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
  },
});

export const listUnits = defineAction({
  id: 'properties.units.list',
  title: 'Listar unidades',
  description:
    'Todas las unidades alquilables de la cartera, sin importar de qué propiedad son. Para las de una propiedad puntual, «Unidades de una propiedad».',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Cantidad de resultados a devolver. Default 20; máximo 50.',
      },
      offset: {
        type: 'integer',
        description: 'Cantidad de resultados a saltear para pedir la página siguiente.',
      },
    },
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        // El nombre calificado con su propiedad («Belgrano 1240 · 1°A»). Publicar solo
        // «1°A» hacía que dos unidades de edificios distintos se leyeran idénticas: el
        // nombre de una unidad no identifica nada fuera de su propiedad.
        key: 'label',
        name: 'label',
        label: 'Unidad',
        format: 'text',
      },
      {
        // El nombre tal cual se guardó. Va junto con `label` y no en su lugar: es el campo
        // que el agente escribe, y si no está en la salida no hay con qué comprobar que lo
        // escrito es lo que quedó — la certificación live lo rechaza, con razón.
        key: 'name',
        name: 'name',
        label: 'Nombre',
        format: 'text',
      },
      {
        key: 'detail',
        name: 'detail',
        label: 'Detalle',
        format: 'text',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'ocupada',
            label: 'Ocupada',
          },
          {
            value: 'vacante',
            label: 'Vacante',
          },
          {
            value: 'en_recambio',
            label: 'En recambio',
          },
          {
            value: 'con_preaviso',
            label: 'Con preaviso',
          },
          {
            value: 'no_disponible',
            label: 'No disponible',
          },
        ],
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

export const getByIdUnits = defineAction({
  id: 'properties.units.getById',
  title: 'Ver una unidad',
  description:
    'Los datos de una unidad: ambientes, baños, superficie, alícuota de expensas, estado de ocupación y alquiler de referencia.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'La unidad que se quiere ver.',
        ref: { resource: 'properties.units' },
      },
    },
    required: ['id'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        // El nombre calificado con su propiedad («Belgrano 1240 · 1°A»). Publicar solo
        // «1°A» hacía que dos unidades de edificios distintos se leyeran idénticas: el
        // nombre de una unidad no identifica nada fuera de su propiedad.
        key: 'label',
        name: 'label',
        label: 'Unidad',
        format: 'text',
      },
      {
        // El nombre tal cual se guardó. Va junto con `label` y no en su lugar: es el campo
        // que el agente escribe, y si no está en la salida no hay con qué comprobar que lo
        // escrito es lo que quedó — la certificación live lo rechaza, con razón.
        key: 'name',
        name: 'name',
        label: 'Nombre',
        format: 'text',
      },
      {
        key: 'detail',
        name: 'detail',
        label: 'Detalle',
        format: 'text',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'ocupada',
            label: 'Ocupada',
          },
          {
            value: 'vacante',
            label: 'Vacante',
          },
          {
            value: 'en_recambio',
            label: 'En recambio',
          },
          {
            value: 'con_preaviso',
            label: 'Con preaviso',
          },
          {
            value: 'no_disponible',
            label: 'No disponible',
          },
        ],
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
  },
});

export const createUnits = defineAction({
  id: 'properties.units.create',
  title: 'Dar de alta una unidad',
  description:
    'Agrega una unidad alquilable a una propiedad. El alquiler que se cobra NO se define acá: sale del contrato. El «alquiler de referencia» es solo el valor con el que se publica mientras está vacante.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Datos de la unidad a crear.',
        properties: {
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'La propiedad a la que pertenece la unidad.',
            ref: { resource: 'properties.buildings' },
          },
          name: {
            type: 'string',
            description: 'Nombre o número',
          },
          rooms: {
            type: 'integer',
            description: 'Ambientes',
          },
          bathrooms: {
            type: 'integer',
            description: 'Baños',
          },
          surface_m2: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Superficie (m²)',
          },
          share_pct: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Alícuota de expensas (%)',
          },
          photos: {
            type: 'array',
            items: {
              type: 'object',
              description: 'Una foto de la lista.',
              properties: {
                url: {
                  type: 'string',
                  description: 'Dirección de la foto, no el archivo.',
                },
                caption: {
                  type: 'string',
                  description: 'Qué se ve en la foto.',
                },
              },
              required: ['url'],
              additionalProperties: false,
            },
            description: 'Fotos (lista de fotos, en orden: la primera es la principal)',
          },
          status: {
            type: 'string',
            enum: ['vacante', 'ocupada', 'en_recambio', 'con_preaviso', 'no_disponible'],
            description:
              'Estado. Opciones: vacante (Vacante), ocupada (Ocupada), en_recambio (En recambio), con_preaviso (Con preaviso), no_disponible (No disponible).',
          },
          reference_rent: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Alquiler de referencia',
          },
          notes: {
            type: 'string',
            description: 'Notas',
          },
        },
        required: ['building_id', 'name', 'status'],
        additionalProperties: false,
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        // El nombre calificado con su propiedad («Belgrano 1240 · 1°A»). Publicar solo
        // «1°A» hacía que dos unidades de edificios distintos se leyeran idénticas: el
        // nombre de una unidad no identifica nada fuera de su propiedad.
        key: 'label',
        name: 'label',
        label: 'Unidad',
        format: 'text',
      },
      {
        // El nombre tal cual se guardó. Va junto con `label` y no en su lugar: es el campo
        // que el agente escribe, y si no está en la salida no hay con qué comprobar que lo
        // escrito es lo que quedó — la certificación live lo rechaza, con razón.
        key: 'name',
        name: 'name',
        label: 'Nombre',
        format: 'text',
      },
      {
        key: 'detail',
        name: 'detail',
        label: 'Detalle',
        format: 'text',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'ocupada',
            label: 'Ocupada',
          },
          {
            value: 'vacante',
            label: 'Vacante',
          },
          {
            value: 'en_recambio',
            label: 'En recambio',
          },
          {
            value: 'con_preaviso',
            label: 'Con preaviso',
          },
          {
            value: 'no_disponible',
            label: 'No disponible',
          },
        ],
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
  },
});

export const updateUnits = defineAction({
  id: 'properties.units.update',
  title: 'Editar una unidad',
  description:
    'Cambia los datos de una unidad. Cuidado con el estado: la ocupación la escribe el contrato al firmarse, renovarse o rescindirse. Ponerlo a mano acá deja la unidad diciendo una cosa y el alquiler otra.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'La unidad a editar.',
        ref: { resource: 'properties.units' },
      },
      data: {
        type: 'object',
        description: 'Los campos de la unidad que se quieren cambiar.',
        properties: {
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'Mover la unidad a otra propiedad. Normalmente no se toca.',
            ref: { resource: 'properties.buildings' },
          },
          name: {
            type: 'string',
            description: 'Nombre o número',
          },
          rooms: {
            type: 'integer',
            description: 'Ambientes',
          },
          bathrooms: {
            type: 'integer',
            description: 'Baños',
          },
          surface_m2: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Superficie (m²)',
          },
          share_pct: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Alícuota de expensas (%)',
          },
          photos: {
            type: 'array',
            items: {
              type: 'object',
              description: 'Una foto de la lista.',
              properties: {
                url: {
                  type: 'string',
                  description: 'Dirección de la foto, no el archivo.',
                },
                caption: {
                  type: 'string',
                  description: 'Qué se ve en la foto.',
                },
              },
              required: ['url'],
              additionalProperties: false,
            },
            description: 'Fotos (lista de fotos, en orden: la primera es la principal)',
          },
          status: {
            type: 'string',
            enum: ['vacante', 'ocupada', 'en_recambio', 'con_preaviso', 'no_disponible'],
            description:
              'Estado. Opciones: vacante (Vacante), ocupada (Ocupada), en_recambio (En recambio), con_preaviso (Con preaviso), no_disponible (No disponible).',
          },
          reference_rent: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Alquiler de referencia',
          },
          notes: {
            type: 'string',
            description: 'Notas',
          },
        },
        additionalProperties: false,
      },
    },
    required: ['id', 'data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        // El nombre calificado con su propiedad («Belgrano 1240 · 1°A»). Publicar solo
        // «1°A» hacía que dos unidades de edificios distintos se leyeran idénticas: el
        // nombre de una unidad no identifica nada fuera de su propiedad.
        key: 'label',
        name: 'label',
        label: 'Unidad',
        format: 'text',
      },
      {
        // El nombre tal cual se guardó. Va junto con `label` y no en su lugar: es el campo
        // que el agente escribe, y si no está en la salida no hay con qué comprobar que lo
        // escrito es lo que quedó — la certificación live lo rechaza, con razón.
        key: 'name',
        name: 'name',
        label: 'Nombre',
        format: 'text',
      },
      {
        key: 'detail',
        name: 'detail',
        label: 'Detalle',
        format: 'text',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'ocupada',
            label: 'Ocupada',
          },
          {
            value: 'vacante',
            label: 'Vacante',
          },
          {
            value: 'en_recambio',
            label: 'En recambio',
          },
          {
            value: 'con_preaviso',
            label: 'Con preaviso',
          },
          {
            value: 'no_disponible',
            label: 'No disponible',
          },
        ],
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
  },
});

export const listBuildingExpenses = defineAction({
  id: 'properties.buildingExpenses.list',
  title: 'Listar liquidaciones de expensas',
  description:
    'Todas las liquidaciones de expensas cargadas, de cualquier propiedad y cualquier mes. Para acotar, «Expensas de una propiedad» o «Expensas liquidadas de un mes».',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Cantidad de resultados a devolver. Default 20; máximo 50.',
      },
      offset: {
        type: 'integer',
        description: 'Cantidad de resultados a saltear para pedir la página siguiente.',
      },
    },
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'period',
        name: 'period',
        label: 'Período',
        format: 'text',
      },
      {
        key: 'amount',
        name: 'amount',
        label: 'Total',
        format: 'money',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'recibida',
            label: 'Recibida',
          },
          {
            value: 'pagada',
            label: 'Pagada',
          },
        ],
      },
    ],
    identifierKey: 'id',
    defaultLimit: 10,
    maxLimit: 50,
  },
});

export const getByIdBuildingExpenses = defineAction({
  id: 'properties.buildingExpenses.getById',
  title: 'Ver una liquidación de expensas',
  description:
    'Una liquidación por su id: de qué propiedad y qué mes es, cuánto liquidó el consorcio, cuándo llegó y si ya se pagó.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'La liquidación que se quiere ver.',
        ref: { resource: 'properties.buildingExpenses' },
      },
    },
    required: ['id'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'period',
        name: 'period',
        label: 'Período',
        format: 'text',
      },
      {
        key: 'amount',
        name: 'amount',
        label: 'Total',
        format: 'money',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'recibida',
            label: 'Recibida',
          },
          {
            value: 'pagada',
            label: 'Pagada',
          },
        ],
      },
    ],
    identifierKey: 'id',
  },
});

export const createBuildingExpenses = defineAction({
  id: 'properties.buildingExpenses.create',
  title: 'Cargar la liquidación de expensas',
  description:
    'Registra lo que el consorcio liquidó a una propiedad por un mes. Ese total es el que después se reparte entre las unidades según su alícuota, así que cargar dos veces el mismo mes duplica el reparto: antes de cargar, conviene mirar si ya está con «Expensas de una propiedad».',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Datos de la liquidación a cargar.',
        properties: {
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'La propiedad a la que el consorcio le liquidó estas expensas.',
            ref: { resource: 'properties.buildings' },
          },
          period: {
            type: 'string',
            description: 'Período',
          },
          amount: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Total liquidado',
          },
          status: {
            type: 'string',
            enum: ['recibida', 'pagada'],
            description: 'Estado. Opciones: recibida (Recibida), pagada (Pagada).',
            default: 'recibida',
          },
          paid_at: {
            type: 'string',
            format: 'date',
            description: 'Fecha de pago',
          },
          document_url: {
            type: 'string',
            description: 'Link a la liquidación',
          },
          notes: {
            type: 'string',
            description: 'Observaciones',
          },
        },
        required: ['building_id', 'period', 'amount'],
        additionalProperties: false,
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'period',
        name: 'period',
        label: 'Período',
        format: 'text',
      },
      {
        key: 'amount',
        name: 'amount',
        label: 'Total',
        format: 'money',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'recibida',
            label: 'Recibida',
          },
          {
            value: 'pagada',
            label: 'Pagada',
          },
        ],
      },
    ],
    identifierKey: 'id',
  },
});

export const updateBuildingExpenses = defineAction({
  id: 'properties.buildingExpenses.update',
  title: 'Corregir una liquidación de expensas',
  description:
    'Cambia el importe, las fechas o el estado de una liquidación ya cargada. Ojo: si ese mes ya se repartió a los inquilinos, corregir acá NO corrige los cargos que ya se emitieron.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'La liquidación a corregir.',
        ref: { resource: 'properties.buildingExpenses' },
      },
      data: {
        type: 'object',
        description: 'Los campos de la liquidación que se quieren cambiar.',
        properties: {
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'La propiedad a la que corresponde la liquidación.',
            ref: { resource: 'properties.buildings' },
          },
          period: {
            type: 'string',
            description: 'Período',
          },
          amount: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Total liquidado',
          },
          status: {
            type: 'string',
            enum: ['recibida', 'pagada'],
            description: 'Estado. Opciones: recibida (Recibida), pagada (Pagada).',
            default: 'recibida',
          },
          paid_at: {
            type: 'string',
            format: 'date',
            description: 'Fecha de pago',
          },
          document_url: {
            type: 'string',
            description: 'Link a la liquidación',
          },
          notes: {
            type: 'string',
            description: 'Observaciones',
          },
        },
        additionalProperties: false,
      },
    },
    required: ['id', 'data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'period',
        name: 'period',
        label: 'Período',
        format: 'text',
      },
      {
        key: 'amount',
        name: 'amount',
        label: 'Total',
        format: 'money',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'recibida',
            label: 'Recibida',
          },
          {
            value: 'pagada',
            label: 'Pagada',
          },
        ],
      },
    ],
    identifierKey: 'id',
  },
});

export const getSummaryBuildings = defineAction({
  id: 'properties.buildings.getSummary',
  title: 'Resumen de una propiedad',
  description:
    'Una propiedad con lo que no está en su fila: la dirección armada, cuántas unidades tiene, cuántas están ocupadas, el alquiler de referencia sumado y si sus certificados están al día.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'La propiedad de la que se quiere el resumen.',
        ref: { resource: 'properties.buildings' },
      },
      alertDays: {
        type: 'integer',
        description:
          'Con cuántos días de anticipación contar un certificado como «por vencer». Si se omite, 30.',
      },
    },
    required: ['id'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'address',
        name: 'address',
        label: 'Dirección',
        format: 'text',
      },
      {
        key: 'certs',
        name: 'certs',
        label: 'Certificados',
        format: 'text',
        values: [
          {
            value: 'ok',
            label: 'Al día',
          },
          {
            value: 'soon',
            label: 'Certificado por vencer',
          },
          {
            value: 'expired',
            label: 'Certificado vencido',
          },
        ],
      },
      {
        key: 'type',
        name: 'type',
        label: 'Tipo',
        format: 'text',
        values: [
          {
            value: 'edificio',
            label: 'Edificio',
          },
          {
            value: 'departamento',
            label: 'Departamento',
          },
          {
            value: 'casa',
            label: 'Casa',
          },
          {
            value: 'local',
            label: 'Local',
          },
          {
            value: 'oficina',
            label: 'Oficina',
          },
          {
            value: 'galpon',
            label: 'Galpón',
          },
          {
            value: 'cochera',
            label: 'Cochera',
          },
          {
            value: 'baulera',
            label: 'Baulera',
          },
        ],
      },
      {
        key: 'occupancy',
        name: 'occupancy',
        label: 'Ocupación',
        format: 'text',
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
  },
});

export const listByBuildingUnits = defineAction({
  id: 'properties.units.listByBuilding',
  title: 'Unidades de una propiedad',
  description:
    'Las unidades alquilables de una propiedad, ordenadas por nombre, con su estado de ocupación.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      buildingId: {
        type: 'string',
        description: 'La propiedad cuyas unidades se quieren listar.',
        ref: { resource: 'properties.buildings' },
      },
    },
    required: ['buildingId'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        // El nombre calificado con su propiedad («Belgrano 1240 · 1°A»). Publicar solo
        // «1°A» hacía que dos unidades de edificios distintos se leyeran idénticas: el
        // nombre de una unidad no identifica nada fuera de su propiedad.
        key: 'label',
        name: 'label',
        label: 'Unidad',
        format: 'text',
      },
      {
        // El nombre tal cual se guardó. Va junto con `label` y no en su lugar: es el campo
        // que el agente escribe, y si no está en la salida no hay con qué comprobar que lo
        // escrito es lo que quedó — la certificación live lo rechaza, con razón.
        key: 'name',
        name: 'name',
        label: 'Nombre',
        format: 'text',
      },
      {
        key: 'detail',
        name: 'detail',
        label: 'Detalle',
        format: 'text',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'ocupada',
            label: 'Ocupada',
          },
          {
            value: 'vacante',
            label: 'Vacante',
          },
          {
            value: 'en_recambio',
            label: 'En recambio',
          },
          {
            value: 'con_preaviso',
            label: 'Con preaviso',
          },
          {
            value: 'no_disponible',
            label: 'No disponible',
          },
        ],
      },
      {
        key: 'reference_rent',
        name: 'referenceRent',
        label: 'Alquiler de referencia',
        format: 'money',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

export const listByBuildingCertificates = defineAction({
  id: 'properties.certificates.listByBuilding',
  title: 'Certificados de una propiedad',
  description:
    'Los certificados que alcanzan a una propiedad —los suyos y los de sus unidades—, con el estado ya resuelto contra la fecha de hoy: vigente, por vencer o vencido. Lo que vence primero viene primero.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      buildingId: {
        type: 'string',
        description: 'La propiedad cuyos certificados se quieren ver.',
        ref: { resource: 'properties.buildings' },
      },
      alertDays: {
        type: 'integer',
        description:
          'Con cuántos días de anticipación marcar un certificado como «por vencer». Si se omite, cada tipo usa su propio horizonte.',
      },
    },
    required: ['buildingId'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'type',
        name: 'type',
        label: 'Certificado',
        format: 'text',
        values: [
          {
            value: 'matafuegos',
            label: 'Matafuegos',
          },
          {
            value: 'gas',
            label: 'Instalación de gas',
          },
          {
            value: 'ascensor',
            label: 'Ascensor',
          },
          {
            value: 'electricidad',
            label: 'Instalación eléctrica',
          },
          {
            value: 'seguro',
            label: 'Seguro del inmueble',
          },
          {
            value: 'otro',
            label: 'Otro',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'vigente',
            label: 'Vigente',
          },
          {
            value: 'por_vencer',
            label: 'Por vencer',
          },
          {
            value: 'vencido',
            label: 'Vencido',
          },
        ],
      },
      {
        key: 'expires_at',
        name: 'expiresAt',
        label: 'Vence',
        format: 'date',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 10,
    maxLimit: 50,
  },
});

export const forBuildingBuildingExpenses = defineAction({
  id: 'properties.buildingExpenses.forBuilding',
  title: 'Expensas de una propiedad',
  description:
    'Las liquidaciones de expensas de una propiedad, del mes más reciente al más viejo, con el total que liquidó el consorcio y si ya se pagó.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      buildingId: {
        type: 'string',
        description: 'La propiedad cuyas liquidaciones se quieren ver.',
        ref: { resource: 'properties.buildings' },
      },
    },
    required: ['buildingId'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'period',
        name: 'period',
        label: 'Período',
        format: 'text',
      },
      {
        key: 'amount',
        name: 'amount',
        label: 'Total',
        format: 'money',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'recibida',
            label: 'Recibida',
          },
          {
            value: 'pagada',
            label: 'Pagada',
          },
        ],
      },
    ],
    identifierKey: 'id',
    defaultLimit: 10,
    maxLimit: 50,
  },
});

export const getOwnerUnitOwners = defineAction({
  id: 'properties.unitOwners.getOwner',
  title: 'Ver un propietario',
  description:
    'Un propietario con sus datos de contacto y de cobro juntos: documento, condición fiscal, banco, CBU y alias. Los datos de cobro se guardan aparte de las columnas del contacto y esta capacidad ya los devuelve al mismo nivel.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description:
          'El propietario que se quiere ver, tal como lo devuelve «Listar propietarios».',
        ref: { resource: 'properties.unitOwners' },
      },
    },
    required: ['id'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Propietario',
        format: 'text',
      },
      {
        key: 'document_number',
        name: 'documentNumber',
        label: 'Documento',
        format: 'text',
      },
      {
        key: 'email',
        name: 'email',
        label: 'Email',
        format: 'text',
      },
      {
        key: 'phone',
        name: 'phone',
        label: 'Teléfono',
        format: 'text',
      },
      {
        key: 'address',
        name: 'address',
        label: 'Domicilio',
        format: 'text',
      },
      {
        key: 'tax_condition',
        name: 'taxCondition',
        label: 'Condición frente al IVA',
        format: 'text',
        values: [
          {
            value: 'monotributo',
            label: 'Monotributo',
          },
          {
            value: 'responsable_inscripto',
            label: 'Responsable inscripto',
          },
          {
            value: 'exento',
            label: 'Exento',
          },
          {
            value: 'consumidor_final',
            label: 'Consumidor final',
          },
        ],
      },
      {
        key: 'bank',
        name: 'bank',
        label: 'Banco',
        format: 'text',
      },
      {
        key: 'cbu',
        name: 'cbu',
        label: 'CBU',
        format: 'text',
      },
      {
        key: 'alias',
        name: 'alias',
        label: 'Alias',
        format: 'text',
      },
    ],
    identifierKey: 'id',
  },
});

export const saveOwnerUnitOwners = defineAction({
  id: 'properties.unitOwners.saveOwner',
  title: 'Guardar un propietario',
  description:
    'Da de alta un propietario o edita uno existente: con «id» edita ese, sin «id» crea uno. Necesita nombre y documento (CUIT, CUIL o DNI) — sin documento no se le puede liquidar. Es el único camino correcto para escribirlo: decide qué va en columnas y qué en los datos de cobro, y conserva lo que otro rol le cargó a esa persona. También es el único modo de decir DE QUÉ UNIDAD es dueño: con «unit_id» crea o corrige ese vínculo, sin tocar sus otras unidades.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description:
          'El propietario a editar. Omitilo para crear uno nuevo; mandarlo con un id inexistente no crea nada.',
        ref: { resource: 'properties.unitOwners' },
      },
      data: {
        type: 'object',
        description: 'Datos de Propietario a crear.',
        properties: {
          name: {
            type: 'string',
            description: 'Nombre y apellido o razón social',
          },
          document_type: {
            type: 'string',
            enum: ['cuit', 'cuil', 'dni'],
            description: 'Documento. Opciones: cuit (CUIT), cuil (CUIL), dni (DNI).',
          },
          document_number: {
            type: 'string',
            description: 'Número',
          },
          tax_condition: {
            type: 'string',
            enum: ['monotributo', 'responsable_inscripto', 'exento', 'consumidor_final'],
            description:
              'Condición frente al IVA. Opciones: monotributo (Monotributo), responsable_inscripto (Responsable inscripto), exento (Exento), consumidor_final (Consumidor final).',
          },
          email: {
            type: 'string',
            description: 'Email',
          },
          phone: {
            type: 'string',
            description: 'Teléfono',
          },
          address: {
            type: 'string',
            description: 'Domicilio',
          },
          bank: {
            type: 'string',
            description: 'Banco',
          },
          account: {
            type: 'string',
            description: 'Tipo y número de cuenta',
          },
          cbu: {
            type: 'string',
            description: 'CBU',
          },
          alias: {
            type: 'string',
            description: 'Alias',
          },
          unit_id: {
            type: 'string',
            format: 'uuid',
            description:
              'De qué unidad es dueño. Opcional: sin esto se guarda solo la persona. Con esto se crea el vínculo, o se corrige el que ya tenía con ESA unidad — las otras no se tocan.',
            ref: { resource: 'properties.units' },
          },
          share_pct: {
            type: 'number',
            description:
              'Con qué porcentaje figura en esa unidad. Si es el único dueño se puede omitir: se toma 100. Entre todos los dueños de una unidad no puede pasar de 100, y la operación se rechaza si se pasa — ese porcentaje es con el que después se le liquida y con el que declara la renta.',
          },
          role: {
            type: 'string',
            enum: ['titular', 'cotitular', 'usufructuario', 'nudo_propietario'],
            description:
              'Con qué carácter figura en la unidad. Si se omite, «titular» al crear el vínculo y el que ya tenía al corregirlo. Titular, cotitular y nudo propietario reparten el DOMINIO (juntos llegan a 100); el usufructuario percibe los frutos y suma por su cuenta, así que un usufructo sobre una unidad ya escriturada al 100 % es válido.',
          },
        },
        // El handler solo exige nombre, pero el canal agentic valida contra el
        // mismo formulario que la pantalla, que además pide documento. Declarar
        // acá solo el nombre haría que el catálogo prometa algo que después se
        // rechaza — verificado en la certificación live. Y el documento no es
        // burocracia: sin CUIT o DNI no se le puede liquidar al propietario.
        required: ['name', 'document_type', 'document_number'],
        additionalProperties: false,
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  // saveOwner devuelve a quién guardó, si nació en esta llamada y cómo quedó
  // repartida la unidad — no la fila completa del propietario. Para leerlo
  // entero, «Ver un propietario».
  output: {
    kind: 'record',
    fields: [
      {
        key: 'created',
        name: 'created',
        label: 'Se creó como propietario nuevo',
        format: 'boolean',
      },
      {
        // Que la unidad haya quedado al 60 % no es un error —los dueños se cargan
        // de a uno— pero tiene que DECIRSE, o se reparte mal en silencio hasta que
        // alguien lo note en la liquidación.
        key: 'ownership',
        name: 'ownership',
        label: 'Cómo quedó la unidad',
        format: 'text',
      },
    ],
    identifierKey: 'id',
  },
});

export const listOwnersUnitOwners = defineAction({
  id: 'properties.unitOwners.listOwners',
  title: 'Listar propietarios',
  description:
    'Los propietarios de la cartera: cuántas unidades tiene cada uno y con qué participación, más los datos con los que se le transfiere (alias o CBU). Incluye a los registrados como propietarios aunque todavía no tengan ninguna unidad a su nombre.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: none(),
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Propietario',
        format: 'text',
      },
      {
        key: 'document',
        name: 'document',
        label: 'Documento',
        format: 'text',
      },
      {
        key: 'units',
        name: 'units',
        label: 'Unidades',
        format: 'text',
      },
      {
        key: 'cbu',
        name: 'cbu',
        label: 'CBU / alias',
        format: 'text',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

/**
 * No tiene pantalla propia: la consume la generación de cargos de `leases`, que
 * necesita el total liquidado del mes para repartirlo por alícuota. El borrador
 * la marcó como escritura porque no pudo inferirla desde ninguna vista; es un
 * `select` por período.
 */
export const forPeriodBuildingExpenses = defineAction({
  id: 'properties.buildingExpenses.forPeriod',
  title: 'Expensas liquidadas de un mes',
  description:
    'Las liquidaciones de expensas de un mes, de todas las propiedades. Es el total que el consorcio liquidó y que después se reparte entre las unidades según su alícuota.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      period: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}$',
        description: 'El mes a consultar, como «2026-08». Las expensas son mensuales.',
      },
    },
    required: ['period'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'period',
        name: 'period',
        label: 'Período',
        format: 'text',
      },
      {
        key: 'amount',
        name: 'amount',
        label: 'Total',
        format: 'money',
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'recibida',
            label: 'Recibida',
          },
          {
            value: 'pagada',
            label: 'Pagada',
          },
        ],
      },
      {
        key: 'building_id',
        name: 'buildingId',
        label: 'Propiedad',
        format: 'text',
        reference: {
          action: 'properties.buildings.getById',
          displayField: 'name',
        },
      },
    ],
    identifierKey: 'id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

/**
 * Las tres operaciones que hacen falta para mirar y corregir la titularidad parado en la
 * unidad, que es donde el 100 % significa algo: en la ficha de una persona nunca se ve si
 * a una unidad le falta asignar una parte (COONG-294).
 */
export const listByUnitUnitOwners = defineAction({
  id: 'properties.unitOwners.listByUnit',
  title: 'Titulares de una unidad',
  description:
    'Quiénes figuran como dueños de UNA unidad, con qué participación y con qué carácter. Es la lectura que responde «¿de quién es esto?»; para saber si el reparto está completo, «Cómo está repartida una unidad».',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      unitId: {
        type: 'string',
        description: 'La unidad cuyos titulares se quieren ver.',
        ref: { resource: 'properties.units' },
      },
    },
    required: ['unitId'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Titular',
        format: 'text',
      },
      {
        key: 'document',
        name: 'document',
        label: 'Documento',
        format: 'text',
      },
      {
        key: 'share_label',
        name: 'shareLabel',
        label: 'Participación',
        format: 'text',
      },
      {
        key: 'role',
        name: 'role',
        label: 'Carácter',
        format: 'text',
        values: [
          { value: 'titular', label: 'Titular' },
          { value: 'cotitular', label: 'Cotitular' },
          { value: 'usufructuario', label: 'Usufructuario' },
          { value: 'nudo_propietario', label: 'Nudo propietario' },
        ],
      },
    ],
    // La PERSONA, no el vínculo. Cada fila tiene los dos ids, y el que identifica
    // al recurso «propietario» es el del contacto — es el que devuelve
    // «listOwners» y el que pide «removeOwner». Emitir el id del vínculo hacía
    // que encadenar list → remove fallara con «esa persona no figura como dueña».
    identifierKey: 'contact_id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

export const ownershipOfUnitOwners = defineAction({
  id: 'properties.unitOwners.ownershipOf',
  title: 'Cómo está repartida una unidad',
  description:
    'Si el dominio de una unidad llega a 100 % y, si no, cuánto falta asignar. El usufructo se informa aparte porque no le saca dominio a nadie: lo desmembra. Sirve para detectar unidades a medio cargar antes de que repartan mal la liquidación.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      unitId: {
        type: 'string',
        description: 'La unidad que se quiere revisar.',
        ref: { resource: 'properties.units' },
      },
    },
    required: ['unitId'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'summary',
        name: 'summary',
        label: 'Estado del reparto',
        format: 'text',
      },
      {
        key: 'assigned',
        name: 'assigned',
        label: 'Dominio asignado (%)',
        format: 'number',
      },
      {
        key: 'missing',
        name: 'missing',
        label: 'Falta asignar (%)',
        format: 'number',
      },
      {
        key: 'usufruct',
        name: 'usufruct',
        label: 'Usufructo declarado (%)',
        format: 'number',
      },
      {
        key: 'owners',
        name: 'owners',
        label: 'Personas cargadas',
        format: 'number',
      },
    ],
  },
});

export const removeOwnerUnitOwners = defineAction({
  id: 'properties.unitOwners.removeOwner',
  title: 'Sacar a un titular de una unidad',
  description:
    'Quita a una persona de la titularidad de una unidad. NO borra a la persona: sigue existiendo con sus datos y sus otras unidades, y se la puede volver a cargar con «Guardar un propietario». Deja la unidad por debajo de 100 % a propósito —quien se equivocó de persona tiene que poder sacarla— y devuelve cómo quedó el reparto.',
  effect: 'destructive',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      unitId: {
        type: 'string',
        description: 'La unidad de la que se saca al titular.',
        ref: { resource: 'properties.units' },
      },
      contactId: {
        type: 'string',
        description:
          'La persona que deja de figurar. Es el id del propietario, no el del vínculo — el mismo que devuelve «Titulares de una unidad» en su columna de contacto.',
        ref: { resource: 'properties.unitOwners' },
      },
    },
    required: ['unitId', 'contactId'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'ownership',
        name: 'ownership',
        label: 'Cómo quedó la unidad',
        format: 'text',
      },
    ],
  },
});

/**
 * Los dueños de una propiedad entera. Existe para las que SON una sola unidad
 * —una casa, un local—, donde la titularidad se mira parado en la propiedad.
 */
export const listByBuildingUnitOwners = defineAction({
  id: 'properties.unitOwners.listByBuilding',
  title: 'Titulares de una propiedad',
  description:
    'Quiénes figuran como dueños de una propiedad, con qué participación y con qué carácter. En una casa o un local —que son una sola unidad— es la forma directa de preguntar de quién es. En un edificio devuelve los dueños de todas sus unidades.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      buildingId: {
        type: 'string',
        description: 'La propiedad cuyos titulares se quieren ver.',
        ref: { resource: 'properties.buildings' },
      },
    },
    required: ['buildingId'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'name',
        name: 'name',
        label: 'Titular',
        format: 'text',
      },
      {
        key: 'document',
        name: 'document',
        label: 'Documento',
        format: 'text',
      },
      {
        key: 'share_label',
        name: 'shareLabel',
        label: 'Participación',
        format: 'text',
      },
      {
        key: 'role',
        name: 'role',
        label: 'Carácter',
        format: 'text',
        values: [
          { value: 'titular', label: 'Titular' },
          { value: 'cotitular', label: 'Cotitular' },
          { value: 'usufructuario', label: 'Usufructuario' },
          { value: 'nudo_propietario', label: 'Nudo propietario' },
        ],
      },
    ],
    // La PERSONA, no el vínculo — mismo criterio que «Titulares de una unidad».
    identifierKey: 'contact_id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

/**
 * Las unidades que están a nombre de una persona. Es la mitad que faltaba: el
 * catálogo sabía decir quiénes son los dueños de una unidad, pero no de qué es
 * dueño alguien.
 */
export const listUnitsOfUnitOwners = defineAction({
  id: 'properties.unitOwners.listUnitsOf',
  title: 'Unidades de un propietario',
  description:
    'Qué unidades están a nombre de una persona, con qué participación y con qué carácter en cada una. Cada unidad viene con su propiedad adelante («Belgrano 1240 · 1°A»), porque el nombre suelto no distingue el «1°A» de un edificio del de otro.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
        description: 'La persona de la que se quieren ver las unidades.',
        ref: { resource: 'properties.unitOwners' },
      },
    },
    required: ['contactId'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'label',
        name: 'label',
        label: 'Unidad',
        format: 'text',
      },
      {
        key: 'share_label',
        name: 'shareLabel',
        label: 'Participación',
        format: 'text',
      },
      {
        key: 'role',
        name: 'role',
        label: 'Carácter',
        format: 'text',
        values: [
          { value: 'titular', label: 'Titular' },
          { value: 'cotitular', label: 'Cotitular' },
          { value: 'usufructuario', label: 'Usufructuario' },
          { value: 'nudo_propietario', label: 'Nudo propietario' },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          { value: 'ocupada', label: 'Ocupada' },
          { value: 'vacante', label: 'Vacante' },
          { value: 'en_recambio', label: 'En recambio' },
          { value: 'con_preaviso', label: 'Con preaviso' },
          { value: 'no_disponible', label: 'No disponible' },
        ],
      },
    ],
    // La UNIDAD, que es de lo que habla cada fila: con esa referencia el agente
    // encadena hacia su ficha o hacia un contrato.
    identifierKey: 'unit_id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

/**
 * REVISAR: generado desde el formulario de la vista.
 *
 * El borrador describe lo que la pantalla envía hoy. El contrato tiene que
 * describir lo que ESTE handler exige — incluidos los valores que la UI
 * resuelve por contexto de apertura y que en el formulario no se ven.
 */
export const listByUnitCertificates = defineAction({
  id: 'properties.certificates.listByUnit',
  title: 'Certificados de una unidad',
  description:
    'Los certificados que alcanzan a UNA unidad: los suyos y los del edificio donde está, que la cubren igual. Cada uno viene con su alcance —«de la unidad» o «del edificio»— y con el estado ya resuelto contra la fecha de hoy. Es la lectura para contestar si una unidad está en regla para alquilarse. Los certificados de las unidades hermanas no entran: el gas del 5°A no dice nada del 3°B.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  // El borrador decía `none()` porque la PANTALLA no manda nada: la ficha resuelve la
  // unidad del registro con el que se abrió. El handler sí la exige, y un agente no
  // tiene ese contexto — sin declararlo, la capability quedaba imposible de llamar.
  input: {
    type: 'object',
    properties: {
      unitId: {
        type: 'string',
        description: 'La unidad cuyos certificados se quieren ver.',
        ref: { resource: 'properties.units' },
      },
      alertDays: {
        type: 'integer',
        description:
          'Con cuántos días de anticipación marcar un certificado como «por vencer». Si se omite, cada tipo usa su propio horizonte.',
      },
    },
    required: ['unitId'],
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'type',
        name: 'type',
        label: 'Certificado',
        format: 'text',
        values: [
          {
            value: 'matafuegos',
            label: 'Matafuegos',
          },
          {
            value: 'gas',
            label: 'Instalación de gas',
          },
          {
            value: 'ascensor',
            label: 'Ascensor',
          },
          {
            value: 'electricidad',
            label: 'Instalación eléctrica',
          },
          {
            value: 'seguro',
            label: 'Seguro del inmueble',
          },
          {
            value: 'otro',
            label: 'Otro',
          },
        ],
      },
      {
        key: 'scope',
        name: 'scope',
        label: 'Alcance',
        format: 'text',
        values: [
          {
            value: 'unidad',
            label: 'De la unidad',
          },
          {
            value: 'edificio',
            label: 'Del edificio',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'vigente',
            label: 'Vigente',
          },
          {
            value: 'por_vencer',
            label: 'Por vencer',
          },
          {
            value: 'vencido',
            label: 'Vencido',
          },
        ],
      },
      {
        key: 'expires_at',
        name: 'expiresAt',
        label: 'Vence',
        format: 'date',
      },
    ],
    identifierKey: 'id',
    defaultLimit: 10,
    maxLimit: 50,
  },
});

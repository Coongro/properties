/**
 * Ficha de propiedad — datos y estado (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import {
  actions,
  events,
  getHostReact,
  usePlugin,
  views,
  type LiveValues,
} from '@coongro/plugin-sdk';

import { customHandlers } from './handlers.js';

const React = getHostReact();
const { useState, useEffect, useCallback, useMemo, useRef } = React;

export function useFichaDePropiedadView() {
  const { toast } = usePlugin();
  const mounted = useRef(true);
  // reset en el mount (no solo cleanup): StrictMode desmonta y REMONTA
  // conservando refs — con cleanup solo, el remonte quedaría muerto
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // Registro con el que se abrió la vista (views.open(id, { record })): en una
  // ficha es por lo que filtran sus tablas hijas. Null en una lista suelta.
  const viewRecord = ((views.params as any)?.record ?? null) as Record<string, any> | null;
  // Valores en vivo de los indicadores. Mientras cargan NO se muestra el número
  // del diseño: sería una cifra inventada leída como real (por el usuario y por
  // el Copilot). Sin loadLiveValues la vista es de maqueta y el texto escrito manda.
  const [metrics, setMetrics] = useState<Record<string, LiveValues> | null>(null);
  const reloadMetrics = useCallback(() => {
    const load = customHandlers.loadLiveValues;
    if (!load) return;
    setMetrics(null);
    void load({
      execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
        return actions.execute<T>(id, args);
      },
      record: viewRecord,
    })
      .then((m) => {
        if (mounted.current) setMetrics(m ?? {});
      })
      .catch(() => {
        if (mounted.current) setMetrics({});
      });
    // deps intencionalmente fijas: la función es estable
  }, []);
  useEffect(() => {
    reloadMetrics();
  }, [reloadMetrics]);
  const metric = useCallback(
    (id: string, key: keyof LiveValues, design: string) => {
      if (!customHandlers.loadLiveValues) return design;
      if (!metrics) return '…';
      return metrics[id]?.[key] ?? design;
    },
    [metrics]
  );

  const normKey = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');

  // ── tabla 1 — properties.buildings: estado propio en su scope (mismos nombres, sin colisión) ──
  const useTable1 = () => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
      setLoading(true);
      try {
        const ctx = {
          execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
            return actions.execute<T>(id, args);
          },
          record: viewRecord,
        };
        const byBlock = customHandlers.loadDataFor?.['tbl_unidades'];
        const data = byBlock
          ? await byBlock(ctx)
          : customHandlers.loadData
            ? await customHandlers.loadData(ctx)
            : await actions.execute<any[]>('properties.buildings.list');
        if (mounted.current) setRows(Array.isArray(data) ? data : []);
      } catch {
        if (mounted.current) {
          setRows([]);
          toast.error('Error', 'No se pudieron cargar los datos');
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, []);
    useEffect(() => {
      void load();
    }, [load]);
    useEffect(() => {
      const offs = [
        'properties.buildings.create',
        'properties.buildings.update',
        'properties.buildings.delete',
        'properties.buildings.restore',
      ].map((id) =>
        events.on(id, () => {
          void load();
        })
      );
      return () => {
        for (const off of offs) off();
      };
    }, [load]);

    // columnas de la tabla: key + label (+ ref/refDisplay/refPath/ref2/display/values/prefix/suffix/format/iconFrom/empty*)
    const COLUMNS: {
      key: string;
      label: string;
      ref?: string;
      refDisplay?: string;
      refPath?: string;
      ref2?: string;
      display?: string;
      values?: { value: string; label?: string; icon?: string; tone?: string }[];
      tone?: string;
      prefix?: string;
      suffix?: string;
      format?: string;
      iconFrom?: string;
      emptyLabel?: string;
      emptyIcon?: string;
    }[] = [
      { key: 'name', label: 'Unidad' },
      { key: 'detail', label: 'Detalle' },
      {
        key: 'status',
        label: 'Estado',
        display: 'pill',
        values: [
          { value: 'ocupada', label: 'Ocupada', tone: 'success', icon: 'UserCheck' },
          { value: 'vacante', label: 'Vacante', tone: 'warning', icon: 'DoorOpen' },
          { value: 'en_recambio', label: 'En recambio', tone: 'neutral', icon: 'Paintbrush' },
          { value: 'con_preaviso', label: 'Con preaviso', tone: 'warning', icon: 'BellRing' },
          { value: 'no_disponible', label: 'No disponible', tone: 'outline', icon: 'Ban' },
        ],
      },
      { key: 'reference_rent', label: 'Alquiler de referencia', display: 'mono', format: 'money' },
    ];
    // el subtítulo se muda bajo el título: fuera de las columnas propias
    const SUB_COL = COLUMNS.find((c) => c.key === 'detail');
    const ITEM_COLS = COLUMNS.filter((c) => c.key !== 'detail');
    // imagen del registro: su URL sale de esta columna (puede estar oculta)
    const IMAGE_COL: (typeof COLUMNS)[number] = { key: 'photos', label: 'Fotos' };
    const cellValue = (
      row: any,
      c: { key: string; ref?: string; refDisplay?: string; refPath?: string; ref2?: string }
    ) => {
      let v = row?.[c.key];
      if (v === undefined) {
        const k = Object.keys(row ?? {}).find((x) => normKey(x) === normKey(c.key));
        v = k ? row[k] : undefined;
      }
      return v;
    };
    const mapRow =
      customHandlers.mapRow ??
      ((row: any) =>
        COLUMNS.map((c) => {
          const v = cellValue(row, c);
          return v === null || v === undefined
            ? ''
            : typeof v === 'object'
              ? JSON.stringify(v)
              : String(v);
        }));

    // orden por columna (click en el encabezado) + filtros automáticos
    const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
    // firma del UI.DataTable del host: (key, 'asc' | 'desc' | null)
    const onSortChange = useCallback((k: string, d: 'asc' | 'desc' | null) => {
      setSort(d ? { k, d: d === 'asc' ? 1 : -1 } : null);
    }, []);
    const [filters, setFilters] = useState<Record<string, string>>({});
    // filtrable = columna con pocos valores distintos (2..12) en los datos
    const filterOptions = useMemo(() => {
      const out: Record<string, string[]> = {};
      for (const c of COLUMNS) {
        const vals = [
          ...new Set(
            rows
              .map((r) => {
                const v = cellValue(r, c);
                return v === null || v === undefined ? '' : String(v);
              })
              .filter(Boolean)
          ),
        ];
        if (vals.length >= 2 && vals.length <= 12) out[c.key] = vals.sort();
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows]);
    const visibleRows = useMemo(() => {
      let out = rows;
      if (search)
        out = out.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
      for (const [k, fv] of Object.entries(filters)) {
        if (!fv) continue;
        const c = COLUMNS.find((x) => x.key === k);
        if (c)
          out = out.filter((r) => {
            const v = cellValue(r, c);
            return String(v ?? '') === fv;
          });
      }
      if (sort) {
        const c = COLUMNS.find((x) => x.key === sort.k);
        if (c)
          out = [...out].sort((ra, rb) => {
            const va = cellValue(ra, c);
            const vb = cellValue(rb, c);
            const na = Number(va);
            const nb = Number(vb);
            const cmp =
              !Number.isNaN(na) && !Number.isNaN(nb) && va !== '' && vb !== ''
                ? na - nb
                : String(va ?? '').localeCompare(String(vb ?? ''));
            return sort.d * cmp;
          });
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows, search, filters, sort]);
    // limpiar todo: búsqueda + filtros + orden (botón "Limpiar filtros" del FilterBar)
    const clearFilters = useCallback(() => {
      setSearch('');
      setFilters({});
      setSort(null);
    }, []);
    // paginación (20 por página); vuelve a la página 1 al buscar/filtrar/ordenar
    const [page, setPage] = useState(1);
    useEffect(() => {
      setPage(1);
    }, [search, filters, sort]);
    const pagedRows = useMemo(
      () => visibleRows.slice((page - 1) * 20, page * 20),
      [visibleRows, page]
    );
    const [pendingDelete, setPendingDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const removeRow = useCallback((row: any) => {
      setPendingDelete(row ?? null);
    }, []);
    const cancelDelete = useCallback(() => {
      if (!deleting) setPendingDelete(null);
    }, [deleting]);
    const confirmDelete = useCallback(async () => {
      if (!pendingDelete) return;
      setDeleting(true);
      try {
        await actions.execute('properties.buildings.delete', { id: pendingDelete.id });
        toast.success('Eliminado', 'El registro se eliminó correctamente');
        setPendingDelete(null);
        void load();
      } catch {
        toast.error('Error', 'No se pudo eliminar');
      } finally {
        setDeleting(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [pendingDelete, load]);
    return {
      sort,
      onSortChange,
      filters,
      setFilters,
      filterOptions,
      cellValue,
      clearFilters,
      page,
      setPage,
      pagedRows,
      pendingDelete,
      deleting,
      confirmDelete,
      cancelDelete,
      loading,
      search,
      setSearch,
      load,
      COLUMNS,
      mapRow,
      visibleRows,
      removeRow,
      IMAGE_COL,
      SUB_COL,
      ITEM_COLS,
    };
  };
  const t1 = useTable1();

  // ── tabla 2 — properties.buildings: estado propio en su scope (mismos nombres, sin colisión) ──
  const useTable2 = () => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
      setLoading(true);
      try {
        const ctx = {
          execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
            return actions.execute<T>(id, args);
          },
          record: viewRecord,
        };
        const byBlock = customHandlers.loadDataFor?.['tbl_expensas'];
        const data = byBlock
          ? await byBlock(ctx)
          : await actions.execute<any[]>('properties.buildings.list');
        if (mounted.current) setRows(Array.isArray(data) ? data : []);
      } catch {
        if (mounted.current) {
          setRows([]);
          toast.error('Error', 'No se pudieron cargar los datos');
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, []);
    useEffect(() => {
      void load();
    }, [load]);
    useEffect(() => {
      const offs = [
        'properties.buildings.create',
        'properties.buildings.update',
        'properties.buildings.delete',
        'properties.buildings.restore',
      ].map((id) =>
        events.on(id, () => {
          void load();
        })
      );
      return () => {
        for (const off of offs) off();
      };
    }, [load]);

    // columnas de la tabla: key + label (+ ref/refDisplay/refPath/ref2/display/values/prefix/suffix/format/iconFrom/empty*)
    const COLUMNS: {
      key: string;
      label: string;
      ref?: string;
      refDisplay?: string;
      refPath?: string;
      ref2?: string;
      display?: string;
      values?: { value: string; label?: string; icon?: string; tone?: string }[];
      tone?: string;
      prefix?: string;
      suffix?: string;
      format?: string;
      iconFrom?: string;
      emptyLabel?: string;
      emptyIcon?: string;
    }[] = [
      { key: 'period', label: 'Período' },
      { key: 'amount', label: 'Total', display: 'mono', format: 'money' },
      {
        key: 'status',
        label: 'Estado',
        display: 'pill',
        values: [
          { value: 'recibida', label: 'Recibida', tone: 'neutral', icon: 'Inbox' },
          { value: 'pagada', label: 'Pagada', tone: 'success', icon: 'CircleCheck' },
        ],
      },
    ];
    // el subtítulo se muda bajo el título: fuera de las columnas propias
    const SUB_COL = COLUMNS.find((c) => c.key === 'status');
    const ITEM_COLS = COLUMNS.filter((c) => c.key !== 'status');
    const cellValue = (
      row: any,
      c: { key: string; ref?: string; refDisplay?: string; refPath?: string; ref2?: string }
    ) => {
      let v = row?.[c.key];
      if (v === undefined) {
        const k = Object.keys(row ?? {}).find((x) => normKey(x) === normKey(c.key));
        v = k ? row[k] : undefined;
      }
      return v;
    };
    const mapRow = (row: any) =>
      COLUMNS.map((c) => {
        const v = cellValue(row, c);
        return v === null || v === undefined
          ? ''
          : typeof v === 'object'
            ? JSON.stringify(v)
            : String(v);
      });

    // orden por columna (click en el encabezado) + filtros automáticos
    const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
    // firma del UI.DataTable del host: (key, 'asc' | 'desc' | null)
    const onSortChange = useCallback((k: string, d: 'asc' | 'desc' | null) => {
      setSort(d ? { k, d: d === 'asc' ? 1 : -1 } : null);
    }, []);
    const [filters, setFilters] = useState<Record<string, string>>({});
    // filtrable = columna con pocos valores distintos (2..12) en los datos
    const filterOptions = useMemo(() => {
      const out: Record<string, string[]> = {};
      for (const c of COLUMNS) {
        const vals = [
          ...new Set(
            rows
              .map((r) => {
                const v = cellValue(r, c);
                return v === null || v === undefined ? '' : String(v);
              })
              .filter(Boolean)
          ),
        ];
        if (vals.length >= 2 && vals.length <= 12) out[c.key] = vals.sort();
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows]);
    const visibleRows = useMemo(() => {
      let out = rows;
      if (search)
        out = out.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
      for (const [k, fv] of Object.entries(filters)) {
        if (!fv) continue;
        const c = COLUMNS.find((x) => x.key === k);
        if (c)
          out = out.filter((r) => {
            const v = cellValue(r, c);
            return String(v ?? '') === fv;
          });
      }
      if (sort) {
        const c = COLUMNS.find((x) => x.key === sort.k);
        if (c)
          out = [...out].sort((ra, rb) => {
            const va = cellValue(ra, c);
            const vb = cellValue(rb, c);
            const na = Number(va);
            const nb = Number(vb);
            const cmp =
              !Number.isNaN(na) && !Number.isNaN(nb) && va !== '' && vb !== ''
                ? na - nb
                : String(va ?? '').localeCompare(String(vb ?? ''));
            return sort.d * cmp;
          });
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows, search, filters, sort]);
    // limpiar todo: búsqueda + filtros + orden (botón "Limpiar filtros" del FilterBar)
    const clearFilters = useCallback(() => {
      setSearch('');
      setFilters({});
      setSort(null);
    }, []);
    // paginación (10 por página); vuelve a la página 1 al buscar/filtrar/ordenar
    const [page, setPage] = useState(1);
    useEffect(() => {
      setPage(1);
    }, [search, filters, sort]);
    const pagedRows = useMemo(
      () => visibleRows.slice((page - 1) * 10, page * 10),
      [visibleRows, page]
    );
    const [pendingDelete, setPendingDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const removeRow = useCallback((row: any) => {
      setPendingDelete(row ?? null);
    }, []);
    const cancelDelete = useCallback(() => {
      if (!deleting) setPendingDelete(null);
    }, [deleting]);
    const confirmDelete = useCallback(async () => {
      if (!pendingDelete) return;
      setDeleting(true);
      try {
        await actions.execute('properties.buildings.delete', { id: pendingDelete.id });
        toast.success('Eliminado', 'El registro se eliminó correctamente');
        setPendingDelete(null);
        void load();
      } catch {
        toast.error('Error', 'No se pudo eliminar');
      } finally {
        setDeleting(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [pendingDelete, load]);
    return {
      sort,
      onSortChange,
      filters,
      setFilters,
      filterOptions,
      cellValue,
      clearFilters,
      page,
      setPage,
      pagedRows,
      pendingDelete,
      deleting,
      confirmDelete,
      cancelDelete,
      loading,
      search,
      setSearch,
      load,
      COLUMNS,
      mapRow,
      visibleRows,
      removeRow,
      SUB_COL,
      ITEM_COLS,
    };
  };
  const t2 = useTable2();

  // ── tabla 3 — properties.buildings: estado propio en su scope (mismos nombres, sin colisión) ──
  const useTable3 = () => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
      setLoading(true);
      try {
        const ctx = {
          execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
            return actions.execute<T>(id, args);
          },
          record: viewRecord,
        };
        const byBlock = customHandlers.loadDataFor?.['tbl_certs'];
        const data = byBlock
          ? await byBlock(ctx)
          : await actions.execute<any[]>('properties.buildings.list');
        if (mounted.current) setRows(Array.isArray(data) ? data : []);
      } catch {
        if (mounted.current) {
          setRows([]);
          toast.error('Error', 'No se pudieron cargar los datos');
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, []);
    useEffect(() => {
      void load();
    }, [load]);
    useEffect(() => {
      const offs = [
        'properties.buildings.create',
        'properties.buildings.update',
        'properties.buildings.delete',
        'properties.buildings.restore',
      ].map((id) =>
        events.on(id, () => {
          void load();
        })
      );
      return () => {
        for (const off of offs) off();
      };
    }, [load]);

    // columnas de la tabla: key + label (+ ref/refDisplay/refPath/ref2/display/values/prefix/suffix/format/iconFrom/empty*)
    const COLUMNS: {
      key: string;
      label: string;
      ref?: string;
      refDisplay?: string;
      refPath?: string;
      ref2?: string;
      display?: string;
      values?: { value: string; label?: string; icon?: string; tone?: string }[];
      tone?: string;
      prefix?: string;
      suffix?: string;
      format?: string;
      iconFrom?: string;
      emptyLabel?: string;
      emptyIcon?: string;
    }[] = [
      {
        key: 'type',
        label: 'Certificado',
        display: 'pill',
        values: [
          { value: 'matafuegos', label: 'Matafuegos', tone: 'outline', icon: 'FireExtinguisher' },
          { value: 'gas', label: 'Instalación de gas', tone: 'outline', icon: 'Flame' },
          { value: 'ascensor', label: 'Ascensor', tone: 'outline', icon: 'MoveVertical' },
          { value: 'electricidad', label: 'Instalación eléctrica', tone: 'outline', icon: 'Zap' },
          { value: 'seguro', label: 'Seguro del inmueble', tone: 'outline', icon: 'Umbrella' },
          { value: 'otro', label: 'Otro', tone: 'outline', icon: 'FileText' },
        ],
      },
      {
        key: 'status',
        label: 'Estado',
        display: 'pill',
        values: [
          { value: 'vigente', label: 'Vigente', tone: 'success' },
          { value: 'por_vencer', label: 'Por vencer', tone: 'warning' },
          { value: 'vencido', label: 'Vencido', tone: 'danger' },
        ],
      },
      { key: 'expires_at', label: 'Vence', format: 'date' },
    ];
    // el subtítulo se muda bajo el título: fuera de las columnas propias
    const SUB_COL = COLUMNS.find((c) => c.key === 'status');
    const ITEM_COLS = COLUMNS.filter((c) => c.key !== 'status');
    const cellValue = (
      row: any,
      c: { key: string; ref?: string; refDisplay?: string; refPath?: string; ref2?: string }
    ) => {
      let v = row?.[c.key];
      if (v === undefined) {
        const k = Object.keys(row ?? {}).find((x) => normKey(x) === normKey(c.key));
        v = k ? row[k] : undefined;
      }
      return v;
    };
    const mapRow = (row: any) =>
      COLUMNS.map((c) => {
        const v = cellValue(row, c);
        return v === null || v === undefined
          ? ''
          : typeof v === 'object'
            ? JSON.stringify(v)
            : String(v);
      });

    // orden por columna (click en el encabezado) + filtros automáticos
    const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
    // firma del UI.DataTable del host: (key, 'asc' | 'desc' | null)
    const onSortChange = useCallback((k: string, d: 'asc' | 'desc' | null) => {
      setSort(d ? { k, d: d === 'asc' ? 1 : -1 } : null);
    }, []);
    const [filters, setFilters] = useState<Record<string, string>>({});
    // filtrable = columna con pocos valores distintos (2..12) en los datos
    const filterOptions = useMemo(() => {
      const out: Record<string, string[]> = {};
      for (const c of COLUMNS) {
        const vals = [
          ...new Set(
            rows
              .map((r) => {
                const v = cellValue(r, c);
                return v === null || v === undefined ? '' : String(v);
              })
              .filter(Boolean)
          ),
        ];
        if (vals.length >= 2 && vals.length <= 12) out[c.key] = vals.sort();
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows]);
    const visibleRows = useMemo(() => {
      let out = rows;
      if (search)
        out = out.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
      for (const [k, fv] of Object.entries(filters)) {
        if (!fv) continue;
        const c = COLUMNS.find((x) => x.key === k);
        if (c)
          out = out.filter((r) => {
            const v = cellValue(r, c);
            return String(v ?? '') === fv;
          });
      }
      if (sort) {
        const c = COLUMNS.find((x) => x.key === sort.k);
        if (c)
          out = [...out].sort((ra, rb) => {
            const va = cellValue(ra, c);
            const vb = cellValue(rb, c);
            const na = Number(va);
            const nb = Number(vb);
            const cmp =
              !Number.isNaN(na) && !Number.isNaN(nb) && va !== '' && vb !== ''
                ? na - nb
                : String(va ?? '').localeCompare(String(vb ?? ''));
            return sort.d * cmp;
          });
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows, search, filters, sort]);
    // limpiar todo: búsqueda + filtros + orden (botón "Limpiar filtros" del FilterBar)
    const clearFilters = useCallback(() => {
      setSearch('');
      setFilters({});
      setSort(null);
    }, []);
    // paginación (10 por página); vuelve a la página 1 al buscar/filtrar/ordenar
    const [page, setPage] = useState(1);
    useEffect(() => {
      setPage(1);
    }, [search, filters, sort]);
    const pagedRows = useMemo(
      () => visibleRows.slice((page - 1) * 10, page * 10),
      [visibleRows, page]
    );
    const [pendingDelete, setPendingDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const removeRow = useCallback((row: any) => {
      setPendingDelete(row ?? null);
    }, []);
    const cancelDelete = useCallback(() => {
      if (!deleting) setPendingDelete(null);
    }, [deleting]);
    const confirmDelete = useCallback(async () => {
      if (!pendingDelete) return;
      setDeleting(true);
      try {
        await actions.execute('properties.buildings.delete', { id: pendingDelete.id });
        toast.success('Eliminado', 'El registro se eliminó correctamente');
        setPendingDelete(null);
        void load();
      } catch {
        toast.error('Error', 'No se pudo eliminar');
      } finally {
        setDeleting(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [pendingDelete, load]);
    return {
      sort,
      onSortChange,
      filters,
      setFilters,
      filterOptions,
      cellValue,
      clearFilters,
      page,
      setPage,
      pagedRows,
      pendingDelete,
      deleting,
      confirmDelete,
      cancelDelete,
      loading,
      search,
      setSearch,
      load,
      COLUMNS,
      mapRow,
      visibleRows,
      removeRow,
      SUB_COL,
      ITEM_COLS,
    };
  };
  const t3 = useTable3();

  // ── tabla 4 — properties.buildings: estado propio en su scope (mismos nombres, sin colisión) ──
  const useTable4 = () => {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const load = useCallback(async () => {
      setLoading(true);
      try {
        const ctx = {
          execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
            return actions.execute<T>(id, args);
          },
          record: viewRecord,
        };
        const byBlock = customHandlers.loadDataFor?.['tbl_ot'];
        const data = byBlock
          ? await byBlock(ctx)
          : await actions.execute<any[]>('properties.buildings.list');
        if (mounted.current) setRows(Array.isArray(data) ? data : []);
      } catch {
        if (mounted.current) {
          setRows([]);
          toast.error('Error', 'No se pudieron cargar los datos');
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, []);
    useEffect(() => {
      void load();
    }, [load]);
    useEffect(() => {
      const offs = [
        'properties.buildings.create',
        'properties.buildings.update',
        'properties.buildings.delete',
        'properties.buildings.restore',
      ].map((id) =>
        events.on(id, () => {
          void load();
        })
      );
      return () => {
        for (const off of offs) off();
      };
    }, [load]);

    // columnas de la tabla: key + label (+ ref/refDisplay/refPath/ref2/display/values/prefix/suffix/format/iconFrom/empty*)
    const COLUMNS: {
      key: string;
      label: string;
      ref?: string;
      refDisplay?: string;
      refPath?: string;
      ref2?: string;
      display?: string;
      values?: { value: string; label?: string; icon?: string; tone?: string }[];
      tone?: string;
      prefix?: string;
      suffix?: string;
      format?: string;
      iconFrom?: string;
      emptyLabel?: string;
      emptyIcon?: string;
    }[] = [
      { key: 'title', label: 'Trabajo' },
      { key: 'unit', label: 'Unidad' },
      {
        key: 'priority',
        label: 'Prioridad',
        display: 'pill',
        values: [
          { value: 'urgente', label: 'Urgente', tone: 'danger' },
          { value: 'alta', label: 'Alta', tone: 'warning' },
          { value: 'normal', label: 'Normal', tone: 'outline' },
          { value: 'baja', label: 'Baja', tone: 'neutral' },
        ],
      },
    ];
    // el subtítulo se muda bajo el título: fuera de las columnas propias
    const SUB_COL = COLUMNS.find((c) => c.key === 'unit');
    const ITEM_COLS = COLUMNS.filter((c) => c.key !== 'unit');
    const cellValue = (
      row: any,
      c: { key: string; ref?: string; refDisplay?: string; refPath?: string; ref2?: string }
    ) => {
      let v = row?.[c.key];
      if (v === undefined) {
        const k = Object.keys(row ?? {}).find((x) => normKey(x) === normKey(c.key));
        v = k ? row[k] : undefined;
      }
      return v;
    };
    const mapRow = (row: any) =>
      COLUMNS.map((c) => {
        const v = cellValue(row, c);
        return v === null || v === undefined
          ? ''
          : typeof v === 'object'
            ? JSON.stringify(v)
            : String(v);
      });

    // orden por columna (click en el encabezado) + filtros automáticos
    const [sort, setSort] = useState<{ k: string; d: 1 | -1 } | null>(null);
    // firma del UI.DataTable del host: (key, 'asc' | 'desc' | null)
    const onSortChange = useCallback((k: string, d: 'asc' | 'desc' | null) => {
      setSort(d ? { k, d: d === 'asc' ? 1 : -1 } : null);
    }, []);
    const [filters, setFilters] = useState<Record<string, string>>({});
    // filtrable = columna con pocos valores distintos (2..12) en los datos
    const filterOptions = useMemo(() => {
      const out: Record<string, string[]> = {};
      for (const c of COLUMNS) {
        const vals = [
          ...new Set(
            rows
              .map((r) => {
                const v = cellValue(r, c);
                return v === null || v === undefined ? '' : String(v);
              })
              .filter(Boolean)
          ),
        ];
        if (vals.length >= 2 && vals.length <= 12) out[c.key] = vals.sort();
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows]);
    const visibleRows = useMemo(() => {
      let out = rows;
      if (search)
        out = out.filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
      for (const [k, fv] of Object.entries(filters)) {
        if (!fv) continue;
        const c = COLUMNS.find((x) => x.key === k);
        if (c)
          out = out.filter((r) => {
            const v = cellValue(r, c);
            return String(v ?? '') === fv;
          });
      }
      if (sort) {
        const c = COLUMNS.find((x) => x.key === sort.k);
        if (c)
          out = [...out].sort((ra, rb) => {
            const va = cellValue(ra, c);
            const vb = cellValue(rb, c);
            const na = Number(va);
            const nb = Number(vb);
            const cmp =
              !Number.isNaN(na) && !Number.isNaN(nb) && va !== '' && vb !== ''
                ? na - nb
                : String(va ?? '').localeCompare(String(vb ?? ''));
            return sort.d * cmp;
          });
      }
      return out;
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [rows, search, filters, sort]);
    // limpiar todo: búsqueda + filtros + orden (botón "Limpiar filtros" del FilterBar)
    const clearFilters = useCallback(() => {
      setSearch('');
      setFilters({});
      setSort(null);
    }, []);
    // paginación (10 por página); vuelve a la página 1 al buscar/filtrar/ordenar
    const [page, setPage] = useState(1);
    useEffect(() => {
      setPage(1);
    }, [search, filters, sort]);
    const pagedRows = useMemo(
      () => visibleRows.slice((page - 1) * 10, page * 10),
      [visibleRows, page]
    );
    const [pendingDelete, setPendingDelete] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const removeRow = useCallback((row: any) => {
      setPendingDelete(row ?? null);
    }, []);
    const cancelDelete = useCallback(() => {
      if (!deleting) setPendingDelete(null);
    }, [deleting]);
    const confirmDelete = useCallback(async () => {
      if (!pendingDelete) return;
      setDeleting(true);
      try {
        await actions.execute('properties.buildings.delete', { id: pendingDelete.id });
        toast.success('Eliminado', 'El registro se eliminó correctamente');
        setPendingDelete(null);
        void load();
      } catch {
        toast.error('Error', 'No se pudo eliminar');
      } finally {
        setDeleting(false);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    }, [pendingDelete, load]);
    return {
      sort,
      onSortChange,
      filters,
      setFilters,
      filterOptions,
      cellValue,
      clearFilters,
      page,
      setPage,
      pagedRows,
      pendingDelete,
      deleting,
      confirmDelete,
      cancelDelete,
      loading,
      search,
      setSearch,
      load,
      COLUMNS,
      mapRow,
      visibleRows,
      removeRow,
      SUB_COL,
      ITEM_COLS,
    };
  };
  const t4 = useTable4();

  return { metric, reloadMetrics, t1, t2, t3, t4 };
}

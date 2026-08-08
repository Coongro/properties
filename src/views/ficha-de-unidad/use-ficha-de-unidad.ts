/**
 * Ficha de unidad — datos y estado (generado por el Builder de Vistas).
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

export function useFichaDeUnidadView() {
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

  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    run: () => void;
  } | null>(null);
  const askConfirm = useCallback(
    (title: string, message: string, confirmLabel: string, run: () => void) => {
      setPendingConfirm({ title, message, confirmLabel, run });
    },
    []
  );
  const cancelConfirm = useCallback(() => {
    setPendingConfirm(null);
  }, []);
  const runConfirmed = useCallback(() => {
    const pend = pendingConfirm;
    setPendingConfirm(null);
    pend?.run();
  }, [pendingConfirm]);

  const normKey = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '');

  // ── tabla 1 — properties.units: estado propio en su scope (mismos nombres, sin colisión) ──
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
        const byBlock = customHandlers.loadDataFor?.['tbl_titulares'];
        const data = byBlock
          ? await byBlock(ctx)
          : customHandlers.loadData
            ? await customHandlers.loadData(ctx)
            : await actions.execute<any[]>('properties.units.list');
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
        'properties.unitOwners.create',
        'properties.unitOwners.update',
        'properties.unitOwners.delete',
        'properties.unitOwners.restore',
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
      { key: 'name', label: 'Titular' },
      { key: 'document', label: 'Documento', emptyLabel: 'Sin documento' },
      { key: 'share_label', label: 'Participación' },
      {
        key: 'role',
        label: 'Carácter',
        display: 'pill',
        values: [
          { value: 'titular', label: 'Titular', tone: 'neutral', icon: 'UserCheck' },
          { value: 'cotitular', label: 'Cotitular', tone: 'neutral', icon: 'Users' },
          { value: 'usufructuario', label: 'Usufructuario', tone: 'success', icon: 'HandCoins' },
          {
            value: 'nudo_propietario',
            label: 'Nudo propietario',
            tone: 'neutral',
            icon: 'KeyRound',
          },
        ],
      },
    ];
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
    const removeRow = useCallback((_row: any) => {
      toast.warning(
        'Acción sin declarar',
        'Las filas de esta tabla son de otra entidad: declarale sus acciones en el Builder o implementá onAction en handlers.ts'
      );
    }, []);
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
      loading,
      search,
      setSearch,
      load,
      COLUMNS,
      mapRow,
      visibleRows,
      removeRow,
    };
  };
  const t1 = useTable1();

  // ── tabla 2 — properties.units: estado propio en su scope (mismos nombres, sin colisión) ──
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
        const byBlock = customHandlers.loadDataFor?.['tbl_certificados'];
        const data = byBlock
          ? await byBlock(ctx)
          : await actions.execute<any[]>('properties.units.list');
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
        'properties.certificates.create',
        'properties.certificates.update',
        'properties.certificates.delete',
        'properties.certificates.restore',
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
        key: 'scope',
        label: 'Alcance',
        display: 'pill',
        values: [
          { value: 'unidad', label: 'De la unidad', tone: 'neutral', icon: 'DoorOpen' },
          { value: 'edificio', label: 'Del edificio', tone: 'outline', icon: 'Building2' },
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
    const removeRow = useCallback((_row: any) => {
      toast.warning(
        'Acción sin declarar',
        'Las filas de esta tabla son de otra entidad: declarale sus acciones en el Builder o implementá onAction en handlers.ts'
      );
    }, []);
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

  const reloadTables = useCallback(() => {
    void t1.load();
    void t2.load();
  }, [t1, t2]);

  // args opcionales: las acciones de fila pasan { id } del registro, y
  // `record` la fila entera para el handler (el id solo no alcanza
  // cuando la acción necesita el monto o el estado de esa fila).
  const runServerAction = useCallback(
    async (id: string, args?: unknown, record?: Record<string, any>) => {
      try {
        if (customHandlers.onAction) {
          await customHandlers.onAction(id, {
            execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
              return actions.execute<T>(id, args);
            },
            toast,
            record,
            reload: () => {
              void reloadTables();
              reloadMetrics();
            },
          });
        } else {
          await actions.execute(id, args);
        }
        if (!customHandlers.onAction) toast.success('Listo', id);
        void t1.load();
        void t2.load();
      } catch (err) {
        toast.error('Error', err instanceof Error ? err.message : 'Falló ' + id);
      }
      // deps intencionalmente fijas: el efecto corre una sola vez
    },
    []
  );

  return {
    metric,
    reloadMetrics,
    pendingConfirm,
    askConfirm,
    cancelConfirm,
    runConfirmed,
    t1,
    t2,
    reloadTables,
    runServerAction,
  };
}

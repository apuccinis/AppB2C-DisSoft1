import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrders } from '../services/orderService.js';
import { getErrorMessage } from '../services/api.js';
import { formatAssetAmount, formatDateTime, formatPrice } from '../utils/format.js';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { LoadingState } from '../components/Spinner.jsx';

const TYPE_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'BUY', label: 'Compras' },
  { value: 'SELL', label: 'Ventas' },
];

const ASSET_FILTERS = ['', 'USD', 'EUR', 'BTC', 'ETH'];

const TypeChip = ({ type }) => (
  <span className={`chip ${type === 'BUY' ? 'bg-bull/15 text-bull' : 'bg-bear/15 text-bear'}`}>
    {type}
  </span>
);

const StatusChip = ({ status }) => (
  <span className="chip bg-base-500 text-slate-300">
    <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-bull" />
    {status === 'COMPLETED' ? 'Completed' : status}
  </span>
);

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [assetFilter, setAssetFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // El filtrado lo resuelve el backend (solo devuelve ordenes del usuario autenticado).
      const data = await fetchOrders({ type: typeFilter, asset: assetFilter });
      setOrders(data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido cargar el historial'));
    } finally {
      setLoading(false);
    }
  }, [typeFilter, assetFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters = Boolean(typeFilter || assetFilter);

  const summary = useMemo(() => {
    const buys = orders.filter((order) => order.type === 'BUY').length;
    return { total: orders.length, buys, sells: orders.length - buys };
  }, [orders]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Historial de órdenes</h1>
        <p className="text-sm text-slate-400">
          {summary.total} {summary.total === 1 ? 'operación' : 'operaciones'} · {summary.buys}{' '}
          {summary.buys === 1 ? 'compra' : 'compras'} · {summary.sells}{' '}
          {summary.sells === 1 ? 'venta' : 'ventas'}
        </p>
      </header>

      <section className="card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Tipo</span>
            <div className="flex rounded-lg border border-white/10 bg-base-800 p-1">
              {TYPE_FILTERS.map((filter) => (
                <button
                  key={filter.value || 'all'}
                  type="button"
                  onClick={() => setTypeFilter(filter.value)}
                  aria-pressed={typeFilter === filter.value}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    typeFilter === filter.value
                      ? 'bg-accent text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="assetFilter"
              className="text-xs font-medium uppercase tracking-wide text-slate-500"
            >
              Activo
            </label>
            <select
              id="assetFilter"
              value={assetFilter}
              onChange={(event) => setAssetFilter(event.target.value)}
              className="input w-32 cursor-pointer py-2"
            >
              {ASSET_FILTERS.map((asset) => (
                <option key={asset || 'all'} value={asset} className="bg-base-700">
                  {asset || 'Todos'}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('');
                  setAssetFilter('');
                }}
                className="text-xs font-semibold text-slate-400 transition hover:text-slate-200"
              >
                Limpiar filtros
              </button>
            ) : null}
            <button type="button" onClick={load} className="btn-ghost px-3 py-1.5 text-xs">
              Actualizar
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <Alert variant="error" title="Error al cargar el historial">
          <div className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <button type="button" onClick={load} className="btn-ghost px-3 py-1.5 text-xs">
              Reintentar
            </button>
          </div>
        </Alert>
      ) : null}

      <section className="card overflow-hidden">
        {loading ? (
          <LoadingState label="Cargando órdenes…" />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={hasFilters ? '🔍' : '📄'}
            title={hasFilters ? 'Sin resultados' : 'Todavía no has operado'}
            description={
              hasFilters
                ? 'Ninguna orden coincide con los filtros seleccionados.'
                : 'Cuando ejecutes tu primera compra o venta aparecerá aquí.'
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('');
                    setAssetFilter('');
                  }}
                  className="btn-ghost"
                >
                  Quitar filtros
                </button>
              ) : (
                <Link to="/trade" className="btn-primary">
                  Ir a Trade
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Par</th>
                  <th className="px-4 py-3 font-medium">Vendido</th>
                  <th className="px-4 py-3 font-medium">Comprado</th>
                  <th className="px-4 py-3 text-right font-medium">Cantidad</th>
                  <th className="px-4 py-3 text-right font-medium">Precio</th>
                  <th className="px-4 py-3 text-right font-medium">Comisión</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => {
                  const buy = order.type === 'BUY';
                  const soldAsset = buy ? order.quoteAsset : order.baseAsset;
                  const boughtAsset = buy ? order.baseAsset : order.quoteAsset;
                  return (
                    <tr key={order.id} className="transition hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <TypeChip type={order.type} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">
                        {order.pair}
                      </td>
                      <td className="px-4 py-3 text-bear">{soldAsset}</td>
                      <td className="px-4 py-3 text-bull">{boughtAsset}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-100">
                        {formatAssetAmount(order.amount, order.baseAsset)}{' '}
                        <span className="text-slate-500">{order.baseAsset}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-300">
                        {formatPrice(order.price, order.quoteAsset)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-amber-300">
                        {formatAssetAmount(order.fee, order.quoteAsset)}{' '}
                        <span className="text-slate-500">{order.quoteAsset}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-100">
                        {formatAssetAmount(order.total, order.quoteAsset)}{' '}
                        <span className="text-slate-500">{order.quoteAsset}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={order.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {orders.length > 0 ? (
        <p className="text-xs text-slate-500">
          «Total» es el importe en el activo de cotización que entra o sale de tu wallet: en una
          compra incluye la comisión, en una venta ya la tiene descontada.
        </p>
      ) : null}
    </div>
  );
};

export default Orders;

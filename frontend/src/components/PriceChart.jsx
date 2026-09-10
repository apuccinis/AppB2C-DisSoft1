import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchHistory } from '../services/marketService.js';
import { getErrorMessage } from '../services/api.js';
import { useMarket } from '../hooks/useMarket.jsx';
import { LoadingState } from './Spinner.jsx';
import Alert from './Alert.jsx';
import ChangeBadge from './ChangeBadge.jsx';
import { formatNumber, formatTimeLabel } from '../utils/format.js';

const RANGES = ['1H', '24H', '7D'];

const ChartTooltip = ({ active, payload, label, range }) => {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-lg border border-white/10 bg-base-800/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="text-slate-400">{formatTimeLabel(label, range)}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-white">
        ${formatNumber(value, value < 10 ? 4 : 2)}
      </p>
    </div>
  );
};

/**
 * Grafico reutilizable de precios. El historico lo genera el backend y el
 * ultimo punto se refresca con el precio vigente del contexto de mercado.
 */
export const PriceChart = ({
  assets = ['BTC', 'ETH', 'EUR'],
  defaultAsset = 'BTC',
  className = '',
}) => {
  const { priceMap } = useMarket();
  const [asset, setAsset] = useState(defaultAsset);
  const [range, setRange] = useState('24H');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchHistory(asset, range)
      .then((data) => {
        if (active) setPoints(data.points || []);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'No se ha podido cargar el histórico'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [asset, range]);

  const livePrice = priceMap[asset]?.usdPrice;

  const data = useMemo(() => {
    if (points.length === 0) return [];
    if (!livePrice) return points;
    // Sustituye el ultimo punto por el precio en vivo para que el grafico se mueva.
    const copy = points.slice(0, -1);
    copy.push({ ...points[points.length - 1], price: livePrice });
    return copy;
  }, [points, livePrice]);

  const domain = useMemo(() => {
    if (data.length === 0) return ['auto', 'auto'];
    const values = data.map((point) => point.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min || max * 0.01) * 0.15;
    return [min - padding, max + padding];
  }, [data]);

  const trend = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0].price;
    const last = data[data.length - 1].price;
    return first ? ((last - first) / first) * 100 : 0;
  }, [data]);

  const positive = trend >= 0;
  const strokeColor = positive ? '#10B981' : '#F43F5E';
  const gradientId = `price-gradient-${asset}`;

  return (
    <section className={`card p-5 ${className}`}>
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              {asset}/USD
            </h2>
            <ChangeBadge value={Number(trend.toFixed(2))} />
          </div>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight text-white">
            {livePrice ? `$${formatNumber(livePrice, livePrice < 10 ? 4 : 2)}` : '—'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-white/10 bg-base-800 p-1">
            {assets.map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => setAsset(symbol)}
                aria-pressed={asset === symbol}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  asset === symbol
                    ? 'bg-accent text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-white/10 bg-base-800 p-1">
            {RANGES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                aria-pressed={range === option}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
                  range === option
                    ? 'bg-base-500 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </header>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {loading && data.length === 0 ? (
        <LoadingState label="Cargando histórico…" className="h-[260px]" />
      ) : null}

      {!loading && data.length === 0 && !error ? (
        <div className="flex h-[260px] items-center justify-center text-sm text-slate-500">
          Sin datos para este rango.
        </div>
      ) : null}

      {data.length > 0 ? (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(value) => formatTimeLabel(value, range)}
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={domain}
                stroke="#64748B"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(value) => `$${formatNumber(value, value < 10 ? 3 : 0)}`}
              />
              <Tooltip content={<ChartTooltip range={range} />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
};

export default PriceChart;

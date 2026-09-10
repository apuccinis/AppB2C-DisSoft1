import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMarket } from '../hooks/useMarket.jsx';
import { usePortfolio } from '../hooks/usePortfolio.jsx';
import { createOrder } from '../services/orderService.js';
import { getErrorMessage } from '../services/api.js';
import { buildTradePreview, resolvePair } from '../utils/trade.js';
import { formatAssetAmount, formatNumber, formatPrice, formatUsd } from '../utils/format.js';
import PriceChart from '../components/PriceChart.jsx';
import AssetBadge from '../components/AssetBadge.jsx';
import Alert from '../components/Alert.jsx';
import Spinner from '../components/Spinner.jsx';

const ASSETS = ['USD', 'EUR', 'BTC', 'ETH'];
const PERCENTAGES = [25, 50, 75, 100];

const AssetSelect = ({ id, label, value, onChange, exclude }) => (
  <div className="flex-1">
    <label className="label" htmlFor={id}>
      {label}
    </label>
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-base-800 px-3 py-2">
      <AssetBadge asset={value} size="sm" />
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full cursor-pointer border-0 bg-transparent py-1 text-sm font-semibold text-slate-100 outline-none"
      >
        {ASSETS.map((asset) => (
          <option key={asset} value={asset} disabled={asset === exclude} className="bg-base-700">
            {asset}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SummaryRow = ({ label, value, tone = '' }) => (
  <div className="flex items-baseline justify-between gap-4 py-2 text-sm">
    <span className="text-slate-400">{label}</span>
    <span className={`font-mono text-right ${tone || 'text-slate-200'}`}>{value}</span>
  </div>
);

export const Trade = () => {
  const { getPairPrice, feeRate, loading: pricesLoading, error: marketError } = useMarket();
  const { balanceOf, applyPortfolio, refresh, wallets } = usePortfolio();
  const [searchParams, setSearchParams] = useSearchParams();

  const [fromAsset, setFromAsset] = useState(() => searchParams.get('from')?.toUpperCase() || 'USD');
  const [toAsset, setToAsset] = useState(() => searchParams.get('to')?.toUpperCase() || 'BTC');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Nunca permitir el mismo activo en ambos lados.
  useEffect(() => {
    if (fromAsset === toAsset) {
      setToAsset(ASSETS.find((asset) => asset !== fromAsset));
    }
  }, [fromAsset, toAsset]);

  // Mantiene la URL sincronizada para poder compartir/volver al mismo par.
  useEffect(() => {
    setSearchParams({ from: fromAsset, to: toAsset }, { replace: true });
  }, [fromAsset, toAsset, setSearchParams]);

  // Acepta tanto "0.5" como "0,5" (el separador decimal cambia segun el teclado/locale).
  const numericAmount = Number(String(amount).replace(',', '.'));
  const balance = balanceOf(fromAsset);
  const effectiveFeeRate = feeRate ?? 0.005;

  // El par y el tipo de operación se conocen antes de introducir la cantidad.
  const pair = useMemo(() => resolvePair(fromAsset, toAsset), [fromAsset, toAsset]);
  const tradeType = fromAsset === pair.quote ? 'BUY' : 'SELL';

  // El precio del par se deriva de los precios en USD que publica el backend.
  const pairPrice = useMemo(
    () => getPairPrice(pair.base, pair.quote),
    [pair, getPairPrice],
  );

  const preview = useMemo(
    () =>
      buildTradePreview({
        fromAsset,
        toAsset,
        amount: numericAmount,
        price: pairPrice,
        feeRate: effectiveFeeRate,
      }),
    [fromAsset, toAsset, numericAmount, pairPrice, effectiveFeeRate],
  );

  const insufficient =
    Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount > balance + 1e-9;

  const canSubmit =
    !submitting && !pricesLoading && preview?.valid && !insufficient && numericAmount > 0;

  const swap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    setAmount('');
    setResult(null);
    setError(null);
  };

  const applyPercentage = (percentage) => {
    if (!balance) return;
    const decimals = fromAsset === 'USD' || fromAsset === 'EUR' ? 2 : 8;
    const value = (balance * percentage) / 100;
    setAmount(String(Number(value.toFixed(decimals))));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Introduce una cantidad mayor que cero.');
      return;
    }
    if (insufficient) {
      setError(`Saldo insuficiente: solo tienes ${formatAssetAmount(balance, fromAsset)} ${fromAsset}.`);
      return;
    }

    setSubmitting(true);
    try {
      // El backend recalcula precio, comision y saldo antes de ejecutar.
      const data = await createOrder({ fromAsset, toAsset, amount: numericAmount });
      setResult(data);
      applyPortfolio(data.portfolio);
      setAmount('');
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido ejecutar la operación'));
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const typeTone = tradeType === 'SELL' ? 'bg-bear/15 text-bear' : 'bg-bull/15 text-bull';

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Trade</h1>
        <p className="mt-1 text-sm text-slate-400">
          Intercambia divisas y criptomonedas a precio de mercado simulado.
        </p>
      </header>

      {marketError ? (
        <Alert variant="warning" title="Precios no disponibles">
          {marketError}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-5">
        <section className="card p-5 xl:col-span-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Nueva operación
              </h2>
              <span className={`chip ${typeTone}`}>
                {tradeType} · {pair.base}/{pair.quote}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-3">
                <AssetSelect
                  id="fromAsset"
                  label="Vendes"
                  value={fromAsset}
                  onChange={setFromAsset}
                  exclude={toAsset}
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Invertir activos"
                  className="rounded-full border border-white/10 bg-base-600 p-2 text-slate-300 transition hover:bg-base-500 hover:text-white"
                >
                  ⇅
                </button>
              </div>

              <div className="flex items-end gap-3">
                <AssetSelect
                  id="toAsset"
                  label="Recibes"
                  value={toAsset}
                  onChange={setToAsset}
                  exclude={fromAsset}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="label mb-0">Cantidad</span>
                <span className="text-xs text-slate-500">
                  Disponible:{' '}
                  <span className="font-mono text-slate-300">
                    {formatAssetAmount(balance, fromAsset)} {fromAsset}
                  </span>
                </span>
              </div>
              <div className="relative">
                <input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  className={`input pr-16 font-mono text-lg ${
                    insufficient ? 'border-bear/60 focus:border-bear focus:ring-bear/25' : ''
                  }`}
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled={submitting}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {fromAsset}
                </span>
              </div>

              <div className="mt-2 flex gap-2">
                {PERCENTAGES.map((percentage) => (
                  <button
                    key={percentage}
                    type="button"
                    onClick={() => applyPercentage(percentage)}
                    disabled={!balance || submitting}
                    className="flex-1 rounded-md border border-white/10 bg-base-800 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-base-600 hover:text-slate-100 disabled:opacity-40"
                  >
                    {percentage === 100 ? 'MAX' : `${percentage}%`}
                  </button>
                ))}
              </div>

              {insufficient ? (
                <p className="mt-2 text-xs font-medium text-bear">
                  Saldo insuficiente en {fromAsset}.
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-white/5 bg-base-800 p-4">
              {preview ? (
                <>
                  <SummaryRow
                    label="Par"
                    value={`${preview.pair} · ${formatPrice(preview.price, preview.quoteAsset)}`}
                  />
                  <SummaryRow
                    label={`Comisión (${(effectiveFeeRate * 100).toFixed(2)}%)`}
                    value={`${formatAssetAmount(preview.fee, preview.feeAsset)} ${preview.feeAsset}`}
                    tone="text-amber-300"
                  />
                  <SummaryRow
                    label="Subtotal"
                    value={`${formatAssetAmount(preview.subtotal, preview.quoteAsset)} ${preview.quoteAsset}`}
                  />
                  <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-white/5 pt-3">
                    <span className="text-sm text-slate-400">Recibes</span>
                    <span className="font-mono text-lg font-semibold text-white">
                      {formatAssetAmount(preview.receiveAmount, toAsset)}{' '}
                      <span className="text-sm text-slate-400">{toAsset}</span>
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Estimación con el precio actual. El backend recalcula el importe definitivo al
                    ejecutar la orden.
                  </p>
                </>
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">
                  {pricesLoading
                    ? 'Cargando precios de mercado…'
                    : 'Introduce una cantidad para ver el resumen.'}
                </p>
              )}
            </div>

            {error ? (
              <Alert variant="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            ) : null}

            <button type="submit" className="btn-primary" disabled={!canSubmit}>
              {submitting ? <Spinner className="h-4 w-4" /> : null}
              {submitting ? 'Ejecutando…' : `${tradeType === 'SELL' ? 'Vender' : 'Comprar'} ${pair.base}`}
            </button>
          </form>
        </section>

        <div className="flex flex-col gap-6 xl:col-span-3">
          {result ? (
            <Alert variant="success" title="Operación completada" onClose={() => setResult(null)}>
              <div className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <p>
                  Orden <span className="font-mono">#{result.order.id}</span> · {result.order.type}{' '}
                  {result.order.pair}
                </p>
                <p>
                  Ejecutado a{' '}
                  <span className="font-mono">
                    {formatPrice(result.order.price, result.order.quoteAsset)}
                  </span>
                </p>
                <p>
                  Recibido:{' '}
                  <span className="font-mono text-emerald-200">
                    {formatAssetAmount(result.execution.receiveAmount, result.execution.toAsset)}{' '}
                    {result.execution.toAsset}
                  </span>
                </p>
                <p>
                  Comisión:{' '}
                  <span className="font-mono">
                    {formatAssetAmount(result.order.fee, result.order.quoteAsset)}{' '}
                    {result.order.quoteAsset}
                  </span>
                </p>
              </div>
              <p className="mt-3">
                <Link to="/orders" className="font-semibold text-emerald-200 hover:underline">
                  Ver historial de órdenes →
                </Link>
              </p>
            </Alert>
          ) : null}

          <section className="card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Tus saldos
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {wallets.map((wallet) => (
                <li
                  key={wallet.asset}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-base-800 px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <AssetBadge asset={wallet.asset} size="sm" />
                    {wallet.asset}
                  </span>
                  <span className="text-right">
                    <span className="block font-mono text-sm text-slate-100">
                      {formatAssetAmount(wallet.balance, wallet.asset)}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {formatUsd(wallet.usdValue)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Comisión aplicada por el backend:{' '}
              <span className="font-mono text-slate-300">
                {formatNumber(effectiveFeeRate * 100, 2)}%
              </span>{' '}
              (TRADING_FEE_RATE)
            </p>
          </section>

          <PriceChart defaultAsset={toAsset === 'USD' ? fromAsset : toAsset} />
        </div>
      </div>
    </div>
  );
};

export default Trade;

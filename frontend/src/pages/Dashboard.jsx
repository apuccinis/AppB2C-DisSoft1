import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { usePortfolio } from '../hooks/usePortfolio.jsx';
import { useMarket } from '../hooks/useMarket.jsx';
import WalletCard from '../components/WalletCard.jsx';
import PriceChart from '../components/PriceChart.jsx';
import ChangeBadge from '../components/ChangeBadge.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { LoadingState } from '../components/Spinner.jsx';
import { formatUsd } from '../utils/format.js';

const WalletSkeleton = () => (
  <div className="card animate-pulse p-5">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-base-500" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-12 rounded bg-base-500" />
        <div className="h-2.5 w-20 rounded bg-base-600" />
      </div>
    </div>
    <div className="mt-5 h-7 w-32 rounded bg-base-500" />
    <div className="mt-2 h-3 w-20 rounded bg-base-600" />
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const { wallets, totalUsd, loading, error, refresh } = usePortfolio();
  const { prices, error: marketError } = useMarket();
  const navigate = useNavigate();

  // Variacion ponderada del portfolio: media de las variaciones por peso en USD.
  const portfolioChange = useMemo(() => {
    if (totalUsd <= 0) return 0;
    return wallets.reduce(
      (sum, wallet) => sum + (wallet.change24h || 0) * (wallet.usdValue / totalUsd),
      0,
    );
  }, [wallets, totalUsd]);

  const funded = wallets.filter((wallet) => wallet.balance > 0);
  const topMovers = [...prices]
    .filter((price) => price.asset !== 'USD')
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));

  const goToTrade = (asset) => navigate(`/trade?from=${asset}`);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-slate-400">Hola, {user?.name?.split(' ')[0] || 'trader'} 👋</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
      </header>

      {error ? (
        <Alert variant="error" title="Error al cargar el portfolio">
          <div className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <button type="button" onClick={refresh} className="btn-ghost px-3 py-1.5 text-xs">
              Reintentar
            </button>
          </div>
        </Alert>
      ) : null}

      {marketError && !error ? (
        <Alert variant="warning" title="Precios no disponibles">
          {marketError}
        </Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-6 lg:col-span-1">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
          />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total balance</p>
          {loading ? (
            <div className="mt-3 h-9 w-40 animate-pulse rounded bg-base-500" />
          ) : (
            <p className="mt-2 font-mono text-4xl font-semibold tracking-tight text-white">
              {formatUsd(totalUsd)}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <ChangeBadge value={Number(portfolioChange.toFixed(2))} />
            <span className="text-xs text-slate-500">24h · valorado en USD</span>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            {funded.length} de {wallets.length} wallets con saldo
          </p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Mercado (simulado)
          </h2>
          <ul className="mt-4 divide-y divide-white/5">
            {topMovers.length === 0 ? (
              <li className="py-6 text-sm text-slate-500">Cargando precios…</li>
            ) : null}
            {topMovers.map((price) => (
              <li key={price.asset} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{price.asset}/USD</p>
                  <p className="text-xs text-slate-500">{price.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-slate-200">
                    {formatUsd(price.usdPrice, price.usdPrice < 10 ? 4 : 2)}
                  </span>
                  <ChangeBadge value={price.change24h} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <PriceChart />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Wallets</h2>
          <button
            type="button"
            onClick={refresh}
            className="text-xs font-semibold text-accent-soft transition hover:underline"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((key) => (
              <WalletSkeleton key={key} />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="👛"
              title="Todavía no hay wallets"
              description="Las wallets se crean automáticamente al iniciar sesión."
              action={
                <button type="button" onClick={refresh} className="btn-ghost">
                  Recargar
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.asset} wallet={wallet} onTrade={goToTrade} />
            ))}
          </div>
        )}

        {!loading && wallets.length > 0 && funded.length === 0 ? (
          <div className="mt-4">
            <Alert variant="info" title="Tus wallets están vacías">
              Esta cuenta no tiene saldo. Usa la cuenta demo o ejecuta{' '}
              <span className="font-mono">npm run seed</span> en el backend para cargar fondos de
              prueba.
            </Alert>
          </div>
        ) : null}
      </section>

      {loading ? <LoadingState label="Sincronizando datos…" className="py-4" /> : null}
    </div>
  );
};

export default Dashboard;

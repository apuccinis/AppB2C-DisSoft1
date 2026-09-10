import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { usePortfolio } from '../hooks/usePortfolio.jsx';
import { useMarket } from '../hooks/useMarket.jsx';
import { formatUsd } from '../utils/format.js';
import Logo from './Logo.jsx';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/trade', label: 'Trade', icon: '⇄' },
  { to: '/orders', label: 'Órdenes', icon: '☰' },
];

const navClasses = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-accent/15 text-white ring-1 ring-inset ring-accent/30'
      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
  }`;

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { totalUsd, loading } = usePortfolio();
  const { error: marketError } = useMarket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = (user?.name || '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo />

      <div className="rounded-xl border border-white/5 bg-base-800 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total balance</p>
        <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-white">
          {loading ? <span className="text-slate-500">···</span> : formatUsd(totalUsd)}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Valorado en USD</p>
      </div>

      <nav className="flex flex-col gap-1" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={navClasses}
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true" className="w-4 text-center text-base">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent-soft">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="btn-ghost w-full">
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-base-900">
      {/* Sidebar fijo en desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-base-700 lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Menu deslizante en tablet/movil */}
      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-white/5 bg-base-700 shadow-2xl">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-base-800/80 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="btn-ghost px-3 py-2 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
          <div className="lg:hidden">
            <Logo compact />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Total balance</p>
              <p className="font-mono text-sm font-semibold text-white">
                {loading ? '···' : formatUsd(totalUsd)}
              </p>
            </div>
            <span
              className={`chip ${marketError ? 'bg-bear/10 text-bear' : 'bg-bull/10 text-bull'}`}
              title={marketError || 'Precios en vivo (simulados)'}
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
              {marketError ? 'Sin conexión' : 'Live'}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

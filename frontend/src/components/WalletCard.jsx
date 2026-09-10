import AssetBadge from './AssetBadge.jsx';
import ChangeBadge from './ChangeBadge.jsx';
import { formatAssetAmount, formatNumber, formatUsd } from '../utils/format.js';

export const WalletCard = ({ wallet, onTrade }) => {
  const { asset, name, balance, usdPrice, usdValue, change24h } = wallet;

  return (
    <article className="card group flex flex-col gap-4 p-5 transition hover:border-accent/30">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <AssetBadge asset={asset} />
          <div>
            <p className="text-sm font-semibold text-slate-100">{asset}</p>
            <p className="text-xs text-slate-400">{name}</p>
          </div>
        </div>
        <ChangeBadge value={change24h} />
      </header>

      <div>
        <p className="font-mono text-2xl font-semibold tracking-tight text-white">
          {formatAssetAmount(balance, asset)}
          <span className="ml-1.5 text-sm font-medium text-slate-400">{asset}</span>
        </p>
        <p className="mt-1 text-sm text-slate-400">≈ {formatUsd(usdValue)}</p>
      </div>

      <footer className="flex items-center justify-between border-t border-white/5 pt-3">
        <div className="text-xs text-slate-400">
          <span className="text-slate-500">Precio </span>
          <span className="font-mono text-slate-300">
            ${formatNumber(usdPrice, usdPrice < 10 ? 4 : 2)}
          </span>
        </div>
        {onTrade ? (
          <button
            type="button"
            onClick={() => onTrade(asset)}
            className="rounded-md px-2 py-1 text-xs font-semibold text-accent-soft transition hover:bg-accent/10"
          >
            Operar →
          </button>
        ) : null}
      </footer>
    </article>
  );
};

export default WalletCard;

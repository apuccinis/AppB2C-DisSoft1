// Colores e iniciales por activo para dar identidad visual sin usar imagenes.
const ASSET_STYLES = {
  USD: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', symbol: '$' },
  EUR: { bg: 'bg-sky-500/15', text: 'text-sky-300', symbol: '€' },
  BTC: { bg: 'bg-amber-500/15', text: 'text-amber-300', symbol: '₿' },
  ETH: { bg: 'bg-violet-500/15', text: 'text-violet-300', symbol: 'Ξ' },
};

export const AssetBadge = ({ asset, size = 'md' }) => {
  const style = ASSET_STYLES[asset] || { bg: 'bg-base-500', text: 'text-slate-300', symbol: '◆' };
  const sizes = {
    sm: 'h-7 w-7 text-sm',
    md: 'h-10 w-10 text-lg',
    lg: 'h-12 w-12 text-xl',
  };
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${style.bg} ${style.text} ${sizes[size]}`}
    >
      {style.symbol}
    </span>
  );
};

export default AssetBadge;

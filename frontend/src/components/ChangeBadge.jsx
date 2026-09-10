import { formatPercent } from '../utils/format.js';

// Variacion de precio con codigo de color alcista/bajista.
export const ChangeBadge = ({ value, showArrow = true, className = '' }) => {
  const numeric = Number(value) || 0;
  const positive = numeric > 0;
  const negative = numeric < 0;
  const tone = positive
    ? 'bg-bull/10 text-bull'
    : negative
      ? 'bg-bear/10 text-bear'
      : 'bg-base-500 text-slate-400';

  return (
    <span className={`chip ${tone} ${className}`}>
      {showArrow && numeric !== 0 ? (positive ? '▲' : '▼') : null}
      <span className={showArrow && numeric !== 0 ? 'ml-1' : ''}>{formatPercent(numeric)}</span>
    </span>
  );
};

export default ChangeBadge;

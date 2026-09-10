// Decimales de presentacion por activo.
const ASSET_DECIMALS = { USD: 2, EUR: 2, BTC: 8, ETH: 6 };

export const decimalsFor = (asset) => ASSET_DECIMALS[String(asset).toUpperCase()] ?? 2;

export const formatNumber = (value, decimals = 2) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '—';
  return parsed.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatUsd = (value, decimals = 2) => `$${formatNumber(value, decimals)}`;

// Cantidad de un activo con sus decimales naturales (recorta ceros sobrantes en cripto).
export const formatAssetAmount = (value, asset) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '—';
  const decimals = decimalsFor(asset);
  const fixed = parsed.toFixed(decimals);
  if (decimals <= 2) return formatNumber(parsed, decimals);
  return fixed.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};

export const formatPrice = (value, quoteAsset = 'USD') => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '—';
  const decimals = parsed < 10 ? 4 : 2;
  const prefix = quoteAsset === 'USD' ? '$' : quoteAsset === 'EUR' ? '€' : '';
  return `${prefix}${formatNumber(parsed, decimals)}${prefix ? '' : ` ${quoteAsset}`}`;
};

export const formatPercent = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '—';
  return `${parsed > 0 ? '+' : ''}${parsed.toFixed(2)}%`;
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  // SQLite devuelve "YYYY-MM-DD HH:MM:SS" en UTC.
  const iso = typeof value === 'string' && !value.includes('T') ? `${value.replace(' ', 'T')}Z` : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeLabel = (isoString, range) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  if (range === '7D') {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

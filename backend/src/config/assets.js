// Catalogo de activos soportados por el prototipo.
// `usdPrice` es el precio inicial de referencia usado por el simulador.
export const QUOTE_ASSET = 'USD';

export const ASSETS = [
  { symbol: 'USD', name: 'US Dollar', type: 'FIAT', precision: 2, usdPrice: 1 },
  { symbol: 'EUR', name: 'Euro', type: 'FIAT', precision: 2, usdPrice: 1.17 },
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', precision: 8, usdPrice: 100000 },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', precision: 6, usdPrice: 4000 },
];

// Activos con precio simulado (USD es la moneda de referencia y vale siempre 1).
export const TRADABLE_ASSETS = ASSETS.filter((asset) => asset.symbol !== QUOTE_ASSET);

export const ASSET_SYMBOLS = ASSETS.map((asset) => asset.symbol);

export const assetBySymbol = (symbol) =>
  ASSETS.find((asset) => asset.symbol === String(symbol || '').toUpperCase());

export const isValidAsset = (symbol) => Boolean(assetBySymbol(symbol));

// Prioridad para decidir cual de los dos activos de un par actua como "quote".
// Menor indice = mas probable que sea la moneda de cotizacion.
const QUOTE_PRIORITY = ['USD', 'EUR', 'ETH', 'BTC'];

export const resolvePair = (assetA, assetB) => {
  const a = String(assetA).toUpperCase();
  const b = String(assetB).toUpperCase();
  const quote = QUOTE_PRIORITY.indexOf(a) <= QUOTE_PRIORITY.indexOf(b) ? a : b;
  const base = quote === a ? b : a;
  return { base, quote };
};

export default ASSETS;

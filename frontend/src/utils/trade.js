// Espejo en el cliente del calculo del backend (services/tradeService.js).
// Sirve solo para previsualizar: el backend siempre recalcula al ejecutar.

const DECIMALS = { USD: 2, EUR: 2, BTC: 8, ETH: 6 };
// Prioridad para decidir cual de los dos activos actua como "quote" del par.
const QUOTE_PRIORITY = ['USD', 'EUR', 'ETH', 'BTC'];

const round = (value, decimals) => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const roundForAsset = (value, asset) => round(value, DECIMALS[asset] ?? 8);

export const resolvePair = (assetA, assetB) => {
  const quote = QUOTE_PRIORITY.indexOf(assetA) <= QUOTE_PRIORITY.indexOf(assetB) ? assetA : assetB;
  return { base: quote === assetA ? assetB : assetA, quote };
};

/**
 * Calcula la previsualizacion de una operacion.
 * BUY  -> se gasta QUOTE: la comision se descuenta del importe indicado.
 * SELL -> se vende BASE: la comision se descuenta del importe recibido.
 */
export const buildTradePreview = ({ fromAsset, toAsset, amount, price, feeRate }) => {
  if (!fromAsset || !toAsset || fromAsset === toAsset) return null;
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(price) || price <= 0) return null;

  const { base, quote } = resolvePair(fromAsset, toAsset);
  const type = fromAsset === quote ? 'BUY' : 'SELL';

  let spendAmount;
  let fee;
  let subtotal;
  let baseAmount;
  let receiveAmount;

  if (type === 'BUY') {
    spendAmount = roundForAsset(amount, quote);
    fee = roundForAsset(spendAmount * feeRate, quote);
    subtotal = roundForAsset(spendAmount - fee, quote);
    baseAmount = roundForAsset(subtotal / price, base);
    receiveAmount = baseAmount;
  } else {
    spendAmount = roundForAsset(amount, base);
    baseAmount = spendAmount;
    subtotal = roundForAsset(spendAmount * price, quote);
    fee = roundForAsset(subtotal * feeRate, quote);
    receiveAmount = roundForAsset(subtotal - fee, quote);
  }

  return {
    type,
    baseAsset: base,
    quoteAsset: quote,
    pair: `${base}/${quote}`,
    price,
    feeRate,
    fee,
    feeAsset: quote,
    subtotal,
    amount: baseAmount,
    spendAmount,
    receiveAmount,
    total: type === 'BUY' ? spendAmount : receiveAmount,
    valid: baseAmount > 0 && receiveAmount > 0,
  };
};

export default buildTradePreview;

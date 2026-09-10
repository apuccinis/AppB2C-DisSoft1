import config from '../config/env.js';
import { ASSETS, QUOTE_ASSET, TRADABLE_ASSETS, assetBySymbol } from '../config/assets.js';
import { roundTo } from '../utils/numbers.js';
import ApiError from '../utils/ApiError.js';

const MINUTE_MS = 60 * 1000;
const HISTORY_MINUTES = 7 * 24 * 60; // 7 dias de historico simulado, 1 punto por minuto.
const MAX_DRIFT = 0.25; // Los precios no se alejan mas de un 25% del ancla inicial.

const RANGES = {
  '1H': { minutes: 60, step: 1 },
  '24H': { minutes: 24 * 60, step: 10 },
  '7D': { minutes: HISTORY_MINUTES, step: 60 },
};

// Estado en memoria: precio actual + serie historica por activo.
const state = new Map();
let tickTimer = null;

const gaussian = () => {
  // Box-Muller: ruido normal para que el paseo aleatorio no parezca "escalonado".
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// Paseo aleatorio con reversion a la media: fluctua pero se mantiene realista y positivo.
const nextPrice = (price, anchor, volatility) => {
  const pull = (anchor - price) / anchor; // fuerza que devuelve el precio hacia el ancla
  const change = gaussian() * volatility + pull * 0.02;
  const clampedLow = anchor * (1 - MAX_DRIFT);
  const clampedHigh = anchor * (1 + MAX_DRIFT);
  const candidate = price * (1 + change);
  return Math.min(Math.max(candidate, clampedLow), clampedHigh);
};

const priceDecimals = (symbol) => (assetBySymbol(symbol)?.type === 'FIAT' ? 4 : 2);

const buildHistory = (asset) => {
  const now = Date.now();
  const prices = [];
  let price = asset.usdPrice;

  // Se genera la serie hacia atras partiendo del precio actual...
  for (let i = 0; i < HISTORY_MINUTES; i += 1) {
    prices.push(roundTo(price, priceDecimals(asset.symbol)));
    price = nextPrice(price, asset.usdPrice, config.priceVolatility * 1.4);
  }
  // ...y se invierte para quedar ordenada del punto mas antiguo al mas reciente.
  prices.reverse();

  return prices.map((value, index) => ({
    time: now - (HISTORY_MINUTES - 1 - index) * MINUTE_MS,
    price: value,
  }));
};

export const initPriceService = () => {
  if (state.size > 0) return;

  for (const asset of TRADABLE_ASSETS) {
    const history = buildHistory(asset);
    state.set(asset.symbol, {
      symbol: asset.symbol,
      anchor: asset.usdPrice,
      price: history[history.length - 1].price,
      history,
    });
  }
};

export const tickPrices = () => {
  const now = Date.now();
  for (const entry of state.values()) {
    const updated = nextPrice(entry.price, entry.anchor, config.priceVolatility);
    entry.price = roundTo(updated, priceDecimals(entry.symbol));

    const last = entry.history[entry.history.length - 1];
    if (now - last.time >= MINUTE_MS) {
      entry.history.push({ time: now, price: entry.price });
      if (entry.history.length > HISTORY_MINUTES) entry.history.shift();
    } else {
      last.price = entry.price; // el ultimo punto refleja siempre el precio vigente
    }
  }
};

export const startPriceSimulation = () => {
  initPriceService();
  if (tickTimer) return tickTimer;
  tickTimer = setInterval(tickPrices, config.priceTickIntervalMs);
  tickTimer.unref?.();
  return tickTimer;
};

export const stopPriceSimulation = () => {
  if (tickTimer) clearInterval(tickTimer);
  tickTimer = null;
};

// Precio de un activo expresado en USD. USD siempre vale 1.
export const getUsdPrice = (symbol) => {
  const asset = String(symbol).toUpperCase();
  if (asset === QUOTE_ASSET) return 1;
  const entry = state.get(asset);
  if (!entry) throw ApiError.badRequest(`Unsupported asset: ${asset}`);
  return entry.price;
};

const changePercent = (symbol) => {
  if (symbol === QUOTE_ASSET) return 0;
  const entry = state.get(symbol);
  if (!entry) return 0;
  const dayAgo = entry.history[Math.max(0, entry.history.length - 1 - 24 * 60)];
  if (!dayAgo || !dayAgo.price) return 0;
  return roundTo(((entry.price - dayAgo.price) / dayAgo.price) * 100, 2);
};

export const getPrice = (symbol) => {
  const asset = String(symbol).toUpperCase();
  const meta = assetBySymbol(asset);
  if (!meta) throw ApiError.badRequest(`Unsupported asset: ${asset}`);
  return {
    asset: meta.symbol,
    name: meta.name,
    type: meta.type,
    precision: meta.precision,
    usdPrice: getUsdPrice(meta.symbol),
    change24h: changePercent(meta.symbol),
    updatedAt: new Date().toISOString(),
  };
};

export const getPrices = () => ASSETS.map((asset) => getPrice(asset.symbol));

// Precio de 1 base expresado en unidades de quote (BTC/USD, BTC/EUR, ...).
export const getPairPrice = (base, quote) => {
  const basePrice = getUsdPrice(base);
  const quotePrice = getUsdPrice(quote);
  if (!(basePrice > 0) || !(quotePrice > 0)) {
    throw ApiError.badRequest('Invalid price for the requested pair');
  }
  return basePrice / quotePrice;
};

export const getHistory = (symbol, range = '24H') => {
  const asset = String(symbol).toUpperCase();
  const meta = assetBySymbol(asset);
  if (!meta) throw ApiError.badRequest(`Unsupported asset: ${asset}`);

  const rangeKey = String(range).toUpperCase();
  const rangeConfig = RANGES[rangeKey];
  if (!rangeConfig) {
    throw ApiError.badRequest(`Unsupported range: ${range}. Use 1H, 24H or 7D`);
  }

  if (asset === QUOTE_ASSET) {
    // USD es la referencia: su serie es plana en 1.
    const now = Date.now();
    const points = Math.floor(rangeConfig.minutes / rangeConfig.step);
    return {
      asset,
      range: rangeKey,
      points: Array.from({ length: points }, (_, index) => ({
        time: new Date(now - (points - 1 - index) * rangeConfig.step * MINUTE_MS).toISOString(),
        price: 1,
      })),
    };
  }

  const entry = state.get(asset);
  const window = entry.history.slice(-rangeConfig.minutes);
  const points = [];
  for (let i = 0; i < window.length; i += rangeConfig.step) {
    points.push({ time: new Date(window[i].time).toISOString(), price: window[i].price });
  }
  const last = window[window.length - 1];
  if (points.length === 0 || points[points.length - 1].price !== last.price) {
    points.push({ time: new Date(last.time).toISOString(), price: last.price });
  }

  return { asset, range: rangeKey, points };
};

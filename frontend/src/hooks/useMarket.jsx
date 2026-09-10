import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchHealth, fetchPrices } from '../services/marketService.js';
import { getErrorMessage } from '../services/api.js';

const MarketContext = createContext(null);

const REFRESH_MS = Number(import.meta.env.VITE_PRICE_REFRESH_MS) || 4000;

export const MarketProvider = ({ children }) => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // La comision la define el backend via TRADING_FEE_RATE: nunca se fija en el cliente.
  const [feeRate, setFeeRate] = useState(null);
  const timerRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchPrices();
      setPrices(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'No se han podido cargar los precios'));
    } finally {
      setLoading(false);
    }
  }, []);

  // La comision solo hace falta una vez por sesion.
  useEffect(() => {
    fetchHealth()
      .then((data) => setFeeRate(Number(data.feeRate)))
      .catch(() => setFeeRate(null));
  }, []);

  // Polling: el backend simula el mercado, el frontend solo consulta.
  useEffect(() => {
    refresh();
    timerRef.current = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timerRef.current);
  }, [refresh]);

  const priceMap = useMemo(
    () => Object.fromEntries(prices.map((price) => [price.asset, price])),
    [prices],
  );

  const getUsdPrice = useCallback(
    (asset) => (asset === 'USD' ? 1 : priceMap[asset]?.usdPrice ?? null),
    [priceMap],
  );

  // Precio de 1 base expresado en quote (mismo criterio que el backend).
  const getPairPrice = useCallback(
    (base, quote) => {
      const basePrice = getUsdPrice(base);
      const quotePrice = getUsdPrice(quote);
      if (!basePrice || !quotePrice) return null;
      return basePrice / quotePrice;
    },
    [getUsdPrice],
  );

  const value = useMemo(
    () => ({ prices, priceMap, loading, error, feeRate, refresh, getUsdPrice, getPairPrice }),
    [prices, priceMap, loading, error, feeRate, refresh, getUsdPrice, getPairPrice],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket debe usarse dentro de <MarketProvider>');
  return context;
};

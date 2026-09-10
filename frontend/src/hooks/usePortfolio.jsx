import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchPortfolio } from '../services/walletService.js';
import { getErrorMessage } from '../services/api.js';
import { useAuth } from './useAuth.jsx';
import { useMarket } from './useMarket.jsx';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { getUsdPrice, priceMap } = useMarket();
  const [wallets, setWallets] = useState([]);
  const [totalUsd, setTotalUsd] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setWallets([]);
      setTotalUsd(0);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await fetchPortfolio();
      setWallets(data.wallets || []);
      setTotalUsd(data.totalUsd || 0);
    } catch (err) {
      setError(getErrorMessage(err, 'No se han podido cargar las wallets'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  // Permite que /trade actualice el portfolio sin esperar a un nuevo fetch.
  const applyPortfolio = useCallback((portfolio) => {
    if (!portfolio) return;
    setWallets(portfolio.wallets || []);
    setTotalUsd(portfolio.totalUsd || 0);
  }, []);

  const balanceOf = useCallback(
    (asset) => wallets.find((wallet) => wallet.asset === asset)?.balance ?? 0,
    [wallets],
  );

  // Revaloriza las wallets con los precios vigentes del mercado simulado:
  // el balance consolidado se recalcula en cada tick sin volver a pedir /wallets.
  const valuedWallets = useMemo(
    () =>
      wallets.map((wallet) => {
        const livePrice = getUsdPrice(wallet.asset);
        const usdPrice = livePrice ?? wallet.usdPrice;
        return {
          ...wallet,
          usdPrice,
          change24h: priceMap[wallet.asset]?.change24h ?? wallet.change24h ?? 0,
          usdValue: wallet.balance * usdPrice,
        };
      }),
    [wallets, getUsdPrice, priceMap],
  );

  const liveTotalUsd = useMemo(
    () => valuedWallets.reduce((sum, wallet) => sum + wallet.usdValue, 0),
    [valuedWallets],
  );

  const value = useMemo(
    () => ({
      wallets: valuedWallets,
      totalUsd: liveTotalUsd,
      settledTotalUsd: totalUsd,
      loading,
      error,
      refresh,
      applyPortfolio,
      balanceOf,
    }),
    [valuedWallets, liveTotalUsd, totalUsd, loading, error, refresh, applyPortfolio, balanceOf],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio debe usarse dentro de <PortfolioProvider>');
  return context;
};

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredToken, setStoredToken } from '../services/api.js';
import { loginRequest, meRequest, registerRequest } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [initializing, setInitializing] = useState(true);

  const applySession = useCallback((session) => {
    setStoredToken(session.token);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  // Restaura la sesion al cargar la app validando el token contra /auth/me.
  useEffect(() => {
    let active = true;
    const restore = async () => {
      if (!getStoredToken()) {
        setInitializing(false);
        return;
      }
      try {
        const data = await meRequest();
        if (active) setUser(data.user);
      } catch {
        if (active) logout();
      } finally {
        if (active) setInitializing(false);
      }
    };
    restore();
    return () => {
      active = false;
    };
  }, [logout]);

  // El interceptor de axios emite este evento cuando la API responde 401.
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('cryptofx:unauthorized', handler);
    return () => window.removeEventListener('cryptofx:unauthorized', handler);
  }, [logout]);

  const login = useCallback(
    async (credentials) => applySession(await loginRequest(credentials)),
    [applySession],
  );

  const register = useCallback(
    async (payload) => applySession(await registerRequest(payload)),
    [applySession],
  );

  const value = useMemo(
    () => ({ user, token, initializing, isAuthenticated: Boolean(user), login, register, logout }),
    [user, token, initializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return context;
};

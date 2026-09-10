import axios from 'axios';

const TOKEN_KEY = 'cryptofx.token';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Adjunta el JWT a cada peticion si existe.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normaliza la respuesta ({ success, data }) y los errores de la API.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setStoredToken(null);
      // Avisa a la app para cerrar sesion sin recargar la pagina.
      window.dispatchEvent(new CustomEvent('cryptofx:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export const unwrap = (response) => response.data?.data ?? {};

export const getErrorMessage = (error, fallback = 'Ha ocurrido un error inesperado') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'La petición ha tardado demasiado. Inténtalo de nuevo.';
  if (error?.message === 'Network Error') {
    return 'No se puede conectar con el servidor. ¿Está iniciado el backend?';
  }
  return error?.message || fallback;
};

export default api;

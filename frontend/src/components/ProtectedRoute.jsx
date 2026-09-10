import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { LoadingState } from './Spinner.jsx';

/**
 * Estado "usuario no autenticado": mientras se restaura la sesion muestra un
 * loader y, si no hay sesion valida, redirige a /login recordando el destino.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Restaurando sesión…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;

import { Link } from 'react-router-dom';

export const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
    <p className="font-mono text-6xl font-bold text-accent">404</p>
    <h1 className="text-xl font-semibold text-white">Página no encontrada</h1>
    <p className="max-w-sm text-sm text-slate-400">
      La ruta que has intentado abrir no existe en este prototipo.
    </p>
    <Link to="/dashboard" className="btn-primary mt-2">
      Volver al dashboard
    </Link>
  </div>
);

export default NotFound;

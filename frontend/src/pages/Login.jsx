import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { getErrorMessage } from '../services/api.js';
import AuthLayout from '../components/AuthLayout.jsx';
import Alert from '../components/Alert.jsx';
import Spinner from '../components/Spinner.jsx';

const DEMO_CREDENTIALS = { email: 'demo@example.com', password: 'demo123' };

export const Login = () => {
  const { login, isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!initializing && isAuthenticated) {
    return <Navigate to={location.state?.from || '/dashboard'} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (credentials) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(credentials);
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido iniciar sesión'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Introduce tu email y contraseña.');
      return;
    }
    submit({ email: form.email.trim(), password: form.password });
  };

  const useDemo = () => {
    setForm(DEMO_CREDENTIALS);
    submit(DEMO_CREDENTIALS);
  };

  return (
    <AuthLayout
      title="Inicia sesión"
      subtitle="Accede a tus wallets y opera con divisas y criptomonedas."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/register" className="font-semibold text-accent-soft hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {error ? (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

        <button type="submit" className="btn-primary mt-2" disabled={submitting}>
          {submitting ? <Spinner className="h-4 w-4" /> : null}
          {submitting ? 'Entrando…' : 'Entrar'}
        </button>

        <button type="button" className="btn-ghost" onClick={useDemo} disabled={submitting}>
          Usar cuenta demo
        </button>

        <p className="text-center text-xs text-slate-500">
          Cuenta de demostración local: <span className="font-mono">demo@example.com</span> /{' '}
          <span className="font-mono">demo123</span>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;

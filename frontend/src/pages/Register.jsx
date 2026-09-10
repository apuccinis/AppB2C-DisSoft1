import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { getErrorMessage } from '../services/api.js';
import AuthLayout from '../components/AuthLayout.jsx';
import Alert from '../components/Alert.jsx';
import Spinner from '../components/Spinner.jsx';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Register = () => {
  const { register, isAuthenticated, initializing } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!initializing && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validacion de cortesia en el cliente; el backend vuelve a validarlo todo.
  const validate = () => {
    if (form.name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres.';
    if (!EMAIL_REGEX.test(form.email.trim())) return 'Introduce un email válido.';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido crear la cuenta'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Las cuentas nuevas empiezan con las wallets a cero."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-accent-soft hover:underline">
            Iniciar sesión
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
          <label className="label" htmlFor="name">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="Ada Lovelace"
            value={form.name}
            onChange={handleChange}
            disabled={submitting}
          />
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm">
              Repetir
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className="input"
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>
        </div>

        <button type="submit" className="btn-primary mt-2" disabled={submitting}>
          {submitting ? <Spinner className="h-4 w-4" /> : null}
          {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;

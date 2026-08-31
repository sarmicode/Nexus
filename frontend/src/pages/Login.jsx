import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';

/**
 * Login — phone or email + password (Phase 01).
 */
export default function Login() {
  const { isAuthed, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthed) return <Navigate to={location.state?.from || '/'} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const nextErrors = {};
    if (!form.identifier.trim()) nextErrors.identifier = 'Phone or email is required';
    if (!form.password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await login({ identifier: form.identifier.trim(), password: form.password });
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setServerError(err.apiError?.message || 'Could not sign in — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card card--narrow">
      <h1>Welcome back</h1>
      <p className="muted">Sign in to FarmBridge</p>

      {serverError && (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Field label="Phone or email" error={errors.identifier}>
          <input
            className="input"
            type="text"
            autoComplete="username"
            placeholder="98765 43210 or you@example.com"
            value={form.identifier}
            onChange={set('identifier')}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
          />
        </Field>
        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="muted center">
        New to FarmBridge?{' '}
        <Link className="link" to="/register">
          Create an account
        </Link>
      </p>
    </section>
  );
}

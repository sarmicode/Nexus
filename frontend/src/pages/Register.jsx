import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Field from '../components/Field';
import { STATES, DISTRICTS, OTHER_DISTRICT } from '../data/locations';

const LANGUAGES = [
  ['en', 'English'],
  ['hi', 'हिन्दी'],
  ['bn', 'বাংলা'],
  ['ta', 'தமிழ்'],
  ['te', 'తెలుగు'],
  ['mr', 'मराठी'],
  ['gu', 'ગુજરાતી'],
  ['kn', 'ಕನ್ನಡ'],
  ['ml', 'മലയാളം'],
  ['ur', 'اردو'],
];

// Same rule the backend enforces (common/utils/phone.js).
function isIndianPhone(value) {
  let s = String(value || '').replace(/[\s\-().]/g, '');
  if (s.startsWith('+91')) s = s.slice(3);
  else if (s.startsWith('91') && s.length === 12) s = s.slice(2);
  return /^[6-9]\d{9}$/.test(s);
}

/**
 * Register — farmer/buyer self-signup with role toggle, state/district
 * dropdowns, optional geolocation, and client-side validation (Phase 01).
 * Success → auto-login (backend returns tokens) → home.
 */
export default function Register() {
  const { isAuthed, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirm: '',
    role: 'farmer',
    language: 'en',
    state: '',
    district: '',
    otherDistrict: '',
    village: '',
    geo: null,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const districts = useMemo(
    () => (form.state ? [...(DISTRICTS[form.state] || []), OTHER_DISTRICT] : []),
    [form.state]
  );

  // After all hooks — keeps hook order stable (rules-of-hooks).
  if (isAuthed) return <Navigate to="/" replace />;

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
      ...(key === 'state' ? { district: '', otherDistrict: '' } : {}),
    }));

  function useMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          geo: [Number(pos.coords.latitude.toFixed(6)), Number(pos.coords.longitude.toFixed(6))],
        })),
      () => setGeoError('Could not get your location — check browser permissions'),
      { timeout: 8000 }
    );
  }

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name';
    if (!isIndianPhone(form.phone))
      next.phone = 'Enter a valid 10-digit Indian mobile number (starting 6-9)';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email))
      next.email = 'Enter a valid email or leave it blank';
    if (form.password.length < 8) next.password = 'Password must be at least 8 characters';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match';
    if (!form.state) next.state = 'Select your state';
    if (!form.district) next.district = 'Select your district';
    else if (form.district === OTHER_DISTRICT && form.otherDistrict.trim().length < 2)
      next.district = 'Type your district name';
    return next;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
      language: form.language,
      location: {
        village: form.village.trim() || undefined,
        state: form.state,
        district: form.district === OTHER_DISTRICT ? form.otherDistrict.trim() : form.district,
        geo: form.geo || undefined,
      },
    };
    if (form.email.trim()) payload.email = form.email.trim();

    setSubmitting(true);
    try {
      await register(payload);
      navigate('/', { replace: true }); // register() auto-logged us in
    } catch (err) {
      setServerError(err.apiError?.message || 'Could not create your account — please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card card--wide">
      <h1>Create your account</h1>
      <p className="muted">Join FarmBridge as a farmer or a buyer</p>

      {serverError && (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="role-toggle">
          {['farmer', 'buyer'].map((r) => (
            <label key={r} className={`role-toggle__option ${form.role === r ? 'is-active' : ''}`}>
              <input
                type="radio"
                name="role"
                value={r}
                checked={form.role === r}
                onChange={set('role')}
              />
              <span>{r === 'farmer' ? '🌱 I sell my produce' : '🛒 I buy produce'}</span>
            </label>
          ))}
        </div>

        <div className="form-grid">
          <Field label="Full name" error={errors.name}>
            <input
              className="input"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Ramesh Kumar"
            />
          </Field>
          <Field label="Mobile number" error={errors.phone} hint="10 digits, starting 6-9">
            <input
              className="input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="98765 43210"
            />
          </Field>
          <Field label="Email (optional)" error={errors.email}>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Preferred language">
            <select className="input" value={form.language} onChange={set('language')}>
              {LANGUAGES.map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Password" error={errors.password} hint="At least 8 characters">
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
            />
          </Field>
          <Field label="Confirm password" error={errors.confirm}>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
            />
          </Field>
          <Field label="State" error={errors.state}>
            <select className="input" value={form.state} onChange={set('state')}>
              <option value="">Select state…</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="District" error={errors.district}>
            <select
              className="input"
              value={form.district}
              onChange={set('district')}
              disabled={!form.state}
            >
              <option value="">{form.state ? 'Select district…' : 'Select state first'}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          {form.district === OTHER_DISTRICT && (
            <Field label="Your district" error={errors.otherDistrict}>
              <input
                className="input"
                type="text"
                value={form.otherDistrict}
                onChange={set('otherDistrict')}
                placeholder="Type your district"
              />
            </Field>
          )}
          <Field label="Village (optional)">
            <input
              className="input"
              type="text"
              value={form.village}
              onChange={set('village')}
              placeholder="e.g. Raipur"
            />
          </Field>
          <div className="field">
            <span className="field__label">Location (optional)</span>
            <button type="button" className="btn btn--ghost" onClick={useMyLocation}>
              📍 Use my location
            </button>
            {form.geo && (
              <span className="field__hint">
                Captured: {form.geo[0]}, {form.geo[1]}
              </span>
            )}
            {geoError && (
              <span className="field__error" role="alert">
                {geoError}
              </span>
            )}
          </div>
        </div>

        <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="muted center">
        Already registered?{' '}
        <Link className="link" to="/login">
          Sign in
        </Link>
      </p>
    </section>
  );
}

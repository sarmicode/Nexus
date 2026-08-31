import { useState } from 'react';
import { useUser } from '../context/UserContext';
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

/**
 * Profile — view + edit name, language and location (Phase 01).
 * Phone and role are fixed (identity / RBAC).
 */
export default function Profile() {
  const { user, updateUser } = useUser();
  const [form, setForm] = useState({
    name: user?.name || '',
    language: user?.language || 'en',
    state: user?.location?.state || '',
    district: user?.location?.district || '',
    otherDistrict: user?.location?.district || '',
    village: user?.location?.village || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const location = user?.location || {};
  const useOther =
    form.state && form.district && !(DISTRICTS[form.state] || []).includes(form.district);

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.value,
      ...(key === 'state' ? { district: '', otherDistrict: '' } : {}),
    }));

  async function onSave(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (form.name.trim().length < 2) {
      setError('Name is too short');
      return;
    }
    const districtValue = useOther ? form.otherDistrict.trim() : form.district;
    const locationPatch = {
      village: form.village.trim() || undefined,
      state: form.state || undefined,
      district: districtValue || undefined,
    };
    setSaving(true);
    try {
      await updateUser({
        name: form.name.trim(),
        language: form.language,
        location: locationPatch,
      });
      setMessage('Profile updated');
    } catch (err) {
      setError(err.apiError?.message || 'Could not save your profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card card--wide">
      <h1>Your profile</h1>
      <p className="muted">
        Signed in as <strong>{user?.phone}</strong> ·{' '}
        <span className={`role-badge role-badge--${user?.role}`}>{user?.role}</span>
      </p>

      {message && (
        <div className="alert alert--success" role="status">
          {message}
        </div>
      )}
      {error && (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={onSave} noValidate>
        <div className="form-grid">
          <Field label="Full name">
            <input className="input" type="text" value={form.name} onChange={set('name')} />
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
          <Field label="State">
            <select className="input" value={form.state} onChange={set('state')}>
              <option value="">Select state…</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="District">
            <select
              className="input"
              value={useOther ? OTHER_DISTRICT : form.district}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  district: e.target.value,
                  otherDistrict: e.target.value === OTHER_DISTRICT ? '' : e.target.value,
                }))
              }
              disabled={!form.state}
            >
              <option value="">{form.state ? 'Select district…' : 'Select state first'}</option>
              {form.state &&
                [...(DISTRICTS[form.state] || []), OTHER_DISTRICT].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </Field>
          {useOther && (
            <Field label="Your district">
              <input
                className="input"
                type="text"
                value={form.otherDistrict}
                onChange={set('otherDistrict')}
              />
            </Field>
          )}
          <Field label="Village">
            <input className="input" type="text" value={form.village} onChange={set('village')} />
          </Field>
        </div>
        <p className="muted">
          Current location:{' '}
          {location.state ? `${location.district || '—'}, ${location.state}` : 'not set'}
          {location.geo ? ` (geo: ${location.geo[0]}, ${location.geo[1]})` : ''}
        </p>
        <button className="btn btn--primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </section>
  );
}

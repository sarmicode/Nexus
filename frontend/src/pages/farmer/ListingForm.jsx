import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Field from '../../components/Field';
import {
  createListing,
  getListing,
  updateListing,
  uploadListingImages,
} from '../../services/listings';
import { getMyFpos } from '../../services/fpos';
import { assetUrl } from '../../utils/assetUrl';
import { CROPS, QUANTITY_UNITS, GRADES, PRICE_TYPES } from '../../data/crops';
import { STATES, DISTRICTS, OTHER_DISTRICT } from '../../data/locations';

const MAX_IMAGES = 5;

function titleCase(value) {
  if (!value) return '';
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * ListingForm — create + edit a crop listing (Phase 02).
 * Multi-image upload with preview, crop typeahead, price type & grade, and the
 * district/geo picker reused from registration.
 */
export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [fpos, setFpos] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [geoError, setGeoError] = useState(null);

  const [form, setForm] = useState({
    crop: '',
    variety: '',
    grade: 'A',
    organic: false,
    quantityValue: '',
    unit: 'quintal',
    priceType: 'fixed',
    pricePerUnit: '',
    mandiRef: '',
    readinessDate: '',
    state: '',
    district: '',
    otherDistrict: '',
    village: '',
    geo: null,
    fpoId: '',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [errors, setErrors] = useState({});

  const districts = useMemo(
    () => (form.state ? [...(DISTRICTS[form.state] || []), OTHER_DISTRICT] : []),
    [form.state]
  );

  useEffect(() => {
    // Load own FPOs (optional attach) for both modes.
    getMyFpos()
      .then((res) => setFpos(res.items || []))
      .catch(() => setFpos([]));

    if (!isEdit) return undefined;

    let active = true;
    getListing(id)
      .then((listing) => {
        if (!active) return;
        setForm({
          crop: titleCase(listing.crop),
          variety: listing.variety || '',
          grade: listing.grade || 'A',
          organic: Boolean(listing.organic),
          quantityValue: String(listing.quantity.value),
          unit: listing.quantity.unit,
          priceType: listing.priceType,
          pricePerUnit: listing.pricePerUnit ? String(listing.pricePerUnit) : '',
          mandiRef: listing.mandiRef || '',
          readinessDate: listing.readinessDate ? String(listing.readinessDate).slice(0, 10) : '',
          state: listing.location.state || '',
          district: listing.location.district || '',
          otherDistrict: listing.location.district || '',
          village: listing.location.village || '',
          geo: listing.location.geo || null,
          fpoId: listing.fpoId || '',
        });
        setExistingImages(listing.images || []);
      })
      .catch((err) => setServerError(err.apiError?.message || 'Could not load the listing'))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === 'state' ? { district: '', otherDistrict: '' } : {}),
    }));
  };

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

  function onFilesPicked(e) {
    const files = Array.from(e.target.files || []);
    const room = MAX_IMAGES - existingImages.length - newImages.length;
    if (files.length > room) {
      setServerError(
        `You can add at most ${MAX_IMAGES - existingImages.length} more image(s) (5 total)`
      );
      e.target.value = '';
      return;
    }
    setServerError(null);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = '';
  }

  function removeNewImage(index) {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  }

  const useOther =
    form.state && form.district && !(DISTRICTS[form.state] || []).includes(form.district);
  const districtValue = useOther ? form.otherDistrict.trim() : form.district;

  function validate() {
    const next = {};
    if (!form.crop.trim()) next.crop = 'Crop is required';
    const qty = Number(form.quantityValue);
    if (!form.quantityValue || Number.isNaN(qty) || qty <= 0)
      next.quantityValue = 'Quantity must be greater than 0';
    if (form.priceType === 'fixed') {
      const price = Number(form.pricePerUnit);
      if (form.pricePerUnit === '' || Number.isNaN(price) || price <= 0)
        next.pricePerUnit = 'A price greater than 0 is required for fixed-price listings';
    }
    if (!form.state) next.state = 'Select your state';
    if (!form.district) next.district = 'Select your district';
    else if (form.district === OTHER_DISTRICT && form.otherDistrict.trim().length < 2)
      next.district = 'Type your district name';
    return next;
  }

  function buildPayload() {
    const price =
      form.priceType === 'fixed' || form.pricePerUnit !== ''
        ? Number(form.pricePerUnit)
        : undefined;
    return {
      crop: form.crop.trim(),
      variety: form.variety.trim() || undefined,
      grade: form.grade,
      organic: form.organic,
      quantity: { value: Number(form.quantityValue), unit: form.unit },
      priceType: form.priceType,
      pricePerUnit: price,
      mandiRef: form.mandiRef.trim() || undefined,
      readinessDate: form.readinessDate || undefined,
      location: {
        village: form.village.trim() || undefined,
        state: form.state,
        district: districtValue,
        geo: form.geo || undefined,
      },
      fpoId: form.fpoId || undefined,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const payload = buildPayload();
      const saved = isEdit ? await updateListing(id, payload) : await createListing(payload);
      if (newImages.length > 0) {
        await uploadListingImages(saved._id, newImages);
      }
      navigate('/farmer', { replace: true });
    } catch (err) {
      setServerError(err.apiError?.message || 'Could not save the listing — please try again');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card status status--loading">⏳ Loading…</div>;
  }

  return (
    <section className="card card--wide">
      <h1>{isEdit ? 'Edit listing' : 'Add a listing'}</h1>
      <p className="muted">
        {isEdit ? 'Update your crop lot details' : 'Tell buyers what you have to sell'}
      </p>

      {serverError && (
        <div className="alert alert--error" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="form-grid">
          <Field label="Crop" error={errors.crop}>
            <input
              className="input"
              type="text"
              list="crop-options"
              value={form.crop}
              onChange={set('crop')}
              placeholder="e.g. Wheat"
            />
            <datalist id="crop-options">
              {CROPS.map((crop) => (
                <option key={crop} value={crop} />
              ))}
            </datalist>
          </Field>
          <Field label="Variety (optional)">
            <input
              className="input"
              type="text"
              value={form.variety}
              onChange={set('variety')}
              placeholder="e.g. HD-3086"
            />
          </Field>
          <Field label="Grade">
            <select className="input" value={form.grade} onChange={set('grade')}>
              {GRADES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price type">
            <select className="input" value={form.priceType} onChange={set('priceType')}>
              {PRICE_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Quantity"
            error={errors.quantityValue}
            hint="Total quantity you want to sell"
          >
            <div className="input-group">
              <input
                className="input"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={form.quantityValue}
                onChange={set('quantityValue')}
                placeholder="0"
              />
              <select className="input input-group__unit" value={form.unit} onChange={set('unit')}>
                {QUANTITY_UNITS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <Field
            label={
              form.priceType === 'fixed' ? 'Price (₹ per unit)' : 'Expected price (₹, optional)'
            }
            error={errors.pricePerUnit}
            hint={
              form.priceType === 'fixed'
                ? 'Your fixed asking price'
                : 'Leave blank if open to offers'
            }
          >
            <input
              className="input"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={form.pricePerUnit}
              onChange={set('pricePerUnit')}
              placeholder="0"
            />
          </Field>
          <Field label="Ready by (optional)">
            <input
              className="input"
              type="date"
              value={form.readinessDate}
              onChange={set('readinessDate')}
            />
          </Field>
          <Field label="Nearest mandi (optional)">
            <input
              className="input"
              type="text"
              value={form.mandiRef}
              onChange={set('mandiRef')}
              placeholder="e.g. APMC Munger"
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
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          {useOther && (
            <Field label="Your district" error={errors.district}>
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
          <Field label="FPO (optional)" hint="Attach one of your FPOs to this listing">
            <select className="input" value={form.fpoId} onChange={set('fpoId')}>
              <option value="">No FPO</option>
              {fpos.map((fpo) => (
                <option key={fpo._id} value={fpo._id}>
                  {fpo.name} ({fpo.district})
                </option>
              ))}
            </select>
          </Field>
          <div className="field">
            <span className="field__label">Organic produce</span>
            <label className="toggle">
              <input type="checkbox" checked={form.organic} onChange={set('organic')} />
              <span>{form.organic ? 'Yes — grown organically' : 'No — conventional'}</span>
            </label>
          </div>
          <div className="field">
            <span className="field__label">Farm location (optional)</span>
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

        <div className="field upload-field">
          <span className="field__label">
            Photos ({existingImages.length + newImages.length}/{MAX_IMAGES})
          </span>
          <span className="field__hint">jpg, png or webp · max 3 MB each · up to 5 photos</span>

          {existingImages.length + newImages.length > 0 && (
            <div className="previews">
              {existingImages.map((img) => (
                <div key={img} className="preview">
                  <img src={assetUrl(img)} alt="Existing" loading="lazy" />
                </div>
              ))}
              {newImages.map((file, index) => (
                <div key={`${file.name}-${index}`} className="preview">
                  <img src={URL.createObjectURL(file)} alt={file.name} loading="lazy" />
                  <button
                    type="button"
                    className="preview__remove"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeNewImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="btn btn--ghost"
            disabled={existingImages.length + newImages.length >= MAX_IMAGES}
            onClick={() => fileInputRef.current?.click()}
          >
            + Add photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            hidden
            onChange={onFilesPicked}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish listing'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => navigate('/farmer')}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

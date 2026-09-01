import { Link } from 'react-router-dom';
import { assetUrl } from '../utils/assetUrl';

const UNIT_LABELS = { quintal: 'quintal', kg: 'kg', tonne: 'tonne' };
const PRICE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function titleCase(value) {
  if (!value) return '';
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * CompareTable — side-by-side comparison of 2–4 selected lots (Phase 03).
 *
 * Each listing carries its own quantity unit, so the price is shown both as
 * the raw `price / unit` and as a unit-normalized `₹ per kg`, so a ₹/quintal
 * quote is comparable with a ₹/kg one. A placeholder "mandi modal price"
 * column is shown (real values arrive with Phase 4).
 */
const TO_KG = { quintal: 100, kg: 1, tonne: 1000 };

export default function CompareTable({ listings, onRemove }) {
  if (!listings.length) return null;

  const perKg = (price, unit) => {
    if (price == null || !TO_KG[unit]) return null;
    return price / TO_KG[unit];
  };

  const fmtPerKg = (price, unit) => {
    const v = perKg(price, unit);
    if (v == null) return '—';
    return `${PRICE.format(v)}/kg`;
  };

  return (
    <section className="card compare">
      <div className="page-head">
        <div>
          <h2>Compare lots</h2>
          <p className="muted">
            Prices normalized to ₹/kg so you can compare across units. Mandi modal price arrives in
            Phase 4.
          </p>
        </div>
        <span className="muted">{listings.length} selected</span>
      </div>

      <div className="compare-scroll">
        <table className="table compare-table">
          <thead>
            <tr>
              <th>Field</th>
              {listings.map((l) => (
                <th key={l._id}>
                  <div className="compare-thumb">
                    {l.images?.[0] ? <img src={assetUrl(l.images[0])} alt="" /> : <span>🌾</span>}
                  </div>
                  <Link className="link" to={`/listings/${l._id}`}>
                    {titleCase(l.crop)}
                  </Link>
                  {onRemove && (
                    <button
                      type="button"
                      className="compare-remove"
                      onClick={() => onRemove(l._id)}
                      aria-label="Remove from compare"
                    >
                      ✕
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Price / unit</td>
              {listings.map((l) => (
                <td key={l._id}>
                  {l.priceType === 'negotiable'
                    ? 'Negotiable'
                    : `${PRICE.format(l.pricePerUnit)} / ${UNIT_LABELS[l.quantity.unit] || l.quantity.unit}`}
                </td>
              ))}
            </tr>
            <tr>
              <td>Price / kg</td>
              {listings.map((l) => (
                <td key={l._id}>
                  {l.priceType === 'negotiable'
                    ? 'Negotiable'
                    : fmtPerKg(l.pricePerUnit, l.quantity.unit)}
                </td>
              ))}
            </tr>
            <tr>
              <td>Quantity</td>
              {listings.map((l) => (
                <td key={l._id}>
                  {l.quantity.value} {UNIT_LABELS[l.quantity.unit] || l.quantity.unit}
                </td>
              ))}
            </tr>
            <tr>
              <td>Grade</td>
              {listings.map((l) => (
                <td key={l._id}>{l.grade}</td>
              ))}
            </tr>
            <tr>
              <td>District</td>
              {listings.map((l) => (
                <td key={l._id}>{l.location?.district || '—'}</td>
              ))}
            </tr>
            <tr>
              <td>State</td>
              {listings.map((l) => (
                <td key={l._id}>{l.location?.state || '—'}</td>
              ))}
            </tr>
            <tr>
              <td>Readiness</td>
              {listings.map((l) => (
                <td key={l._id}>
                  {l.readinessDate ? new Date(l.readinessDate).toLocaleDateString() : '—'}
                </td>
              ))}
            </tr>
            <tr>
              <td>Organic</td>
              {listings.map((l) => (
                <td key={l._id}>{l.organic ? '🌱 Yes' : 'No'}</td>
              ))}
            </tr>
            <tr className="compare-mandi-row">
              <td>Mandi modal price</td>
              {listings.map((l) => (
                <td key={l._id} className="muted">
                  Phase 4
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getListing } from '../services/listings';
import { createLead } from '../services/leads';
import { addToWatchlist, removeFromWatchlist } from '../services/watchlist';
import { useAuth } from '../context/AuthContext';
import { assetUrl } from '../utils/assetUrl';
import StatusChip from '../components/StatusChip';
import Field from '../components/Field';

const UNIT_LABELS = { quintal: 'quintal', kg: 'kg', tonne: 'tonne' };
const QUANTITY_UNITS = [
  ['quintal', 'Quintal'],
  ['kg', 'Kilogram (kg)'],
  ['tonne', 'Tonne'],
];
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
 * ListingDetail — public view of a crop listing (Phase 02) extended with the
 * Phase 03 buyer actions: "Send enquiry (RFQ)" and a watchlist toggle.
 * Unauthenticated users can browse; RFQ/watchlist redirect to login.
 */
export default function ListingDetail() {
  const { id } = useParams();
  const { isAuthed, role } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ listing: null, loadedId: null, error: null });

  // RFQ form
  const [rfq, setRfq] = useState({
    quantityWanted: '',
    quantityUnit: 'quintal',
    message: '',
    priceOffered: '',
  });
  const [rfqBusy, setRfqBusy] = useState(false);
  const [rfqMsg, setRfqMsg] = useState(null); // { type: 'success'|'error', text }

  // Watchlist
  const [watchBusy, setWatchBusy] = useState(false);
  const [watchMsg, setWatchMsg] = useState(null);

  // `state.loadedId !== id` doubles as the loading flag: on a route change to a
  // different id the page shows loading until the fetch resolves. setState only
  // happens inside promise callbacks (never synchronously in the effect body).
  useEffect(() => {
    let active = true;
    getListing(id)
      .then((data) => {
        if (active) setState({ listing: data, loadedId: id, error: null });
      })
      .catch((err) => {
        if (active)
          setState({
            listing: null,
            loadedId: id,
            error: err.apiError || { code: 'UNKNOWN', message: err.message },
          });
      });
    return () => {
      active = false;
    };
  }, [id]);

  const loading = state.loadedId !== id;
  const { listing, error } = state;

  if (loading) {
    return <div className="card status status--loading">⏳ Loading listing…</div>;
  }
  if (error || !listing) {
    return (
      <div className="card status status--error">
        <div>
          <strong>{error?.status === 404 ? 'Listing not found' : 'Could not load listing'}</strong>
          <p className="muted">{error?.message || ''}</p>
        </div>
        <Link to="/" className="btn btn--ghost">
          ← Home
        </Link>
      </div>
    );
  }

  const qty = `${listing.quantity.value} ${UNIT_LABELS[listing.quantity.unit] || listing.quantity.unit}`;
  const isOwner = listing.isOwner || role === 'farmer';
  const canEnquire = isAuthed && role === 'buyer' && listing.status === 'active';
  const needLogin = !isAuthed;

  async function onSubmitRfq(e) {
    e.preventDefault();
    if (needLogin) {
      navigate('/login');
      return;
    }
    setRfqBusy(true);
    setRfqMsg(null);
    try {
      await createLead(id, {
        message: rfq.message,
        quantityWanted: Number(rfq.quantityWanted),
        quantityUnit: rfq.quantityUnit,
        priceOffered: rfq.priceOffered ? Number(rfq.priceOffered) : undefined,
      });
      setRfqMsg({ type: 'success', text: 'Enquiry sent! The farmer will get back to you.' });
      setRfq({ quantityWanted: '', quantityUnit: rfq.quantityUnit, message: '', priceOffered: '' });
    } catch (err) {
      setRfqMsg({ type: 'error', text: err.apiError?.message || err.message });
    } finally {
      setRfqBusy(false);
    }
  }

  async function onToggleWatchlist() {
    if (needLogin) {
      navigate('/login');
      return;
    }
    setWatchBusy(true);
    setWatchMsg(null);
    try {
      await addToWatchlist(id);
      setWatchMsg({ type: 'success', text: 'Added to your watchlist.' });
    } catch (err) {
      if (err.apiError?.status === 409) {
        await removeFromWatchlist(id);
        setWatchMsg({ type: 'success', text: 'Removed from your watchlist.' });
      } else {
        setWatchMsg({ type: 'error', text: err.apiError?.message || err.message });
      }
    } finally {
      setWatchBusy(false);
    }
  }

  return (
    <article className="card card--wide">
      <p className="muted">
        <Link className="link" to="/">
          ← Home
        </Link>
        <span> · </span>
        <Link className="link" to="/catalog">
          Marketplace
        </Link>
      </p>

      <header className="detail-head">
        <div>
          <h1>{titleCase(listing.crop)}</h1>
          <p className="muted">
            {listing.variety ? `${titleCase(listing.variety)} · ` : ''}
            Grade {listing.grade} · {listing.organic ? '🌱 Organic' : 'Conventional'} · {qty}
          </p>
        </div>
        <StatusChip status={listing.status} />
      </header>

      {listing.images.length > 0 && (
        <div className="gallery">
          {listing.images.map((img) => (
            <img key={img} src={assetUrl(img)} alt={titleCase(listing.crop)} loading="lazy" />
          ))}
        </div>
      )}

      <div className="detail-grid">
        <section>
          <h2>Details</h2>
          <dl className="facts">
            <div>
              <dt>Price</dt>
              <dd className="price">
                {listing.priceType === 'negotiable'
                  ? 'Negotiable'
                  : `${PRICE.format(listing.pricePerUnit)} / ${UNIT_LABELS[listing.quantity.unit] || listing.quantity.unit}`}
              </dd>
            </div>
            <div>
              <dt>Quantity available</dt>
              <dd>{qty}</dd>
            </div>
            <div>
              <dt>Ready by</dt>
              <dd>
                {listing.readinessDate ? new Date(listing.readinessDate).toLocaleDateString() : '—'}
              </dd>
            </div>
            {listing.mandiRef && (
              <div>
                <dt>Nearest mandi</dt>
                <dd>{listing.mandiRef}</dd>
              </div>
            )}
          </dl>
        </section>

        <aside className="seller-card">
          <h2>Seller</h2>
          <p className="seller-name">
            {listing.farmer?.name || 'Farmer'}
            {listing.fpo ? (
              <span className="fpo-badge" title="Sold through an FPO">
                🏢 {listing.fpo.name}
                {listing.fpo.verified ? ' ✓' : ''}
              </span>
            ) : null}
          </p>
          <p className="muted">
            {[listing.farmer?.village, listing.farmer?.district, listing.farmer?.state]
              .filter(Boolean)
              .join(', ') || 'Location not set'}
          </p>
        </aside>
      </div>

      {!isOwner && (
        <div className="rfq">
          <div className="detail-head">
            <h2>Send enquiry (RFQ)</h2>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={onToggleWatchlist}
              disabled={watchBusy}
            >
              {watchMsg?.type === 'success' ? '☆ Remove from watchlist' : '☆ Watchlist'}
            </button>
          </div>
          {watchMsg && (
            <div className={`alert alert--${watchMsg.type}`} role="alert">
              {watchMsg.text}
            </div>
          )}

          {needLogin ? (
            <p className="muted">
              <Link className="link" to="/login">
                Log in
              </Link>{' '}
              as a buyer to send an enquiry or add to your watchlist.
            </p>
          ) : canEnquire ? (
            <>
              {rfqMsg && (
                <div className={`alert alert--${rfqMsg.type}`} role="alert">
                  {rfqMsg.text}
                </div>
              )}
              <form onSubmit={onSubmitRfq} className="form-grid">
                <Field label={`Quantity wanted (${UNIT_LABELS[listing.quantity.unit] || 'unit'})`}>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="any"
                    required
                    placeholder={String(listing.quantity.value)}
                    value={rfq.quantityWanted}
                    onChange={(e) => setRfq({ ...rfq, quantityWanted: e.target.value })}
                  />
                </Field>
                <Field label="Unit">
                  <select
                    className="input"
                    value={rfq.quantityUnit}
                    onChange={(e) => setRfq({ ...rfq, quantityUnit: e.target.value })}
                  >
                    {QUANTITY_UNITS.map(([v, label]) => (
                      <option key={v} value={v}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Price offered (optional)">
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="any"
                    placeholder={`₹ / ${rfq.quantityUnit}`}
                    value={rfq.priceOffered}
                    onChange={(e) => setRfq({ ...rfq, priceOffered: e.target.value })}
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    className="input"
                    rows="3"
                    required
                    placeholder="Tell the farmer what you're looking for…"
                    value={rfq.message}
                    onChange={(e) => setRfq({ ...rfq, message: e.target.value })}
                  />
                </Field>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={rfqBusy}
                  style={{ gridColumn: '1 / -1' }}
                >
                  {rfqBusy ? 'Sending…' : 'Send enquiry'}
                </button>
              </form>
            </>
          ) : (
            <p className="muted">You need a buyer account to enquire about this listing.</p>
          )}
        </div>
      )}
    </article>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getListing } from '../services/listings';
import { assetUrl } from '../utils/assetUrl';
import StatusChip from '../components/StatusChip';

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
 * ListingDetail — public view of a crop listing with an image gallery and a
 * "seller" card (farmer name, location, optional FPO badge). Phase 02.
 */
export default function ListingDetail() {
  const { id } = useParams();
  // `loadedId` doubles as the loading flag: until a fetch resolves for the
  // current id, the page shows the loading state. setState happens only in
  // promise callbacks (never synchronously in the effect body).
  const [state, setState] = useState({ listing: null, loadedId: null, error: null });

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

  return (
    <article className="card card--wide">
      <p className="muted">
        <Link className="link" to="/">
          ← Home
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
    </article>
  );
}

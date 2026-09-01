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
 * ListingCard — a crop-lot result card for the Catalog / compare tray
 * (Phase 03). Clicking the card opens the detail page; the compare checkbox
 * adds it to the compare tray (2–4 lots).
 */
export default function ListingCard({ listing, compareSelected, onToggleCompare }) {
  const qty = `${listing.quantity.value} ${UNIT_LABELS[listing.quantity.unit] || listing.quantity.unit}`;
  const selected = Boolean(compareSelected);

  return (
    <article className={`listing-card ${selected ? 'listing-card--selected' : ''}`}>
      <Link className="listing-card__media" to={`/listings/${listing._id}`}>
        {listing.images?.[0] ? (
          <img src={assetUrl(listing.images[0])} alt={titleCase(listing.crop)} loading="lazy" />
        ) : (
          <div className="listing-card__placeholder">🌾</div>
        )}
      </Link>
      <div className="listing-card__body">
        <div className="listing-card__head">
          <Link className="listing-card__title" to={`/listings/${listing._id}`}>
            {titleCase(listing.crop)}
          </Link>
          {onToggleCompare && (
            <button
              type="button"
              className={`compare-toggle ${selected ? 'is-active' : ''}`}
              onClick={() => onToggleCompare(listing._id)}
              title={selected ? 'Remove from compare' : 'Add to compare'}
              aria-pressed={selected}
            >
              ⇄
            </button>
          )}
        </div>
        <p className="muted listing-card__sub">
          {listing.variety ? `${titleCase(listing.variety)} · ` : ''}
          {listing.organic ? '🌱 Organic' : 'Conventional'} · Grade {listing.grade}
        </p>
        <div className="listing-card__meta">
          <span className="listing-card__price">
            {listing.priceType === 'negotiable'
              ? 'Negotiable'
              : `${PRICE.format(listing.pricePerUnit)} / ${UNIT_LABELS[listing.quantity.unit] || listing.quantity.unit}`}
          </span>
          <span className="listing-card__qty">{qty}</span>
        </div>
        <p className="muted listing-card__loc">
          {[listing.location?.village, listing.location?.district, listing.location?.state]
            .filter(Boolean)
            .join(', ') || 'Location not set'}
        </p>
      </div>
    </article>
  );
}

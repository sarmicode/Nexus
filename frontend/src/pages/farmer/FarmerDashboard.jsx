import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyListings, updateListing, deleteListing } from '../../services/listings';
import StatusChip from '../../components/StatusChip';

const PRICE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const UNIT_LABELS = { quintal: 'quintal', kg: 'kg', tonne: 'tonne' };

function titleCase(value) {
  if (!value) return '';
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * FarmerDashboard — stats cards + "my listings" table with status chips and
 * actions (view / edit / retire / relist / mark sold / delete). Phase 02.
 */
export default function FarmerDashboard() {
  const [data, setData] = useState({ items: [], stats: { active: 0, sold: 0, avgPrice: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  // Bumped on retry / after an action to re-run the effect (event-handler
  // triggered — setState in the effect body only happens in promise callbacks).
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getMyListings()
      .then((res) => {
        if (!active) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (active) setError(err.apiError || { code: 'UNKNOWN', message: err.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const refresh = useCallback(() => {
    setLoading(true); // immediate spinner feedback (event handler, not an effect)
    setAttempt((n) => n + 1);
  }, []);

  async function runAction(id, action) {
    setBusyId(id);
    try {
      if (action === 'delete') await deleteListing(id);
      else await updateListing(id, { status: action });
      refresh();
    } catch (err) {
      setError(err.apiError || { code: 'UNKNOWN', message: err.message });
    } finally {
      setBusyId(null);
    }
  }

  const { items, stats } = data;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>My listings</h1>
          <p className="muted">Manage your crop lots on FarmBridge</p>
        </div>
        <Link to="/farmer/listings/new" className="btn btn--primary">
          + Add listing
        </Link>
      </div>

      {error && (
        <div className="alert alert--error" role="alert">
          {error.message}
          <button type="button" className="btn btn--ghost btn--small" onClick={refresh}>
            Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__value">{stats.active}</span>
          <span className="stat-card__label">Active listings</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{stats.sold}</span>
          <span className="stat-card__label">Sold</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{PRICE.format(stats.avgPrice || 0)}</span>
          <span className="stat-card__label">Avg. price / unit</span>
        </div>
      </div>

      {loading ? (
        <div className="card status status--loading">⏳ Loading your listings…</div>
      ) : items.length === 0 ? (
        <div className="card">
          <p>You have no listings yet.</p>
          <Link to="/farmer/listings/new" className="btn btn--primary">
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th className="table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((listing) => (
                <tr key={listing._id}>
                  <td>
                    <strong>{titleCase(listing.crop)}</strong>
                    <span className="muted table__sub">
                      {listing.organic ? '🌱 organic' : 'conventional'} · grade {listing.grade}
                    </span>
                  </td>
                  <td>
                    {listing.quantity.value}{' '}
                    {UNIT_LABELS[listing.quantity.unit] || listing.quantity.unit}
                  </td>
                  <td>
                    {listing.priceType === 'negotiable'
                      ? 'Negotiable'
                      : PRICE.format(listing.pricePerUnit)}
                  </td>
                  <td>
                    <StatusChip status={listing.status} />
                  </td>
                  <td className="table__actions">
                    <Link className="link" to={`/listings/${listing._id}`}>
                      View
                    </Link>
                    <Link className="link" to={`/farmer/listings/${listing._id}/edit`}>
                      Edit
                    </Link>
                    {listing.status !== 'active' ? (
                      <button
                        type="button"
                        className="link"
                        disabled={busyId === listing._id}
                        onClick={() => runAction(listing._id, 'active')}
                      >
                        Relist
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="link"
                          disabled={busyId === listing._id}
                          onClick={() => runAction(listing._id, 'sold')}
                        >
                          Mark sold
                        </button>
                        <button
                          type="button"
                          className="link"
                          disabled={busyId === listing._id}
                          onClick={() => runAction(listing._id, 'draft')}
                        >
                          Retire
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="link link--danger"
                      disabled={busyId === listing._id}
                      onClick={() => runAction(listing._id, 'delete')}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

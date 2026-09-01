import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyListings, updateListing, deleteListing } from '../../services/listings';
import { listFarmerLeads, updateLeadStatus } from '../../services/leads';
import StatusChip from '../../components/StatusChip';

const PRICE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const UNIT_LABELS = { quintal: 'quintal', kg: 'kg', tonne: 'tonne' };

const LEAD_STATUSES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['converted', 'Converted'],
  ['dropped', 'Dropped'],
];

function titleCase(value) {
  if (!value) return '';
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function statusLabel(status) {
  return LEAD_STATUSES.find(([v]) => v === status)?.[1] || status;
}

/**
 * FarmerDashboard — stats cards + "my listings" table with status chips and
 * actions (Phase 02), extended with a Phase 03 "Enquiries" tab (lead inbox
 * with status actions).
 */
export default function FarmerDashboard() {
  const [tab, setTab] = useState('listings');
  const [data, setData] = useState({ items: [], stats: { active: 0, sold: 0, avgPrice: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Enquiries (Phase 03)
  const [leads, setLeads] = useState({ items: [], total: 0 });
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState(null);
  const [busyLead, setBusyLead] = useState(null);

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

  useEffect(() => {
    let active = true;
    listFarmerLeads()
      .then((res) => {
        if (!active) return;
        setLeads(res);
        setLeadsError(null);
        setLeadsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLeadsError(err.apiError || { code: 'UNKNOWN', message: err.message });
        setLeadsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const refresh = useCallback(() => {
    setLoading(true);
    setLeadsLoading(true);
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

  async function onLeadAction(id, status) {
    setBusyLead(id);
    try {
      await updateLeadStatus(id, status);
      refresh();
    } catch (err) {
      setLeadsError(err.apiError || { code: 'UNKNOWN', message: err.message });
    } finally {
      setBusyLead(null);
    }
  }

  const { items, stats } = data;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Farmer dashboard</h1>
          <p className="muted">Manage your crop lots and buyer enquiries</p>
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

      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'listings' ? 'is-active' : ''}`}
          onClick={() => setTab('listings')}
        >
          My listings ({items.length})
        </button>
        <button
          type="button"
          className={`tab ${tab === 'enquiries' ? 'is-active' : ''}`}
          onClick={() => setTab('enquiries')}
        >
          Enquiries ({leads.total})
        </button>
      </div>

      {tab === 'listings' && (
        <>
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
        </>
      )}

      {tab === 'enquiries' && (
        <div className="card">
          <h2>Enquiries (RFQs)</h2>
          {leadsError && (
            <div className="alert alert--error" role="alert">
              {leadsError.message}
            </div>
          )}
          {leadsLoading ? (
            <div className="status status--loading">⏳ Loading enquiries…</div>
          ) : leads.items.length === 0 ? (
            <p className="muted">
              No enquiries yet. When a buyer shows interest in one of your lots it appears here.
            </p>
          ) : (
            <div className="card-list">
              {leads.items.map((lead) => (
                <div className="card-list__item" key={lead._id}>
                  <div>
                    <strong>{titleCase(lead.listing?.crop || 'Listing')}</strong>
                    <span className="muted"> · {lead.buyer?.name || 'Buyer'}</span>
                    <p className="muted">
                      wants {lead.quantityWanted}{' '}
                      {UNIT_LABELS[lead.quantityUnit] || lead.quantityUnit}
                      {lead.priceOffered != null
                        ? ` · offered ${PRICE.format(lead.priceOffered)}`
                        : ''}
                    </p>
                    <p className="muted">{lead.message}</p>
                  </div>
                  <div className="card-list__meta">
                    <span className={`chip chip--${lead.status}`}>{statusLabel(lead.status)}</span>
                    <select
                      className="input input--small"
                      value={lead.status}
                      disabled={busyLead === lead._id}
                      onChange={(e) => onLeadAction(lead._id, e.target.value)}
                    >
                      {LEAD_STATUSES.map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

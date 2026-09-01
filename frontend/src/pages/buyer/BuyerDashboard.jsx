import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listWatchlist, removeFromWatchlist } from '../../services/watchlist';
import {
  listSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
} from '../../services/savedSearches';
import { listMyLeads, updateLeadStatus } from '../../services/leads';
import { assetUrl } from '../../utils/assetUrl';

const UNIT_LABELS = { quintal: 'quintal', kg: 'kg', tonne: 'tonne' };
const PRICE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

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
 * BuyerDashboard — watchlist grid, saved searches and my enquiries (Phase 03).
 * Each tab handles loading / empty / error states (RULES.md §5).
 */
export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('enquiries');

  // Watchlist
  const [watch, setWatch] = useState({ items: [], total: 0 });
  const [watchLoading, setWatchLoading] = useState(true);
  const [watchError, setWatchError] = useState(null);
  const [busyWatch, setBusyWatch] = useState(null);

  // Saved searches
  const [saved, setSaved] = useState({ items: [], total: 0 });
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState(null);

  // Enquiries
  const [leads, setLeads] = useState({ items: [], total: 0 });
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState(null);
  const [busyLead, setBusyLead] = useState(null);

  // Load the three data sets. `loadAll` never sets loading=true synchronously;
  // the effect and event handlers control the spinner themselves.
  const loadAll = useCallback(async () => {
    const [w, s, l] = await Promise.all([listWatchlist(), listSavedSearches(), listMyLeads()]);
    setWatch(w);
    setSaved(s);
    setLeads(l);
    setWatchError(null);
    setSavedError(null);
    setLeadsError(null);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([listWatchlist(), listSavedSearches(), listMyLeads()])
      .then(([w, s, l]) => {
        if (!active) return;
        setWatch(w);
        setSaved(s);
        setLeads(l);
        setWatchError(null);
        setSavedError(null);
        setLeadsError(null);
      })
      .catch((err) => {
        if (!active) return;
        const e = err.apiError || { code: 'UNKNOWN', message: err.message };
        setWatchError(e);
        setSavedError(e);
        setLeadsError(e);
      })
      .finally(() => {
        if (!active) return;
        setWatchLoading(false);
        setSavedLoading(false);
        setLeadsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Event-handler refresh: show the spinner, then re-fetch.
  const refresh = useCallback(async () => {
    setWatchLoading(true);
    setSavedLoading(true);
    setLeadsLoading(true);
    await loadAll().catch((err) => {
      const e = err.apiError || { code: 'UNKNOWN', message: err.message };
      setWatchError(e);
      setSavedError(e);
      setLeadsError(e);
    });
    setWatchLoading(false);
    setSavedLoading(false);
    setLeadsLoading(false);
  }, [loadAll]);

  async function onRemoveWatch(id) {
    setBusyWatch(id);
    try {
      await removeFromWatchlist(id);
      refresh();
    } catch (err) {
      setWatchError(err.apiError || { code: 'UNKNOWN', message: err.message });
    } finally {
      setBusyWatch(null);
    }
  }

  async function onDeleteSaved(id) {
    try {
      await deleteSavedSearch(id);
      refresh();
    } catch (err) {
      setSavedError(err.apiError || { code: 'UNKNOWN', message: err.message });
    }
  }

  async function onRecreateSaved(query) {
    navigate(`/catalog?${new URLSearchParams(query).toString()}`);
  }

  async function onUpdateLead(id, status) {
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

  async function onSaveCurrent() {
    // Quick "save a search" from an empty form — saves a sensible default.
    try {
      await createSavedSearch({ sort: 'newest' });
      refresh();
    } catch (err) {
      setSavedError(err.apiError || { code: 'UNKNOWN', message: err.message });
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Buyer dashboard</h1>
          <p className="muted">Your enquiries, watchlist and saved searches</p>
        </div>
        <Link to="/catalog" className="btn btn--primary">
          Browse marketplace
        </Link>
      </div>

      <div className="tabs">
        {[
          ['enquiries', `Enquiries (${leads.total})`],
          ['watchlist', `Watchlist (${watch.total})`],
          ['saved', `Saved searches (${saved.total})`],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab ${tab === key ? 'is-active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'enquiries' && (
        <div className="card">
          <h2>My enquiries (RFQs)</h2>
          {leadsLoading ? (
            <div className="status status--loading">⏳ Loading enquiries…</div>
          ) : leadsError ? (
            <div className="alert alert--error">{leadsError.message}</div>
          ) : leads.items.length === 0 ? (
            <p className="muted">
              You haven't sent any enquiries yet. Browse the marketplace and use “Send enquiry” on a
              listing.
            </p>
          ) : (
            <div className="card-list">
              {leads.items.map((lead) => (
                <div className="card-list__item" key={lead._id}>
                  <div>
                    <Link className="link" to={`/listings/${lead.listingId}`}>
                      {titleCase(lead.listing?.crop || 'Listing')}
                    </Link>
                    <span className="muted">
                      {' '}
                      · {lead.quantityWanted} {UNIT_LABELS[lead.quantityUnit] || lead.quantityUnit}
                      {lead.priceOffered != null
                        ? ` · offered ${PRICE.format(lead.priceOffered)}`
                        : ''}
                    </span>
                    <p className="muted">{lead.message}</p>
                  </div>
                  <div className="card-list__meta">
                    <span className={`chip chip--${lead.status}`}>{statusLabel(lead.status)}</span>
                    {lead.status === 'new' && (
                      <select
                        className="input input--small"
                        value=""
                        disabled={busyLead === lead._id}
                        onChange={(e) => e.target.value && onUpdateLead(lead._id, e.target.value)}
                      >
                        <option value="" disabled>
                          Withdraw…
                        </option>
                        <option value="dropped">Withdraw enquiry</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'watchlist' && (
        <div className="card">
          <div className="page-head">
            <h2>Watchlist</h2>
          </div>
          {watchLoading ? (
            <div className="status status--loading">⏳ Loading watchlist…</div>
          ) : watchError ? (
            <div className="alert alert--error">{watchError.message}</div>
          ) : watch.items.length === 0 ? (
            <p className="muted">
              Your watchlist is empty. Tap ⇄ on any lot in the marketplace to add it.
            </p>
          ) : (
            <div className="watch-grid">
              {watch.items.map((entry) => {
                const listing = entry.listing;
                return (
                  <div className="watch-card" key={entry._id}>
                    {listing?.images?.[0] ? (
                      <img src={assetUrl(listing.images[0])} alt="" />
                    ) : (
                      <div className="watch-card__placeholder">🌾</div>
                    )}
                    <div className="watch-card__body">
                      <Link className="link" to={`/listings/${listing?._id}`}>
                        {titleCase(listing?.crop || 'Listing')}
                      </Link>
                      <p className="muted">
                        {listing
                          ? `${PRICE.format(listing.pricePerUnit)} / ${UNIT_LABELS[listing.quantity.unit] || listing.quantity.unit} · ${listing.location?.district || '—'}`
                          : 'No longer available'}
                      </p>
                      {entry.note && <p className="muted">{entry.note}</p>}
                      <button
                        type="button"
                        className="link link--danger"
                        disabled={busyWatch === entry._id}
                        onClick={() => onRemoveWatch(listing?._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div className="card">
          <div className="page-head">
            <h2>Saved searches</h2>
            <button type="button" className="btn btn--ghost btn--small" onClick={onSaveCurrent}>
              + Save current
            </button>
          </div>
          {savedLoading ? (
            <div className="status status--loading">⏳ Loading saved searches…</div>
          ) : savedError ? (
            <div className="alert alert--error">{savedError.message}</div>
          ) : saved.items.length === 0 ? (
            <p className="muted">
              No saved searches. Search in the marketplace and tap “♡ Save search”.
            </p>
          ) : (
            <div className="card-list">
              {saved.items.map((search) => (
                <div className="card-list__item" key={search._id}>
                  <div>
                    <code>{new URLSearchParams(search.query).toString() || 'All lots'}</code>
                    {search.alertsEnabled && <span className="chip chip--active">🔔 alerts</span>}
                  </div>
                  <div className="card-list__meta">
                    <button
                      type="button"
                      className="link"
                      onClick={() => onRecreateSaved(search.query)}
                    >
                      Run
                    </button>
                    <button
                      type="button"
                      className="link link--danger"
                      onClick={() => onDeleteSaved(search._id)}
                    >
                      Delete
                    </button>
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

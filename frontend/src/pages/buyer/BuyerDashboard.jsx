import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWatchlist, removeFromWatchlist, getBuyerLeads, getSavedSearches, deleteSavedSearch } from '../../services/buyer';
import { assetUrl } from '../../utils/assetUrl';

export default function BuyerDashboard() {
  const [tab, setTab] = useState('watchlist');
  const [watchlist, setWatchlist] = useState([]);
  const [leads, setLeads] = useState([]);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetcher =
      tab === 'watchlist' ? getWatchlist({ page: 1, limit: 50 }) :
      tab === 'enquiries' ? getBuyerLeads({ page: 1, limit: 50 }) :
      getSavedSearches({ page: 1, limit: 50 });

    fetcher
      .then((data) => {
        if (tab === 'watchlist') setWatchlist(data.items || []);
        else if (tab === 'enquiries') setLeads(data.items || []);
        else setSearches(data.items || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tab]);

  async function handleRemoveWatchlist(id) {
    try {
      await removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteSearch(id) {
    try {
      await deleteSavedSearch(id);
      setSearches((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dashboard-page">
      <h1>🛒 Buyer Dashboard</h1>
      <div className="tabs">
        <button className={tab === 'watchlist' ? 'active' : ''} onClick={() => setTab('watchlist')}>
          ❤️ Watchlist ({watchlist.length})
        </button>
        <button className={tab === 'enquiries' ? 'active' : ''} onClick={() => setTab('enquiries')}>
          📨 My Enquiries ({leads.length})
        </button>
        <button className={tab === 'searches' ? 'active' : ''} onClick={() => setTab('searches')}>
          🔖 Saved Searches ({searches.length})
        </button>
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error">Error: {error}</p>}

      {tab === 'watchlist' && !loading && (
        <div className="listing-grid">
          {watchlist.map((w) => (
            <div key={w._id} className="listing-card">
              {w.listing?.images?.[0] && (
                <img src={assetUrl(w.listing.images[0])} alt={w.listing.crop} className="listing-card__img" />
              )}
              <div className="listing-card__body">
                <h3>{w.listing?.crop || 'Listing'}</h3>
                <p>₹{w.listing?.pricePerUnit}/{w.listing?.quantity?.unit}</p>
                <p>📍 {w.listing?.location?.district}</p>
                <div className="card-actions">
                  <Link to={`/listings/${w.listing?._id}`} className="btn btn--small">View</Link>
                  <button className="btn btn--ghost btn--small" onClick={() => handleRemoveWatchlist(w._id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
          {watchlist.length === 0 && <p>No watchlist items yet.</p>}
        </div>
      )}

      {tab === 'enquiries' && !loading && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Crop</th><th>Message</th><th>Qty Wanted</th><th>Price Offered</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.listingId?.crop || '—'}</td>
                  <td>{lead.message?.slice(0, 60)}{lead.message?.length > 60 ? '…' : ''}</td>
                  <td>{lead.quantityWanted ? `${lead.quantityWanted.value} ${lead.quantityWanted.unit}` : '—'}</td>
                  <td>{lead.priceOffered ? `₹${lead.priceOffered}` : '—'}</td>
                  <td><span className={`status-chip status-chip--${lead.status}`}>{lead.status}</span></td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && <p>No enquiries sent yet.</p>}
        </div>
      )}

      {tab === 'searches' && !loading && (
        <div className="search-list">
          {searches.map((s) => (
            <div key={s._id} className="saved-search-item">
              <strong>{s.name || 'Unnamed search'}</strong>
              <span>{Object.entries(s.query).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>
              <span>Alerts: {s.alertsEnabled ? '✅' : '❌'}</span>
              <button className="btn btn--ghost btn--small" onClick={() => handleDeleteSearch(s._id)}>Delete</button>
            </div>
          ))}
          {searches.length === 0 && <p>No saved searches.</p>}
        </div>
      )}
    </div>
  );
}

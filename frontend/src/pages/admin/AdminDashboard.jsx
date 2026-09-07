import { useState, useEffect } from 'react';
import { getAdminOverview, adminListUsers, adminBlockUser, adminUnblockUser, adminGetDisputes, adminResolveDispute } from '../../services/admin';

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (tab === 'overview') {
      getAdminOverview().then(setOverview).catch((e) => setError(e.message)).finally(() => setLoading(false));
    } else if (tab === 'users') {
      adminListUsers({ page: 1, limit: 50 }).then((d) => setUsers(d.users || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
    } else if (tab === 'disputes') {
      adminGetDisputes({ page: 1, limit: 50 }).then((d) => setDisputes(d.items || [])).catch((e) => setError(e.message)).finally(() => setLoading(false));
    }
  }, [tab]);

  async function handleBlock(userId) {
    try {
      await adminBlockUser(userId);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: 'blocked' } : u)));
    } catch (err) { alert(err.message); }
  }

  async function handleUnblock(userId) {
    try {
      await adminUnblockUser(userId);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: 'active' } : u)));
    } catch (err) { alert(err.message); }
  }

  async function handleResolve(orderId) {
    const resolution = prompt('Resolution (refund/cancel/complete):');
    if (!resolution) return;
    const note = prompt('Note:') || '';
    try {
      await adminResolveDispute(orderId, { resolution, note });
      const d = await adminGetDisputes({ page: 1, limit: 50 });
      setDisputes(d.items || []);
    } catch (err) { alert(err.message); }
  }

  return (
    <div className="admin-page">
      <h1>🛡️ Admin Console</h1>
      <div className="tabs">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>📊 Overview</button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>👥 Users</button>
        <button className={tab === 'disputes' ? 'active' : ''} onClick={() => setTab('disputes')}>⚠️ Disputes</button>
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error">Error: {error}</p>}

      {tab === 'overview' && overview && (
        <div className="admin-overview">
          <div className="stat-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{overview.users.total}</p>
              <small>
                {Object.entries(overview.users.byRole).map(([r, c]) => `${r}: ${c}`).join(' · ')}
              </small>
            </div>
            <div className="stat-card">
              <h3>GMV</h3>
              <p className="stat-value">₹{overview.orders.gmv?.toLocaleString()}</p>
              <small>{overview.orders.total} total orders</small>
            </div>
            <div className="stat-card">
              <h3>Active Listings</h3>
              <p className="stat-value">{overview.listings.active || 0}</p>
              <small>Sold: {overview.listings.sold || 0}</small>
            </div>
            <div className="stat-card">
              <h3>Dispute Rate</h3>
              <p className="stat-value">{overview.disputeRate}%</p>
            </div>
          </div>
          <h3>Top Districts</h3>
          <div className="district-list">
            {overview.topDistricts?.map((d, i) => (
              <span key={i} className="avg-chip">{d.district}: {d.count}</span>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && !loading && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.phone}</td>
                  <td><span className={`role-badge role-badge--${u.role}`}>{u.role}</span></td>
                  <td>{u.status}</td>
                  <td>
                    {u.status === 'active' ? (
                      <button className="btn btn--ghost btn--small" onClick={() => handleBlock(u._id)}>Block</button>
                    ) : (
                      <button className="btn btn--primary btn--small" onClick={() => handleUnblock(u._id)}>Unblock</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p>No users found.</p>}
        </div>
      )}

      {tab === 'disputes' && !loading && (
        <div className="disputes-list">
          {disputes.map((d) => (
            <div key={d._id} className="order-card">
              <p><strong>Order:</strong> #{d._id.slice(-6)}</p>
              <p><strong>Farmer:</strong> {d.farmerId?.name} — <strong>Buyer:</strong> {d.buyerId?.name}</p>
              <p><strong>Crop:</strong> {d.listingId?.crop} — <strong>Total:</strong> ₹{d.total}</p>
              <button className="btn btn--primary btn--small" onClick={() => handleResolve(d._id)}>Resolve</button>
            </div>
          ))}
          {disputes.length === 0 && <p>No active disputes.</p>}
        </div>
      )}
    </div>
  );
}

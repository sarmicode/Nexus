import { useState, useEffect } from 'react';
import { getFarmerAnalytics } from '../../services/admin';

export default function FarmerAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFarmerAnalytics()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading analytics…</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!data) return null;

  return (
    <div className="analytics-page">
      <h1>📊 Farmer Analytics</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <h3>Total Listings</h3>
          <p className="stat-value">{data.listings.total}</p>
        </div>
        <div className="stat-card">
          <h3>Active</h3>
          <p className="stat-value">{data.listings.active}</p>
        </div>
        <div className="stat-card">
          <h3>Sold</h3>
          <p className="stat-value">{data.listings.sold}</p>
        </div>
        <div className="stat-card">
          <h3>Avg Price</h3>
          <p className="stat-value">₹{data.listings.avgPrice}</p>
        </div>
      </div>
      <h3>Orders</h3>
      <div className="stat-grid">
        {Object.entries(data.orders).filter(([k]) => k !== 'totalRevenue').map(([status, count]) => (
          <div key={status} className="stat-card">
            <h3>{status}</h3>
            <p className="stat-value">{count}</p>
          </div>
        ))}
        <div className="stat-card">
          <h3>Order Revenue</h3>
          <p className="stat-value">₹{data.orders.totalRevenue?.toLocaleString()}</p>
        </div>
      </div>
      <h3>Enquiry Funnel</h3>
      <div className="stat-grid">
        {Object.entries(data.leads).map(([status, count]) => (
          <div key={status} className="stat-card">
            <h3>{status}</h3>
            <p className="stat-value">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

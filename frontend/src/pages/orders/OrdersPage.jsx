import { useState, useEffect } from 'react';
import { getMyOrders, confirmOrder, dispatchOrder, deliverOrder, cancelOrder } from '../../services/orders';

const STATUS_COLORS = {
  created: '#2196f3',
  confirmed: '#ff9800',
  dispatched: '#9c27b0',
  delivered: '#4caf50',
  completed: '#388e3c',
  cancelled: '#f44336',
  disputed: '#e91e63',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('all');

  useEffect(() => {
    setLoading(true);
    getMyOrders({ page: 1, limit: 50, role })
      .then((data) => setOrders(data.items || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [role]);

  async function handleAction(id, action, fn) {
    const note = prompt(`Note for ${action} (optional):`) || '';
    try {
      await fn(id, note);
      const data = await getMyOrders({ page: 1, limit: 50, role });
      setOrders(data.items || []);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="orders-page">
      <h1>📦 My Orders</h1>
      <div className="tabs">
        <button className={role === 'all' ? 'active' : ''} onClick={() => setRole('all')}>All</button>
        <button className={role === 'farmer' ? 'active' : ''} onClick={() => setRole('farmer')}>As Farmer</button>
        <button className={role === 'buyer' ? 'active' : ''} onClick={() => setRole('buyer')}>As Buyer</button>
      </div>

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card__header">
              <span className="order-id">#{order._id.slice(-6)}</span>
              <span className="order-status" style={{ background: STATUS_COLORS[order.status] || '#999', color: '#fff', padding: '2px 8px', borderRadius: '4px' }}>
                {order.status}
              </span>
            </div>
            <div className="order-card__body">
              <p><strong>Crop:</strong> {order.listingId?.crop || '—'}</p>
              <p><strong>Quantity:</strong> {order.quantity?.value} {order.quantity?.unit}</p>
              <p><strong>Price:</strong> ₹{order.pricePerUnit}/{order.quantity?.unit}</p>
              <p><strong>Total:</strong> ₹{order.total}</p>
              <p><strong>Payment:</strong> {order.payment?.provider} — {order.payment?.status}</p>
              <p><strong>Farmer:</strong> {order.farmerId?.name} ({order.farmerId?.phone})</p>
              <p><strong>Buyer:</strong> {order.buyerId?.name} ({order.buyerId?.phone})</p>
            </div>
            <div className="order-card__timeline">
              {order.timeline?.map((t, i) => (
                <div key={i} className="timeline-entry">
                  <span className="timeline-dot" style={{ background: STATUS_COLORS[t.status] || '#999' }} />
                  <span>{t.status} — {new Date(t.at).toLocaleString()} {t.note && `(${t.note})`}</span>
                </div>
              ))}
            </div>
            <div className="order-card__actions">
              {order.status === 'created' && (
                <>
                  <button className="btn btn--primary btn--small" onClick={() => handleAction(order._id, 'confirm', confirmOrder)}>Confirm</button>
                  <button className="btn btn--ghost btn--small" onClick={() => handleAction(order._id, 'cancel', cancelOrder)}>Cancel</button>
                </>
              )}
              {order.status === 'confirmed' && (
                <>
                  <button className="btn btn--primary btn--small" onClick={() => handleAction(order._id, 'dispatch', dispatchOrder)}>Dispatch</button>
                  <button className="btn btn--ghost btn--small" onClick={() => handleAction(order._id, 'cancel', cancelOrder)}>Cancel</button>
                </>
              )}
              {order.status === 'dispatched' && (
                <button className="btn btn--primary btn--small" onClick={() => handleAction(order._id, 'deliver', deliverOrder)}>Confirm Delivery</button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && !loading && <p>No orders yet.</p>}
      </div>
    </div>
  );
}

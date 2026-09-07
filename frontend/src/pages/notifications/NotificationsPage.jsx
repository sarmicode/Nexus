import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/orders';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const data = await getNotifications({ page: 1, limit: 100 });
      setNotifications(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="notifications-page">
      <h1>🔔 Notifications {unreadCount > 0 && <span className="badge">{unreadCount} unread</span>}</h1>
      {unreadCount > 0 && (
        <button className="btn btn--ghost" onClick={handleMarkAllRead}>Mark all as read</button>
      )}

      {loading && <p className="loading">Loading…</p>}
      {error && <p className="error">Error: {error}</p>}

      <div className="notification-list">
        {notifications.map((n) => (
          <div key={n._id} className={`notification-item ${n.read ? '' : 'unread'}`} onClick={() => !n.read && handleMarkRead(n._id)}>
            <div className="notification-item__header">
              <strong>{n.title}</strong>
              <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            <p>{n.body}</p>
            <span className="notification-type">{n.type.replace(/_/g, ' ')}</span>
          </div>
        ))}
        {notifications.length === 0 && !loading && <p>No notifications yet.</p>}
      </div>
    </div>
  );
}

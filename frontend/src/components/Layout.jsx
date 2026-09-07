import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';

export default function Layout() {
  const { isAuthed, initializing, logout } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">🌾</span>
          <span className="navbar__name">FarmBridge</span>
          <span className="navbar__tag">farmer–buyer marketplace</span>
        </div>

        <nav className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/catalog" className={({ isActive }) => (isActive ? 'active' : '')}>Catalog</NavLink>
          <NavLink to="/market" className={({ isActive }) => (isActive ? 'active' : '')}>Market Prices</NavLink>
          <NavLink to="/map" className={({ isActive }) => (isActive ? 'active' : '')}>Map</NavLink>

          {isAuthed && (
            <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>Profile</NavLink>
          )}

          {isAuthed && user?.role === 'farmer' && (
            <>
              <NavLink to="/farmer" className={({ isActive }) => (isActive ? 'active' : '')}>My Listings</NavLink>
              <NavLink to="/farmer/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>Analytics</NavLink>
              <NavLink to="/farmer/listings/new" className={({ isActive }) => (isActive ? 'active' : '')}>Add Listing</NavLink>
            </>
          )}

          {isAuthed && user?.role === 'buyer' && (
            <NavLink to="/buyer" className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
          )}

          {isAuthed && (
            <>
              <NavLink to="/orders" className={({ isActive }) => (isActive ? 'active' : '')}>Orders</NavLink>
              <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : '')}>🔔</NavLink>
            </>
          )}

          {isAuthed && user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>Admin</NavLink>
          )}

          {initializing ? null : isAuthed ? (
            <button type="button" className="btn btn--ghost btn--small" onClick={onLogout}>Logout</button>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>Login</NavLink>
              <NavLink to="/register" className="btn btn--primary btn--small">Register</NavLink>
            </>
          )}

          {isAuthed && user && (
            <span className={`role-badge role-badge--${user.role}`} title={`Signed in as ${user.phone}`}>
              {user.role}
            </span>
          )}
        </nav>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        FarmBridge · SIH 2026 (SIH26132) · direct market linkages &amp; price discovery
      </footer>
    </div>
  );
}

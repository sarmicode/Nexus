import { NavLink, Outlet } from 'react-router-dom';

/**
 * Placeholder layout (Phase 00): navbar + outlet.
 * Phase 01 adds Auth links, Phase 02/03 the dashboards.
 */
export default function Layout() {
  return (
    <div className="layout">
      <header className="navbar">
        <div className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            🌾
          </span>
          <span className="navbar__name">FarmBridge</span>
          <span className="navbar__tag">farmer–buyer marketplace</span>
        </div>
        <nav className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
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

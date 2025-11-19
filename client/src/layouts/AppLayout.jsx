// client/src/layouts/AppLayout.jsx
import { Link, Outlet, useLocation } from "react-router-dom";

function AppLayout() {
  const location = useLocation();

  const isBuilder = location.pathname.startsWith("/builder");

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-logo">
            Bharat Resume Builder
          </Link>
          <nav className="app-nav">
            <Link to="/templates">Templates</Link>
            <Link to="/builder">Build resume</Link>
          </nav>
          {!isBuilder && (
            <Link to="/builder" className="btn-primary btn-small">
              Start free
            </Link>
          )}
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>© {new Date().getFullYear()} Bharat Resume Builder</span>
          <span>ATS‑friendly layouts · Job‑aware questions · PDF & QR profile</span>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;

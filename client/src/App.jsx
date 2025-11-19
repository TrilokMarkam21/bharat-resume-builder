import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import TemplateGallery from "./pages/TemplateGallery.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./hooks/useTheme.js";

function App() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const linkClass = ({ isActive }) =>
    "nav-link" + (isActive ? " nav-link-active" : "");

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div>
            <div className="brand-title">Bharat Resume Builder</div>
            <div className="brand-sub">
              Universal Resume Builder for Bharat Workforce
            </div>
          </div>

          <nav className="nav-links">
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
            <NavLink to="/templates" className={linkClass}>
              Templates
            </NavLink>
            <NavLink to="/builder" className={linkClass}>
              Create Resume
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </nav>

          <div
            style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
          >
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-ghost btn-small"
            >
              {theme === "dark" ? "Dark" : "Light"}
            </button>

            {user ? (
              <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                {user.email}
              </span>
            ) : (
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="page-container">
        <Routes>
          {/* Root: if not logged in, go to /login first */}
          <Route
            path="/"
            element={
              user ? <Home /> : <Navigate to="/login" replace />
            }
          />

          {/* Login: if already logged in, skip to dashboard */}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />

          {/* Public profile from QR can stay public */}
          <Route path="/profile/:resumeId" element={<ProfilePage />} />

          {/* All builder tools behind auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="/builder" element={<ResumeBuilder />} />
            <Route path="/templates" element={<TemplateGallery />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <span className="footer-text">
            Built for multi‑modal resumes across Bharat&apos;s workforce.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;

// client/src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="card-elevated" style={{ marginTop: "1rem" }}>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
        Logged in as {user?.email || "guest"}.
      </p>

      <div style={{ marginTop: "0.8rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <Link to="/builder" className="btn-primary">
          Create new resume
        </Link>
        <Link to="/templates" className="btn-ghost">
          Choose template
        </Link>
      </div>

      <button
        onClick={logout}
        style={{
          marginTop: "0.9rem",
          fontSize: "0.8rem",
          borderRadius: "999px",
          padding: "0.3rem 0.8rem",
          border: "1px solid #4b5563",
          background: "transparent",
          color: "#e5e7eb",
          cursor: "pointer",
        }}
      >
        Log out
      </button>
    </div>
  );
}

export default Dashboard;

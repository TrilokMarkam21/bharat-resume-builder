// client/src/pages/Login.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email to continue.");
      return;
    }

    try {
      await login({ email });
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="card-elevated" style={{ maxWidth: 420, margin: "1.5rem auto" }}>
      <h2 style={{ marginTop: 0 }}>Login</h2>
      <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
        Log in to see your saved resumes and profiles.
      </p>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.8rem" }}
      >
        <label>
          Work email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        {error && (
          <p style={{ color: "salmon", fontSize: "0.8rem", margin: 0 }}>{error}</p>
        )}

        <button type="submit" className="btn-primary">
          Continue
        </button>
      </form>
    </div>
  );
}

export default Login;

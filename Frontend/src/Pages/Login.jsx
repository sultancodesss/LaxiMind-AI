import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://laximind-ai.onrender.com"
).replace(/\/$/, "");

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Cannot connect to server. Make sure the backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-section">
      <div className="auth-container feedback-container">
        <h2>Welcome Back</h2>
        <p>Login to continue to LaxiMind AI</p>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#fca5a5",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form className="auth-form feedback-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="auth-links mt-4 text-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/get-started"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Get Started
            </Link>
          </p>
        </div>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link
            to="/"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;

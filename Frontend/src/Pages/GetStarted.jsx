import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://pghero-dpg-d8kecai8qa3s738016sg-a.onrender.com"
).replace(/\/$/, "");

function GetStarted() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto-login after registration
      login(data.token, data.user);
      setSuccess("Account created! Redirecting to your dashboard...");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError("Cannot connect to server. Make sure the backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-section">
      <div className="auth-container feedback-container">
        <h2>Create your LaxiMind AI account</h2>
        <p>Start your journey with LaxiMind AI</p>

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

        {success && (
          <div
            style={{
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              color: "#86efac",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "0.9rem",
            }}
          >
            ✅ {success}
          </div>
        )}

        <form className="auth-form feedback-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
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
              placeholder="Create a password (min 6 chars)"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-links mt-4 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300">
              Login here
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

export default GetStarted;

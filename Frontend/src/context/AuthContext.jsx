import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://laximind-ai.onrender.com"
).replace(/\/$/, "");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify stored token and hydrate user state
  useEffect(() => {
    const token = localStorage.getItem("laximind_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          // Token invalid — clear it
          localStorage.removeItem("laximind_token");
        }
      })
      .catch(() => localStorage.removeItem("laximind_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("laximind_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("laximind_token");
    setUser(null);
  };

  const getToken = () => localStorage.getItem("laximind_token");

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

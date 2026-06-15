import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import Upload from './Upload';
import Live from './Live';
import Translation from './Translation';
import Ai from './Ai';
import Reports from './Reports';
import Setting from './Setting';
import Profile from './Profile';
import { ShieldCheck, ShieldAlert, Sparkles, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://laximind-ai.onrender.com"
).replace(/\/$/, "");

function Dashboard() {
  const [keyConnected, setKeyConnected] = useState(false);
  const { user } = useAuth();

  // Check API key connectivity status to display in top panel header
  useEffect(() => {
    const checkKey = () => {
      const savedKey = localStorage.getItem('leximind_openai_api_key');
      setKeyConnected(!!savedKey && savedKey.length > 20);
    };

    checkKey();
    // Poll for changes in case user updates settings
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-layout-container">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Content Area */}
      <main className="dashboard-main-content">
        {/* Top Header Indicator Bar */}
        <header className="dashboard-top-bar">
          <div className="top-bar-welcome">
            <Sparkles size={16} className="text-purple-400" />
            <span>Workspace: <strong>LexiMind Main</strong></span>
          </div>

          <div className="top-bar-actions">
            {keyConnected ? (
              <div className="status-badge connected">
                <ShieldCheck size={14} />
                <span>OpenAI Connected</span>
              </div>
            ) : (
              <Link to="/dashboard/setting" className="status-badge disconnected">
                <ShieldAlert size={14} />
                <span>Key Required (Set in Settings)</span>
              </Link>
            )}

            <Link to="/dashboard/profile" className="user-profile-badge" style={{ textDecoration: 'none' }}>
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url.startsWith('http') ? user.avatar_url : `${API_URL}${user.avatar_url}`} 
                  alt="Avatar" 
                  className="profile-avatar-img" 
                  style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <span className="profile-initials">{user?.name ? user.name.substring(0, 2).toUpperCase() : "LM"}</span>
              )}
              <span className="profile-name">{user?.name || "Lexi User"}</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <div className="dashboard-workspace-body">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="upload" element={<Upload />} />
            <Route path="live" element={<Live />} />
            <Route path="translation" element={<Translation />} />
            <Route path="ai" element={<Ai />} />
            <Route path="reports" element={<Reports />} />
            <Route path="setting" element={<Setting />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
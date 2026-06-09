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
import { ShieldCheck, ShieldAlert, Sparkles, Key } from 'lucide-react';

function Dashboard() {
  const [keyConnected, setKeyConnected] = useState(false);

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

            <div className="user-profile-badge">
              <span className="profile-initials">LM</span>
              <span className="profile-name">Lexi User</span>
            </div>
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
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
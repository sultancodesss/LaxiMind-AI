import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  Mic, 
  Languages, 
  Sparkles, 
  History, 
  Settings,
  User,
  ArrowLeft
} from 'lucide-react';

function Sidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <h3>LexiMind AI</h3>
        <span className="brand-badge">PRO</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          end 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </NavLink>

        <NavLink 
          to="/dashboard/upload" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Upload size={20} />
          <span>Upload Audio</span>
        </NavLink>

        <NavLink 
          to="/dashboard/live" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Mic size={20} />
          <span>Live Recording</span>
        </NavLink>

        <NavLink 
          to="/dashboard/translation" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Languages size={20} />
          <span>Translation</span>
        </NavLink>

        <NavLink 
          to="/dashboard/ai" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Sparkles size={20} />
          <span>AI Summarizer</span>
        </NavLink>

        <NavLink 
          to="/dashboard/reports" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <History size={20} />
          <span>Reports & History</span>
        </NavLink>

        <NavLink 
          to="/dashboard/setting" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        <NavLink 
          to="/dashboard/profile" 
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="sidebar-nav-item exit-link">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;

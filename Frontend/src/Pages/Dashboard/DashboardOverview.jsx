import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileAudio, 
  Mic, 
  Languages, 
  Sparkles, 
  ArrowRight, 
  History,
  TrendingUp,
  FolderOpen
} from 'lucide-react';

function DashboardOverview() {
  const [stats, setStats] = useState({
    total: 0,
    transcribe: 0,
    translate: 0,
    summarize: 0
  });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    const reportsStr = localStorage.getItem('leximind_reports') || '[]';
    try {
      const reports = JSON.parse(reportsStr);
      
      const transcriptionCount = reports.filter(r => r.type === 'transcribe' || r.type === 'transcription').length;
      const translationCount = reports.filter(r => r.type === 'translation').length;
      const summaryCount = reports.filter(r => r.type === 'summarize' || r.type === 'summary').length;

      setStats({
        total: reports.length,
        transcribe: transcriptionCount,
        translate: translationCount,
        summarize: summaryCount
      });

      setRecentReports(reports.slice(0, 3));
    } catch (e) {
      console.error('Error parsing reports', e);
    }
  }, []);

  const getReportIcon = (type) => {
    switch (type) {
      case 'transcribe':
      case 'transcription':
        return <FileAudio className="text-cyan-400" size={18} />;
      case 'live':
      case 'live_recording':
        return <Mic className="text-red-400" size={18} />;
      case 'translation':
        return <Languages className="text-purple-400" size={18} />;
      case 'summarize':
      case 'summary':
        return <Sparkles className="text-amber-400" size={18} />;
      default:
        return <FolderOpen className="text-blue-400" size={18} />;
    }
  };

  return (
    <div className="dashboard-view-container">
      {/* Welcome Card */}
      <div className="welcome-banner-card">
        <div className="welcome-text-content">
          <h1>Welcome to LexiMind AI</h1>
          <p>Transcribe, translate, and synthesize speech and documents instantly using next-generation AI engines.</p>
          <div className="banner-badges mt-4">
            <span className="banner-badge-item">
              <TrendingUp size={14} /> Active Workspace
            </span>
          </div>
        </div>
        <div className="welcome-graphic">
          <Sparkles className="pulsating-icon" size={64} />
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="overview-stats-grid">
        <div className="overview-stat-card">
          <div className="stat-icon-wrapper cyan-glow">
            <FileAudio size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.transcribe}</span>
            <span className="stat-label">Transcriptions</span>
          </div>
        </div>

        <div className="overview-stat-card">
          <div className="stat-icon-wrapper purple-glow">
            <Languages size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.translate}</span>
            <span className="stat-label">Translations</span>
          </div>
        </div>

        <div className="overview-stat-card">
          <div className="stat-icon-wrapper amber-glow">
            <Sparkles size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.summarize}</span>
            <span className="stat-label">AI Summaries</span>
          </div>
        </div>

        <div className="overview-stat-card">
          <div className="stat-icon-wrapper blue-glow">
            <History size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Jobs Saved</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Recent Files */}
      <div className="overview-main-grid">
        {/* Quick Actions Panel */}
        <div className="overview-panel-card">
          <h3>Quick Tool Access</h3>
          <p className="panel-desc">Launch audio recording, translation, or document synthesis tools immediately.</p>
          
          <div className="quick-actions-list">
            <Link to="/dashboard/upload" className="action-link-row">
              <div className="action-link-info">
                <FileAudio size={18} />
                <div>
                  <strong>Transcribe File</strong>
                  <span>Upload WAV/MP3 files for Whisper conversion</span>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/dashboard/live" className="action-link-row">
              <div className="action-link-info">
                <Mic size={18} />
                <div>
                  <strong>Live Dictation</strong>
                  <span>Record real-time audio and transcribe on-the-fly</span>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/dashboard/translation" className="action-link-row">
              <div className="action-link-info">
                <Languages size={18} />
                <div>
                  <strong>Translate Text</strong>
                  <span>Translate text and summaries into 100+ languages</span>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link to="/dashboard/ai" className="action-link-row">
              <div className="action-link-info">
                <Sparkles size={18} />
                <div>
                  <strong>AI Analysis</strong>
                  <span>Summarize legal text and chat with transcripts</span>
                </div>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="overview-panel-card">
          <div className="panel-header-row">
            <h3>Recent Actions</h3>
            <Link to="/dashboard/reports" className="see-all-link">
              See All <ArrowRight size={12} />
            </Link>
          </div>
          <p className="panel-desc">Review your latest generated audio documents and notes.</p>

          <div className="recent-activity-list">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="activity-item-row">
                  <div className="activity-icon-container">
                    {getReportIcon(report.type)}
                  </div>
                  <div className="activity-details">
                    <span className="activity-title">{report.title}</span>
                    <span className="activity-meta">
                      {new Date(report.date).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity-box">
                <History size={32} />
                <p>No activity recorded yet.</p>
                <span>Process a file, translate text, or start a live recording to see history here!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;

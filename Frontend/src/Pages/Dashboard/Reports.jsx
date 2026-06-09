import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  Copy, 
  X, 
  FileAudio, 
  Mic, 
  Languages, 
  Sparkles, 
  FileText 
} from 'lucide-react';

function Reports() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'transcribe' | 'live' | 'translation' | 'summarize'
  
  // Modal states
  const [selectedReport, setSelectedReport] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const reportsStr = localStorage.getItem('leximind_reports') || '[]';
    try {
      setReports(JSON.parse(reportsStr));
    } catch (e) {
      console.error('Error parsing reports', e);
      setReports([]);
    }
  };

  const handleDeleteReport = (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this report?')) {
      const updated = reports.filter(r => r.id !== id);
      localStorage.setItem('leximind_reports', JSON.stringify(updated));
      setReports(updated);
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport(null);
      }
    }
  };

  const handleClearAll = () => {
    if (window.confirm('WARNING: Are you sure you want to delete ALL reports? This action cannot be undone.')) {
      localStorage.removeItem('leximind_reports');
      setReports([]);
      setSelectedReport(null);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (report) => {
    const fileContent = `=== LexiMind AI Report ===
Title: ${report.title}
Date: ${new Date(report.date).toLocaleString()}
Type: ${report.type.toUpperCase()}
${report.duration ? `Duration: ${report.duration}` : ''}
${report.fileSize ? `File Size: ${report.fileSize}` : ''}

=== Original Input/Context ===
${report.originalText || 'N/A'}

=== Result Output ===
${report.resultText}
`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getReportIcon = (type) => {
    switch (type) {
      case 'transcribe':
      case 'transcription':
        return <FileAudio className="text-cyan-400" size={20} />;
      case 'live':
      case 'live_recording':
        return <Mic className="text-red-400" size={20} />;
      case 'translation':
        return <Languages className="text-purple-400" size={20} />;
      case 'summarize':
      case 'summary':
        return <Sparkles className="text-amber-400" size={20} />;
      default:
        return <FileText className="text-blue-400" size={20} />;
    }
  };

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.resultText && report.resultText.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterType === 'all') return matchesSearch;
    
    // Normalize type string matches
    if (filterType === 'transcribe') {
      return matchesSearch && (report.type === 'transcribe' || report.type === 'transcription');
    }
    return matchesSearch && report.type === filterType;
  });

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <div>
          <h2>Reports & Workspace History</h2>
          <p className="subtitle">Search, view, download, or manage your saved AI transcriptions and summaries</p>
        </div>
        <History className="header-icon" size={28} />
      </div>

      {/* Filter and Search Bar */}
      <div className="reports-search-filter-row">
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by keywords or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filter-badges">
          <button 
            className={`filter-badge ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button 
            className={`filter-badge ${filterType === 'transcribe' ? 'active' : ''}`}
            onClick={() => setFilterType('transcribe')}
          >
            Audio Uploads
          </button>
          <button 
            className={`filter-badge ${filterType === 'live' ? 'active' : ''}`}
            onClick={() => setFilterType('live')}
          >
            Live Recordings
          </button>
          <button 
            className={`filter-badge ${filterType === 'translation' ? 'active' : ''}`}
            onClick={() => setFilterType('translation')}
          >
            Translations
          </button>
          <button 
            className={`filter-badge ${filterType === 'summarize' ? 'active' : ''}`}
            onClick={() => setFilterType('summarize')}
          >
            AI Summaries
          </button>
        </div>

        {reports.length > 0 && (
          <button className="btn-danger-outline" onClick={handleClearAll}>
            <Trash2 size={14} /> Clear All History
          </button>
        )}
      </div>

      {/* Reports Grid/List */}
      <div className="reports-history-list">
        {filteredReports.length > 0 ? (
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Type</th>
                  <th>Title</th>
                  <th>Date Created</th>
                  <th>Metadata</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="report-row" onClick={() => setSelectedReport(report)}>
                    <td>
                      <div className="table-icon-cell">
                        {getReportIcon(report.type)}
                      </div>
                    </td>
                    <td>
                      <div className="table-title-cell">
                        <strong>{report.title}</strong>
                        <span className="text-preview">
                          {report.resultText ? report.resultText.substring(0, 70) + '...' : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      {new Date(report.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      {report.duration ? (
                        <span className="meta-pill">Dur: {report.duration}</span>
                      ) : report.fileSize ? (
                        <span className="meta-pill">Size: {report.fileSize}</span>
                      ) : report.language ? (
                        <span className="meta-pill">Lang: {report.language}</span>
                      ) : (
                        <span className="meta-pill">Doc</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="action-icon-btn view" 
                          onClick={() => setSelectedReport(report)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-icon-btn download" 
                          onClick={() => handleDownloadFile(report)}
                          title="Download TXT"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          className="action-icon-btn delete" 
                          onClick={(e) => handleDeleteReport(report.id, e)}
                          title="Delete Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-reports-box">
            <History size={48} className="text-gray-500 mb-2" />
            <h3>No reports found</h3>
            <p>Try refining your search query or generate new transcriptions, summaries, or translations.</p>
          </div>
        )}
      </div>

      {/* Modal Detail Viewer */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                {getReportIcon(selectedReport.type)}
                <h3>{selectedReport.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedReport(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-scrollable">
              <div className="modal-meta-row">
                <span className="meta-item">
                  <strong>Created:</strong> {new Date(selectedReport.date).toLocaleString()}
                </span>
                {selectedReport.duration && (
                  <span className="meta-item"><strong>Duration:</strong> {selectedReport.duration}</span>
                )}
                {selectedReport.fileSize && (
                  <span className="meta-item"><strong>Size:</strong> {selectedReport.fileSize}</span>
                )}
                {selectedReport.language && (
                  <span className="meta-item"><strong>Language:</strong> {selectedReport.language}</span>
                )}
              </div>

              {/* Source/Input Text if exists */}
              {selectedReport.originalText && (
                <div className="modal-text-section mb-6">
                  <h4>Original Input Context</h4>
                  <div className="modal-context-box">{selectedReport.originalText}</div>
                </div>
              )}

              {/* Result/Output Text */}
              <div className="modal-text-section">
                <h4>AI Generated Output</h4>
                <div className="modal-result-box output-rich-text">{selectedReport.resultText}</div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-footer-left">
                {copied && <span className="action-success text-sm">Copied to clipboard!</span>}
              </div>
              <div className="modal-footer-actions">
                <button 
                  className="btn-secondary flex items-center gap-1"
                  onClick={() => handleCopyText(selectedReport.resultText)}
                >
                  <Copy size={14} /> Copy Output
                </button>
                <button 
                  className="btn-secondary flex items-center gap-1"
                  onClick={() => handleDownloadFile(selectedReport)}
                >
                  <Download size={14} /> Download TXT
                </button>
                <button 
                  className="btn-danger flex items-center gap-1"
                  onClick={(e) => {
                    handleDeleteReport(selectedReport.id, e);
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;

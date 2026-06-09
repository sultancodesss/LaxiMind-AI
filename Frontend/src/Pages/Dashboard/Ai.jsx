import React, { useState } from 'react';
import { Sparkles, MessageSquare, Copy, Check, AlertCircle, FileText, Send } from 'lucide-react';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

const ANALYSIS_MODES = [
  { id: 'summary', name: 'Executive Summary', prompt: 'Provide a clean, structured executive summary of the following document. Include a high-level overview paragraph and then a bulleted list of the main points.' },
  { id: 'action_items', name: 'Action Items', prompt: 'Analyze the following transcript/document and extract a checklist of actionable items. Format them clearly as a checklist, identifying who is responsible if mentioned.' },
  { id: 'legal', name: 'Legal Insights', prompt: 'Perform a legal analysis of the text below. Identify potential liabilities, obligations, important dates, standard clauses, and suggestions for refinement.' },
  { id: 'decisions', name: 'Key Decisions', prompt: 'Read the following meeting transcript/text and extract all major decisions, agreements, and key alignment points. Format as a bulleted summary.' },
  { id: 'custom', name: 'Custom Instruction', prompt: '' },
];

function Ai() {
  const [inputText, setInputText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [analysisMode, setAnalysisMode] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultText, setResultText] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const getApiKey = () =>
    localStorage.getItem('leximind_groq_api_key') ||
    import.meta.env.VITE_GROQ_API_KEY ||
    '';

  const getModel = () => {
    const savedPrefs = localStorage.getItem('leximind_preferences');
    return savedPrefs
      ? JSON.parse(savedPrefs).model || 'llama-3.3-70b-versatile'
      : 'llama-3.3-70b-versatile';
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please add your Groq API Key in Settings to analyze documents.');
      return;
    }

    setLoading(true);
    setError('');
    setSaved(false);
    setResultText('');
    setChatHistory([]);

    try {
      const modeConfig = ANALYSIS_MODES.find((m) => m.id === analysisMode);
      const systemPrompt =
        modeConfig.id === 'custom' ? customPrompt : modeConfig.prompt;

      const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: getModel(),
          messages: [
            {
              role: 'system',
              content: `You are an advanced AI document synthesiser. ${systemPrompt}`,
            },
            {
              role: 'user',
              content: inputText,
            },
          ],
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate summary.');
      }

      const data = await response.json();
      const result = data.choices[0].message.content.trim();
      setResultText(result);

      setChatHistory([
        {
          sender: 'ai',
          text: 'I have analyzed the document. You can now ask me any specific questions about it below!',
        },
      ]);
    } catch (err) {
      console.error(err);
      setError(
        err.message || 'Error occurred. Please verify your Groq API key and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !inputText) return;

    const apiKey = getApiKey();
    if (!apiKey) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setChatLoading(true);

    try {
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: getModel(),
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant analyzing a document. You must answer questions based ONLY on the following document context. Keep answers clear, accurate, and concise. If the answer cannot be found in the document, state that.\n\nDOCUMENT CONTEXT:\n${inputText}`,
            },
            ...formattedHistory,
            { role: 'user', content: userMessage },
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate response.');
      }

      const data = await response.json();
      const aiReply = data.choices[0].message.content.trim();
      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: `Error: ${err.message || 'Failed to reply.'}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToReports = () => {
    if (!resultText) return;

    const reportsStr = localStorage.getItem('leximind_reports') || '[]';
    const reports = JSON.parse(reportsStr);

    const modeName =
      ANALYSIS_MODES.find((m) => m.id === analysisMode)?.name || 'AI Summary';
    const sampleTitle = inputText.substring(0, 30) + '...';

    const newReport = {
      id: 'rep_' + Date.now(),
      type: 'summarize',
      title: `${modeName}: ${sampleTitle}`,
      date: new Date().toISOString(),
      originalText: inputText,
      resultText: resultText,
    };

    reports.unshift(newReport);
    localStorage.setItem('leximind_reports', JSON.stringify(reports));
    setSaved(true);
  };

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <div>
          <h2>AI Summary & Insights</h2>
          <p className="subtitle">
            Condense legal paperwork, transcribing logs, and long documents into
            clear summaries
          </p>
        </div>
        <Sparkles className="header-icon text-amber-500" size={28} />
      </div>

      <div className="ai-workspace-grid">
        {/* Input Form Column */}
        <div className="ai-input-column">
          <div className="form-group">
            <label htmlFor="docText">Paste Document or Transcript Text</label>
            <textarea
              id="docText"
              className="ai-textarea"
              placeholder="Paste transcript logs, notes, or contract text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="analysis-mode-selector-card">
            <h3>Select Summary Mode</h3>
            <div className="analysis-options-grid">
              {ANALYSIS_MODES.map((mode) => (
                <button
                  key={mode.id}
                  className={`mode-badge-btn ${analysisMode === mode.id ? 'active' : ''}`}
                  onClick={() => setAnalysisMode(mode.id)}
                >
                  {mode.name}
                </button>
              ))}
            </div>

            {analysisMode === 'custom' && (
              <div className="form-group mt-4">
                <label htmlFor="customPrompt">Custom instructions for the AI</label>
                <input
                  type="text"
                  id="customPrompt"
                  className="form-control"
                  placeholder="e.g. Rewrite this as a bulleted checklist for stakeholders..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>
            )}

            <button
              className="btn-primary w-full mt-4"
              onClick={handleGenerate}
              disabled={loading || !inputText.trim()}
            >
              <Sparkles size={16} />
              {loading ? 'Synthesizing insights...' : 'Generate Insights'}
            </button>
          </div>
        </div>

        {/* Outputs Column */}
        <div className="ai-output-column">
          <div className="output-tabs-container">
            <div className="output-tab active">
              <FileText size={16} /> AI Summary & Synthesis
            </div>
          </div>

          <div className="ai-result-card">
            <div className="panel-header-simple border-b-0 pb-1">
              <span className="results-label">Insights Report</span>
              {resultText && (
                <div className="panel-header-actions">
                  <button className="icon-btn-text" onClick={handleCopy}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}{' '}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    className="icon-btn-text"
                    onClick={handleSaveToReports}
                    disabled={saved}
                  >
                    <Check size={14} /> {saved ? 'Saved' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            <div className="result-container-box flex-grow">
              {loading ? (
                <div className="loading-placeholder">
                  <div className="spinner"></div>
                  <p>Synthesizing insights with Groq AI...</p>
                </div>
              ) : error ? (
                <div className="error-message-box">
                  <AlertCircle size={18} />
                  <p>{error}</p>
                </div>
              ) : resultText ? (
                <div className="output-rich-text markdown-render">{resultText}</div>
              ) : (
                <div className="output-placeholder">
                  Select a mode and click Generate to see summaries and key
                  takeaways here.
                </div>
              )}
            </div>
          </div>

          {/* Interactive Chat Box */}
          {resultText && (
            <div className="doc-chat-container">
              <div className="chat-header">
                <MessageSquare size={16} />
                <span>Chat Assistant (Question your Document)</span>
              </div>

              <div className="chat-messages-box">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`chat-bubble-row ${msg.sender}`}>
                    <div className="chat-bubble">{msg.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-bubble-row ai">
                    <div className="chat-bubble loading">
                      <div className="dot-pulse"></div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendChatMessage} className="chat-input-row">
                <input
                  type="text"
                  placeholder="Ask a question about this document..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button type="submit" disabled={!chatInput.trim() || chatLoading}>
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ai;

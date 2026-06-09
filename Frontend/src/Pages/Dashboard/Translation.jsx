import React, { useState } from 'react';
import { Languages, Volume2, Copy, Trash2, ArrowRightLeft, Sparkles, AlertCircle, Scan } from 'lucide-react';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';

const LANGUAGES_LIST = [
  { code: 'es', name: 'Spanish' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ko', name: 'Korean' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ur', name: 'Urdu' },
];

function Translation() {
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please add your Groq API Key in Settings to perform translations.');
      return;
    }

    setLoading(true);
    setError('');
    setSaved(false);
    setTargetText('');

    try {
      const selectedLangName =
        LANGUAGES_LIST.find((l) => l.code === targetLang)?.name || targetLang;
      
      const sourceLangName =
        sourceLang === 'auto'
          ? 'automatically detected language'
          : LANGUAGES_LIST.find((l) => l.code === sourceLang)?.name || sourceLang;

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
              content: `You are a professional, high-accuracy translator. Translate the given text from ${sourceLangName} into ${selectedLangName}. Do not include any introduction, explanation, or markdown. Output ONLY the raw translated text.`,
            },
            {
              role: 'user',
              content: sourceText,
            },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Translation failed.');
      }

      const data = await response.json();
      setTargetText(data.choices[0].message.content.trim());
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          'Something went wrong. Please check your Groq API key and network connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (sourceLang !== 'auto') {
      const tempLang = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(tempLang);
    }
    const tempText = sourceText;
    setSourceText(targetText);
    setTargetText(tempText);
  };

  const handleSaveToReports = () => {
    if (!targetText) return;
    const reportsStr = localStorage.getItem('leximind_reports') || '[]';
    const reports = JSON.parse(reportsStr);

    reports.unshift({
      id: 'rep_' + Date.now(),
      type: 'translation',
      title: `Translation to ${
        LANGUAGES_LIST.find((l) => l.code === targetLang)?.name || targetLang
      }`,
      date: new Date().toISOString(),
      originalText: sourceText,
      resultText: targetText,
      language: LANGUAGES_LIST.find((l) => l.code === targetLang)?.name || targetLang,
    });

    localStorage.setItem('leximind_reports', JSON.stringify(reports));
    setSaved(true);
  };

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <div>
          <h2>Language Translation</h2>
          <p className="subtitle">
            Paste any text — Groq AI detects the language and translates with
            high precision
          </p>
        </div>
        <Languages className="header-icon" size={28} />
      </div>

      <div className="translation-grid">
        {/* ── Source Panel ─────────────────────────────────────────── */}
        <div className="translation-panel">
          <div className="panel-header">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="lang-select"
            >
              <option value="auto">Auto-Detect Language</option>
              <option value="en">English</option>
              {LANGUAGES_LIST.filter(l => l.code !== 'en').map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <button
              className="panel-icon-btn"
              onClick={() => setSourceText('')}
              title="Clear text"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <textarea
            className="translation-textarea"
            placeholder="Type or paste text to translate..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            maxLength={5000}
          />

          <div className="panel-footer">
            <span className="char-count">{sourceText.length}/5000 characters</span>
          </div>
        </div>

        {/* ── Swap Button ──────────────────────────────────────────── */}
        <div className="swap-button-container">
          <button className="swap-btn" onClick={handleSwap} title="Swap text">
            <ArrowRightLeft size={18} />
          </button>
        </div>

        {/* ── Target Panel ─────────────────────────────────────────── */}
        <div className="translation-panel">
          <div className="panel-header">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="lang-select"
            >
              {LANGUAGES_LIST.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="panel-actions-row">
              <button
                className="panel-icon-btn"
                onClick={() => handleSpeak(targetText)}
                disabled={!targetText}
                title="Speak Translation"
              >
                <Volume2 size={16} />
              </button>
              <button
                className="panel-icon-btn"
                onClick={() => handleCopy(targetText)}
                disabled={!targetText}
                title="Copy Translation"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="translation-output-container">
            {loading ? (
              <div className="loading-placeholder">
                <div className="spinner"></div>
                <p>Translating with Groq AI...</p>
              </div>
            ) : error ? (
              <div className="error-message-box">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            ) : targetText ? (
              <div className="translation-output-text">{targetText}</div>
            ) : (
              <div className="output-placeholder">
                Translation will appear here...
              </div>
            )}
          </div>

          <div className="panel-footer">
            {copied && <span className="action-success">Copied to clipboard!</span>}
            {saved && <span className="action-success">Saved to Reports!</span>}
          </div>
        </div>
      </div>

      <div className="translation-actions-bottom">
        <button
          className="btn-primary"
          onClick={handleTranslate}
          disabled={loading || !sourceText.trim()}
        >
          <Sparkles size={16} />
          {loading ? 'Translating...' : 'Translate'}
        </button>

        {targetText && !loading && (
          <button
            className="btn-secondary"
            onClick={handleSaveToReports}
            disabled={saved}
          >
            Save to Reports
          </button>
        )}
      </div>
    </div>
  );
}

export default Translation;

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Key, Eye, EyeOff } from 'lucide-react';

const GROQ_MODELS_LIST = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Recommended – Best Quality)' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Fastest – Low Latency)' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Large Context – 32K tokens)' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B (Google – Instruction Tuned)' },
];

const TARGET_LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
];

function Setting() {
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [defaultLang, setDefaultLang] = useState('es');
  const [saveStatus, setSaveStatus] = useState(false);

  const [groqApiKey, setGroqApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    // Load model/lang preferences
    const savedPrefs = localStorage.getItem('leximind_preferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.model) setSelectedModel(parsed.model);
        if (parsed.defaultLang) setDefaultLang(parsed.defaultLang);
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }

    // Load saved Groq API key (fallback to env variable)
    const savedKey =
      localStorage.getItem('leximind_groq_api_key') ||
      import.meta.env.VITE_GROQ_API_KEY ||
      '';
    setGroqApiKey(savedKey);
  }, []);

  const handleSave = () => {
    const preferences = {
      model: selectedModel,
      defaultLang: defaultLang,
    };
    localStorage.setItem('leximind_preferences', JSON.stringify(preferences));
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handleSaveApiKey = () => {
    if (groqApiKey.trim()) {
      localStorage.setItem('leximind_groq_api_key', groqApiKey.trim());
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2000);
    }
  };

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <div>
          <h2>Settings</h2>
          <p className="subtitle">Configure your Groq API credentials and AI generation preferences</p>
        </div>
        <Settings className="header-icon" size={28} />
      </div>

      <div className="settings-card-container">

        {/* API Key Panel */}
        <div className="settings-panel">
          <div className="panel-section-title">
            <h3>Groq API Key</h3>
            <p>Your Groq API key is used for all AI features — translation, transcription, and document analysis. It is stored locally in your browser.</p>
          </div>

          <div className="form-group">
            <label htmlFor="groqApiKey">Groq API Key</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="groqApiKey"
                  type={showKey ? 'text' : 'password'}
                  className="form-control"
                  placeholder="gsk_..."
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0,
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button
                className="btn-primary"
                onClick={handleSaveApiKey}
                style={{ whiteSpace: 'nowrap', display: 'flex', gap: '0.4rem', alignItems: 'center' }}
              >
                {keySaved ? <Check size={16} /> : <Key size={16} />}
                {keySaved ? 'Saved!' : 'Save Key'}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
              Get your free API key at{' '}
              <a href="https://console.groq.com" target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>
                console.groq.com
              </a>
            </p>
          </div>
        </div>

        {/* Preferences Panel */}
        <div className="settings-panel">
          <div className="panel-section-title">
            <h3>Generation Preferences</h3>
            <p>Select which Groq AI model and default target language to use across your workspace.</p>
          </div>

          <div className="form-group">
            <label htmlFor="modelSelect">Default Chat Model</label>
            <select
              id="modelSelect"
              className="form-control"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {GROQ_MODELS_LIST.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="defaultLang">Default Translation Language</label>
            <select
              id="defaultLang"
              className="form-control"
              value={defaultLang}
              onChange={(e) => setDefaultLang(e.target.value)}
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Row */}
        <div className="settings-actions-row">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSave}
          >
            {saveStatus ? <Check size={16} /> : <Save size={16} />}
            {saveStatus ? 'Settings Saved!' : 'Save Configurations'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Setting;

import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, FileText, Copy, Trash2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GROQ_WHISPER_MODEL = 'whisper-large-v3';

function Upload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultText, setResultText] = useState('');
  const [actionType, setActionType] = useState('transcribe'); // 'transcribe' | 'translate' | 'summarize'
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav',
      'audio/m4a', 'audio/x-m4a', 'audio/webm', 'video/mp4',
    ];
    const maxBytes = 25 * 1024 * 1024; // 25 MB (Groq limit)

    setError('');
    setResultText('');
    setSaved(false);

    if (selectedFile.size > maxBytes) {
      setError('File is too large. Maximum size allowed is 25MB.');
      return;
    }

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    const validExtensions = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg', 'flac'];

    if (!validTypes.includes(selectedFile.type) && !validExtensions.includes(extension)) {
      setError('Invalid file format. Please upload MP3, WAV, M4A, WEBM, OGG, or FLAC.');
      return;
    }

    setFile(selectedFile);
  };

  const handleProcessFile = async () => {
    if (!file) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please add your Groq API Key in Settings to process files.');
      return;
    }

    setLoading(true);
    setError('');
    setResultText('');
    setSaved(false);

    try {
      // ── Step 1: Transcription via Groq Whisper ─────────────────────────────
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', GROQ_WHISPER_MODEL);

      // For "translate" we call the translations endpoint (outputs English)
      const transcriptEndpoint =
        actionType === 'translate'
          ? `${GROQ_API_BASE}/audio/translations`
          : `${GROQ_API_BASE}/audio/transcriptions`;

      const whisperResponse = await fetch(transcriptEndpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });

      if (!whisperResponse.ok) {
        const errorData = await whisperResponse.json();
        throw new Error(errorData.error?.message || 'Groq Whisper processing failed.');
      }

      const whisperData = await whisperResponse.json();
      let transcribedText = whisperData.text;

      // ── Step 2: Summarisation via Groq chat completions ────────────────────
      if (actionType === 'summarize') {
        const chatResponse = await fetch(`${GROQ_API_BASE}/chat/completions`, {
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
                content:
                  'You are an advanced text summarizing AI. Summarize the following transcript. Provide a structured summary with a title, a brief paragraph overview, and a bulleted list of key takeaways or action items.',
              },
              { role: 'user', content: transcribedText },
            ],
            temperature: 0.5,
          }),
        });

        if (!chatResponse.ok) {
          const chatError = await chatResponse.json();
          throw new Error(
            chatError.error?.message ||
              'Summarization failed, but transcription succeeded.'
          );
        }

        const chatData = await chatResponse.json();
        setResultText(chatData.choices[0].message.content.trim());
      } else {
        setResultText(transcribedText);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while processing the audio.');
    } finally {
      setLoading(false);
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

    const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    let reportTitle = '';
    if (actionType === 'transcribe') reportTitle = `Transcription: ${file.name}`;
    else if (actionType === 'translate') reportTitle = `English Translation: ${file.name}`;
    else if (actionType === 'summarize') reportTitle = `Summary: ${file.name}`;

    const newReport = {
      id: 'rep_' + Date.now(),
      type: actionType,
      title: reportTitle,
      date: new Date().toISOString(),
      originalText: `Audio file: ${file.name} (${formattedSize})`,
      resultText: resultText,
      fileSize: formattedSize,
    };

    reports.unshift(newReport);
    localStorage.setItem('leximind_reports', JSON.stringify(reports));
    setSaved(true);
  };

  const removeFile = () => {
    setFile(null);
    setResultText('');
    setError('');
  };

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <div>
          <h2>Upload Audio File</h2>
          <p className="subtitle">
            Upload pre-recorded audio or video files to transcribe and summarize
            with Groq AI
          </p>
        </div>
        <UploadCloud className="header-icon" size={28} />
      </div>

      <div className="upload-layout-grid">
        {/* Upload Panel */}
        <div className="upload-left-panel">
          <div
            className={`dropzone ${dragActive ? 'drag-active' : ''} ${
              file ? 'has-file' : ''
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="file-input-hidden"
              onChange={handleChange}
              accept=".mp3,.wav,.m4a,.webm,.mp4,.ogg,.flac"
            />

            {file ? (
              <div className="file-info-container">
                <FileAudio className="file-icon" size={48} />
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <button
                  className="remove-file-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className="dropzone-prompt">
                <UploadCloud size={40} className="upload-prompt-icon" />
                <p className="primary-prompt">Drag &amp; drop your audio file here</p>
                <p className="secondary-prompt">
                  Supports MP3, WAV, M4A, WEBM, OGG, FLAC up to 25MB
                </p>
                <button className="browse-btn" type="button">
                  Browse Files
                </button>
              </div>
            )}
          </div>

          {file && (
            <div className="processing-settings-card">
              <h3>Select AI Processing Action</h3>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="actionType"
                    value="transcribe"
                    checked={actionType === 'transcribe'}
                    onChange={() => setActionType('transcribe')}
                  />
                  <div className="radio-custom-text">
                    <strong>Standard Transcription</strong>
                    <span>Extract word-for-word text from audio</span>
                  </div>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="actionType"
                    value="translate"
                    checked={actionType === 'translate'}
                    onChange={() => setActionType('translate')}
                  />
                  <div className="radio-custom-text">
                    <strong>Translate to English</strong>
                    <span>Transcribe foreign audio directly to English</span>
                  </div>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="actionType"
                    value="summarize"
                    checked={actionType === 'summarize'}
                    onChange={() => setActionType('summarize')}
                  />
                  <div className="radio-custom-text">
                    <strong>Transcribe &amp; Summarize</strong>
                    <span>Get transcription + structured executive summary</span>
                  </div>
                </label>
              </div>

              <button
                className="btn-primary w-full mt-4"
                onClick={handleProcessFile}
                disabled={loading}
              >
                <Sparkles size={16} />
                {loading ? 'Processing Audio...' : 'Process File'}
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="upload-right-panel">
          <div className="panel-header-simple">
            <span className="results-label">
              <FileText size={16} /> Result Output
            </span>
            {resultText && (
              <div className="panel-header-actions">
                <button className="icon-btn-text" onClick={handleCopy}>
                  <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  className="icon-btn-text"
                  onClick={handleSaveToReports}
                  disabled={saved}
                >
                  <CheckCircle size={14} /> {saved ? 'Saved' : 'Save to Reports'}
                </button>
              </div>
            )}
          </div>

          <div className="result-container-box">
            {loading ? (
              <div className="loading-placeholder">
                <div className="spinner"></div>
                <p>Processing with Groq Whisper...</p>
                <span className="subtext">
                  This can take up to a minute depending on file size...
                </span>
              </div>
            ) : error ? (
              <div className="error-message-box">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            ) : resultText ? (
              <div className="output-rich-text">{resultText}</div>
            ) : (
              <div className="output-placeholder">
                Your processed transcript will display here after you upload and
                process a file.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;

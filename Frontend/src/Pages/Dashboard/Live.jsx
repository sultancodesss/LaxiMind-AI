import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  FileText,
} from "lucide-react";

const GROQ_API_BASE = "https://api.groq.com/openai/v1";
const GROQ_WHISPER_MODEL = "whisper-large-v3";

function Live() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [whisperTranscript, setWhisperTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [livePreview, setLivePreview] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const getApiKey = () =>
    localStorage.getItem("leximind_groq_api_key") ||
    import.meta.env.VITE_GROQ_API_KEY ||
    "";

  // Web Speech API initialization (browser-native live preview)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.maxAlternatives = 1;

      rec.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i][0]?.transcript || "";
          if (event.results[i].isFinal) {
            finalTranscript += result;
          } else {
            interimTranscript += result;
          }
        }

        setLivePreview(interimTranscript.trim());

        if (finalTranscript) {
          setLiveTranscript((prev) =>
            `${prev} ${finalTranscript.trim()}`.trim(),
          );
        }
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error", e);
        if (e.error !== "not-allowed") {
          setError("Live speech preview had trouble reading your voice.");
        }
      };

      recognitionRef.current = rec;
    } else {
      setIsSpeechSupported(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Duration Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    setError("");
    setAudioUrl(null);
    setLiveTranscript("");
    setLivePreview("");
    setWhisperTranscript("");
    setSaved(false);
    audioChunksRef.current = [];
    setDuration(0);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser does not support microphone access.");
      }

      if (typeof MediaRecorder === "undefined") {
        throw new Error("Audio recording is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ];
      const mimeType = preferredMimeTypes.find((type) =>
        MediaRecorder.isTypeSupported(type),
      );

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blobType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });

        if (audioChunksRef.current.length === 0) {
          setError("No audio was captured. Please try recording again.");
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(500); // collect data in 500ms chunks
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn("Speech recognition was already running", e);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not access microphone. Please grant permission and ensure mic is connected.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping speech recognition", e);
      }
    }
    setIsRecording(false);
  };

  const handleGroqWhisperRefine = async (mode = "transcription") => {
    if (audioChunksRef.current.length === 0) return;

    const apiKey = getApiKey();
    if (!apiKey) {
      setError(
        "Groq API Key is required. Please add it in Settings.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const blobType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
      
      let extension = "webm";
      if (blobType.includes("mp4")) extension = "mp4";
      else if (blobType.includes("wav")) extension = "wav";
      else if (blobType.includes("mpeg")) extension = "mp3";
      else if (blobType.includes("ogg")) extension = "ogg";

      const cleanMimeType = blobType.split(";")[0];
      const file = new File([audioBlob], `live_recording.${extension}`, {
        type: cleanMimeType,
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", GROQ_WHISPER_MODEL);

      const endpoint = mode === "translation" ? "translations" : "transcriptions";
      const response = await fetch(`${GROQ_API_BASE}/audio/${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error?.message || `Groq Whisper ${mode} failed.`
        );
      }

      const data = await response.json();
      setWhisperTranscript(data.text);
    } catch (err) {
      console.error(err);
      setError(
        err.message || "Error occurred while contacting Groq Whisper API.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToReports = () => {
    const finalResultText = whisperTranscript || liveTranscript;
    if (!finalResultText) return;

    const reportsStr = localStorage.getItem("leximind_reports") || "[]";
    const reports = JSON.parse(reportsStr);

    const formatTime = (secs) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const newReport = {
      id: "rep_" + Date.now(),
      type: "live",
      title: `Live Voice Record - ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      originalText: `Live Microphone Recording (${formatTime(duration)})`,
      resultText: finalResultText,
      duration: formatTime(duration),
    };

    reports.unshift(newReport);
    localStorage.setItem("leximind_reports", JSON.stringify(reports));
    setSaved(true);
  };

  const formatTimer = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="dashboard-view-container">
      <div className="view-header">
        <div>
          <h2>Live Voice Recording</h2>
          <p className="subtitle">
            Record conversations, meetings, or voice memos — refined with Groq
            Whisper
          </p>
        </div>
        <Mic className="header-icon text-red-500" size={28} />
      </div>

      <div className="live-recorder-layout">
        {/* Recorder Controls */}
        <div className="recorder-control-card">
          <div className="recorder-status">
            {isRecording ? (
              <span className="live-badge anim-pulse">● RECORDING</span>
            ) : (
              <span className="idle-badge">READY</span>
            )}
            <span className="recording-timer">{formatTimer(duration)}</span>
          </div>

          {/* Waveform Visualizer */}
          <div
            className={`waveform-visualizer-box ${isRecording ? "active" : ""}`}
          >
            {isRecording ? (
              <div className="bars-container">
                <div className="wave-bar bar-1"></div>
                <div className="wave-bar bar-2"></div>
                <div className="wave-bar bar-3"></div>
                <div className="wave-bar bar-4"></div>
                <div className="wave-bar bar-5"></div>
                <div className="wave-bar bar-6"></div>
                <div className="wave-bar bar-7"></div>
                <div className="wave-bar bar-8"></div>
                <div className="wave-bar bar-9"></div>
                <div className="wave-bar bar-10"></div>
              </div>
            ) : (
              <div className="waveform-placeholder">
                <Mic size={32} />
                <p>Click the Record button to start</p>
              </div>
            )}
          </div>

          <div className="recorder-buttons">
            {isRecording ? (
              <button className="record-btn-stop" onClick={stopRecording}>
                <MicOff size={24} />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button className="record-btn-start" onClick={startRecording}>
                <Mic size={24} />
                <span>Start Recording</span>
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="audio-playback-wrapper mt-6">
              <h4>Playback Recording</h4>
              <audio src={audioUrl} controls className="audio-element-custom" />

              {!whisperTranscript && (
                <div className="flex gap-3 w-full mt-4 flex-col sm:flex-row">
                  <button
                    className="btn-primary flex-1 flex items-center justify-center"
                    onClick={() => handleGroqWhisperRefine("transcription")}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin mr-2" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="mr-2" />
                        Transcribe Audio
                      </>
                    )}
                  </button>
                  <button
                    className="btn-secondary flex-1 flex items-center justify-center bg-purple-600 text-white hover:bg-purple-700 border-none"
                    onClick={() => handleGroqWhisperRefine("translation")}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin mr-2" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="mr-2" />
                        Translate to English
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live / Refined Transcript Panel */}
        <div className="recorder-transcript-card">
          <div className="panel-header-simple">
            <span className="results-label">
              <FileText size={16} /> Transcription Outputs
            </span>
            {(liveTranscript || whisperTranscript) && (
              <button
                className="icon-btn-text"
                onClick={handleSaveToReports}
                disabled={saved}
              >
                <Save size={14} /> {saved ? "Saved to Reports" : "Save Report"}
              </button>
            )}
          </div>

          <div className="transcripts-output-box">
            {error && (
              <div className="error-message-box mb-4">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}

            {!isSpeechSupported && (
              <div className="error-message-box mb-4">
                <AlertCircle size={18} />
                <p>
                  Live voice preview is unavailable in this browser. You can
                  still record audio and refine it with Groq Whisper.
                </p>
              </div>
            )}

            {whisperTranscript ? (
              <div className="whisper-output-section">
                <div className="transcription-badge premium">
                  <Sparkles size={12} /> Groq Whisper Refined
                </div>
                <div className="final-transcript-text">{whisperTranscript}</div>
              </div>
            ) : (
              <div className="live-output-section">
                <div className="transcription-badge browser">
                  <Mic size={12} /> Live Voice Output
                </div>
                <div className="live-transcript-text">
                  {livePreview ||
                    liveTranscript ||
                    "Speak into your microphone to see the transcript here."}
                </div>
              </div>
            )}

            {!whisperTranscript && !liveTranscript && !livePreview && (
              <div className="output-placeholder">
                Dictated text will stream here in real-time as you speak. Stop
                recording to listen to audio or trigger high-precision Groq
                Whisper refinement.
              </div>
            )}
          </div>

          {saved && (
            <div className="action-success-banner mt-4">
              <CheckCircle size={18} />
              <span>Transcript successfully saved to reports list!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Live;

import { useState, useEffect } from 'react';
import './App.css';
import HistoryTimeline from './HistoryTimeline';
import PatternCard from './PatternCard';
import Recommendations from './Recommendations';

const HISTORY_KEY = 'lyric-moodboard-history';

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 20px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: '700',
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#888',
    margin: '0 0 40px',
  },
  form: {
    width: '100%',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    backgroundColor: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    padding: '12px 16px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    backgroundColor: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.95rem',
    padding: '12px 16px',
    outline: 'none',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    lineHeight: '1.6',
  },
  buttonWrapper: {
    padding: '2px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
  },
  button: {
    width: '100%',
    padding: '13px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonLoading: {
    backgroundColor: '#1a1a1a',
    color: '#888',
    cursor: 'not-allowed',
  },
  card: {
    marginTop: '48px',
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#141414',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    padding: '32px',
    boxSizing: 'border-box',
  },
  mood: {
    fontSize: '2.2rem',
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: '24px',
    letterSpacing: '-0.01em',
  },
  colorsRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  colorCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  keywordsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
  },
  pill: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '999px',
    padding: '5px 14px',
    fontSize: '0.85rem',
    color: '#ccc',
  },
  summary: {
    fontStyle: 'italic',
    color: '#aaa',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  copyButton: {
    marginTop: '4px',
    padding: '8px 18px',
    borderRadius: '8px',
    border: '1px solid #333',
    backgroundColor: 'transparent',
    color: '#aaa',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s, color 0.2s',
  },
  copyButtonSuccess: {
    borderColor: '#4ade80',
    color: '#4ade80',
  },
};

function resultToParams(result) {
  const p = new URLSearchParams();
  p.set('mood', result.mood);
  p.set('summary', result.summary);
  p.set('keywords', result.keywords.join(','));
  p.set('colors', result.colors.join(','));
  return p;
}

function paramsToResult(params) {
  const mood = params.get('mood');
  const summary = params.get('summary');
  const keywords = params.get('keywords');
  const colors = params.get('colors');
  if (!mood || !summary || !keywords || !colors) return null;
  return {
    mood,
    summary,
    keywords: keywords.split(','),
    colors: colors.split(','),
  };
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export default function App() {
  const [songTitle, setSongTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(loadHistory);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = paramsToResult(params);
    if (fromUrl) setResult(fromUrl);
  }, []);

  async function handleGenerate() {
    if (!lyrics.trim() || !songTitle.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songTitle, lyrics }),
      });

      if (!res.ok) throw new Error('Server error');
      const data = await res.json();

      setResult(data);
      window.history.replaceState(null, '', window.location.pathname);

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        songTitle,
        analyzedAt: new Date().toISOString(),
        ...data,
      };
      const updated = [...history, entry];
      setHistory(updated);
      saveHistory(updated);
    } catch (err) {
      setError('Something went wrong. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!result) return;
    const params = resultToParams(result);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSelectHistory(entry) {
    setResult(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleClearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  return (
    <div style={styles.page} className="page-root">
      <h1 style={styles.title} className="page-title">Lyric Mood Board</h1>
      <p style={styles.subtitle} className="page-subtitle">Paste any lyrics. See the vibe.</p>

      <div style={styles.form}>
        <input
          style={styles.input}
          type="text"
          placeholder="Song title"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
        />
        <textarea
          style={styles.textarea}
          rows={8}
          placeholder="Paste lyrics here..."
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
        />
        <div style={styles.buttonWrapper}>
          <button
            style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Generate Mood Board'}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: '#f87171', marginTop: '24px', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      {result && (
        <div style={styles.card} className="mood-card">
          <div style={styles.mood} className="mood-word">{result.mood}</div>

          <div style={styles.colorsRow} className="colors-row">
            {result.colors.map((hex) => (
              <div
                key={hex}
                style={{ ...styles.colorCircle, backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>

          <div style={styles.keywordsRow} className="keywords-row">
            {result.keywords.map((word) => (
              <span key={word} style={styles.pill}>
                {word}
              </span>
            ))}
          </div>

          <p style={styles.summary}>{result.summary}</p>

          <button
            style={{ ...styles.copyButton, ...(copied ? styles.copyButtonSuccess : {}) }}
            onClick={handleCopyLink}
          >
            {copied ? 'Link copied!' : 'Copy Link'}
          </button>
        </div>
      )}

      {result && <Recommendations key={result.mood + result.summary} result={result} />}

      {history.length > 0 && (
        <>
          <PatternCard history={history} />
          <HistoryTimeline
            history={history}
            onSelect={handleSelectHistory}
            onClear={handleClearHistory}
          />
        </>
      )}
    </div>
  );
}

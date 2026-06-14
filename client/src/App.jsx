import { useState, useEffect } from 'react';
import './App.css';
import SongSearch from './SongSearch';
import HistoryTimeline from './HistoryTimeline';
import PatternCard from './PatternCard';
import Recommendations from './Recommendations';

const HISTORY_KEY = 'lyric-moodboard-history';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% -10%, #1e0b38 0%, #0a0a0a 55%)',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '72px 20px 80px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '3.2rem',
    fontWeight: '800',
    margin: '0 0 10px',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: '1.05rem',
    color: '#666',
    margin: '0 0 48px',
    letterSpacing: '0.01em',
  },
  form: {
    width: '100%',
    maxWidth: '560px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  card: {
    marginTop: '48px',
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#0f0f0f',
    border: '1px solid #1f1f1f',
    borderRadius: '20px',
    padding: '32px',
    boxSizing: 'border-box',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.4)',
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
  return { mood, summary, keywords: keywords.split(','), colors: colors.split(',') };
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
  const [selectedSong, setSelectedSong] = useState(null);
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
    if (!selectedSong) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle: selectedSong.trackName,
          artist: selectedSong.artistName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Make sure the server is running.');
        return;
      }

      const enriched = {
        ...data,
        songTitle: selectedSong.trackName,
        artist: selectedSong.artistName,
        artworkUrl: selectedSong.artworkUrl100?.replace('100x100bb', '300x300bb') ?? null,
      };

      setResult(enriched);
      window.history.replaceState(null, '', window.location.pathname);

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        analyzedAt: new Date().toISOString(),
        ...enriched,
      };
      const updated = [...history, entry];
      setHistory(updated);
      saveHistory(updated);
    } catch {
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

  const isDisabled = !selectedSong || loading;

  return (
    <div style={styles.page} className="page-root">
      <h1 style={styles.title} className="page-title gradient-title">Lyric Mood Board</h1>
      <p style={styles.subtitle} className="page-subtitle">Search any song. See the vibe.</p>

      <div style={styles.form}>
        <SongSearch onSelect={setSelectedSong} />
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={isDisabled}
        >
          {loading ? 'Analyzing...' : 'Generate Mood Board'}
        </button>
      </div>

      {error && (
        <p style={{ color: '#f87171', marginTop: '24px', fontSize: '0.9rem' }}>
          {error}
        </p>
      )}

      {result && (
        <div style={styles.card} className="mood-card">
          {result.artworkUrl && (
            <img
              src={result.artworkUrl}
              alt=""
              style={{ width: '72px', height: '72px', borderRadius: '8px', marginBottom: '20px', display: 'block' }}
            />
          )}

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
              <span key={word} style={styles.pill}>{word}</span>
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

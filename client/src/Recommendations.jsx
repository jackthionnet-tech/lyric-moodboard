import { useState } from 'react';

export default function Recommendations({ result }) {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchRecs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songTitle: result.songTitle ?? 'this song',
          mood: result.mood,
          keywords: result.keywords,
          summary: result.summary,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRecs(data.recommendations);
    } catch {
      setError('Could not load recommendations.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '560px', marginTop: '12px' }}>
      {!recs && (
        <button
          onClick={fetchRecs}
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '10px',
            border: '1px solid #2a2a2a',
            backgroundColor: 'transparent',
            color: loading ? '#444' : '#888',
            fontSize: '0.95rem',
            cursor: loading ? 'default' : 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = loading ? '#444' : '#888'; }}
        >
          {loading ? 'Finding similar songs...' : 'Find similar songs'}
        </button>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '8px 0 0' }}>{error}</p>
      )}

      {recs && (
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '24px',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
              Similar songs
            </h2>
            <button
              onClick={() => setRecs(null)}
              style={{ background: 'none', border: 'none', color: '#444', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0' }}
            >
              Dismiss
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recs.map((rec, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{ color: '#fff', fontWeight: '500', fontSize: '0.95rem' }}>
                    {rec.title}
                  </span>
                  <span style={{ color: '#555', fontSize: '0.8rem', flexShrink: 0 }}>
                    {rec.artist}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#555', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  {rec.reason}
                </p>
                {i < recs.length - 1 && (
                  <div style={{ borderBottom: '1px solid #1a1a1a', marginTop: '12px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

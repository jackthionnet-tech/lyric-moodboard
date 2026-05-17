import { useState, useEffect } from 'react';

const MIN_ENTRIES = 3;

export default function PatternCard({ history }) {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (history.length >= MIN_ENTRIES) fetchPatterns();
  }, [history.length]);

  async function fetchPatterns() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
      });
      if (!res.ok) throw new Error();
      setPatterns(await res.json());
    } catch {
      setError('Could not load pattern insights.');
    } finally {
      setLoading(false);
    }
  }

  const remaining = MIN_ENTRIES - history.length;

  if (history.length < MIN_ENTRIES) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '560px',
        marginTop: '16px',
        padding: '16px',
        borderRadius: '10px',
        border: '1px dashed #222',
        color: '#3a3a3a',
        fontSize: '0.85rem',
        textAlign: 'center',
        boxSizing: 'border-box',
      }}>
        Analyze {remaining} more song{remaining !== 1 ? 's' : ''} to unlock pattern insights
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '560px',
      marginTop: '16px',
      backgroundColor: '#141414',
      border: '1px solid #2a2a2a',
      borderRadius: '16px',
      padding: '24px',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
          Listening Patterns
        </h2>
        <button
          onClick={fetchPatterns}
          disabled={loading}
          style={{ background: 'none', border: 'none', color: '#444', fontSize: '0.8rem', cursor: loading ? 'default' : 'pointer', padding: '4px 0' }}
        >
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {loading && !patterns && (
        <p style={{ color: '#444', fontSize: '0.9rem', margin: 0 }}>Analyzing your history...</p>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>{error}</p>
      )}

      {patterns && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: '#ccc', fontSize: '0.9rem', lineHeight: '1.7' }}>
            {patterns.insight}
          </p>

          {(patterns.timePattern || patterns.trend) && (
            <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {patterns.timePattern && (
                <p style={{ margin: 0, color: '#666', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  {patterns.timePattern}
                </p>
              )}
              {patterns.trend && (
                <p style={{ margin: 0, color: '#666', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  {patterns.trend}
                </p>
              )}
            </div>
          )}

          {patterns.dominantMood && (
            <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: '16px' }}>
              <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Dominant mood
              </div>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', textTransform: 'capitalize', marginTop: '6px' }}>
                {patterns.dominantMood}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

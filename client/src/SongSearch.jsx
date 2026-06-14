import { useState, useEffect, useRef } from 'react';

const inputStyle = {
  backgroundColor: '#141414',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.95rem',
  padding: '12px 16px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

async function searchItunes(query) {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8`
  );
  const data = await res.json();
  return data.results ?? [];
}

export default function SongSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const songs = await searchItunes(query);
        setResults(songs);
        setOpen(songs.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleSelect(song) {
    setSelected(song);
    setOpen(false);
    setQuery('');
    onSelect(song);
  }

  function handleClear() {
    setSelected(null);
    onSelect(null);
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {selected ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: '10px',
          padding: '10px 14px',
          boxSizing: 'border-box',
        }}>
          {selected.artworkUrl100 && (
            <img
              src={selected.artworkUrl100}
              alt=""
              style={{ width: '44px', height: '44px', borderRadius: '5px', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selected.trackName}
            </div>
            <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '2px' }}>
              {selected.artistName}
            </div>
          </div>
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0, padding: '4px 0' }}
          >
            Change
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Search for a song..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
          />
          {searching && (
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: '0.75rem' }}>
              searching...
            </div>
          )}
        </div>
      )}

      {open && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          backgroundColor: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          {results.map((song, i) => (
            <button
              key={song.trackId ?? i}
              onClick={() => handleSelect(song)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                borderBottom: i < results.length - 1 ? '1px solid #1a1a1a' : 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {song.artworkUrl100 ? (
                <img
                  src={song.artworkUrl100}
                  alt=""
                  style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#222', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.trackName}
                </div>
                <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.artistName}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

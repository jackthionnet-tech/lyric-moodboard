import { useState, useEffect, useRef } from 'react';

const inputStyle = {
  backgroundColor: '#111',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.95rem',
  padding: '12px 16px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

async function searchSongs(query) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/search?q=${encodeURIComponent(query)}`
  );
  return res.ok ? res.json() : [];
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
        const songs = await searchSongs(query);
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
    // Normalize to the shape the rest of the app expects
    setSelected(song);
    setOpen(false);
    setQuery('');
    onSelect({
      trackName: song.title,
      artistName: song.artist,
      artworkUrl100: song.artwork,
    });
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
          backgroundColor: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: '10px',
          padding: '10px 14px',
        }}>
          {selected.artwork && (
            <img
              src={selected.artwork}
              alt=""
              style={{ width: '44px', height: '44px', borderRadius: '5px', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selected.title}
            </div>
            <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '2px' }}>
              {selected.artist}
            </div>
          </div>
          <button
            onClick={handleClear}
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}
          >
            Change
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            className="search-input"
            style={inputStyle}
            type="text"
            placeholder="Search song or artist..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            autoComplete="off"
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
          backgroundColor: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          overflow: 'hidden',
          zIndex: 20,
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
        }}>
          {results.map((song, i) => (
            <button
              key={song.id ?? i}
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
              {song.artwork ? (
                <img src={song.artwork} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#222', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.title}
                </div>
                <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {song.artist}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

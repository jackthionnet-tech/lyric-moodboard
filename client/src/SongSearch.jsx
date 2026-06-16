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

async function searchItunes(songQuery, artistQuery) {
  const combined = [songQuery, artistQuery].filter(Boolean).join(' ').trim();

  const requests = [
    fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(combined)}&entity=song&limit=20`)
      .then(r => r.json()).then(d => d.results ?? []),
  ];

  // When an artist is specified, also search directly by artist name so niche
  // artists aren't buried by popular songs with the same title.
  if (artistQuery.trim()) {
    requests.push(
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artistQuery)}&attribute=artistTerm&entity=song&limit=25`)
        .then(r => r.json())
        .then(d => {
          const songs = d.results ?? [];
          if (!songQuery.trim()) return songs;
          const lower = songQuery.toLowerCase();
          return songs.filter(s => s.trackName?.toLowerCase().includes(lower));
        })
    );
  }

  const [combinedResults, artistResults = []] = await Promise.all(requests);

  // Merge, putting artist-specific matches first, then deduplicate by trackId.
  const seen = new Set();
  const merged = [];
  for (const song of [...artistResults, ...combinedResults]) {
    const key = song.trackId ?? `${song.trackName}-${song.artistName}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(song);
    }
  }
  return merged.slice(0, 20);
}

export default function SongSearch({ onSelect }) {
  const [songQuery, setSongQuery] = useState('');
  const [artistQuery, setArtistQuery] = useState('');
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
    const combined = [songQuery, artistQuery].filter(Boolean).join(' ').trim();
    if (!combined) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const songs = await searchItunes(songQuery, artistQuery);
        setResults(songs);
        setOpen(songs.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [songQuery, artistQuery]);

  function handleSelect(song) {
    setSelected(song);
    setOpen(false);
    setSongQuery('');
    setArtistQuery('');
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
          backgroundColor: '#111',
          border: '1px solid #2a2a2a',
          borderRadius: '10px',
          padding: '10px 14px',
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
            style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}
          >
            Change
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <input
              className="search-input"
              style={inputStyle}
              type="text"
              placeholder="Song title..."
              value={songQuery}
              onChange={e => setSongQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
            />
            {searching && (
              <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#444', fontSize: '0.75rem' }}>
                searching...
              </div>
            )}
          </div>
          <input
            className="search-input"
            style={inputStyle}
            type="text"
            placeholder="Artist (optional — helps narrow results)"
            value={artistQuery}
            onChange={e => setArtistQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
          />
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
                <img src={song.artworkUrl100} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0 }} />
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

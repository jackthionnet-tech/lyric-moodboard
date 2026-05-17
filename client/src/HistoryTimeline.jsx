function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HistoryTimeline({ history, onSelect, onClear }) {
  if (history.length === 0) return null;

  const reversed = [...history].reverse();

  return (
    <div style={{ width: '100%', maxWidth: '560px', marginTop: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
          History
        </h2>
        <button
          onClick={onClear}
          style={{ background: 'none', border: 'none', color: '#444', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0' }}
        >
          Clear all
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {reversed.map(entry => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '10px',
              padding: '12px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
          >
            <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
              {entry.colors.map(hex => (
                <div
                  key={hex}
                  style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: hex }}
                />
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {entry.songTitle}
              </div>
              <div style={{ color: '#555', fontSize: '0.8rem', textTransform: 'capitalize', marginTop: '2px' }}>
                {entry.mood}
              </div>
            </div>

            <div style={{ color: '#444', fontSize: '0.75rem', flexShrink: 0 }}>
              {formatRelativeTime(entry.analyzedAt)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

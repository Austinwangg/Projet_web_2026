export default function Stars({ value = 4.5 }) {
  return (
    <span className="stars" title={value}>
      {'★★★★★'.split('').map((c, i) => (
        <span key={i} style={{ opacity: value >= i + 0.5 ? 1 : 0.25 }}>★</span>
      ))}
      <span className="muted" style={{ marginLeft: 6, fontSize: 12, color: 'var(--ink-soft)' }}>{value.toFixed(1)}</span>
    </span>
  );
}

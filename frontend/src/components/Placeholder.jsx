export default function Placeholder({ label, ratio = '4/5', cat, style, className = '', imageUrl }) {
  if (imageUrl) {
    return (
      <div className={`ph ${className}`} data-cat={cat} style={{ aspectRatio: ratio, position: 'relative', overflow: 'hidden', ...style }}>
        <img
          src={imageUrl}
          alt={label}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    );
  }
  return (
    <div className={`ph ${className}`} data-cat={cat} style={{ aspectRatio: ratio, ...style }}>
      <span className="ph-label">{label}</span>
    </div>
  );
}

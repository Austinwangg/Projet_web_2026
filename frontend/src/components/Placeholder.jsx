export default function Placeholder({ label, ratio = '4/5', cat, style, className = '' }) {
  return (
    <div className={`ph ${className}`} data-cat={cat} style={{ aspectRatio: ratio, ...style }}>
      <span className="ph-label">{label}</span>
    </div>
  );
}

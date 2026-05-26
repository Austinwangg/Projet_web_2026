export default function Logo({ small = false }) {
  const size = small ? 28 : 36;
  return (
    <div className="vv-logo">
      <div className="vv-logo-mark" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" width={size * 0.62} height={size * 0.62} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="13.5" r="3.2" fill="currentColor" stroke="none" />
          <line x1="4" y1="20" x2="32" y2="20" />
          <path d="M7 27 L14 19 L18 24 L24 17 L29 27 Z" fill="currentColor" stroke="none" fillOpacity="0.85" />
        </svg>
      </div>
      {!small && (
        <span className="vv-logo-text">
          Voyage<em>Vista</em>
        </span>
      )}
    </div>
  );
}

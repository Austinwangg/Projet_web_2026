import { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return <div className="toast">✓ {message}</div>;
}

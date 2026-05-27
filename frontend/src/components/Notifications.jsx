import { useState, useEffect, useRef } from 'react';
import { getNotifications, markRead, markAllRead } from '../services/notificationService.js';

export default function Notifications({ user }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = async () => {
    if (!user?.id) return;
    try {
      const { data } = await getNotifications(user.id);
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {
      // backend indisponible — on affiche rien
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: 1 } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, lu: 1 })));
      setUnread(0);
    } catch { /* silent */ }
  };

  const iconForType = (type) => {
    if (type === 'reservation') return '✓';
    if (type === 'annulation') return '✕';
    if (type === 'transport') return '✈';
    if (type === 'activite') return '◇';
    return '✦';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (!user) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        style={{ position: 'relative' }}
        title="Notifications"
        aria-label="Notifications"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--accent)', color: 'white',
            fontSize: 10, fontWeight: 700,
            display: 'grid', placeItems: 'center',
            transform: 'translate(4px,-4px)'
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 360, maxHeight: 480, overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--line-soft)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 1000
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px 12px', borderBottom: '1px solid var(--line-soft)'
          }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
            {unread > 0 && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, padding: '2px 8px' }}
                onClick={handleMarkAllRead}
              >
                Tout marquer lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-faint)', fontSize: 13 }}>
              Aucune notification
            </div>
          ) : (
            <div>
              {notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => n.lu === 0 && handleMarkRead(n.id)}
                  style={{
                    display: 'flex', gap: 12, padding: '14px 20px',
                    borderBottom: '1px solid var(--line-soft)',
                    background: n.lu === 0 ? 'color-mix(in oklab, var(--primary) 6%, var(--surface))' : 'transparent',
                    cursor: n.lu === 0 ? 'pointer' : 'default',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontSize: 14
                  }}>
                    {iconForType(n.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13.5, fontWeight: n.lu === 0 ? 600 : 400,
                      color: 'var(--ink)', lineHeight: 1.3
                    }}>
                      {n.titre}
                    </div>
                    {n.message && (
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>
                        {n.message}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4, fontFamily: 'JetBrains Mono', letterSpacing: '0.05em' }}>
                      {formatDate(n.created_at).toUpperCase()}
                    </div>
                  </div>
                  {n.lu === 0 && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, alignSelf: 'center' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

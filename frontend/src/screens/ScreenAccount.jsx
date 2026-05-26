import { useState, useEffect } from 'react';
import { destinations, reservations } from '../data.js';
import Placeholder from '../components/Placeholder.jsx';
import { getNotifications, markRead, markAllRead } from '../services/notificationsService.js';

export default function ScreenAccount({ T, lang, navigate, user, onSignOut }) {
  const [tab, setTab] = useState('bookings');
  const R = reservations;
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (tab === 'notifications' && user?.id) {
      getNotifications(user.id)
        .then(({ data }) => {
          setNotifs(data.notifications || []);
          setUnreadCount(data.unread || 0);
        })
        .catch(() => {});
    }
  }, [tab, user]);

  const handleMarkRead = async (id) => {
    try {
      await markRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllRead(user.id);
      setNotifs(prev => prev.map(n => ({ ...n, lu: 1 })));
      setUnreadCount(0);
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
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="mono mb-16" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
        {(lang === 'fr' ? 'ACCUEIL' : 'HOME')} / <span style={{ color: 'var(--ink)' }}>{T.account.crumb.toUpperCase()}</span>
      </div>

      <div className="between mb-32" style={{ alignItems: 'flex-end' }}>
        <div className="row gap-16">
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{(user?.initials || 'JD')}</div>
          <div>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1 }}>{user?.name || 'Jean Dupont'}</h1>
            <p className="muted mt-4">jean.dupont@mail.com · {lang === 'fr' ? 'Membre depuis 2024' : 'Member since 2024'}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={onSignOut}>{T.cta.logout}</button>
      </div>

      <div className="tabs mb-32">
        {[
          { id: 'bookings', label: T.account.tabs[0] },
          { id: 'favorites', label: T.account.tabs[1] },
          { id: 'profile', label: T.account.tabs[2] },
          { id: 'notifications', label: T.account.tabs[3] }
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab === 'bookings' && (
        <div className="col gap-16 fade-up">
          {R.map(r => {
            const upcoming = r.status !== 'completed';
            const statusLabel = r.status === 'confirmed' ? T.account.confirmed : r.status === 'pending' ? T.account.pending : T.account.completed;
            const dotClass = r.status === 'confirmed' ? 'green' : r.status === 'pending' ? 'amber' : '';
            return (
              <div key={r.id} className="card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: 24, padding: 20, alignItems: 'center' }}>
                <Placeholder label={(lang === 'fr' ? r.dest : r.destEn).toUpperCase()} ratio="16/10" cat="ville" imageUrl={destinations.find(d => (lang === 'fr' ? r.dest : r.destEn).toLowerCase().includes(d.city.toLowerCase()))?.imageUrl} />
                <div>
                  <div className="row gap-8 mb-4">
                    <span className="tag"><span className={`dot ${dotClass}`}></span>{statusLabel}</span>
                    <span className="mono muted" style={{ fontSize: 11 }}>{T.account.ref} {r.ref}</span>
                  </div>
                  <div className="serif" style={{ fontSize: 28, lineHeight: 1.1 }}>{lang === 'fr' ? r.dest : r.destEn}</div>
                  <div className="muted mt-4" style={{ fontSize: 13.5 }}>
                    {lang === 'fr' ? r.date : r.dateEn} · {T.account.travelers(r.travelers)}
                  </div>
                </div>
                <div className="col" style={{ alignItems: 'flex-end', gap: 8 }}>
                  <div className="serif" style={{ fontSize: 26 }}>{r.total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</div>
                  <div className="row gap-8">
                    {upcoming && <button className="btn btn-outline btn-sm">{T.account.modify}</button>}
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('detail', { id: 'shanghai' })}>{T.account.details} →</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid grid-4 fade-up">
          {destinations.slice(0, 4).map(d => (
            <button key={d.id} className="dest" onClick={() => navigate('detail', { id: d.id })}>
              <Placeholder label={d.ph} ratio="4/5" cat={d.type} className="dest-img" imageUrl={d.imageUrl} />
              <div className="dest-meta">
                <div>
                  <div className="dest-name">{d.city}</div>
                  <div className="dest-country">{lang === 'fr' ? d.country : d.countryEn}</div>
                </div>
                <span>♥</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === 'profile' && (
        <div className="card-tile fade-up" style={{ padding: 40, maxWidth: 720 }}>
          <h3 className="serif mb-24" style={{ fontSize: 24 }}>{lang === 'fr' ? 'Informations personnelles' : 'Personal information'}</h3>
          <div className="col gap-16">
            <div className="grid grid-2 gap-16">
              <div>
                <label className="field-label">{lang === 'fr' ? 'Prénom' : 'First name'}</label>
                <input className="input" defaultValue="Jean" />
              </div>
              <div>
                <label className="field-label">{lang === 'fr' ? 'Nom' : 'Last name'}</label>
                <input className="input" defaultValue="Dupont" />
              </div>
            </div>
            <div>
              <label className="field-label">{T.auth.email}</label>
              <input className="input" defaultValue="jean.dupont@mail.com" />
            </div>
            <div className="grid grid-2 gap-16">
              <div>
                <label className="field-label">{lang === 'fr' ? 'Téléphone' : 'Phone'}</label>
                <input className="input" defaultValue="+33 6 12 34 56 78" />
              </div>
              <div>
                <label className="field-label">{lang === 'fr' ? 'Date de naissance' : 'Date of birth'}</label>
                <input className="input" defaultValue="14/02/1992" />
              </div>
            </div>
            <button className="btn btn-primary mt-16" style={{ alignSelf: 'flex-start' }}>{lang === 'fr' ? 'Enregistrer' : 'Save changes'}</button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="col gap-12 fade-up" style={{ maxWidth: 720 }}>
          {unreadCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                {lang === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
              </button>
            </div>
          )}
          {notifs.length === 0 ? (
            <div className="card-tile" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
              {lang === 'fr' ? 'Aucune notification pour le moment.' : 'No notifications yet.'}
            </div>
          ) : (
            notifs.map((n) => (
              <div
                key={n.id}
                className="card-tile row gap-16"
                style={{ padding: 18, alignItems: 'center', background: n.lu === 0 ? 'color-mix(in oklab, var(--primary) 5%, var(--surface))' : undefined, cursor: n.lu === 0 ? 'pointer' : 'default' }}
                onClick={() => n.lu === 0 && handleMarkRead(n.id)}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {iconForType(n.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: n.lu === 0 ? 600 : 500 }}>{n.titre}</div>
                  {n.message && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{n.message}</div>}
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 4 }}>{formatDate(n.created_at).toUpperCase()}</div>
                </div>
                {n.lu === 0 && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}></span>}
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}

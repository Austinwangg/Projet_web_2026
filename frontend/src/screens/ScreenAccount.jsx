import { useState } from 'react';
import { destinations, reservations } from '../data.js';
import Placeholder from '../components/Placeholder.jsx';

export default function ScreenAccount({ T, lang, navigate, user, onSignOut }) {
  const [tab, setTab] = useState('bookings');
  const R = reservations;

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
                <Placeholder label={(lang === 'fr' ? r.dest : r.destEn).toUpperCase()} ratio="16/10" cat="ville" />
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
              <Placeholder label={d.ph} ratio="4/5" cat={d.type} className="dest-img" />
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
          {[
            { i: '✓', t: lang === 'fr' ? 'Réservation Bali confirmée' : 'Bali booking confirmed', s: lang === 'fr' ? "Aujourd'hui · 10:32" : 'Today · 10:32', n: true },
            { i: '✈', t: lang === 'fr' ? 'Départ dans 2 jours · vol AF 116' : 'Departure in 2 days · flight AF 116', s: lang === 'fr' ? 'Hier · 09:15' : 'Yesterday · 09:15', n: true },
            { i: '◇', t: lang === 'fr' ? 'Atelier xiaolongbao : rappel J-1' : 'Xiaolongbao workshop: D-1 reminder', s: lang === 'fr' ? 'Il y a 3 jours' : '3 days ago', n: false },
            { i: '✦', t: lang === 'fr' ? 'Offre Kyoto -15% pour vous' : 'Kyoto offer -15% just for you', s: lang === 'fr' ? 'Il y a 5 jours' : '5 days ago', n: false }
          ].map((notif, i) => (
            <div key={i} className="card-tile row gap-16" style={{ padding: 18, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>{notif.i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{notif.t}</div>
                <div className="muted mono" style={{ fontSize: 11, marginTop: 2 }}>{notif.s.toUpperCase()}</div>
              </div>
              {notif.n && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}></span>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

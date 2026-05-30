import { useState, useEffect } from 'react';
import { destinations } from '../data.js';
import Placeholder from '../components/Placeholder.jsx';
import { updateProfile, changePassword } from '../services/authService.js';
import { getNotifications, markRead, markAllRead, deleteNotification, createNotification } from '../services/notificationService.js';
import { updateReservationStatus } from '../services/reservationsService.js';
import { getHebergementReservationsByUser, cancelHebergementReservation } from '../services/hebergementReservationsService.js';
import api from '../services/api.js';

export default function ScreenAccount({ T, lang, navigate, user, onSignOut, onUpdateUser }) {
  const [tab, setTab] = useState('bookings');

  // Profil
  const [prenom, setPrenom]           = useState(user?.prenom       || '');
  const [nom, setNom]                 = useState(user?.nom           || '');
  const [email, setEmail]             = useState(user?.email         || '');
  const [telephone, setTelephone]     = useState(user?.telephone     || '');
  const [dateNaissance, setDateNais]  = useState(user?.date_naissance|| '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]   = useState('');

  // Mot de passe
  const [curPwd, setCurPwd]   = useState('');
  const [newPwd, setNewPwd]   = useState('');
  const [pwdMsg, setPwdMsg]   = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  // Réservations voyages
  const [reservations, setReservations] = useState([]);
  const [resLoading, setResLoading]     = useState(false);
  const [resActionId, setResActionId]   = useState(null);

  // Réservations hôtels
  const [hotelReservations, setHotelReservations] = useState([]);
  const [hotelResLoading, setHotelResLoading]     = useState(false);
  const [hotelResActionId, setHotelResActionId]   = useState(null);

  // Notifications
  const [notifs, setNotifs]       = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  useEffect(() => {
    if (tab === 'bookings' && user?.id) {
      setResLoading(true);
      api.get('/reservations', { params: { user_id: user.id } })
        .then(r => setReservations(r.data))
        .catch(() => setReservations([]))
        .finally(() => setResLoading(false));

      setHotelResLoading(true);
      getHebergementReservationsByUser(user.id)
        .then(r => setHotelReservations(Array.isArray(r.data) ? r.data : []))
        .catch(() => setHotelReservations([]))
        .finally(() => setHotelResLoading(false));
    }
  }, [tab, user?.id]);

  useEffect(() => {
    if (tab === 'notifications' && user?.id) {
      setNotifsLoading(true);
      getNotifications(user.id)
        .then(r => setNotifs(r.data.notifications || []))
        .catch(() => setNotifs([]))
        .finally(() => setNotifsLoading(false));
    }
  }, [tab, user?.id]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const res = await updateProfile({
        id: user.id, nom, prenom, email, telephone, date_naissance: dateNaissance
      });
      onUpdateUser(res.data);
      setProfileMsg(lang === 'fr' ? '✓ Profil enregistré' : '✓ Profile saved');
    } catch (err) {
      setProfileMsg(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg('');
    setPwdSaving(true);
    try {
      await changePassword(user.id, curPwd, newPwd);
      setPwdMsg(lang === 'fr' ? '✓ Mot de passe modifié' : '✓ Password updated');
      setCurPwd(''); setNewPwd('');
    } catch (err) {
      setPwdMsg(err.response?.data?.error || 'Erreur.');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleMarkRead = async (id) => {
    await markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: 1 } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllRead(user.id);
    setNotifs(prev => prev.map(n => ({ ...n, lu: 1 })));
  };

  const handleDeleteNotif = async (id) => {
    await deleteNotification(id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const handleCancelHotelReservation = async (r) => {
    if (!window.confirm(lang === 'fr' ? `Annuler la réservation hôtel ${r.reference} ?` : `Cancel hotel booking ${r.reference}?`)) return;
    setHotelResActionId(r.id);
    try {
      await cancelHebergementReservation(r.id);
      setHotelReservations(prev => prev.map(x => x.id === r.id ? { ...x, statut: 'annulee' } : x));
      createNotification({
        utilisateur_id: user.id,
        type: 'info',
        titre: lang === 'fr' ? `Réservation hôtel annulée · ${r.reference}` : `Hotel booking cancelled · ${r.reference}`,
        message: lang === 'fr'
          ? `Votre réservation hôtel ${r.reference} a été annulée. La chambre a été restituée.`
          : `Your hotel booking ${r.reference} has been cancelled. The room has been released.`,
      }).catch(() => {});
    } catch { /* silent */ } finally {
      setHotelResActionId(null);
    }
  };

  const handleCancelReservation = async (r) => {
    if (!window.confirm(lang === 'fr' ? `Annuler la réservation ${r.reference} ?` : `Cancel booking ${r.reference}?`)) return;
    setResActionId(r.id);
    try {
      await updateReservationStatus(r.id, 'annulee');
      // Le backend gère déjà la restitution des places transport/hébergement/activités dans Reservation::cancel()
      setReservations(prev => prev.map(x => x.id === r.id ? { ...x, statut: 'annulee' } : x));
      createNotification({
        utilisateur_id: user.id,
        type:    'info',
        titre:   lang === 'fr' ? `Réservation annulée · ${r.reference}` : `Booking cancelled · ${r.reference}`,
        message: lang === 'fr'
          ? `Votre réservation ${r.reference} a été annulée. Les places ont été restituées.`
          : `Your booking ${r.reference} has been cancelled. Seats have been released.`,
      }).catch(() => {});
    } catch { /* silent */ } finally {
      setResActionId(null);
    }
  };

  const unreadCount = notifs.filter(n => !n.lu).length;

  const iconForType = (type) => ({ booking: '✈️', promotion: '🎁', info: 'ℹ️', alert: '⚠️' }[type] || '🔔');

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusLabel = (s) => ({
    confirmee: T.account.confirmed,
    en_attente: T.account.pending,
    terminee: T.account.completed,
    annulee: lang === 'fr' ? 'Annulé' : 'Cancelled'
  }[s] || s);

  const dotClass = (s) => ({
    confirmee: 'green', en_attente: 'amber', terminee: '', annulee: 'red'
  }[s] || '');

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="mono mb-16" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
        {(lang === 'fr' ? 'ACCUEIL' : 'HOME')} / <span style={{ color: 'var(--ink)' }}>{T.account.crumb.toUpperCase()}</span>
      </div>

      <div className="between mb-32" style={{ alignItems: 'flex-end' }}>
        <div className="row gap-16">
          <div className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{user?.initials || 'VV'}</div>
          <div>
            <h1 className="serif" style={{ fontSize: 48, lineHeight: 1 }}>{user?.name || 'Voyageur'}</h1>
            <p className="muted mt-4">{user?.email} · {lang === 'fr' ? 'Membre depuis 2024' : 'Member since 2024'}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={onSignOut}>{T.cta.logout}</button>
      </div>

      <div className="tabs mb-32">
        {[
          { id: 'bookings',      label: T.account.tabs[0] },
          { id: 'favorites',     label: T.account.tabs[1] },
          { id: 'profile',       label: T.account.tabs[2] },
          { id: 'notifications', label: unreadCount > 0 ? `${T.account.tabs[3]} (${unreadCount})` : T.account.tabs[3] }
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {/* ── Réservations ── */}
      {tab === 'bookings' && (
        <div className="col gap-32 fade-up">

          {/* Voyages */}
          <div>
            <h3 className="serif mb-16" style={{ fontSize: 22 }}>
              ✈ {lang === 'fr' ? 'Mes voyages' : 'My trips'}
            </h3>
            {resLoading && <p className="muted">{lang === 'fr' ? 'Chargement…' : 'Loading…'}</p>}
            {!resLoading && reservations.length === 0 && (
              <p className="muted">{T.account.noBookings}</p>
            )}
          <div className="col gap-16">
          {reservations.map(r => {
            const destImg  = r.dest_image || destinations.find(d => d.id === (r.slug || ''))?.imageUrl;
            const destName = lang === 'fr' ? (r.ville || r.slug || '') : (r.pays_en || r.ville || r.slug || '');
            const canCancel = r.statut === 'confirmee' || r.statut === 'en_attente';
            return (
              <div key={r.id} className="card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: 24, padding: 20, alignItems: 'center' }}>
                <Placeholder label={destName.toUpperCase()} ratio="16/10" cat="ville" imageUrl={destImg} />
                <div>
                  <div className="row gap-8 mb-4">
                    <span className="tag"><span className={`dot ${dotClass(r.statut)}`}></span>{statusLabel(r.statut)}</span>
                    <span className="mono muted" style={{ fontSize: 11 }}>{T.account.ref} {r.reference}</span>
                  </div>
                  <div className="serif" style={{ fontSize: 28, lineHeight: 1.1 }}>{destName}</div>
                  <div className="muted mt-4" style={{ fontSize: 13.5 }}>
                    {r.date_depart} → {r.date_retour} · {T.account.travelers(r.nb_voyageurs)}
                  </div>
                  {r.transport_id && (
                    <div className="row gap-6 mt-6" style={{ flexWrap: 'wrap' }}>
                      <span className="tag" style={{ fontSize: 12 }}>
                        ✈ {r.transport_depart || ''} → {r.transport_arrivee || ''}
                        {r.compagnie ? ` · ${r.compagnie}` : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="col" style={{ alignItems: 'flex-end', gap: 8 }}>
                  <div className="serif" style={{ fontSize: 26 }}>{Number(r.montant_total).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</div>
                  <div className="row gap-8">
                    {canCancel && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        disabled={resActionId === r.id}
                        onClick={() => handleCancelReservation(r)}>
                        {resActionId === r.id ? '…' : (lang === 'fr' ? 'Annuler' : 'Cancel')}
                      </button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('detail', { id: r.slug || 'shanghai' })}>{T.account.details} →</button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

          {/* Hôtels */}
          <div>
            <h3 className="serif mb-16" style={{ fontSize: 22 }}>
              🏨 {lang === 'fr' ? 'Mes hôtels réservés' : 'My hotel bookings'}
            </h3>
            {hotelResLoading && <p className="muted">{lang === 'fr' ? 'Chargement…' : 'Loading…'}</p>}
            {!hotelResLoading && hotelReservations.length === 0 && (
              <p className="muted">{lang === 'fr' ? 'Aucune réservation d\'hôtel pour l\'instant.' : 'No hotel bookings yet.'}</p>
            )}
            <div className="col gap-16">
              {hotelReservations.map(r => {
                const canCancel = r.statut === 'confirmee' || r.statut === 'en_attente';
                return (
                  <div key={r.id} className="card" style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: 24, padding: 20, alignItems: 'center' }}>
                    <Placeholder label={(r.hotel_nom || '').toUpperCase()} ratio="16/10" cat="hotel" imageUrl={r.hotel_image} />
                    <div>
                      <div className="row gap-8 mb-4">
                        <span className="tag"><span className={`dot ${dotClass(r.statut)}`}></span>{statusLabel(r.statut)}</span>
                        <span className="mono muted" style={{ fontSize: 11 }}>Réf. {r.reference}</span>
                      </div>
                      <div className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>{r.hotel_nom}</div>
                      <div className="muted mt-4" style={{ fontSize: 13 }}>
                        {r.quartier ? `${r.quartier} · ` : ''}{r.ville}
                        {lang === 'fr' ? `, ${r.pays_fr}` : `, ${r.pays_en}`}
                      </div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                        {lang === 'fr' ? 'Arrivée' : 'Check-in'}: {r.date_arrivee}
                        {' → '}
                        {lang === 'fr' ? 'Départ' : 'Check-out'}: {r.date_depart}
                      </div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                        {r.nb_personnes} {lang === 'fr' ? `personne${r.nb_personnes > 1 ? 's' : ''}` : `guest${r.nb_personnes > 1 ? 's' : ''}`}
                        {' · '}
                        {r.nb_nuits} {lang === 'fr' ? `nuit${r.nb_nuits > 1 ? 's' : ''}` : `night${r.nb_nuits > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <div className="col" style={{ alignItems: 'flex-end', gap: 8 }}>
                      <div className="serif" style={{ fontSize: 26 }}>
                        {Number(r.montant_total).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                      </div>
                      {canCancel && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          disabled={hotelResActionId === r.id}
                          onClick={() => handleCancelHotelReservation(r)}
                        >
                          {hotelResActionId === r.id ? '…' : (lang === 'fr' ? 'Annuler' : 'Cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── Favoris ── */}
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

      {/* ── Profil ── */}
      {tab === 'profile' && (
        <div className="col gap-24 fade-up" style={{ maxWidth: 720 }}>
          <div className="card-tile" style={{ padding: 40 }}>
            <h3 className="serif mb-24" style={{ fontSize: 24 }}>{lang === 'fr' ? 'Informations personnelles' : 'Personal information'}</h3>
            <div className="col gap-16">
              <div className="grid grid-2 gap-16">
                <div>
                  <label className="field-label">{lang === 'fr' ? 'Prénom' : 'First name'}</label>
                  <input className="input" value={prenom} onChange={e => setPrenom(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">{lang === 'fr' ? 'Nom' : 'Last name'}</label>
                  <input className="input" value={nom} onChange={e => setNom(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="field-label">{T.auth.email}</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="grid grid-2 gap-16">
                <div>
                  <label className="field-label">{lang === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input className="input" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+33 6 12 34 56 78" />
                </div>
                <div>
                  <label className="field-label">{lang === 'fr' ? 'Date de naissance' : 'Date of birth'}</label>
                  <input className="input" type="date" value={dateNaissance} onChange={e => setDateNais(e.target.value)} />
                </div>
              </div>
              {profileMsg && (
                <div style={{
                  fontSize: 13, padding: '8px 12px', borderRadius: 8,
                  color: profileMsg.startsWith('✓') ? 'var(--ok)' : 'var(--danger)',
                  background: profileMsg.startsWith('✓') ? 'color-mix(in oklab, var(--ok) 10%, transparent)' : 'color-mix(in oklab, var(--danger) 10%, transparent)'
                }}>{profileMsg}</div>
              )}
              <button className="btn btn-primary mt-8" style={{ alignSelf: 'flex-start' }} onClick={handleSaveProfile} disabled={profileSaving}>
                {profileSaving ? '…' : (lang === 'fr' ? 'Enregistrer' : 'Save changes')}
              </button>
            </div>
          </div>

          <div className="card-tile" style={{ padding: 40 }}>
            <h3 className="serif mb-24" style={{ fontSize: 24 }}>{lang === 'fr' ? 'Changer le mot de passe' : 'Change password'}</h3>
            <div className="col gap-16">
              <div>
                <label className="field-label">{lang === 'fr' ? 'Mot de passe actuel' : 'Current password'}</label>
                <input className="input" type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} />
              </div>
              <div>
                <label className="field-label">{lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}</label>
                <input className="input" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="min. 6 caractères" />
              </div>
              {pwdMsg && (
                <div style={{
                  fontSize: 13, padding: '8px 12px', borderRadius: 8,
                  color: pwdMsg.startsWith('✓') ? 'var(--ok)' : 'var(--danger)',
                  background: pwdMsg.startsWith('✓') ? 'color-mix(in oklab, var(--ok) 10%, transparent)' : 'color-mix(in oklab, var(--danger) 10%, transparent)'
                }}>{pwdMsg}</div>
              )}
              <button className="btn btn-outline mt-8" style={{ alignSelf: 'flex-start' }} onClick={handleChangePassword} disabled={pwdSaving}>
                {pwdSaving ? '…' : (lang === 'fr' ? 'Changer le mot de passe' : 'Change password')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
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

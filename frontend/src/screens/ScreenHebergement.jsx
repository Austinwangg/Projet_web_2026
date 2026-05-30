import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { createHebergementReservation } from '../services/hebergementReservationsService.js';
import { createNotification } from '../services/notificationService.js';
import Placeholder from '../components/Placeholder.jsx';

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function calcNights(dateArrivee, dateDepart) {
  if (!dateArrivee || !dateDepart) return 0;
  const d1 = new Date(dateArrivee);
  const d2 = new Date(dateDepart);
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function StarsDisplay({ n }) {
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
      {'★'.repeat(Math.max(0, n))}{'☆'.repeat(Math.max(0, 5 - n))}
    </span>
  );
}

export default function ScreenHebergement({ T, lang, navigate, user, onSignIn }) {
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedPays, setSelectedPays] = useState('');

  const [bookingHotel, setBookingHotel] = useState(null);
  const [dateArrivee, setDateArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [nbPersonnes, setNbPersonnes] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/hebergements?with_dest=1')
      .then(r => setAllHotels(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAllHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const countries = [...new Set(
    allHotels.map(h => lang === 'fr' ? h.pays_fr : h.pays_en).filter(Boolean)
  )].sort();

  const searchLower = searchText.toLowerCase().trim();
  const displayedHotels = allHotels.filter(h => {
    const pays = (lang === 'fr' ? h.pays_fr : h.pays_en) || '';
    const matchPays = !selectedPays || pays === selectedPays;
    const matchSearch = !searchLower
      || pays.toLowerCase().includes(searchLower)
      || (h.nom || '').toLowerCase().includes(searchLower)
      || (h.ville || '').toLowerCase().includes(searchLower);
    return matchPays && matchSearch;
  });

  const showResults = selectedPays || searchLower.length >= 2;

  const nights = calcNights(dateArrivee, dateDepart);
  const total = bookingHotel ? nights * Number(bookingHotel.prix_nuit) * nbPersonnes : 0;
  const todayISO = toLocalISO(new Date());

  const openBooking = (hotel) => {
    if (!user) { onSignIn('signin'); return; }
    setBookingHotel(hotel);
    setDateArrivee('');
    setDateDepart('');
    setNbPersonnes(1);
    setBookingError('');
    setBookingSuccess(null);
  };

  const closeBooking = () => {
    setBookingHotel(null);
    setBookingError('');
    setBookingSuccess(null);
  };

  const handleBook = async () => {
    if (!dateArrivee || !dateDepart) {
      setBookingError(lang === 'fr' ? "Veuillez renseigner les dates d'arrivée et de départ." : 'Please fill in the check-in and check-out dates.');
      return;
    }
    if (nights <= 0) {
      setBookingError(lang === 'fr' ? "La date de départ doit être après la date d'arrivée." : 'Check-out must be after check-in.');
      return;
    }
    const dispo = bookingHotel.nb_chambres_dispo ?? 0;
    if (nbPersonnes > dispo) {
      const msg = lang === 'fr'
        ? `Pas assez de chambres disponibles — il reste ${dispo} chambre${dispo > 1 ? 's' : ''}, vous en demandez ${nbPersonnes}.`
        : `Not enough rooms available — ${dispo} room${dispo > 1 ? 's' : ''} left, you requested ${nbPersonnes}.`;
      setBookingError(msg);
      return;
    }
    setBookingLoading(true);
    setBookingError('');
    try {
      const res = await createHebergementReservation({
        utilisateur_id: user.id,
        hebergement_id: bookingHotel.id,
        date_arrivee: dateArrivee,
        date_depart: dateDepart,
        nb_personnes: nbPersonnes,
        montant_total: total,
      });

      createNotification({
        utilisateur_id: user.id,
        type: 'booking',
        titre: lang === 'fr'
          ? `Hôtel réservé — ${bookingHotel.nom}`
          : `Hotel booked — ${bookingHotel.nom}`,
        message: lang === 'fr'
          ? `Réservation ${res.data.reference} confirmée · ${nights} nuit${nights > 1 ? 's' : ''} · ${total.toLocaleString('fr-FR')} €`
          : `Booking ${res.data.reference} confirmed · ${nights} night${nights > 1 ? 's' : ''} · €${total.toLocaleString('en-US')}`,
      }).catch(() => {});

      setBookingSuccess(res.data.reference);
      setAllHotels(prev => prev.map(h =>
        h.id === bookingHotel.id
          ? { ...h, nb_chambres_dispo: Math.max(0, (h.nb_chambres_dispo || 0) - nbPersonnes) }
          : h
      ));
    } catch (err) {
      setBookingError(err.response?.data?.error || (lang === 'fr' ? 'Erreur lors de la réservation.' : 'Booking error.'));
    } finally {
      setBookingLoading(false);
    }
  };

  const availColor = (n) => {
    if (n === 0) return 'var(--danger)';
    if (n <= 3) return '#f59e0b';
    return 'var(--ok)';
  };

  const availLabel = (n) => {
    if (n === 0) return lang === 'fr' ? 'Complet' : 'Fully booked';
    if (n <= 3) return lang === 'fr' ? `${n} chambre${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}` : `${n} room${n > 1 ? 's' : ''} left`;
    return lang === 'fr' ? `${n} chambres disponibles` : `${n} rooms available`;
  };

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

      {/* Breadcrumb */}
      <div className="mono mb-16" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
        {lang === 'fr' ? 'ACCUEIL' : 'HOME'} /{' '}
        <span style={{ color: 'var(--ink)' }}>{lang === 'fr' ? 'HÉBERGEMENTS' : 'ACCOMMODATIONS'}</span>
      </div>

      {/* Page header */}
      <div className="mb-40">
        <div className="mono muted mb-8" style={{ fontSize: 11, letterSpacing: '0.12em' }}>
          {lang === 'fr' ? 'HÉBERGEMENTS · RÉSERVATION DIRECTE' : 'ACCOMMODATIONS · DIRECT BOOKING'}
        </div>
        <h1 className="serif" style={{ fontSize: 56, lineHeight: 1.05, marginBottom: 12 }}>
          {lang === 'fr' ? <>Réservez un hôtel,{' '}<em>sans le voyage.</em></> : <>Book a hotel,{' '}<em>without the trip.</em></>}
        </h1>
        <p className="muted" style={{ fontSize: 16, maxWidth: 580 }}>
          {lang === 'fr'
            ? 'Choisissez un pays, trouvez l\'hôtel idéal et réservez directement — sans pack de voyage nécessaire.'
            : 'Pick a country, find the perfect hotel and book directly — no travel package required.'}
        </p>
      </div>

      {/* Search panel */}
      <div className="card-tile" style={{ padding: 32, marginBottom: 40 }}>
        <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>
          {lang === 'fr' ? 'Rechercher par pays ou nom d\'hôtel' : 'Search by country or hotel name'}
        </label>
        <input
          className="input"
          placeholder={lang === 'fr' ? 'Ex: Maroc, Japon, Grèce, Capella…' : 'Ex: Morocco, Japan, Greece, Capella…'}
          value={searchText}
          onChange={e => { setSearchText(e.target.value); setSelectedPays(''); }}
          style={{ marginBottom: 20 }}
        />

        {/* Country chips */}
        {!loading && (
          <>
            <div className="mono muted mb-12" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
              {lang === 'fr' ? 'PAYS DISPONIBLES' : 'AVAILABLE COUNTRIES'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {countries.map(pays => (
                <button
                  key={pays}
                  onClick={() => { setSelectedPays(pays === selectedPays ? '' : pays); setSearchText(''); }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 20,
                    border: `1.5px solid ${selectedPays === pays ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectedPays === pays ? 'var(--primary)' : 'transparent',
                    color: selectedPays === pays ? '#fff' : 'var(--ink)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {pays}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Loading */}
      {loading && <p className="muted">{lang === 'fr' ? 'Chargement des hébergements…' : 'Loading accommodations…'}</p>}

      {/* Empty prompt */}
      {!loading && !showResults && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink-faint)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🏨</div>
          <p className="serif" style={{ fontSize: 26 }}>
            {lang === 'fr' ? 'Choisissez un pays' : 'Choose a country'}
          </p>
          <p className="muted mt-8">
            {lang === 'fr'
              ? 'Sélectionnez un pays ci-dessus pour voir les hébergements disponibles.'
              : 'Select a country above to see available accommodations.'}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && showResults && (
        <>
          <div className="mono muted mb-24" style={{ fontSize: 11, letterSpacing: '0.1em' }}>
            {displayedHotels.length}{' '}
            {lang === 'fr' ? `hébergement${displayedHotels.length !== 1 ? 's' : ''}` : `hotel${displayedHotels.length !== 1 ? 's' : ''}`}
            {selectedPays ? ` — ${selectedPays}` : ''}
          </div>

          {displayedHotels.length === 0 ? (
            <div className="card-tile" style={{ padding: 40, textAlign: 'center', color: 'var(--ink-faint)' }}>
              {lang === 'fr' ? 'Aucun hébergement trouvé pour cette recherche.' : 'No accommodations found for this search.'}
            </div>
          ) : (
            <div className="grid grid-3" style={{ gap: 24 }}>
              {displayedHotels.map(hotel => {
                const dispo = hotel.nb_chambres_dispo ?? 0;
                const complet = dispo === 0;
                return (
                  <div key={hotel.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Placeholder
                      label={hotel.nom.toUpperCase()}
                      ratio="16/9"
                      cat="hotel"
                      imageUrl={hotel.image_url}
                      style={{ borderRadius: '12px 12px 0 0', flexShrink: 0 }}
                    />
                    <div style={{ padding: '20px 20px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span className="tag" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {hotel.hotel_type || hotel.type}
                        </span>
                        <StarsDisplay n={hotel.nb_etoiles || 4} />
                      </div>
                      <div className="serif" style={{ fontSize: 21, lineHeight: 1.2, marginBottom: 4 }}>{hotel.nom}</div>
                      <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>
                        {hotel.quartier ? `${hotel.quartier} · ` : ''}{hotel.ville}
                        {lang === 'fr' ? `, ${hotel.pays_fr}` : `, ${hotel.pays_en}`}
                      </div>
                      {(hotel.avantage_fr || hotel.avantage_en) && (
                        <div style={{ fontSize: 12.5, color: 'var(--ok)', marginBottom: 8 }}>
                          ✓ {lang === 'fr' ? hotel.avantage_fr : hotel.avantage_en}
                        </div>
                      )}
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, marginTop: 12 }}>
                          <div>
                            <span className="serif" style={{ fontSize: 22 }}>
                              {Number(hotel.prix_nuit).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                            </span>
                            <span className="muted" style={{ fontSize: 13 }}>
                              {' '}/ {lang === 'fr' ? 'nuit' : 'night'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: availColor(dispo) }}>
                            {availLabel(dispo)}
                          </div>
                        </div>
                        <button
                          className={complet ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                          style={{ width: '100%' }}
                          disabled={complet}
                          onClick={() => openBooking(hotel)}
                        >
                          {complet
                            ? (lang === 'fr' ? 'Complet' : 'Fully booked')
                            : (lang === 'fr' ? 'Réserver cet hôtel' : 'Book this hotel')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Booking modal */}
      {bookingHotel && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={e => e.target === e.currentTarget && closeBooking()}
        >
          <div
            className="card-tile"
            style={{
              padding: '40px 40px 36px',
              maxWidth: 500, width: '100%',
              background: 'var(--surface)',
              borderRadius: 16,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {bookingSuccess ? (
              /* ── Succès ── */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                <h3 className="serif" style={{ fontSize: 28, marginBottom: 8 }}>
                  {lang === 'fr' ? 'Réservation confirmée !' : 'Booking confirmed!'}
                </h3>
                <p className="muted" style={{ fontSize: 14, marginBottom: 4 }}>
                  {lang === 'fr' ? 'Référence' : 'Reference'}{' '}
                  <strong className="mono">{bookingSuccess}</strong>
                </p>
                <p className="muted" style={{ fontSize: 13 }}>
                  {lang === 'fr'
                    ? 'Votre réservation est visible dans votre profil. Une notification a été envoyée.'
                    : 'Your booking is visible in your profile. A notification has been sent.'}
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
                  <button className="btn btn-outline" onClick={closeBooking}>
                    {lang === 'fr' ? 'Continuer' : 'Continue'}
                  </button>
                  <button className="btn btn-primary" onClick={() => { closeBooking(); navigate('account'); }}>
                    {lang === 'fr' ? 'Voir mes réservations' : 'View my bookings'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Formulaire ── */
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <span className="tag" style={{ fontSize: 11, marginBottom: 6, display: 'inline-block' }}>
                      {bookingHotel.hotel_type || bookingHotel.type}
                    </span>
                    <h3 className="serif" style={{ fontSize: 26, lineHeight: 1.1 }}>{bookingHotel.nom}</h3>
                    <p className="muted" style={{ fontSize: 13 }}>
                      {bookingHotel.quartier ? `${bookingHotel.quartier} · ` : ''}
                      {bookingHotel.ville}{lang === 'fr' ? `, ${bookingHotel.pays_fr}` : `, ${bookingHotel.pays_en}`}
                    </p>
                  </div>
                  <button
                    onClick={closeBooking}
                    style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-faint)', padding: '4px 8px', lineHeight: 1 }}
                  >✕</button>
                </div>

                <div className="col gap-16">
                  <div className="grid grid-2 gap-16">
                    <div>
                      <label className="field-label">{lang === 'fr' ? "Date d'arrivée" : 'Check-in date'}</label>
                      <input
                        className="input"
                        type="date"
                        value={dateArrivee}
                        min={todayISO}
                        onChange={e => setDateArrivee(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">{lang === 'fr' ? 'Date de départ' : 'Check-out date'}</label>
                      <input
                        className="input"
                        type="date"
                        value={dateDepart}
                        min={dateArrivee || todayISO}
                        onChange={e => setDateDepart(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label">
                      {lang === 'fr' ? 'Nombre de personnes' : 'Number of guests'}
                    </label>
                    <input
                      className="input"
                      type="number"
                      value={nbPersonnes}
                      min={1}
                      max={10}
                      onChange={e => setNbPersonnes(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>

                  {nights > 0 && (
                    <div style={{
                      background: 'var(--surface-2)',
                      borderRadius: 8,
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {nights} {lang === 'fr' ? `nuit${nights > 1 ? 's' : ''}` : `night${nights > 1 ? 's' : ''}`}
                        {' × '}
                        {Number(bookingHotel.prix_nuit).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                        {' × '}
                        {nbPersonnes} {lang === 'fr' ? `personne${nbPersonnes > 1 ? 's' : ''}` : `guest${nbPersonnes > 1 ? 's' : ''}`}
                      </div>
                      <div className="serif" style={{ fontSize: 22 }}>
                        {total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                      </div>
                    </div>
                  )}

                  {bookingError && (
                    <div style={{
                      fontSize: 13, padding: '8px 12px', borderRadius: 8,
                      color: 'var(--danger)',
                      background: 'color-mix(in oklab, var(--danger) 10%, transparent)',
                    }}>
                      {bookingError}
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 4 }}
                    disabled={bookingLoading || nights <= 0}
                    onClick={handleBook}
                  >
                    {bookingLoading
                      ? '…'
                      : nights > 0
                        ? `${lang === 'fr' ? 'Confirmer' : 'Confirm'} · ${total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €`
                        : (lang === 'fr' ? 'Choisissez les dates' : 'Select the dates')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

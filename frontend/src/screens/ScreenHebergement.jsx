import { useState, useEffect } from 'react';
import api from '../services/api.js';
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

function fakeAvis(hotel) {
  return 48 + ((hotel.id * 23 + (hotel.nb_etoiles || 4) * 17) % 180);
}

// ── Calendrier inline pour sélection date d'arrivée / départ ────────────────
function MiniCalendar({ dateArrivee, dateDepart, onArrivee, onDepart, minDate, lang }) {
  const minDay = minDate ? new Date(minDate + 'T00:00:00') : new Date();
  minDay.setHours(0, 0, 0, 0);

  const [phase, setPhase] = useState('arrivee');
  const [viewYear, setViewYear] = useState(minDay.getFullYear());
  const [viewMonth, setViewMonth] = useState(minDay.getMonth());

  useEffect(() => {
    if (!dateArrivee && !dateDepart) setPhase('arrivee');
    else if (dateArrivee && !dateDepart) setPhase('depart');
  }, [dateArrivee, dateDepart]);

  const MONTHS = lang === 'fr'
    ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = lang === 'fr'
    ? ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDay = (day) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const clicked = new Date(iso + 'T00:00:00');
    if (clicked < minDay) return;

    if (phase === 'arrivee') {
      onArrivee(iso);
      onDepart('');
      setPhase('depart');
    } else {
      const arr = dateArrivee ? new Date(dateArrivee + 'T00:00:00') : null;
      if (!arr || clicked <= arr) {
        onArrivee(iso);
        onDepart('');
      } else {
        onDepart(iso);
        setPhase('arrivee');
      }
    }
  };

  const daysCount = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDow = new Date(viewYear, viewMonth, 1).getDay();
  const arr = dateArrivee ? new Date(dateArrivee + 'T00:00:00') : null;
  const dep = dateDepart ? new Date(dateDepart + 'T00:00:00') : null;

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysCount; d++) cells.push(d);

  return (
    <div>
      {/* Badges arrivée / départ */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          { key: 'arrivee', label: lang === 'fr' ? 'Arrivée' : 'Check-in',  val: dateArrivee },
          { key: 'depart',  label: lang === 'fr' ? 'Départ'  : 'Check-out', val: dateDepart  },
        ].map(({ key, label, val }) => (
          <button
            key={key}
            onClick={() => setPhase(key)}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 8, fontSize: 12,
              textAlign: 'center', cursor: 'pointer',
              background: phase === key ? 'var(--primary)' : 'var(--surface-2)',
              color: phase === key ? '#fff' : val ? 'var(--ink)' : 'var(--ink-faint)',
              border: `1.5px solid ${phase === key ? 'var(--primary)' : 'var(--border)'}`,
              transition: 'all 0.12s',
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 2 }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {val || (lang === 'fr' ? 'Choisir' : 'Select')}
            </div>
          </button>
        ))}
      </div>

      {/* Navigation mois */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: 'var(--ink)', padding: '2px 8px' }}>‹</button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: 'var(--ink)', padding: '2px 8px' }}>›</button>
      </div>

      {/* En-têtes jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-faint)', fontWeight: 600, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      {/* Cellules jours */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e${idx}`} />;
          const iso    = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const date   = new Date(iso + 'T00:00:00');
          const isPast = date < minDay;
          const isArr  = arr && date.getTime() === arr.getTime();
          const isDep  = dep && date.getTime() === dep.getTime();
          const inRange = arr && dep && date > arr && date < dep;
          const isEnd  = isArr || isDep;
          return (
            <button
              key={day}
              onClick={() => !isPast && handleDay(day)}
              style={{
                border: 'none', borderRadius: 6,
                padding: '7px 0', fontSize: 13, textAlign: 'center',
                cursor: isPast ? 'not-allowed' : 'pointer',
                fontWeight: isEnd ? 700 : 400,
                background: isEnd
                  ? 'var(--primary)'
                  : inRange
                    ? 'color-mix(in oklab, var(--primary) 18%, transparent)'
                    : 'transparent',
                color: isEnd ? '#fff' : isPast ? 'var(--ink-faint)' : 'var(--ink)',
                opacity: isPast ? 0.35 : 1,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ScreenHebergement({ T, lang, navigate, user, onSignIn, addToCart, itineraryMode, addToItinerary, itineraryTravelers, itineraryDates }) {
  const [allHotels, setAllHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedPays, setSelectedPays] = useState('');

  const [bookingHotel, setBookingHotel] = useState(null);
  const [dateArrivee, setDateArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [nbPersonnes, setNbPersonnes] = useState(() => itineraryTravelers && itineraryTravelers > 0 ? itineraryTravelers : 1);

  // Modal itinéraire (sélection dates + nb personnes avant d'ajouter)
  const [itinModal, setItinModal] = useState(null);
  const [itinDateArrivee, setItinDateArrivee] = useState('');
  const [itinDateDepart, setItinDateDepart] = useState('');
  const [itinNbPersonnes, setItinNbPersonnes] = useState(1);
  const [bookingError, setBookingError] = useState('');

  const todayISO = toLocalISO(new Date());

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

  const showResults = true;

  const nights = calcNights(dateArrivee, dateDepart);
  const total = bookingHotel ? nights * Number(bookingHotel.prix_nuit) * nbPersonnes : 0;
  const todayISO = toLocalISO(new Date());
  // Prix total = nuits × prix/nuit × nombre de personnes
  const total = bookingHotel ? nights * Number(bookingHotel.prix_nuit) * nbPersonnes : 0;

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
  };

  const handleBook = () => {
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

    addToCart([{
      id: `hotel-${bookingHotel.id}-${dateArrivee}`,
      kind: 'hotel',
      hebergementDbId: bookingHotel.id,
      destSlug: bookingHotel.dest_slug || '',
      title: bookingHotel.nom,
      sub: `${nights} nuit${nights > 1 ? 's' : ''} · ${nbPersonnes} pers. · ${dateArrivee} → ${dateDepart}`,
      price: total,
      priceUnit: 'total',
      nbVoyageurs: nbPersonnes,
      dateDepart: dateArrivee,
      dateRetour: dateDepart,
      icon: '🏨',
    }]);

    closeBooking();
  };

  const availColor = (n) => {
    if (n === 0) return 'var(--danger)';
    if (n <= 5) return '#f59e0b';
    return 'var(--ok)';
  };

  const availLabel = (n) => {
    if (n === 0) return lang === 'fr' ? 'Complet' : 'Fully booked';
    if (n <= 5) return lang === 'fr' ? `${n} place${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}` : `${n} spot${n > 1 ? 's' : ''} left`;
    return lang === 'fr' ? `${n} places disponibles` : `${n} spots available`;
  };

  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>

      {/* Bandeau mode sélection itinéraire */}
      {itineraryMode && (
        <div style={{
          background: 'color-mix(in oklab, #f59e0b 15%, var(--surface))',
          border: '2px solid #f59e0b',
          borderRadius: 12,
          padding: '14px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {lang === 'fr' ? 'Mode sélection — Itinéraire' : 'Selection mode — Itinerary'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-faint)', marginTop: 2 }}>
                {lang === 'fr'
                  ? 'Cliquez sur "Ajouter à l\'itinéraire" sur un hôtel pour l\'ajouter puis revenir.'
                  : 'Click "Add to itinerary" on a hotel to add it and return.'}
              </div>
            </div>
          </div>
          <div className="row gap-8">
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--ink-faint)' }} onClick={() => navigate('itinerary')}>
              {lang === 'fr' ? 'Passer cette étape →' : 'Skip this step →'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('itinerary')}>
              ← {lang === 'fr' ? 'Retour à l\'itinéraire' : 'Back to itinerary'}
            </button>
          </div>
        </div>
      )}

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
                const avis = fakeAvis(hotel);
                const note = Number(hotel.note || 4.5);
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
                        <span className="muted" style={{ fontSize: 11 }}>
                          {hotel.nb_etoiles || 4}★ {lang === 'fr' ? 'catégorie' : 'category'}
                        </span>
                      </div>

                      {/* Note et avis — étoiles alignées sur la note moyenne */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, fontSize: 12.5 }}>
                        <StarsDisplay n={Math.round(note)} />
                        <span style={{ fontWeight: 700, color: '#f59e0b' }}>{note.toFixed(1)}</span>
                        <span className="muted">·</span>
                        <span className="muted">
                          {avis} {lang === 'fr' ? 'avis' : 'reviews'}
                        </span>
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
                              {' '}/ {lang === 'fr' ? 'nuit/pers.' : 'night/guest'}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: availColor(dispo) }}>
                            {availLabel(dispo)}
                          </div>
                        </div>
                        {itineraryMode ? (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ width: '100%', background: '#f59e0b', border: 'none' }}
                            disabled={complet}
                            onClick={() => {
                              if (complet) return;
                              setItinModal(hotel);
                              setItinDateArrivee(itineraryDates?.depart || '');
                              setItinDateDepart(itineraryDates?.retour || '');
                              setItinNbPersonnes(itineraryTravelers && itineraryTravelers > 0 ? itineraryTravelers : 1);
                            }}
                          >
                            {complet
                              ? (lang === 'fr' ? 'Complet' : 'Fully booked')
                              : (lang === 'fr' ? '+ Ajouter à l\'itinéraire' : '+ Add to itinerary')}
                          </button>
                        ) : (
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
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal ajout itinéraire (dates + nb personnes) */}
      {itinModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => e.target === e.currentTarget && setItinModal(null)}
        >
          <div className="card-tile" style={{ padding: '36px 36px 28px', maxWidth: 480, width: '100%', background: 'var(--surface)', borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="tag" style={{ fontSize: 11, marginBottom: 6, display: 'inline-block', background: '#f59e0b', color: '#fff', border: 'none' }}>
                  {lang === 'fr' ? 'Itinéraire' : 'Itinerary'}
                </span>
                <h3 className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>{itinModal.nom}</h3>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  {itinModal.quartier ? `${itinModal.quartier} · ` : ''}{itinModal.ville}{lang === 'fr' ? `, ${itinModal.pays_fr}` : `, ${itinModal.pays_en}`}
                </p>
              </div>
              <button onClick={() => setItinModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-faint)', padding: '4px 8px', lineHeight: 1 }}>✕</button>
            </div>
            <div className="col gap-16">
              <div>
                <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>
                  {lang === 'fr' ? 'Dates du séjour' : 'Stay dates'}
                </label>
                <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px 14px' }}>
                  <MiniCalendar
                    dateArrivee={itinDateArrivee}
                    dateDepart={itinDateDepart}
                    onArrivee={setItinDateArrivee}
                    onDepart={setItinDateDepart}
                    minDate={toLocalISO(new Date())}
                    lang={lang}
                  />
                </div>
              </div>
              <div>
                <label className="field-label">{lang === 'fr' ? 'Nombre de personnes' : 'Number of guests'}</label>
                <div className="row gap-10" style={{ alignItems: 'center', marginTop: 6 }}>
                  <button className="btn btn-outline btn-sm" style={{ width: 36, height: 36, padding: 0 }} onClick={() => setItinNbPersonnes(n => Math.max(1, n - 1))}>−</button>
                  <span className="mono" style={{ fontSize: 18, minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{itinNbPersonnes}</span>
                  <button className="btn btn-outline btn-sm" style={{ width: 36, height: 36, padding: 0 }} onClick={() => setItinNbPersonnes(n => Math.min(itinModal.nb_chambres_dispo || 20, n + 1))}>+</button>
                </div>
              </div>
              {(() => {
                const nights = calcNights(itinDateArrivee, itinDateDepart);
                const total = nights * Number(itinModal.prix_nuit) * itinNbPersonnes;
                return nights > 0 ? (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="muted" style={{ fontSize: 13 }}>
                      {nights} {lang === 'fr' ? `nuit${nights > 1 ? 's' : ''}` : `night${nights > 1 ? 's' : ''}`}
                      {' × '}{Number(itinModal.prix_nuit).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                      {' × '}{itinNbPersonnes} {lang === 'fr' ? 'pers.' : `guest${itinNbPersonnes > 1 ? 's' : ''}`}
                    </span>
                    <span className="serif" style={{ fontSize: 20 }}>{total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
                  </div>
                ) : null;
              })()}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 4, background: '#f59e0b', border: 'none' }}
                disabled={!itinDateArrivee || !itinDateDepart || calcNights(itinDateArrivee, itinDateDepart) <= 0}
                onClick={() => {
                  if (!addToItinerary) return;
                  const nights = calcNights(itinDateArrivee, itinDateDepart);
                  const total = nights * Number(itinModal.prix_nuit) * itinNbPersonnes;
                  addToItinerary({
                    type: 'hebergement',
                    ref_id: itinModal.id,
                    destSlug: itinModal.dest_slug || '',
                    titre: itinModal.nom,
                    sous_titre: `${itinModal.quartier ? itinModal.quartier + ' · ' : ''}${itinModal.ville} · ${itinDateArrivee} → ${itinDateDepart} · ${itinNbPersonnes} ${lang === 'fr' ? 'pers.' : 'guest(s)'}`,
                    prix: total,
                    icone: '🏨',
                    date_item: itinDateArrivee,
                  });
                  setItinModal(null);
                }}
              >
                {(() => {
                  const nights = calcNights(itinDateArrivee, itinDateDepart);
                  if (!itinDateArrivee || !itinDateDepart || nights <= 0)
                    return lang === 'fr' ? 'Choisissez les dates' : 'Select dates';
                  const total = nights * Number(itinModal.prix_nuit) * itinNbPersonnes;
                  return `${lang === 'fr' ? '+ Ajouter à l\'itinéraire' : '+ Add to itinerary'} · ${total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €`;
                })()}
              </button>
            </div>
          </div>
        </div>
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
              maxWidth: 520, width: '100%',
              background: 'var(--surface)',
              borderRadius: 16,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* ── Formulaire ── */}
            {(
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
                  {/* Calendrier de sélection des dates */}
                  <div>
                    <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>
                      {lang === 'fr' ? 'Sélectionnez vos dates' : 'Select your dates'}
                    </label>
                    <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '16px 14px' }}>
                      <MiniCalendar
                        dateArrivee={dateArrivee}
                        dateDepart={dateDepart}
                        onArrivee={setDateArrivee}
                        onDepart={setDateDepart}
                        minDate={todayISO}
                        lang={lang}
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
                      max={bookingHotel.nb_chambres_dispo || 10}
                      onChange={e => setNbPersonnes(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>

                  {nights > 0 && (
                    <div style={{
                      background: 'var(--surface-2)',
                      borderRadius: 8,
                      padding: '14px 16px',
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="muted" style={{ fontSize: 13 }}>
                          {nights} {lang === 'fr' ? `nuit${nights > 1 ? 's' : ''}` : `night${nights > 1 ? 's' : ''}`}
                          {' × '}
                          {Number(bookingHotel.prix_nuit).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                          {' × '}
                          {nbPersonnes} {lang === 'fr' ? `pers.` : `guest${nbPersonnes > 1 ? 's' : ''}`}
                        </div>
                        <div className="serif" style={{ fontSize: 22 }}>
                          {total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                        </div>
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
                    disabled={nights <= 0}
                    onClick={handleBook}
                  >
                    {nights > 0
                      ? `🛒 ${lang === 'fr' ? 'Ajouter au panier' : 'Add to cart'} · ${total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €`
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

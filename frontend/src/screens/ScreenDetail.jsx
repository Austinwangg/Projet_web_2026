import { useState, useEffect } from 'react';
import { getDestinationBySlug } from '../services/destinationsService.js';
import Placeholder from '../components/Placeholder.jsx';
import Stars from '../components/Stars.jsx';

// Formate une Date locale en YYYY-MM-DD sans décalage timezone
function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Calcule la date de retour à partir d'une date départ (YYYY-MM-DD) + nombre de nuits
function addDays(dateStr, nights) {
  if (!dateStr) return '';
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 1, day + nights);
  return toLocalISO(d);
}

function today() {
  return toLocalISO(new Date());
}

export default function ScreenDetail({ T, lang, navigate, cart, addToCart, removeFromCart, destId, cardStyle, searchDates, searchTravelers }) {
  const [dest, setDest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState('overview');
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [favorite, setFavorite] = useState(false);

  // Dates et voyageurs — pré-remplir depuis la recherche si disponible
  const [dateDepart, setDateDepart] = useState(() => {
    if (searchDates?.start instanceof Date) return toLocalISO(searchDates.start);
    return today();
  });
  const [nbVoyageurs, setNbVoyageurs] = useState(() => {
    if (!searchTravelers) return 2;
    return (searchTravelers.adult || 0) + (searchTravelers.student || 0) + (searchTravelers.child || 0) || 2;
  });

  useEffect(() => {
    if (!destId) return;
    setLoading(true);
    setError(null);
    getDestinationBySlug(destId)
      .then(r => {
        const data = r.data;
        if (!data || data.error) { setError(true); return; }
        setDest(data);
        // Présélectionner le premier transport et hébergement dispo
        if (data.transports && data.transports.length) setSelectedTransport(data.transports[0].id);
        if (data.hebergements && data.hebergements.length) setSelectedHotel(data.hebergements[0].id);
        // Présélectionner les 2 premières activités
        if (data.activites && data.activites.length >= 2) {
          setSelectedActivities([data.activites[0].id, data.activites[1].id]);
        } else if (data.activites && data.activites.length === 1) {
          setSelectedActivities([data.activites[0].id]);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [destId]);

  const toggleActivity = (id) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <main className="container" style={{ paddingTop: 64 }}>
        <div className="card-tile center" style={{ padding: 80 }}>
          <p className="muted">{lang === 'fr' ? 'Chargement du séjour…' : 'Loading stay…'}</p>
        </div>
      </main>
    );
  }

  if (error || !dest) {
    return (
      <main className="container" style={{ paddingTop: 64 }}>
        <div className="card-tile center" style={{ padding: 80 }}>
          <p className="muted">{lang === 'fr' ? 'Destination introuvable.' : 'Destination not found.'}</p>
          <button className="btn btn-outline mt-16" onClick={() => navigate('results')}>{lang === 'fr' ? '← Retour au catalogue' : '← Back to catalog'}</button>
        </div>
      </main>
    );
  }

  const transport = (dest.transports || []).find(t => t.id === selectedTransport);
  const hotel = (dest.hebergements || []).find(h => h.id === selectedHotel);
  const acts = (dest.activites || []).filter(a => selectedActivities.includes(a.id));

  const nights = dest.duree_jours || 7;
  const dateRetour = addDays(dateDepart, nights - 1);

  const transportPrice = transport ? parseFloat(transport.prix) || 0 : 0;
  const hotelPrice = hotel ? (parseFloat(hotel.prix_nuit) || 0) * nights : 0;
  const actsPrice = acts.reduce((s, a) => s + (parseFloat(a.prix) || 0), 0) * nbVoyageurs;
  const subtotal = transportPrice * nbVoyageurs + hotelPrice + actsPrice;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  const onAddToCart = () => {
    const items = [];

    if (transport) {
      items.push({
        id: 'transport-' + transport.id,
        kind: 'flight',
        destSlug: destId,
        title: `${lang === 'fr' ? 'Vol A/R' : 'Round-trip'} · ${transport.depart} → ${transport.arrivee}`,
        sub: `${transport.compagnie} · ${transport.duree || ''}`,
        price: transportPrice * nbVoyageurs,
        icon: '✈',
      });
    }
    if (hotel) {
      items.push({
        id: 'hotel-' + hotel.id,
        kind: 'hotel',
        destSlug: destId,
        hebergementDbId: hotel.id,
        title: hotel.nom,
        sub: `${hotel.quartier || ''} · ${nights} ${lang === 'fr' ? 'nuits' : 'nights'}`,
        price: hotelPrice,
        icon: '⌂',
        dateDepart,
        dateRetour,
        nbVoyageurs,
      });
    }
    acts.forEach(a => {
      items.push({
        id: 'act-' + a.id,
        kind: 'activity',
        destSlug: destId,
        activiteDbId: a.id,
        title: lang === 'fr' ? a.nom_fr : a.nom_en,
        sub: `${a.duree || ''} · ${nbVoyageurs} ${lang === 'fr' ? 'pers.' : 'pax'}`,
        price: (parseFloat(a.prix) || 0) * nbVoyageurs,
        icon: '◇',
      });
    });

    addToCart(items);
    navigate('cart');
  };

  const city = dest.ville || '';
  const country = lang === 'fr' ? dest.pays_fr : dest.pays_en;
  const tag = lang === 'fr' ? dest.tag_fr : dest.tag_en;
  const blurb = lang === 'fr' ? dest.resume_fr : dest.resume_en;
  const note = parseFloat(dest.note) || 4.5;
  const nbAvis = dest.nb_avis || 0;

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      {/* Breadcrumb */}
      <div className="mono mb-16" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
        <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: 0 }} onClick={() => navigate('results')}>
          {T.detail.crumb[0].toUpperCase()} / {T.detail.crumb[1].toUpperCase()}
        </button>
        {' '}/ <span style={{ color: 'var(--ink)' }}>{country.toUpperCase()} · {city.toUpperCase()}</span>
      </div>

      {/* En-tête */}
      <div className="between mb-24" style={{ alignItems: 'flex-end' }}>
        <div>
          <div className="row gap-12 mb-8">
            <span className="dest-country">{country}</span>
            {tag && <span className="tag">{tag}</span>}
            <Stars value={note} />
            <span className="muted" style={{ fontSize: 13 }}>· {T.detail.reviews(nbAvis)}</span>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1 }}>
            {city} · {nights} {lang === 'fr' ? 'jours' : 'days'}
          </h1>
          <p className="muted mt-8" style={{ maxWidth: 640, fontSize: 16 }}>{blurb}</p>
        </div>
        <div className="row gap-8">
          <button className={`btn btn-outline ${favorite ? 'btn-ink' : ''}`} onClick={() => setFavorite(!favorite)}>
            {favorite ? '♥' : '♡'} {T.detail.favorite}
          </button>
          <button className="btn btn-outline">↗ {T.detail.share}</button>
        </div>
      </div>

      {/* Galerie (image principale + placeholders) */}
      <div className="gallery mb-32">
        <Placeholder label={city.toUpperCase()} ratio="auto" cat={dest.type} imageUrl={dest.image_url} />
        <Placeholder label={(lang === 'fr' ? dest.pays_fr : dest.pays_en).toUpperCase()} ratio="auto" cat={dest.type} />
        <Placeholder label={dest.type ? dest.type.toUpperCase() : ''} ratio="auto" cat={dest.type} />
        <Placeholder label="HOTEL" ratio="auto" cat={dest.type} imageUrl={hotel?.image_url} />
        <div style={{ position: 'relative' }}>
          <Placeholder label="ACTIVITÉS" ratio="auto" cat={dest.type} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>
            {T.detail.photos}
          </div>
        </div>
      </div>

      {/* 2 colonnes : contenu + carte de réservation */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        <div>
          {/* Onglets */}
          <div className="tabs mb-24">
            {[
              { id: 'overview',    label: T.detail.tabs[0] },
              { id: 'hotels',      label: T.detail.tabs[1] },
              { id: 'activities',  label: T.detail.tabs[2] },
              { id: 'transport',   label: T.detail.tabs[3] },
              { id: 'reviews',     label: T.detail.tabs[4] },
            ].map(t => (
              <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                {t.label}
              </div>
            ))}
          </div>

          {/* APERÇU */}
          {tab === 'overview' && (
            <div className="col gap-32 fade-up">
              <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'var(--ink-soft)', maxWidth: 640 }}>
                {blurb || (lang === 'fr' ? 'Découvrez cette destination exceptionnelle.' : 'Discover this exceptional destination.')}
              </p>

              {/* Ce qui est inclus */}
              <div>
                <h3 className="serif mb-16" style={{ fontSize: 28 }}>{T.detail.includes}</h3>
                <div className="grid grid-2 gap-12">
                  {[
                    lang === 'fr' ? 'Vols A/R inclus' : 'Round-trip flights',
                    lang === 'fr' ? `Hôtel ${nights} nuits` : `${nights}-night hotel`,
                    lang === 'fr' ? 'Activités sélectionnées' : 'Selected activities',
                    lang === 'fr' ? 'Assistance 24/7' : '24/7 assistance',
                    lang === 'fr' ? 'Annulation flexible J-7' : 'Flexible cancel D-7',
                    lang === 'fr' ? 'Assurance voyage' : 'Travel insurance',
                  ].map((it, i) => (
                    <div key={i} className="row" style={{ padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                      <span style={{ color: 'var(--primary)', fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 14 }}>{it}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations clés */}
              <div className="grid grid-2 gap-16">
                <div className="card-tile" style={{ padding: 20 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.12em', marginBottom: 6 }}>
                    {lang === 'fr' ? 'DURÉE' : 'DURATION'}
                  </div>
                  <div className="serif" style={{ fontSize: 24 }}>{nights} {lang === 'fr' ? 'jours' : 'days'}</div>
                </div>
                <div className="card-tile" style={{ padding: 20 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.12em', marginBottom: 6 }}>
                    {lang === 'fr' ? 'À PARTIR DE' : 'FROM'}
                  </div>
                  <div className="serif" style={{ fontSize: 24 }}>{dest.prix_depuis} €</div>
                </div>
                <div className="card-tile" style={{ padding: 20 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.12em', marginBottom: 6 }}>
                    {lang === 'fr' ? 'NOTE' : 'RATING'}
                  </div>
                  <div className="row gap-8">
                    <Stars value={note} />
                    <span className="serif" style={{ fontSize: 20 }}>{note}</span>
                  </div>
                </div>
                <div className="card-tile" style={{ padding: 20 }}>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.12em', marginBottom: 6 }}>
                    {lang === 'fr' ? 'AVIS' : 'REVIEWS'}
                  </div>
                  <div className="serif" style={{ fontSize: 24 }}>{nbAvis.toLocaleString()}</div>
                </div>
              </div>

              {/* Hébergements en aperçu */}
              {dest.hebergements && dest.hebergements.length > 0 && (
                <div>
                  <div className="between mb-16">
                    <h3 className="serif" style={{ fontSize: 28 }}>{T.detail.tabs[1]}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('hotels')}>
                      {lang === 'fr' ? 'Voir tout →' : 'See all →'}
                    </button>
                  </div>
                  <div className="grid grid-2 gap-12">
                    {dest.hebergements.slice(0, 2).map(h => (
                      <div key={h.id} className="card-tile" style={{ padding: 16 }}>
                        <div className="between">
                          <div className="serif" style={{ fontSize: 16 }}>{h.nom}</div>
                          <Stars value={parseFloat(h.note) || 4} size={12} />
                        </div>
                        <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{h.quartier}</div>
                        <div className="between mt-8">
                          <span className="tag tag-accent">✓ {lang === 'fr' ? h.avantage_fr : h.avantage_en}</span>
                          <span className="serif" style={{ fontSize: 18 }}>{h.prix_nuit} €<span className="muted" style={{ fontSize: 11 }}>/n</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activités en aperçu */}
              {dest.activites && dest.activites.length > 0 && (
                <div>
                  <div className="between mb-16">
                    <h3 className="serif" style={{ fontSize: 28 }}>{T.detail.tabs[2]}</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setTab('activities')}>
                      {lang === 'fr' ? 'Voir tout →' : 'See all →'}
                    </button>
                  </div>
                  <div className="col gap-8">
                    {dest.activites.slice(0, 3).map(a => (
                      <div key={a.id} className="row" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{lang === 'fr' ? a.nom_fr : a.nom_en}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{a.duree} · {a.categorie}</div>
                        </div>
                        <div className="serif" style={{ fontSize: 18 }}>{a.prix > 0 ? `${a.prix} €` : lang === 'fr' ? 'Gratuit' : 'Free'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRANSPORT */}
          {tab === 'transport' && (
            <div className="col gap-12 fade-up">
              <p className="muted mb-8" style={{ fontSize: 14 }}>
                {lang === 'fr' ? 'Choisissez votre transport — le total se met à jour.' : 'Pick your transport — total updates.'}
              </p>
              {(dest.transports || []).length === 0 ? (
                <p className="muted">{lang === 'fr' ? 'Aucun transport disponible.' : 'No transport available.'}</p>
              ) : (
                (dest.transports || []).map(t => (
                  <label key={t.id} className="card-tile" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, padding: 20, cursor: 'pointer', borderColor: selectedTransport === t.id ? 'var(--ink)' : 'var(--line-soft)' }}>
                    <input type="radio" name="transport" checked={selectedTransport === t.id} onChange={() => setSelectedTransport(t.id)} style={{ accentColor: 'var(--primary)' }} />
                    <div>
                      <div className="serif" style={{ fontSize: 20 }}>{t.compagnie}</div>
                      <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{t.depart} → {t.arrivee} · {t.duree}</div>
                      {t.horaire && <div className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4, letterSpacing: '0.06em' }}>{t.horaire}</div>}
                      {t.places_dispo !== undefined && (
                        <div className="mono" style={{ fontSize: 11, color: t.places_dispo < 5 ? 'var(--danger)' : 'var(--ok)', marginTop: 4 }}>
                          {t.places_dispo} {lang === 'fr' ? 'places restantes' : 'seats left'}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="serif" style={{ fontSize: 24 }}>{t.prix} €</div>
                      <div className="muted" style={{ fontSize: 11 }}>{T.detail.perPerson}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          )}

          {/* HÉBERGEMENTS */}
          {tab === 'hotels' && (
            <div className="col gap-16 fade-up">
              {(dest.hebergements || []).length === 0 ? (
                <p className="muted">{lang === 'fr' ? 'Aucun hébergement disponible.' : 'No accommodation available.'}</p>
              ) : (
                <div className="grid grid-2">
                  {(dest.hebergements || []).map(h => (
                    <button key={h.id} onClick={() => setSelectedHotel(h.id)} className="card-tile" style={{ border: selectedHotel === h.id ? '1.5px solid var(--ink)' : '1px solid var(--line-soft)', textAlign: 'left', padding: 0, overflow: 'hidden', cursor: 'pointer', background: 'var(--surface)' }}>
                      <Placeholder label={h.nom.toUpperCase()} ratio="16/10" cat={dest.type} style={{ borderRadius: 0 }} imageUrl={h.image_url} />
                      <div style={{ padding: 20 }}>
                        <div className="between">
                          <div className="serif" style={{ fontSize: 20 }}>{h.nom}</div>
                          <Stars value={parseFloat(h.note) || 4} />
                        </div>
                        <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{h.quartier}</div>
                        {h.nb_chambres_dispo !== undefined && (
                          <div className="mono" style={{ fontSize: 11, color: h.nb_chambres_dispo < 3 ? 'var(--danger)' : 'var(--ok)', marginTop: 6 }}>
                            {h.nb_chambres_dispo} {lang === 'fr' ? 'chambres dispo' : 'rooms available'}
                          </div>
                        )}
                        <div className="row gap-8 mt-12">
                          <span className="tag tag-accent">✓ {lang === 'fr' ? h.avantage_fr : h.avantage_en}</span>
                        </div>
                        <div className="between mt-16" style={{ paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
                          <div>
                            <span className="serif" style={{ fontSize: 22 }}>{h.prix_nuit} €</span>
                            <span className="muted" style={{ fontSize: 12, marginLeft: 4 }}>{T.detail.perNight}</span>
                          </div>
                          <span className="mono" style={{ fontSize: 11, color: selectedHotel === h.id ? 'var(--primary)' : 'var(--ink-faint)' }}>
                            {selectedHotel === h.id ? '● ' + (lang === 'fr' ? 'CHOISI' : 'SELECTED') : '○ ' + (lang === 'fr' ? 'CHOISIR' : 'SELECT')}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVITÉS */}
          {tab === 'activities' && (
            <div className="col gap-12 fade-up">
              {(dest.activites || []).length === 0 ? (
                <p className="muted">{lang === 'fr' ? 'Aucune activité disponible.' : 'No activity available.'}</p>
              ) : (
                (dest.activites || []).map(a => {
                  const on = selectedActivities.includes(a.id);
                  return (
                    <div key={a.id} className="card-tile" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: 20, padding: 16, alignItems: 'center', borderColor: on ? 'var(--ink)' : 'var(--line-soft)' }}>
                      <Placeholder label={(lang === 'fr' ? a.nom_fr : a.nom_en).split(' ').slice(0, 2).join(' ').toUpperCase()} ratio="1/1" cat={dest.type} style={{ height: 64, width: 64 }} />
                      <div>
                        <div className="serif" style={{ fontSize: 17 }}>{lang === 'fr' ? a.nom_fr : a.nom_en}</div>
                        <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{a.duree} · {a.categorie}</div>
                        {a.places_restantes !== undefined && (
                          <div className="mono" style={{ fontSize: 11, color: a.places_restantes < 5 ? 'var(--danger)' : 'var(--ok)', marginTop: 3 }}>
                            {a.places_restantes} {lang === 'fr' ? 'places' : 'spots'}
                          </div>
                        )}
                        {(lang === 'fr' ? a.description_fr : a.description_en) && (
                          <p className="muted" style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                            {(lang === 'fr' ? a.description_fr : a.description_en)}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="serif" style={{ fontSize: 20 }}>{a.prix > 0 ? `${a.prix} €` : lang === 'fr' ? 'Gratuit' : 'Free'}</div>
                        <div className="muted" style={{ fontSize: 11 }}>{a.prix > 0 ? T.detail.perPerson : ''}</div>
                      </div>
                      <button
                        className={`btn btn-sm ${on ? 'btn-ink' : 'btn-outline'}`}
                        onClick={() => toggleActivity(a.id)}
                        disabled={!on && a.places_restantes === 0}
                      >
                        {on ? '✓ ' + T.detail.added : '+ ' + T.detail.addItem}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* AVIS */}
          {tab === 'reviews' && (
            <div className="col gap-16 fade-up">
              <div className="card-tile" style={{ padding: 24, marginBottom: 8 }}>
                <div className="row gap-16" style={{ alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="serif" style={{ fontSize: 56, lineHeight: 1 }}>{note}</div>
                    <Stars value={note} />
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{nbAvis.toLocaleString()} {lang === 'fr' ? 'avis' : 'reviews'}</div>
                  </div>
                  <div className="col gap-8" style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => {
                      const pct = star === 5 ? 65 : star === 4 ? 20 : star === 3 ? 10 : star === 2 ? 3 : 2;
                      return (
                        <div key={star} className="row gap-8" style={{ alignItems: 'center' }}>
                          <span style={{ fontSize: 12, width: 16 }}>{star}</span>
                          <span style={{ color: 'var(--gold)' }}>★</span>
                          <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--gold)', borderRadius: 3 }} />
                          </div>
                          <span className="muted" style={{ fontSize: 11, width: 30, textAlign: 'right' }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Avis exemple */}
              {[
                { n: 'Camille R.', d: lang === 'fr' ? 'Mars 2026' : 'March 2026', r: 5, t: lang === 'fr' ? `Excellent séjour à ${city} ! Tout était parfaitement organisé.` : `Excellent stay in ${city}! Everything was perfectly organized.` },
                { n: 'Hugo & Sarah', d: lang === 'fr' ? 'Février 2026' : 'February 2026', r: 5, t: lang === 'fr' ? `Les activités étaient incroyables, l'hôtel magnifique.` : `The activities were incredible, the hotel beautiful.` },
                { n: 'Léa M.', d: lang === 'fr' ? 'Janvier 2026' : 'January 2026', r: 4, t: lang === 'fr' ? 'Très bon rapport qualité-prix. Je recommande vivement.' : 'Great value for money. Highly recommended.' }
              ].map((rv, i) => (
                <div key={i} className="card-tile">
                  <div className="between" style={{ marginBottom: 8 }}>
                    <div className="row gap-8">
                      <div className="avatar" style={{ background: 'var(--surface-2)', color: 'var(--ink)' }}>{rv.n[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{rv.n}</div>
                        <div className="muted mono" style={{ fontSize: 11 }}>{rv.d}</div>
                      </div>
                    </div>
                    <Stars value={rv.r} />
                  </div>
                  <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>"{rv.t}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CARTE DE RÉSERVATION */}
        <aside className="book-card" style={{ position: 'sticky', top: 24 }}>
          <div className="eyebrow mb-8">{T.detail.bookingCard.title}</div>
          <h3 className="serif" style={{ fontSize: 24, marginBottom: 4 }}>
            {city} · {nights} {lang === 'fr' ? 'jours' : 'days'}
          </h3>

          {/* Dates */}
          <div className="grid grid-2 gap-8 mt-12 mb-12">
            <div>
              <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                {lang === 'fr' ? 'DÉPART' : 'DEPARTURE'}
              </label>
              <input
                type="date"
                className="input"
                style={{ width: '100%', padding: '6px 10px', fontSize: 13, marginTop: 4 }}
                value={dateDepart}
                min={today()}
                onChange={e => setDateDepart(e.target.value)}
              />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                {lang === 'fr' ? 'RETOUR' : 'RETURN'}
              </label>
              <input
                type="date"
                className="input"
                style={{ width: '100%', padding: '6px 10px', fontSize: 13, marginTop: 4, background: 'var(--surface-2)', color: 'var(--ink-faint)' }}
                value={dateRetour}
                readOnly
              />
            </div>
          </div>

          {/* Voyageurs */}
          <div className="between mb-12">
            <span style={{ fontSize: 13 }}>{lang === 'fr' ? 'Voyageurs' : 'Travelers'}</span>
            <div className="row gap-8" style={{ alignItems: 'center' }}>
              <button className="btn btn-outline btn-sm" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setNbVoyageurs(Math.max(1, nbVoyageurs - 1))}>−</button>
              <span className="mono" style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>{nbVoyageurs}</span>
              <button className="btn btn-outline btn-sm" style={{ width: 28, height: 28, padding: 0 }} onClick={() => setNbVoyageurs(Math.min(10, nbVoyageurs + 1))}>+</button>
            </div>
          </div>

          <hr className="hr" style={{ margin: '16px 0' }} />

          {/* Détail des prix */}
          <div className="col gap-10">
            {transport && (
              <div className="between">
                <div className="row gap-8">
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>✈</span>
                  <span style={{ fontSize: 13 }}>{transport.compagnie}</span>
                </div>
                <span className="mono" style={{ fontSize: 13 }}>{(transportPrice * nbVoyageurs).toLocaleString()} €</span>
              </div>
            )}
            {hotel && (
              <div className="between">
                <div className="row gap-8">
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>⌂</span>
                  <span style={{ fontSize: 13 }}>{hotel.nom} · {nights}n</span>
                </div>
                <span className="mono" style={{ fontSize: 13 }}>{hotelPrice.toLocaleString()} €</span>
              </div>
            )}
            {acts.length > 0 && (
              <div className="between">
                <div className="row gap-8">
                  <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>◇</span>
                  <span style={{ fontSize: 13 }}>{acts.length} {lang === 'fr' ? 'activité(s)' : 'activity/ies'}</span>
                </div>
                <span className="mono" style={{ fontSize: 13 }}>{actsPrice.toLocaleString()} €</span>
              </div>
            )}
            <div className="between">
              <span className="muted" style={{ fontSize: 13 }}>{T.cart.taxes}</span>
              <span className="mono" style={{ fontSize: 13 }}>{taxes.toLocaleString()} €</span>
            </div>
          </div>

          <hr className="hr" style={{ margin: '16px 0' }} />

          <div className="between mb-16">
            <span style={{ fontSize: 14 }}>{T.detail.total}</span>
            <span className="serif" style={{ fontSize: 34 }}>{total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={onAddToCart}
            disabled={!transport && !hotel && acts.length === 0}
          >
            {T.detail.addToCart} →
          </button>

          <div className="muted center mono" style={{ fontSize: 10.5, marginTop: 12, letterSpacing: '0.1em' }}>
            {lang === 'fr' ? "ANNULATION FLEXIBLE JUSQU'À J-7" : 'FLEXIBLE CANCELLATION UP TO D-7'}
          </div>
        </aside>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { destinations, shanghaiDetail } from '../data.js';
import Placeholder from '../components/Placeholder.jsx';
import Stars from '../components/Stars.jsx';

export default function ScreenDetail({ T, lang, navigate, cart, addToCart, removeFromCart, destId, cardStyle }) {
  const D = destinations;
  const detail = shanghaiDetail;
  const isShanghai = destId === 'shanghai';
  const dest = D.find(d => d.id === destId) || D[0];
  const [tab, setTab] = useState('overview');
  const [selectedFlight, setSelectedFlight] = useState(detail.flights[0].id);
  const [selectedHotel, setSelectedHotel] = useState(detail.hotels[0].id);
  const [selectedActivities, setSelectedActivities] = useState([detail.activities[0].id, detail.activities[1].id]);
  const [favorite, setFavorite] = useState(false);

  const flight = detail.flights.find(f => f.id === selectedFlight);
  const hotel = detail.hotels.find(h => h.id === selectedHotel);
  const acts = detail.activities.filter(a => selectedActivities.includes(a.id));
  const nights = 7;
  const travelers = 2;

  const subtotal = flight.price * travelers + hotel.pricePerNight * nights + acts.reduce((s, a) => s + a.price, 0) * travelers;
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;

  const toggleActivity = (id) => setSelectedActivities(
    selectedActivities.includes(id) ? selectedActivities.filter(x => x !== id) : [...selectedActivities, id]
  );

  const onAddToCart = () => {
    addToCart([
      { id: 'flight-' + flight.id, kind: 'flight', title: `${lang === 'fr' ? 'Vol A/R' : 'Round-trip flight'} · ${flight.from.split(' ')[0]} → ${dest.city}`, sub: `${flight.airline} · ${flight.duration}`, price: flight.price * travelers, icon: '✈' },
      { id: 'hotel-' + hotel.id, kind: 'hotel', title: hotel.name, sub: `${hotel.area} · ${nights} ${lang === 'fr' ? 'nuits' : 'nights'}`, price: hotel.pricePerNight * nights, icon: '⌂' },
      ...acts.map(a => ({ id: 'act-' + a.id, kind: 'activity', title: typeof a.name === 'object' ? a.name[lang] : a.name, sub: `${a.duration} · ${travelers} ${lang === 'fr' ? 'pers.' : 'pax'}`, price: a.price * travelers, icon: '◇' }))
    ]);
    navigate('cart');
  };

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <div className="mono mb-16" style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--ink-faint)' }}>
        {T.detail.crumb[0].toUpperCase()} / {T.detail.crumb[1].toUpperCase()} / <span style={{ color: 'var(--ink)' }}>{(lang === 'fr' ? dest.country : dest.countryEn).toUpperCase()} · {dest.city.toUpperCase()}</span>
      </div>

      <div className="between mb-24" style={{ alignItems: 'flex-end' }}>
        <div>
          <div className="row gap-12 mb-8">
            <span className="dest-country">{lang === 'fr' ? dest.country : dest.countryEn}</span>
            <span className="tag">{lang === 'fr' ? dest.tag || 'Sélection' : dest.tagEn || 'Featured'}</span>
            <Stars value={dest.rating} />
            <span className="muted" style={{ fontSize: 13 }}>· {T.detail.reviews(dest.reviews)}</span>
          </div>
          <h1 className="serif" style={{ fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 1 }}>
            {isShanghai ? detail.title[lang] : `${dest.city} · ${dest.durationDays} ${lang === 'fr' ? 'jours' : 'days'}`}
          </h1>
          <p className="muted mt-8" style={{ maxWidth: 640, fontSize: 16 }}>
            {isShanghai ? detail.subtitle[lang] : (lang === 'fr' ? dest.blurb : dest.blurbEn)}
          </p>
        </div>
        <div className="row gap-8">
          <button className={`btn btn-outline ${favorite ? 'btn-ink' : ''}`} onClick={() => setFavorite(!favorite)}>
            {favorite ? '♥' : '♡'} {T.detail.favorite}
          </button>
          <button className="btn btn-outline">↗ {T.detail.share}</button>
        </div>
      </div>

      {/* Gallery */}
      <div className="gallery mb-32">
        <Placeholder label={detail.gallery[0]} ratio="auto" cat={dest.type} />
        <Placeholder label={detail.gallery[1]} ratio="auto" cat={dest.type} />
        <Placeholder label={detail.gallery[2]} ratio="auto" cat={dest.type} />
        <Placeholder label={detail.gallery[3]} ratio="auto" cat={dest.type} />
        <div style={{ position: 'relative' }}>
          <Placeholder label={detail.gallery[4]} ratio="auto" cat={dest.type} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'grid', placeItems: 'center', color: 'white', fontSize: 13, fontWeight: 600 }}>
            {T.detail.photos}
          </div>
        </div>
      </div>

      {/* Main 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        <div>
          <div className="tabs mb-24">
            {[
              { id: 'overview', label: T.detail.tabs[0] },
              { id: 'hotels', label: T.detail.tabs[1] },
              { id: 'activities', label: T.detail.tabs[2] },
              { id: 'transport', label: T.detail.tabs[3] },
              { id: 'reviews', label: T.detail.tabs[4] }
            ].map(t => (
              <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</div>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="col gap-32 fade-up">
              <p style={{ fontSize: 16.5, lineHeight: 1.7, color: 'var(--ink-soft)', maxWidth: 640 }}>
                {detail.description[lang]}
              </p>
              <div>
                <h3 className="serif mb-16" style={{ fontSize: 28 }}>{T.detail.includes}</h3>
                <div className="grid grid-2 gap-12">
                  {detail.inclusions[lang].map((it, i) => (
                    <div key={i} className="row" style={{ padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                      <span style={{ color: 'var(--primary)', fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 14 }}>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="between mb-16">
                  <h3 className="serif" style={{ fontSize: 28 }}>{lang === 'fr' ? 'Itinéraire jour par jour' : 'Day-by-day itinerary'}</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate('itinerary')}>{lang === 'fr' ? 'Voir le détail →' : 'See details →'}</button>
                </div>
                <div className="timeline">
                  {[
                    { d: lang === 'fr' ? 'JOUR 01' : 'DAY 01', t: lang === 'fr' ? 'Arrivée · Bund au crépuscule' : 'Arrival · Bund at dusk', i: '✈' },
                    { d: lang === 'fr' ? 'JOUR 02' : 'DAY 02', t: lang === 'fr' ? 'Yu Garden & maison de thé' : 'Yu Garden & tea house', i: '◇' },
                    { d: lang === 'fr' ? 'JOUR 03' : 'DAY 03', t: lang === 'fr' ? 'Pudong & Shanghai Tower' : 'Pudong & Shanghai Tower', i: '◇' },
                    { d: lang === 'fr' ? 'JOUR 04' : 'DAY 04', t: lang === 'fr' ? 'Atelier xiaolongbao' : 'Xiaolongbao workshop', i: '◇' },
                    { d: lang === 'fr' ? 'JOUR 05' : 'DAY 05', t: lang === 'fr' ? 'Excursion à Zhujiajiao' : 'Day trip to Zhujiajiao', i: '◇' },
                    { d: lang === 'fr' ? 'JOUR 06' : 'DAY 06', t: lang === 'fr' ? 'M50 & Tianzifang' : 'M50 & Tianzifang', i: '◇' },
                    { d: lang === 'fr' ? 'JOUR 07' : 'DAY 07', t: lang === 'fr' ? 'Retour · Vol de jour' : 'Departure · Day flight', i: '✈' }
                  ].map((s, i, arr) => (
                    <div key={i} className="tl-item">
                      <div className="tl-day">{s.d}</div>
                      <div className="tl-dot">{s.i}</div>
                      <div className="tl-body"><h4>{s.t}</h4></div>
                      {i < arr.length - 1 && <div className="tl-line" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'transport' && (
            <div className="col gap-12 fade-up">
              <p className="muted mb-8" style={{ fontSize: 14 }}>{lang === 'fr' ? 'Choisissez votre vol — le total se met à jour.' : 'Pick your flight — total updates.'}</p>
              {detail.flights.map(f => (
                <label key={f.id} className="card-tile" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 20, padding: 20, cursor: 'pointer', borderColor: selectedFlight === f.id ? 'var(--ink)' : 'var(--line-soft)' }}>
                  <input type="radio" name="flight" checked={selectedFlight === f.id} onChange={() => setSelectedFlight(f.id)} style={{ accentColor: 'var(--primary)' }} />
                  <div>
                    <div className="serif" style={{ fontSize: 20 }}>{f.airline}</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{f.from} → {f.to} · {f.duration}</div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4, letterSpacing: '0.06em' }}>{f.time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="serif" style={{ fontSize: 24 }}>{f.price} €</div>
                    <div className="muted" style={{ fontSize: 11 }}>{T.detail.perPerson}</div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {tab === 'hotels' && (
            <div className="grid grid-2 fade-up">
              {detail.hotels.map(h => (
                <button key={h.id} onClick={() => setSelectedHotel(h.id)} className="card-tile" style={{ border: selectedHotel === h.id ? '1.5px solid var(--ink)' : '1px solid var(--line-soft)', textAlign: 'left', padding: 0, overflow: 'hidden', cursor: 'pointer', background: 'var(--surface)' }}>
                  <Placeholder label={h.name.toUpperCase()} ratio="16/10" cat={dest.type} style={{ borderRadius: 0 }} />
                  <div style={{ padding: 20 }}>
                    <div className="between">
                      <div className="serif" style={{ fontSize: 22 }}>{h.name}</div>
                      <Stars value={h.rating} />
                    </div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{h.area}</div>
                    <div className="row gap-8 mt-16">
                      <span className="tag tag-accent">✓ {h.perk[lang]}</span>
                    </div>
                    <div className="between mt-16" style={{ paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
                      <div>
                        <span className="serif" style={{ fontSize: 24 }}>{h.pricePerNight} €</span>
                        <span className="muted" style={{ fontSize: 12, marginLeft: 4 }}>{T.detail.perNight}</span>
                      </div>
                      <span className="mono" style={{ fontSize: 11, color: selectedHotel === h.id ? 'var(--primary)' : 'var(--ink-faint)' }}>
                        {selectedHotel === h.id ? '● ' + (lang === 'fr' ? 'CHOISI' : 'SELECTED') : (lang === 'fr' ? '○ CHOISIR' : '○ SELECT')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {tab === 'activities' && (
            <div className="col gap-12 fade-up">
              {detail.activities.map(a => {
                const on = selectedActivities.includes(a.id);
                return (
                  <div key={a.id} className="card-tile" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto auto', gap: 20, padding: 16, alignItems: 'center', borderColor: on ? 'var(--ink)' : 'var(--line-soft)' }}>
                    <Placeholder label={(typeof a.name === 'object' ? a.name.fr : a.name).split(' ').slice(0, 2).join(' ').toUpperCase()} ratio="1/1" cat={dest.type} style={{ height: 64, width: 64 }} />
                    <div>
                      <div className="serif" style={{ fontSize: 18 }}>{typeof a.name === 'object' ? a.name[lang] : a.name}</div>
                      <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{a.duration}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="serif" style={{ fontSize: 22 }}>{a.price} €</div>
                      <div className="muted" style={{ fontSize: 11 }}>{T.detail.perPerson}</div>
                    </div>
                    <button className={`btn btn-sm ${on ? 'btn-ink' : 'btn-outline'}`} onClick={() => toggleActivity(a.id)}>
                      {on ? '✓ ' + T.detail.added : '+ ' + T.detail.addItem}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'reviews' && (
            <div className="col gap-16 fade-up">
              {[
                { n: 'Camille R.', d: lang === 'fr' ? 'Mars 2026' : 'March 2026', r: 5, t: lang === 'fr' ? "Itinéraire parfaitement composé, l'hôtel Middle House est exceptionnel. Le concierge VV a réagi en 5 minutes quand notre vol retour a été retardé." : 'Perfectly composed trip. The Middle House is exceptional. VV concierge responded in 5 min when our return flight was delayed.' },
                { n: 'Hugo & Sarah', d: lang === 'fr' ? 'Février 2026' : 'February 2026', r: 5, t: lang === 'fr' ? "L'atelier xiaolongbao chez l'habitant est ce qu'on garde en tête en rentrant. Pudong de nuit en croisière : magique." : "The xiaolongbao workshop is what stayed with us. Pudong cruise at night: magical." },
                { n: 'Léa M.', d: lang === 'fr' ? 'Janvier 2026' : 'January 2026', r: 4, t: lang === 'fr' ? 'Très bon rapport qualité-prix. Seul bémol : les trajets aéroport-ville auraient pu être mieux balisés.' : 'Great value. Only nitpick: airport transfers could have been clearer.' }
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

        {/* BOOKING CARD */}
        <aside className="book-card">
          <div className="eyebrow mb-8">{T.detail.bookingCard.title}</div>
          <h3 className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            {dest.city} · 7 {lang === 'fr' ? 'jours' : 'days'}
          </h3>
          <p className="muted" style={{ fontSize: 13 }}>{T.detail.bookingCard.for2}</p>
          <hr className="hr" style={{ margin: '20px 0' }} />
          <div className="col gap-12">
            <div className="between">
              <div className="row gap-8">
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>✈</span>
                <span style={{ fontSize: 13.5 }}>{flight.airline}</span>
              </div>
              <span className="mono" style={{ fontSize: 13 }}>{flight.price * travelers} €</span>
            </div>
            <div className="between">
              <div className="row gap-8">
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>⌂</span>
                <span style={{ fontSize: 13.5 }}>{hotel.name} · {nights}n</span>
              </div>
              <span className="mono" style={{ fontSize: 13 }}>{hotel.pricePerNight * nights} €</span>
            </div>
            <div className="between">
              <div className="row gap-8">
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)' }}>◇</span>
                <span style={{ fontSize: 13.5 }}>{acts.length} {lang === 'fr' ? 'activités' : 'activities'}</span>
              </div>
              <span className="mono" style={{ fontSize: 13 }}>{acts.reduce((s, a) => s + a.price, 0) * travelers} €</span>
            </div>
            <div className="between">
              <span className="muted" style={{ fontSize: 13 }}>{T.cart.taxes}</span>
              <span className="mono" style={{ fontSize: 13 }}>{taxes} €</span>
            </div>
          </div>
          <hr className="hr" style={{ margin: '20px 0' }} />
          <div className="between mb-16">
            <span style={{ fontSize: 14 }}>{T.detail.total}</span>
            <span className="serif" style={{ fontSize: 36 }}>{total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={onAddToCart}>
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

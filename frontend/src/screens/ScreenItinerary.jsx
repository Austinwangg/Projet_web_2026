export default function ScreenItinerary({ T, lang, navigate, cart }) {
  const steps = lang === 'fr' ? [
    { d: '15 JUIN', t: 'Vol CDG → Shanghai PVG', sub: 'Air France · 11h15 · Économique', icon: '✈', price: 612 },
    { d: '15-16 JUIN', t: 'Check-in The Middle House', sub: "Jing'an · Suite Deluxe · 7 nuits", icon: '⌂', price: 1995 },
    { d: '17 JUIN', t: 'Croisière nocturne sur le Huangpu', sub: '1h30 · 2 personnes', icon: '◇', price: 56 },
    { d: '18 JUIN', t: "Atelier xiaolongbao chez l'habitant", sub: '2h30 · 2 personnes', icon: '◇', price: 124 },
    { d: '20 JUIN', t: 'Vue panoramique Shanghai Tower', sub: '1h · 2 personnes', icon: '◇', price: 64 },
    { d: '22 JUIN', t: 'Vol retour Shanghai PVG → CDG', sub: 'Air France · 12h05 · Économique', icon: '✈', price: 612 }
  ] : [
    { d: 'JUN 15', t: 'Flight CDG → Shanghai PVG', sub: 'Air France · 11:15 · Economy', icon: '✈', price: 612 },
    { d: 'JUN 15-16', t: 'Check-in The Middle House', sub: "Jing'an · Deluxe Suite · 7 nights", icon: '⌂', price: 1995 },
    { d: 'JUN 17', t: 'Huangpu river night cruise', sub: '1h30 · 2 people', icon: '◇', price: 56 },
    { d: 'JUN 18', t: 'Xiaolongbao home workshop', sub: '2h30 · 2 people', icon: '◇', price: 124 },
    { d: 'JUN 20', t: 'Shanghai Tower panoramic view', sub: '1h · 2 people', icon: '◇', price: 64 },
    { d: 'JUN 22', t: 'Return flight Shanghai PVG → CDG', sub: 'Air France · 12:05 · Economy', icon: '✈', price: 612 }
  ];

  const total = steps.reduce((s, x) => s + x.price, 0);
  const taxes = Math.round(total * 0.06);
  const grand = total + taxes;

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="mb-32">
        <span className="eyebrow">{T.itinerary.eyebrow}</span>
        <h1 className="serif mt-8" style={{ fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 1 }}>
          {T.itinerary.title} <em style={{ color: 'var(--primary)' }}>{T.itinerary.titleEm}</em>
        </h1>
        <p className="muted mt-16" style={{ maxWidth: 540 }}>{T.itinerary.sub}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        <div className="card-tile" style={{ padding: 40 }}>
          <div className="timeline">
            {steps.map((s, i, arr) => (
              <div key={i} className="tl-item">
                <div className="tl-day">{s.d}</div>
                <div className="tl-dot" style={{ borderColor: s.icon === '✈' ? 'var(--primary)' : 'var(--line)' }}>{s.icon}</div>
                <div className="tl-body">
                  <h4>{s.t}</h4>
                  <div className="meta">{s.sub}</div>
                </div>
                <div className="tl-price">{s.price.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</div>
                {i < arr.length - 1 && <div className="tl-line" />}
              </div>
            ))}
          </div>
        </div>

        <aside className="book-card">
          <div className="eyebrow mb-16">{T.itinerary.total}</div>
          <div className="serif" style={{ fontSize: 64, lineHeight: 1 }}>
            {grand.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
          </div>
          <div className="muted mt-8" style={{ fontSize: 13 }}>
            {lang === 'fr' ? '2 voyageurs · 7 jours · taxes incluses' : '2 travelers · 7 days · taxes included'}
          </div>
          <hr className="hr" />
          <div className="col gap-8">
            <div className="between"><span className="muted" style={{ fontSize: 13 }}>{T.cart.subtotal}</span><span className="mono" style={{ fontSize: 13 }}>{total} €</span></div>
            <div className="between"><span className="muted" style={{ fontSize: 13 }}>{T.cart.taxes}</span><span className="mono" style={{ fontSize: 13 }}>{taxes} €</span></div>
          </div>
          <button className="btn btn-primary btn-lg mt-24" style={{ width: '100%' }} onClick={() => navigate('payment')}>
            {T.itinerary.checkout} →
          </button>
          <div className="col gap-8 mt-24">
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>↻ {lang === 'fr' ? 'Réorganiser les jours' : 'Reorder days'}</button>
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>+ {lang === 'fr' ? 'Ajouter une activité' : 'Add activity'}</button>
            <button className="btn btn-ghost btn-sm" style={{ justifyContent: 'flex-start' }}>↗ {lang === 'fr' ? "Partager l'itinéraire" : 'Share itinerary'}</button>
          </div>
        </aside>
      </div>
    </main>
  );
}

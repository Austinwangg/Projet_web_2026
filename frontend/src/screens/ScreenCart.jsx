export default function ScreenCart({ T, lang, cart, removeFromCart, navigate }) {
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const taxes = Math.round(subtotal * 0.06);
  const total = subtotal + taxes;
  const empty = cart.length === 0;

  const flightItem = cart.find(i => i.kind === 'flight');
  const hotelItem  = cart.find(i => i.kind === 'hotel');
  const travelers  = flightItem?.nbVoyageurs || hotelItem?.nbVoyageurs
    || cart.find(i => i.nbVoyageurs)?.nbVoyageurs || 2;
  const hotelNights = hotelItem
    ? Math.max(1, Math.round((new Date(hotelItem.dateRetour) - new Date(hotelItem.dateDepart)) / 86400000))
    : 7;
  const days = hotelNights;

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="stepper mb-32">
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Composition' : 'Compose'}</div>
        <div className="step active"><div className="step-num">2</div>{lang === 'fr' ? 'Panier' : 'Cart'}</div>
        <div className="step"><div className="step-num">3</div>{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
        <div className="step"><div className="step-num">4</div>{lang === 'fr' ? 'Confirmation' : 'Confirmation'}</div>
      </div>

      <div className="between mb-32" style={{ alignItems: 'flex-end' }}>
        <div>
          <span className="eyebrow">{T.cart.eyebrow}</span>
          <h1 className="serif mt-8" style={{ fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 1 }}>
            {T.cart.title} <em style={{ color: 'var(--primary)' }}>{T.cart.titleEm}</em>
          </h1>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('results')}>{T.cart.back}</button>
      </div>

      {empty ? (
        <div className="card-tile center" style={{ padding: 96 }}>
          <div className="serif" style={{ fontSize: 28, marginBottom: 12 }}>{T.cart.empty}</div>
          <button className="btn btn-primary" onClick={() => navigate('results')}>{T.cart.emptyCta}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'flex-start' }}>
          <div className="card-tile" style={{ padding: 32 }}>
            <div className="between mb-16">
              <h3 className="serif" style={{ fontSize: 24 }}>{lang === 'fr' ? 'Votre panier de voyage' : 'Your trip cart'}</h3>
              <span className="mono muted" style={{ fontSize: 12 }}>{cart.length} {lang === 'fr' ? 'ÉLÉMENTS' : 'ITEMS'}</span>
            </div>
            {cart.map((item, i) => (
              <div key={item.id} className="cart-line fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div className="cart-thumb" style={{ background: 'var(--surface-2)', display: 'grid', placeItems: 'center', fontSize: 24, color: 'var(--ink-faint)' }}>{item.icon}</div>
                <div className="cart-body">
                  <h5>{item.title}</h5>
                  <div className="meta">{item.sub}</div>
                </div>
                <div className="row gap-12">
                  <span className="cart-price">{item.price.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
                  <button className="btn btn-ghost btn-sm" title={T.cart.edit}>✎</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.id)} title={T.cart.remove} style={{ color: 'var(--danger)' }}>✕</button>
                </div>
              </div>
            ))}

            <div className="card-tile mt-24" style={{ background: 'color-mix(in oklab, var(--primary) 8%, transparent)', borderColor: 'transparent', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--primary)' }}>●</span>
              <div style={{ fontSize: 13 }}>
                <strong>{lang === 'fr' ? 'Notification activée' : 'Notification active'}.</strong>{' '}
                {lang === 'fr' ? 'Vous recevrez une confirmation par e-mail après validation.' : "You'll receive an email confirmation after checkout."}
              </div>
            </div>
          </div>

          <aside className="book-card">
            <div className="eyebrow mb-16">{T.cart.summary}</div>
            <div className="col gap-12">
              {cart.map(item => (
                <div key={item.id} className="between">
                  <span style={{ fontSize: 13.5 }}>{item.title.slice(0, 32)}{item.title.length > 32 ? '…' : ''}</span>
                  <span className="mono" style={{ fontSize: 13 }}>{item.price} €</span>
                </div>
              ))}
            </div>
            <hr className="hr" />
            <div className="col gap-8">
              <div className="between"><span className="muted" style={{ fontSize: 13 }}>{T.cart.subtotal}</span><span className="mono" style={{ fontSize: 13 }}>{subtotal} €</span></div>
              <div className="between"><span className="muted" style={{ fontSize: 13 }}>{T.cart.taxes}</span><span className="mono" style={{ fontSize: 13 }}>{taxes} €</span></div>
            </div>
            <hr className="hr" />
            <div className="between mb-8">
              <span style={{ fontSize: 14 }}>{T.cart.total}</span>
              <span className="serif" style={{ fontSize: 36 }}>{total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
            </div>
            <div className="muted mono mb-24" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
              {T.cart.for(travelers, days).toUpperCase()}
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('payment')}>
              {T.cart.pay} →
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

import { useState } from 'react';
import { createReservation } from '../services/reservationsService.js';
import { createNotification } from '../services/notificationService.js';
import api from '../services/api.js';

export default function ScreenPayment({ T, lang, cart, navigate, onPaid, user, search, detailId }) {
  const subtotal = cart.reduce((s, i) => s + i.price, 0);
  const taxes    = Math.round(subtotal * 0.06);
  const total    = subtotal + taxes || 1408;

  const [method, setMethod]       = useState('card');
  const [card, setCard]           = useState({ num: '4242 4242 4242 4242', name: user?.name || 'Jean Dupont', exp: '07/28', cvv: '342' });
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError]         = useState('');

  const pay = async () => {
    if (!user?.id) {
      setError(lang === 'fr' ? 'Vous devez être connecté pour réserver.' : 'You must be logged in to book.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Resolve destination slug from cart items or fallback
      const destSlug = cart.find(i => i.destSlug)?.destSlug || detailId || 'shanghai';

      // Get destination_id from backend
      const destRes = await api.get(`/destinations?slug=${destSlug}`);
      const destinationId = destRes.data?.id;
      if (!destinationId) throw new Error(lang === 'fr' ? 'Destination introuvable.' : 'Destination not found.');

      // Extract hebergement and activite DB ids from cart
      const hotelItem      = cart.find(i => i.kind === 'hotel');
      const actItems       = cart.filter(i => i.kind === 'activity');
      const hebergementId  = hotelItem?.hebergementDbId || null;
      const activiteIds    = actItems.map(i => i.activiteDbId).filter(Boolean);

      // Build dates — priorité aux dates de l'hôtel dans le panier (déjà calculées correctement dans ScreenDetail)
      const fmtLocal = (d) => {
        const dt = d instanceof Date ? d : new Date(d);
        const y  = dt.getFullYear();
        const m  = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      const hotelDates = cart.find(i => i.kind === 'hotel' && i.dateDepart);
      const dateDepart = hotelDates?.dateDepart
        ?? (search?.dates?.start ? fmtLocal(search.dates.start) : fmtLocal(new Date(Date.now() + 7  * 86400000)));
      const dateRetour = hotelDates?.dateRetour
        ?? (search?.dates?.end   ? fmtLocal(search.dates.end)   : fmtLocal(new Date(Date.now() + 14 * 86400000)));

      const travelers = search?.travelers
        ? (search.travelers.adult || 0) + (search.travelers.student || 0) + (search.travelers.child || 0)
        : 2;

      const res = await createReservation({
        utilisateur_id: user.id,
        destination_id: destinationId,
        hebergement_id: hebergementId,
        activite_ids:   activiteIds,
        date_depart:    dateDepart,
        date_retour:    dateRetour,
        nb_voyageurs:   travelers || 1,
        montant_total:  total,
        statut:         'confirmee',
      });

      const ref = res.data?.reference || 'VV-XXXXXXX';
      setReference(ref);

      // Notify user (non-blocking)
      createNotification({
        utilisateur_id: user.id,
        type:    'booking',
        titre:   lang === 'fr' ? `Réservation confirmée · ${ref}` : `Booking confirmed · ${ref}`,
        message: lang === 'fr'
          ? `Votre voyage a été confirmé. Référence : ${ref}.`
          : `Your trip has been confirmed. Reference: ${ref}.`,
      }).catch(() => {});

      setDone(true);
      onPaid();
    } catch (err) {
      setError(err.response?.data?.error || err.message || (lang === 'fr' ? 'Erreur lors de la réservation.' : 'Booking error.'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <main className="container" style={{ paddingTop: 40 }}>
        <div className="stepper mb-32">
          <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Composition' : 'Compose'}</div>
          <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Panier' : 'Cart'}</div>
          <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
          <div className="step active"><div className="step-num">4</div>{lang === 'fr' ? 'Confirmation' : 'Confirmation'}</div>
        </div>
        <div className="card-tile fade-up" style={{ padding: 64, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-ink)', margin: '0 auto', display: 'grid', placeItems: 'center', fontSize: 32 }}>✓</div>
          <span className="eyebrow mt-24" style={{ display: 'inline-block' }}>
            {(lang === 'fr' ? 'RÉFÉRENCE · ' : 'REFERENCE · ') + reference}
          </span>
          <h1 className="serif mt-16" style={{ fontSize: 56, lineHeight: 1 }}>{T.pay.success}</h1>
          <p className="muted mt-16" style={{ fontSize: 16, maxWidth: 480, margin: '16px auto 0' }}>{T.pay.successSub}</p>
          <div className="row gap-12 mt-32" style={{ justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={() => navigate('home')}>{T.pay.home}</button>
            <button className="btn btn-primary" onClick={() => navigate('account')}>{T.pay.viewBook}</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="stepper mb-32">
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Composition' : 'Compose'}</div>
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Panier' : 'Cart'}</div>
        <div className="step active"><div className="step-num">3</div>{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
        <div className="step"><div className="step-num">4</div>{lang === 'fr' ? 'Confirmation' : 'Confirmation'}</div>
      </div>

      <div className="mb-32">
        <span className="eyebrow">{T.pay.eyebrow}</span>
        <h1 className="serif mt-8" style={{ fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 1 }}>
          {T.pay.title} <em style={{ color: 'var(--primary)' }}>{T.pay.titleEm}</em>
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        <div className="card-tile" style={{ padding: 40 }}>
          <h3 className="serif mb-24" style={{ fontSize: 24 }}>{T.pay.method}</h3>
          <div className="row gap-12 mb-32" style={{ flexWrap: 'wrap' }}>
            {['card', 'paypal', 'bank'].map(m => (
              <button key={m} className={`pill ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}>
                {m === 'card' ? '◰' : m === 'paypal' ? '◑' : '⌘'} {T.pay[m]}
              </button>
            ))}
          </div>

          {method === 'card' && (
            <div className="col gap-16 fade-up">
              <div>
                <label className="field-label">{T.pay.cardNum}</label>
                <input className="input mono" value={card.num} onChange={e => setCard({ ...card, num: e.target.value })} />
              </div>
              <div className="grid grid-2">
                <div>
                  <label className="field-label">{T.pay.expiry}</label>
                  <input className="input mono" value={card.exp} onChange={e => setCard({ ...card, exp: e.target.value })} />
                </div>
                <div>
                  <label className="field-label">{T.pay.cvv}</label>
                  <input className="input mono" value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="field-label">{T.pay.name}</label>
                <input className="input" value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} />
              </div>
            </div>
          )}

          {method === 'paypal' && (
            <div className="card-tile center fade-up" style={{ padding: 48, background: 'var(--surface-2)' }}>
              <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>PayPal</div>
              <p className="muted" style={{ fontSize: 13.5 }}>
                {lang === 'fr' ? 'Vous serez redirigé vers PayPal pour valider le paiement.' : "You'll be redirected to PayPal to validate the payment."}
              </p>
            </div>
          )}

          {method === 'bank' && (
            <div className="card-tile center fade-up" style={{ padding: 48, background: 'var(--surface-2)' }}>
              <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>{lang === 'fr' ? 'Virement SEPA' : 'SEPA transfer'}</div>
              <p className="muted mono" style={{ fontSize: 13, marginTop: 8, letterSpacing: '0.05em' }}>FR76 3000 4028 7300 0123 4567 891</p>
              <p className="muted mono" style={{ fontSize: 11, marginTop: 4 }}>BIC : BNPAFRPP</p>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)' }}>
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg mt-32"
            style={{ width: '100%' }}
            disabled={loading}
            onClick={pay}>
            {loading ? <>◐ {T.pay.processing}</> : <>{T.pay.pay(total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US'))}</>}
          </button>

          <div className="row gap-8 mt-16 muted" style={{ fontSize: 12, justifyContent: 'center' }}>
            <span>🔒</span> {T.pay.secured}
          </div>
        </div>

        <aside className="book-card">
          <div className="eyebrow mb-16">{T.cart.summary}</div>
          <div className="col gap-12">
            {cart.slice(0, 5).map(item => (
              <div key={item.id} className="between">
                <span style={{ fontSize: 13.5 }}>{item.title.slice(0, 28)}{item.title.length > 28 ? '…' : ''}</span>
                <span className="mono" style={{ fontSize: 13 }}>{item.price} €</span>
              </div>
            ))}
            {cart.length === 0 && (
              <>
                <div className="between"><span style={{ fontSize: 13.5 }}>Vol A/R Paris → Shanghai</span><span className="mono" style={{ fontSize: 13 }}>1 224 €</span></div>
                <div className="between"><span style={{ fontSize: 13.5 }}>Hôtel · 7 nuits</span><span className="mono" style={{ fontSize: 13 }}>875 €</span></div>
                <div className="between"><span style={{ fontSize: 13.5 }}>2 activités</span><span className="mono" style={{ fontSize: 13 }}>180 €</span></div>
              </>
            )}
          </div>
          <hr className="hr" />
          <div className="between mb-8">
            <span style={{ fontSize: 14 }}>{T.cart.total}</span>
            <span className="serif" style={{ fontSize: 36 }}>{total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
          </div>
          <div className="muted mono" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
            {(T.cart.for(2, 7)).toUpperCase()}
          </div>
        </aside>
      </div>
    </main>
  );
}

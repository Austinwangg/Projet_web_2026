import { useState } from 'react';
import { createReservation } from '../services/reservationsService.js';
import { createNotification } from '../services/notificationService.js';
import api from '../services/api.js';

export default function ScreenPayment({ T, lang, cart, navigate, onPaid, user, search, detailId, itinItems = [], itinNbVoyageurs = 0, itinDates = {} }) {
  // Deux sources possibles : panier classique ou itinéraire personnalisé.
  // Si le panier est vide mais qu'un itinéraire existe, on l'utilise à la place.
  const fromItinerary = cart.length === 0 && itinItems.length > 0;
  const activeItems   = fromItinerary ? itinItems : cart;

  const subtotal = activeItems.reduce((s, i) => s + Number(i.price ?? i.prix ?? 0), 0);
  const taxes    = Math.round(subtotal * 0.06); // TVA 6 %
  const total    = subtotal + taxes || 1408;    // fallback démo si panier vide

  // Nombre de voyageurs : priorité vol > hôtel > premier item > recherche > défaut 2
  const flightItemTop = cart.find(i => i.kind === 'flight');
  const hotelItemTop  = cart.find(i => i.kind === 'hotel');
  const cartNb = flightItemTop?.nbVoyageurs || hotelItemTop?.nbVoyageurs
    || cart.find(i => i.nbVoyageurs)?.nbVoyageurs || 0;
  const searchNb = search?.travelers
    ? (search.travelers.adult || 0) + (search.travelers.student || 0) + (search.travelers.child || 0)
    : 0;
  const nbVoyageurs = fromItinerary ? (itinNbVoyageurs || 1) : (cartNb || searchNb || 2);

  // Nombre de nuits : calculé depuis l'hôtel du panier, 7 par défaut
  const hotelItemNights = cart.find(i => i.kind === 'hotel');
  const nights = hotelItemNights
    ? Math.max(1, Math.round((new Date(hotelItemNights.dateRetour) - new Date(hotelItemNights.dateDepart)) / 86400000))
    : 7;

  const [method, setMethod]       = useState('card');
  const [card, setCard]           = useState({ num: '4242 4242 4242 4242', name: user?.name || 'Jean Dupont', exp: '07/28', cvv: '342' });
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError]         = useState('');

  // Appelé au clic sur "Payer". Crée une ou plusieurs réservations en base selon le contenu du panier.
  const pay = async () => {
    if (!user?.id) {
      setError(lang === 'fr' ? 'Vous devez être connecté pour réserver.' : 'You must be logged in to book.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Formate une Date en "YYYY-MM-DD" sans décalage de fuseau horaire
      const fmtLocal = (d) => {
        const dt = d instanceof Date ? d : new Date(d);
        const y  = dt.getFullYear();
        const m  = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      // Récupère l'id numérique d'une destination depuis son slug (ex: "santorin" → 12)
      const resolveDestId = async (slug) => {
        if (!slug) return null;
        const r = await api.get(`/destinations?slug=${encodeURIComponent(slug)}`);
        return r.data?.id || null;
      };

      const travelers = nbVoyageurs;
      let ref = 'VV-XXXXXXX'; // sera remplacé par la référence réelle renvoyée par l'API

      if (fromItinerary) {
        // ── Chemin itinéraire ────────────────────────────────────────────────
        // L'utilisateur a construit un itinéraire personnalisé (pas de panier classique).

        // Destination : lue sur le premier item ayant un slug, sinon déduite du transport
        const destSlug = itinItems.find(i => i.destSlug)?.destSlug || detailId || '';
        let destinationId = await resolveDestId(destSlug);
        if (!destinationId) {
          const fallbackId = itinItems.find(i => i.type === 'transport')?.ref_id;
          if (fallbackId) {
            const tRes = await api.get(`/transports?id=${fallbackId}`);
            destinationId = tRes.data?.destination_id || null;
          }
        }
        if (!destinationId) throw new Error(lang === 'fr' ? 'Destination introuvable. Vérifiez que votre itinéraire contient une destination valide.' : 'Destination not found. Make sure your itinerary contains a valid destination.');

        const itinTransport = itinItems.find(i => i.type === 'transport');
        const itinHeberg    = itinItems.find(i => i.type === 'hebergement');
        const itinActs      = itinItems.filter(i => i.type === 'activite');
        // Dates issues de l'itinéraire ou fallback J+7 / J+14
        const dateDepart = itinDates?.depart || fmtLocal(new Date(Date.now() + 7  * 86400000));
        const dateRetour = itinDates?.retour || fmtLocal(new Date(Date.now() + 14 * 86400000));

        const res = await createReservation({
          utilisateur_id: user.id,
          destination_id: destinationId,
          hebergement_id: itinHeberg?.ref_id   || null,
          transport_id:   itinTransport?.ref_id || null,
          activite_ids:   itinActs.map(i => i.ref_id).filter(Boolean),
          date_depart:    dateDepart,
          date_retour:    dateRetour,
          nb_voyageurs:   travelers || 1,
          montant_total:  total,
          statut:         'confirmee',
        });
        ref = res.data?.reference || ref;

      } else {
        // ── Chemin panier classique ──────────────────────────────────────────
        const hotelItem  = cart.find(i => i.kind === 'hotel');
        const flightItem = cart.find(i => i.kind === 'flight');
        const actItems   = cart.filter(i => i.kind === 'activity');

        // Si l'hôtel a déjà été réservé depuis ScreenHebergement (alreadyReserved: true),
        // on n'envoie pas hebergement_id ici pour éviter un 2ème décrement des places en base.
        const hebergementId = (hotelItem && !hotelItem.alreadyReserved) ? hotelItem.hebergementDbId : null;
        const transportId   = flightItem?.transportDbId || null;

        // Destination principale : transport > hôtel > première activité > dernière destination vue
        const primarySlug = flightItem?.destSlug || hotelItem?.destSlug
          || actItems.find(i => i.destSlug)?.destSlug || detailId || '';

        let primaryDestId = await resolveDestId(primarySlug);
        // Fallback : destination lue directement sur le transport en base
        if (!primaryDestId && transportId) {
          const tRes = await api.get(`/transports?id=${transportId}`);
          primaryDestId = tRes.data?.destination_id || null;
        }
        if (!primaryDestId) throw new Error(lang === 'fr' ? 'Destination introuvable. Vérifiez que votre sélection contient une destination valide.' : 'Destination not found. Make sure your selection contains a valid destination.');

        // Dates : priorité vol > hôtel > barre de recherche > fallback J+7/J+14
        const transportDates = cart.find(i => i.kind === 'flight' && i.dateDepart);
        const hotelDates     = cart.find(i => i.kind === 'hotel'  && i.dateDepart);
        const dateDepart = transportDates?.dateDepart
          ?? hotelDates?.dateDepart
          ?? (search?.dates?.start ? fmtLocal(search.dates.start) : fmtLocal(new Date(Date.now() + 7  * 86400000)));
        const dateRetour = transportDates?.dateRetour
          ?? hotelDates?.dateRetour
          ?? (search?.dates?.end   ? fmtLocal(search.dates.end)   : fmtLocal(new Date(Date.now() + 14 * 86400000)));

        // Regrouper les activités par destination (destSlug).
        // Nécessaire car le panier peut contenir des activités de plusieurs pays différents.
        const actBySlug = {};
        for (const act of actItems) {
          const slug = act.destSlug || primarySlug;
          if (!actBySlug[slug]) actBySlug[slug] = [];
          actBySlug[slug].push(act);
        }

        // Réservation principale : transport + hôtel + activités de la destination principale
        const primaryActIds = (actBySlug[primarySlug] || []).map(i => i.activiteDbId).filter(Boolean);
        const mainRes = await createReservation({
          utilisateur_id: user.id,
          destination_id: primaryDestId,
          hebergement_id: hebergementId,
          transport_id:   transportId,
          activite_ids:   primaryActIds,
          date_depart:    dateDepart,
          date_retour:    dateRetour,
          nb_voyageurs:   travelers || 1,
          montant_total:  total,
          statut:         'confirmee',
        });
        ref = mainRes.data?.reference || ref;

        // Réservations secondaires : une par destination supplémentaire ayant des activités.
        // Chaque groupe génère sa propre entrée en base avec le bon destination_id.
        for (const [slug, acts] of Object.entries(actBySlug)) {
          if (slug === primarySlug) continue; // déjà traité ci-dessus
          const destId2 = await resolveDestId(slug);
          if (!destId2) continue; // slug introuvable en base, on ignore
          const actIds2   = acts.map(i => i.activiteDbId).filter(Boolean);
          const subtotal2 = acts.reduce((s, i) => s + Number(i.price ?? i.prix ?? 0), 0);
          await createReservation({
            utilisateur_id: user.id,
            destination_id: destId2,
            hebergement_id: null,
            transport_id:   null,
            activite_ids:   actIds2,
            date_depart:    dateDepart,
            date_retour:    dateRetour,
            nb_voyageurs:   travelers || 1,
            montant_total:  Math.round(subtotal2 * 1.06), // TVA 6 %
            statut:         'confirmee',
          });
        }
      }

      setReference(ref);

      // Notification en arrière-plan — échec non bloquant
      createNotification({
        utilisateur_id: user.id,
        type:    'booking',
        titre:   lang === 'fr' ? `Réservation confirmée · ${ref}` : `Booking confirmed · ${ref}`,
        message: lang === 'fr'
          ? `Votre voyage a été confirmé. Référence : ${ref}.`
          : `Your trip has been confirmed. Reference: ${ref}.`,
      }).catch(() => {});

      setDone(true);
      onPaid(); // vide le panier et l'itinéraire dans App.jsx
    } catch (err) {
      setError(err.response?.data?.error || err.message || (lang === 'fr' ? 'Erreur lors de la réservation.' : 'Booking error.'));
    } finally {
      setLoading(false);
    }
  };

  // ── Écran de confirmation (affiché après paiement réussi) ───────────────────
  if (done) {
    return (
      <main className="container" style={{ paddingTop: 40 }}>
        {/* Stepper : toutes les étapes cochées */}
        <div className="stepper mb-32">
          <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Composition' : 'Compose'}</div>
          <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Panier' : 'Cart'}</div>
          <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Informations' : 'Passengers'}</div>
          <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
          <div className="step active"><div className="step-num">5</div>{lang === 'fr' ? 'Confirmation' : 'Confirmation'}</div>
        </div>
        {/* Carte de succès avec la référence de réservation */}
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

  // ── Écran de paiement principal ──────────────────────────────────────────────
  return (
    <main className="container" style={{ paddingTop: 40 }}>
      {/* Stepper : étape 4 active */}
      <div className="stepper mb-32">
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Composition' : 'Compose'}</div>
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Panier' : 'Cart'}</div>
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Informations' : 'Passengers'}</div>
        <div className="step active"><div className="step-num">4</div>{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
        <div className="step"><div className="step-num">5</div>{lang === 'fr' ? 'Confirmation' : 'Confirmation'}</div>
      </div>

      <div className="mb-32">
        <span className="eyebrow">{T.pay.eyebrow}</span>
        <h1 className="serif mt-8" style={{ fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 1 }}>
          {T.pay.title} <em style={{ color: 'var(--primary)' }}>{T.pay.titleEm}</em>
        </h1>
      </div>

      {/* Mise en page 2 colonnes : formulaire à gauche, récapitulatif à droite */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'flex-start' }}>

        {/* Colonne gauche : choix du moyen de paiement + formulaire */}
        <div className="card-tile" style={{ padding: 40 }}>
          <h3 className="serif mb-24" style={{ fontSize: 24 }}>{T.pay.method}</h3>

          {/* Sélecteur de méthode : carte / PayPal / virement */}
          <div className="row gap-12 mb-32" style={{ flexWrap: 'wrap' }}>
            {['card', 'paypal', 'bank'].map(m => (
              <button key={m} className={`pill ${method === m ? 'active' : ''}`} onClick={() => setMethod(m)}>
                {m === 'card' ? '◰' : m === 'paypal' ? '◑' : '⌘'} {T.pay[m]}
              </button>
            ))}
          </div>

          {/* Formulaire carte bancaire */}
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

          {/* Message informatif PayPal (pas de vrai redirect en démo) */}
          {method === 'paypal' && (
            <div className="card-tile center fade-up" style={{ padding: 48, background: 'var(--surface-2)' }}>
              <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>PayPal</div>
              <p className="muted" style={{ fontSize: 13.5 }}>
                {lang === 'fr' ? 'Vous serez redirigé vers PayPal pour valider le paiement.' : "You'll be redirected to PayPal to validate the payment."}
              </p>
            </div>
          )}

          {/* IBAN statique pour la démo virement SEPA */}
          {method === 'bank' && (
            <div className="card-tile center fade-up" style={{ padding: 48, background: 'var(--surface-2)' }}>
              <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>{lang === 'fr' ? 'Virement SEPA' : 'SEPA transfer'}</div>
              <p className="muted mono" style={{ fontSize: 13, marginTop: 8, letterSpacing: '0.05em' }}>FR76 3000 4028 7300 0123 4567 891</p>
              <p className="muted mono" style={{ fontSize: 11, marginTop: 4 }}>BIC : BNPAFRPP</p>
            </div>
          )}

          {/* Message d'erreur retourné par l'API ou déclenché côté client */}
          {error && (
            <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13, color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 10%, transparent)' }}>
              {error}
            </div>
          )}

          {/* Bouton principal — désactivé pendant le traitement */}
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

        {/* Colonne droite : récapitulatif du panier (max 5 lignes) */}
        <aside className="book-card">
          <div className="eyebrow mb-16">{T.cart.summary}</div>
          <div className="col gap-12">
            {activeItems.slice(0, 5).map((item, idx) => {
              const title = item.title || item.titre || '';
              const price = Number(item.price ?? item.prix ?? 0);
              return (
                <div key={item.id || idx} className="between">
                  {/* Titre tronqué à 28 caractères pour tenir sur une ligne */}
                  <span style={{ fontSize: 13.5 }}>{title.slice(0, 28)}{title.length > 28 ? '…' : ''}</span>
                  <span className="mono" style={{ fontSize: 13 }}>{price.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
                </div>
              );
            })}
          </div>
          <hr className="hr" />
          <div className="between mb-8">
            <span style={{ fontSize: 14 }}>{T.cart.total}</span>
            <span className="serif" style={{ fontSize: 36 }}>{total.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
          </div>
          <div className="muted mono" style={{ fontSize: 11, letterSpacing: '0.08em' }}>
            {(T.cart.for(nbVoyageurs, nights)).toUpperCase()}
          </div>
        </aside>
      </div>
    </main>
  );
}

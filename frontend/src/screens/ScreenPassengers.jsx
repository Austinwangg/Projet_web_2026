import { useState } from 'react';

export default function ScreenPassengers({ T, lang, cart, itinItems = [], itinNbVoyageurs = 0, navigate, onPassengersSaved }) {
  const fromItinerary = cart.length === 0 && itinItems.length > 0;

  const flightItem = cart.find(i => i.kind === 'flight');
  const hotelItem  = cart.find(i => i.kind === 'hotel');
  const cartNb = flightItem?.nbVoyageurs || hotelItem?.nbVoyageurs
    || cart.find(i => i.nbVoyageurs)?.nbVoyageurs || 0;
  const nbVoyageurs = fromItinerary ? (itinNbVoyageurs || 1) : (cartNb || 1);

  const [names, setNames] = useState(() => Array(nbVoyageurs).fill(''));

  const setName = (i, val) => setNames(prev => prev.map((n, idx) => idx === i ? val : n));

  const proceed = () => {
    onPassengersSaved(names);
    navigate('payment');
  };

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="stepper mb-32">
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Composition' : 'Compose'}</div>
        <div className="step done"><div className="step-num">✓</div>{lang === 'fr' ? 'Panier' : 'Cart'}</div>
        <div className="step active"><div className="step-num">3</div>{lang === 'fr' ? 'Informations' : 'Passengers'}</div>
        <div className="step"><div className="step-num">4</div>{lang === 'fr' ? 'Paiement' : 'Payment'}</div>
        <div className="step"><div className="step-num">5</div>{lang === 'fr' ? 'Confirmation' : 'Confirmation'}</div>
      </div>

      <div className="between mb-32" style={{ alignItems: 'flex-end' }}>
        <div>
          <span className="eyebrow">{lang === 'fr' ? 'ÉTAPE 3 · VOYAGEURS' : 'STEP 3 · PASSENGERS'}</span>
          <h1 className="serif mt-8" style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1 }}>
            {lang === 'fr' ? 'Ajouter les ' : 'Passenger '}<em style={{ color: 'var(--primary)' }}>{lang === 'fr' ? 'informations' : 'information'}</em>
          </h1>
          <p className="muted mt-8" style={{ fontSize: 14 }}>
            {lang === 'fr'
              ? `Indiquez le nom complet de chaque voyageur (${nbVoyageurs} personne${nbVoyageurs > 1 ? 's' : ''}).`
              : `Enter the full name of each traveler (${nbVoyageurs} person${nbVoyageurs > 1 ? 's' : ''}).`}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('cart')}>
          ← {lang === 'fr' ? 'Retour au panier' : 'Back to cart'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        <div className="card-tile" style={{ padding: 40 }}>
          <h3 className="serif mb-24" style={{ fontSize: 22 }}>
            {lang === 'fr' ? 'Noms des voyageurs' : 'Traveler names'}
          </h3>
          <div className="col gap-20">
            {names.map((name, i) => (
              <div key={i}>
                <label className="field-label">
                  {lang === 'fr' ? `Voyageur ${i + 1}` : `Traveler ${i + 1}`}
                  {i === 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--primary)' }}>
                      ({lang === 'fr' ? 'titulaire' : 'lead traveler'})
                    </span>
                  )}
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder={lang === 'fr' ? 'Prénom NOM' : 'First LAST'}
                  value={name}
                  onChange={e => setName(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-lg mt-32"
            style={{ width: '100%' }}
            onClick={proceed}
          >
            {lang === 'fr' ? 'Continuer vers le paiement →' : 'Continue to payment →'}
          </button>
          <p className="muted mt-12" style={{ fontSize: 12, textAlign: 'center' }}>
            {lang === 'fr'
              ? 'Les noms peuvent être laissés vides et modifiés ultérieurement.'
              : 'Names can be left blank and updated later.'}
          </p>
        </div>

        <aside className="book-card">
          <div className="eyebrow mb-16">{lang === 'fr' ? 'RÉCAPITULATIF' : 'SUMMARY'}</div>
          <div className="col gap-10">
            {(fromItinerary ? itinItems : cart).slice(0, 5).map((item, idx) => {
              const title = item.title || item.titre || '';
              const price = Number(item.price ?? item.prix ?? 0);
              return (
                <div key={item.id || idx} className="between">
                  <span style={{ fontSize: 13 }}>{title.slice(0, 28)}{title.length > 28 ? '…' : ''}</span>
                  <span className="mono" style={{ fontSize: 12 }}>{price.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span>
                </div>
              );
            })}
          </div>
          <hr className="hr" />
          <div className="muted" style={{ fontSize: 13 }}>
            {nbVoyageurs} {lang === 'fr' ? `voyageur${nbVoyageurs > 1 ? 's' : ''}` : `traveler${nbVoyageurs > 1 ? 's' : ''}`}
          </div>
        </aside>
      </div>
    </main>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { createItineraire, updateItineraire, deleteItineraire, getItinerairesByUser } from '../services/itinerairesService.js';

export default function ScreenItinerary({ T, lang, navigate, cart, user, onToast }) {
  const [itineraireId, setItineraireId] = useState(null);
  const [nom, setNom] = useState(lang === 'fr' ? 'Mon itinéraire' : 'My itinerary');
  const [items, setItems] = useState([]);
  const [savedItineraires, setSavedItineraires] = useState([]);
  const [loadingState, setLoadingState] = useState('idle'); // idle | saving | saved | loading | deleting
  const [showSaved, setShowSaved] = useState(false);

  // Build items from cart on mount
  useEffect(() => {
    if (cart.length > 0 && items.length === 0) {
      setItems(cart.map(c => ({
        type: c.kind === 'flight' ? 'transport' : c.kind === 'hotel' ? 'hebergement' : 'activite',
        ref_id: null,
        titre: c.title,
        sous_titre: c.sub,
        prix: c.price,
        icone: c.icon || '◇',
        date_item: null,
      })));
    }
  }, [cart]);

  const loadUserItineraires = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getItinerairesByUser(user.id);
      setSavedItineraires(res.data);
    } catch {
      // silently ignore
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserItineraires();
  }, [loadUserItineraires]);

  const subtotal = items.reduce((s, x) => s + Number(x.prix), 0);
  const taxes = Math.round(subtotal * 0.06);
  const grand = subtotal + taxes;

  const handleSave = async () => {
    if (!user?.id) {
      onToast(lang === 'fr' ? 'Connectez-vous pour sauvegarder' : 'Please sign in to save');
      return;
    }
    setLoadingState('saving');
    try {
      const payload = { utilisateur_id: user.id, nom, items };
      let res;
      if (itineraireId) {
        res = await updateItineraire(itineraireId, payload);
      } else {
        res = await createItineraire(payload);
        setItineraireId(res.data.id);
      }
      setLoadingState('saved');
      onToast(lang === 'fr' ? 'Itinéraire sauvegardé ✓' : 'Itinerary saved ✓');
      await loadUserItineraires();
      setTimeout(() => setLoadingState('idle'), 2000);
    } catch {
      setLoadingState('idle');
      onToast(lang === 'fr' ? 'Erreur lors de la sauvegarde' : 'Save failed');
    }
  };

  const handleDelete = async () => {
    if (!itineraireId) return;
    setLoadingState('deleting');
    try {
      await deleteItineraire(itineraireId);
      setItineraireId(null);
      setItems([]);
      setSavedItineraires(prev => prev.filter(i => i.id !== itineraireId));
      onToast(lang === 'fr' ? 'Itinéraire supprimé' : 'Itinerary deleted');
    } catch {
      onToast(lang === 'fr' ? 'Erreur lors de la suppression' : 'Delete failed');
    } finally {
      setLoadingState('idle');
    }
  };

  const handleLoad = async (saved) => {
    setItineraireId(saved.id);
    setNom(saved.nom);
    setItems(saved.items || []);
    setShowSaved(false);
    onToast(lang === 'fr' ? `"${saved.nom}" chargé` : `"${saved.nom}" loaded`);
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const moveItem = (idx, dir) => {
    setItems(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const iconForType = (type) => {
    if (type === 'transport') return '✈';
    if (type === 'hebergement') return '⌂';
    return '◇';
  };

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="mb-32">
        <span className="eyebrow">{T.itinerary.eyebrow}</span>
        <div className="between" style={{ alignItems: 'flex-end' }}>
          <div>
            <h1 className="serif mt-8" style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1 }}>
              {T.itinerary.title} <em style={{ color: 'var(--primary)' }}>{T.itinerary.titleEm}</em>
            </h1>
            <p className="muted mt-16" style={{ maxWidth: 540 }}>{T.itinerary.sub}</p>
          </div>
          {savedItineraires.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSaved(v => !v)}>
              {lang === 'fr' ? `Mes itinéraires (${savedItineraires.length})` : `My itineraries (${savedItineraires.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Saved itineraries picker */}
      {showSaved && (
        <div className="card-tile mb-24 fade-up" style={{ padding: 24 }}>
          <h4 className="serif mb-16" style={{ fontSize: 20 }}>
            {lang === 'fr' ? 'Itinéraires sauvegardés' : 'Saved itineraries'}
          </h4>
          <div className="col gap-8">
            {savedItineraires.map(s => (
              <div key={s.id} className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.nom}</div>
                  <div className="muted mono" style={{ fontSize: 11 }}>
                    {s.ville ? `${s.ville} · ` : ''}{(s.items || []).length} {lang === 'fr' ? 'étapes' : 'steps'}
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => handleLoad(s)}>
                  {lang === 'fr' ? 'Charger' : 'Load'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nom */}
      <div className="mb-24" style={{ maxWidth: 420 }}>
        <label className="field-label">{lang === 'fr' ? "Nom de l'itinéraire" : 'Itinerary name'}</label>
        <input
          className="input"
          value={nom}
          onChange={e => setNom(e.target.value)}
          style={{ fontSize: 15 }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        {/* Timeline */}
        <div className="card-tile" style={{ padding: 40 }}>
          {items.length === 0 ? (
            <div className="center muted" style={{ padding: '48px 0', fontSize: 15 }}>
              {lang === 'fr'
                ? 'Votre itinéraire est vide. Ajoutez des éléments depuis une destination.'
                : 'Your itinerary is empty. Add items from a destination page.'}
            </div>
          ) : (
            <div className="timeline">
              {items.map((s, i, arr) => (
                <div key={i} className="tl-item" style={{ position: 'relative' }}>
                  <div className="tl-day" style={{ minWidth: 28 }}>{i + 1}</div>
                  <div className="tl-dot" style={{ borderColor: s.icone === '✈' || s.type === 'transport' ? 'var(--primary)' : 'var(--line)' }}>
                    {s.icone || iconForType(s.type)}
                  </div>
                  <div className="tl-body">
                    <h4>{s.titre}</h4>
                    {s.sous_titre && <div className="meta">{s.sous_titre}</div>}
                  </div>
                  <div className="tl-price">{Number(s.prix).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</div>
                  <div className="col gap-2" style={{ marginLeft: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => moveItem(i, -1)} disabled={i === 0}>↑</button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => moveItem(i, 1)} disabled={i === arr.length - 1}>↓</button>
                    <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11, color: 'var(--danger)' }} onClick={() => removeItem(i)}>✕</button>
                  </div>
                  {i < arr.length - 1 && <div className="tl-line" />}
                </div>
              ))}
            </div>
          )}

          <div className="row gap-8 mt-24" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('results')}>
              + {lang === 'fr' ? 'Ajouter une destination' : 'Add destination'}
            </button>
            {itineraireId && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)' }}
                onClick={handleDelete}
                disabled={loadingState === 'deleting'}
              >
                {loadingState === 'deleting'
                  ? (lang === 'fr' ? 'Suppression…' : 'Deleting…')
                  : (lang === 'fr' ? 'Supprimer cet itinéraire' : 'Delete itinerary')}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="book-card">
          <div className="eyebrow mb-16">{T.itinerary.total}</div>
          <div className="serif" style={{ fontSize: 64, lineHeight: 1 }}>
            {grand.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
          </div>
          <div className="muted mt-8" style={{ fontSize: 13 }}>
            {lang === 'fr' ? `${items.length} étape${items.length > 1 ? 's' : ''} · taxes incluses` : `${items.length} step${items.length !== 1 ? 's' : ''} · taxes included`}
          </div>
          <hr className="hr" />
          <div className="col gap-8">
            <div className="between"><span className="muted" style={{ fontSize: 13 }}>{T.cart.subtotal}</span><span className="mono" style={{ fontSize: 13 }}>{subtotal.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span></div>
            <div className="between"><span className="muted" style={{ fontSize: 13 }}>{T.cart.taxes}</span><span className="mono" style={{ fontSize: 13 }}>{taxes.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €</span></div>
          </div>
          <hr className="hr" />

          {/* Save button */}
          <button
            className={`btn btn-outline btn-lg mt-8 ${loadingState === 'saved' ? 'btn-ink' : ''}`}
            style={{ width: '100%', marginBottom: 12 }}
            onClick={handleSave}
            disabled={loadingState === 'saving' || items.length === 0}
          >
            {loadingState === 'saving'
              ? (lang === 'fr' ? 'Sauvegarde…' : 'Saving…')
              : loadingState === 'saved'
              ? (lang === 'fr' ? '✓ Sauvegardé' : '✓ Saved')
              : (lang === 'fr' ? (itineraireId ? 'Mettre à jour' : 'Sauvegarder') : (itineraireId ? 'Update' : 'Save itinerary'))}
          </button>

          {/* Checkout button */}
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => navigate('payment')}
            disabled={items.length === 0}
          >
            {T.itinerary.checkout} →
          </button>

          {!user?.id && (
            <p className="muted center mt-12" style={{ fontSize: 12 }}>
              {lang === 'fr' ? 'Connectez-vous pour sauvegarder' : 'Sign in to save your itinerary'}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

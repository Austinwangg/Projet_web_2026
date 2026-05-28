import { useState, useEffect, useCallback } from 'react';
import { createItineraire, updateItineraire, deleteItineraire, getItinerairesByUser } from '../services/itinerairesService.js';
import DateRangePicker from '../components/DateRangePicker.jsx';

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() { return toLocalISO(new Date()); }

export default function ScreenItinerary({
  T, lang, navigate, user, onToast,
  itinItems, setItinItems,
  itinNbVoyageurs, setItinNbVoyageurs,
  itinDates, setItinDates,
}) {
  const [itineraireId, setItineraireId] = useState(null);
  const [nom, setNom] = useState(lang === 'fr' ? 'Mon itinéraire' : 'My itinerary');
  const [savedItineraires, setSavedItineraires] = useState([]);
  const [loadingState, setLoadingState] = useState('idle');
  const [showSaved, setShowSaved] = useState(false);

  const loadUserItineraires = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getItinerairesByUser(user.id);
      setSavedItineraires(res.data);
    } catch { /* silently ignore */ }
  }, [user?.id]);

  useEffect(() => { loadUserItineraires(); }, [loadUserItineraires]);

  // ── Totaux ───────────────────────────────────────────────────────────────
  const subtotal = itinItems.reduce((s, x) => s + Number(x.prix), 0);
  const taxes    = Math.round(subtotal * 0.06);
  const grand    = subtotal + taxes;

  // ── Save / Delete ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user?.id) { onToast(lang === 'fr' ? 'Connectez-vous pour sauvegarder' : 'Please sign in to save'); return; }
    setLoadingState('saving');
    try {
      const payload = { utilisateur_id: user.id, nom, items: itinItems };
      let res;
      if (itineraireId) { res = await updateItineraire(itineraireId, payload); }
      else { res = await createItineraire(payload); setItineraireId(res.data.id); }
      setLoadingState('saved');
      onToast(lang === 'fr' ? 'Itinéraire sauvegardé ✓' : 'Itinerary saved ✓');
      await loadUserItineraires();
      setTimeout(() => setLoadingState('idle'), 2000);
    } catch { setLoadingState('idle'); onToast(lang === 'fr' ? 'Erreur lors de la sauvegarde' : 'Save failed'); }
  };

  const handleDelete = async () => {
    if (!itineraireId) return;
    setLoadingState('deleting');
    try {
      await deleteItineraire(itineraireId);
      setItineraireId(null); setItinItems([]);
      setSavedItineraires(prev => prev.filter(i => i.id !== itineraireId));
      onToast(lang === 'fr' ? 'Itinéraire supprimé' : 'Itinerary deleted');
    } catch { onToast(lang === 'fr' ? 'Erreur lors de la suppression' : 'Delete failed'); }
    finally { setLoadingState('idle'); }
  };

  const handleLoad = (saved) => {
    setItineraireId(saved.id); setNom(saved.nom); setItinItems(saved.items || []);
    setShowSaved(false);
    onToast(lang === 'fr' ? `"${saved.nom}" chargé` : `"${saved.nom}" loaded`);
  };

  const removeItem = (idx) => setItinItems(prev => prev.filter((_, i) => i !== idx));
  const moveItem   = (idx, dir) => setItinItems(prev => {
    const next = [...prev];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return prev;
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  });

  const iconForType = (type) => {
    if (type === 'transport')   return '✈';
    if (type === 'hebergement') return '🏨';
    return '🎯';
  };

  const fr = lang === 'fr';

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
              {fr ? `Mes itinéraires (${savedItineraires.length})` : `My itineraries (${savedItineraires.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Saved itineraries picker */}
      {showSaved && (
        <div className="card-tile mb-24 fade-up" style={{ padding: 24 }}>
          <h4 className="serif mb-16" style={{ fontSize: 20 }}>
            {fr ? 'Itinéraires sauvegardés' : 'Saved itineraries'}
          </h4>
          <div className="col gap-8">
            {savedItineraires.map(s => (
              <div key={s.id} className="between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.nom}</div>
                  <div className="muted mono" style={{ fontSize: 11 }}>
                    {s.ville ? `${s.ville} · ` : ''}{(s.items || []).length} {fr ? 'étapes' : 'steps'}
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => handleLoad(s)}>
                  {fr ? 'Charger' : 'Load'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nom */}
      <div className="mb-24" style={{ maxWidth: 420 }}>
        <label className="field-label">{fr ? "Nom de l'itinéraire" : 'Itinerary name'}</label>
        <input className="input" value={nom} onChange={e => setNom(e.target.value)} style={{ fontSize: 15 }} />
      </div>

      {/* ── Paramètres du voyage ─────────────────────────────────────────── */}
      <div className="card-tile mb-24" style={{ padding: 24 }}>
        <div className="muted mb-16" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          {fr ? 'Paramètres du voyage' : 'Trip parameters'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'flex-end' }}>

          {/* Dates — calendrier visuel */}
          <div style={{ gridColumn: 'span 2' }}>
            <DateRangePicker
              depart={itinDates.depart}
              retour={itinDates.retour}
              onChangeDates={({ depart, retour }) => setItinDates({ depart, retour })}
              T={T}
              lang={lang}
              label={fr ? 'Dates du voyage' : 'Travel dates'}
            />
          </div>

          {/* Nombre de voyageurs */}
          <div>
            <label className="field-label">{fr ? 'Voyageurs' : 'Travelers'}</label>
            <div className="row gap-8" style={{ alignItems: 'center', marginTop: 4 }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ width: 36, height: 36, padding: 0, fontSize: 16 }}
                onClick={() => setItinNbVoyageurs(n => Math.max(1, n - 1))}
              >−</button>
              <span className="mono" style={{ fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{itinNbVoyageurs}</span>
              <button
                className="btn btn-outline btn-sm"
                style={{ width: 36, height: 36, padding: 0, fontSize: 16 }}
                onClick={() => setItinNbVoyageurs(n => Math.min(20, n + 1))}
              >+</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 56, alignItems: 'flex-start' }}>
        {/* Timeline */}
        <div className="card-tile" style={{ padding: 40 }}>
          {itinItems.length === 0 ? (
            <div className="center muted" style={{ padding: '48px 0', fontSize: 15 }}>
              {fr ? 'Votre itinéraire est vide. Ajoutez des éléments ci-dessous.' : 'Your itinerary is empty. Add items below.'}
            </div>
          ) : (
            <div className="timeline">
              {itinItems.map((s, i, arr) => (
                <div key={i} className="tl-item" style={{ position: 'relative' }}>
                  <div className="tl-day" style={{ minWidth: 28 }}>{i + 1}</div>
                  <div className="tl-dot" style={{ borderColor: s.type === 'transport' ? 'var(--primary)' : 'var(--line)' }}>
                    {s.icone || iconForType(s.type)}
                  </div>
                  <div className="tl-body">
                    <h4>{s.titre}</h4>
                    {s.sous_titre && <div className="meta">{s.sous_titre}</div>}
                  </div>
                  <div className="tl-price">{Number(s.prix).toLocaleString(fr ? 'fr-FR' : 'en-US')} €</div>
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

          {/* Boutons d'ajout */}
          <div className="mt-24" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 20 }}>
            <div className="muted mb-12" style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {fr ? "Ajouter à l'itinéraire" : 'Add to itinerary'}
            </div>
            <p className="muted mb-16" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              {fr
                ? 'Choisissez une catégorie. Vous serez redirigé vers la page correspondante, puis ramené ici automatiquement.'
                : "Choose a category. You'll be taken to the relevant page, then returned here automatically."}
            </p>
            <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('transport', { fromItinerary: true })}>
                ✈ {fr ? 'Transport' : 'Transport'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('hebergement', { fromItinerary: true })}>
                🏨 {fr ? 'Hébergement' : 'Accommodation'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('activites', { fromItinerary: true })}>
                🎯 {fr ? 'Activité' : 'Activity'}
              </button>
            </div>
            {itineraireId && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--danger)', marginTop: 12 }}
                onClick={handleDelete}
                disabled={loadingState === 'deleting'}
              >
                {loadingState === 'deleting' ? (fr ? 'Suppression…' : 'Deleting…') : (fr ? 'Supprimer cet itinéraire' : 'Delete itinerary')}
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="book-card">
          <div className="eyebrow mb-16">{T.itinerary.total}</div>
          <div className="serif" style={{ fontSize: 64, lineHeight: 1 }}>
            {grand.toLocaleString(fr ? 'fr-FR' : 'en-US')} €
          </div>
          <div className="muted mt-8" style={{ fontSize: 13 }}>
            {fr
              ? `${itinItems.length} étape${itinItems.length > 1 ? 's' : ''} · ${itinNbVoyageurs} voyageur${itinNbVoyageurs > 1 ? 's' : ''} · taxes incluses`
              : `${itinItems.length} step${itinItems.length !== 1 ? 's' : ''} · ${itinNbVoyageurs} traveler${itinNbVoyageurs !== 1 ? 's' : ''} · taxes included`}
          </div>
          {itinDates.depart && (
            <div className="muted mono mt-4" style={{ fontSize: 12 }}>
              {itinDates.depart}{itinDates.retour ? ` → ${itinDates.retour}` : ''}
            </div>
          )}
          <hr className="hr" />
          <div className="col gap-8">
            <div className="between">
              <span className="muted" style={{ fontSize: 13 }}>{T.cart.subtotal}</span>
              <span className="mono" style={{ fontSize: 13 }}>{subtotal.toLocaleString(fr ? 'fr-FR' : 'en-US')} €</span>
            </div>
            <div className="between">
              <span className="muted" style={{ fontSize: 13 }}>{T.cart.taxes}</span>
              <span className="mono" style={{ fontSize: 13 }}>{taxes.toLocaleString(fr ? 'fr-FR' : 'en-US')} €</span>
            </div>
          </div>
          <hr className="hr" />
          <button
            className={`btn btn-outline btn-lg mt-8 ${loadingState === 'saved' ? 'btn-ink' : ''}`}
            style={{ width: '100%', marginBottom: 12 }}
            onClick={handleSave}
            disabled={loadingState === 'saving' || itinItems.length === 0}
          >
            {loadingState === 'saving'
              ? (fr ? 'Sauvegarde…' : 'Saving…')
              : loadingState === 'saved'
              ? (fr ? '✓ Sauvegardé' : '✓ Saved')
              : (fr ? (itineraireId ? 'Mettre à jour' : 'Sauvegarder') : (itineraireId ? 'Update' : 'Save itinerary'))}
          </button>
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={() => navigate('passengers')}
            disabled={itinItems.length === 0}
          >
            {T.itinerary.checkout} →
          </button>
          {!user?.id && (
            <p className="muted center mt-12" style={{ fontSize: 12 }}>
              {fr ? 'Connectez-vous pour sauvegarder' : 'Sign in to save your itinerary'}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}

import { useState, useEffect } from 'react';
import { getActivites } from '../services/activitesService.js';
import Placeholder from '../components/Placeholder.jsx';

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ScreenActivites({ T, lang, navigate, addToCart, itineraryMode, addToItinerary, itineraryTravelers }) {
  const [activites, setActivites]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterCat, setFilterCat]   = useState('');
  const [filterPays, setFilterPays] = useState('');
  const [search, setSearch]         = useState('');

  // Mini-modal panier pour une activité
  const [cartModal, setCartModal]   = useState(null);
  const [cartDate, setCartDate]     = useState('');
  const [cartNb, setCartNb]         = useState(1);

  // Mini-modal itinéraire pour une activité
  const [itinModal, setItinModal]   = useState(null);
  const [itinDate, setItinDate]     = useState('');
  const [itinNb, setItinNb]         = useState(1);

  useEffect(() => {
    setLoading(true);
    getActivites()
      .then(r => setActivites(Array.isArray(r.data) ? r.data : []))
      .catch(() => setActivites([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(activites.map(a => a.categorie).filter(Boolean))].sort();
  const paysList   = [...new Set(activites.map(a => (lang === 'fr' ? a.pays_fr : a.pays_en) || '').filter(Boolean))].sort();

  const filtered = activites.filter(a => {
    const name = lang === 'fr' ? a.nom_fr : a.nom_en;
    const pays = lang === 'fr' ? a.pays_fr : a.pays_en;
    if (filterCat  && a.categorie !== filterCat)               return false;
    if (filterPays && pays        !== filterPays)               return false;
    if (search     && !name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Grouper par pays
  const grouped = filtered.reduce((acc, a) => {
    const pays = (lang === 'fr' ? a.pays_fr : a.pays_en) || (lang === 'fr' ? 'Autres' : 'Other');
    if (!acc[pays]) acc[pays] = [];
    acc[pays].push(a);
    return acc;
  }, {});

  const full = (a) => a.places_restantes !== undefined && parseInt(a.places_restantes, 10) <= 0;

  return (
    <main className="container" style={{ paddingTop: 40 }}>

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
                  ? 'Cliquez sur "Ajouter à l\'itinéraire" pour ajouter une activité puis revenir.'
                  : 'Click "Add to itinerary" to add an activity and return.'}
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

      {/* En-tête */}
      <div className="mb-32">
        <span className="eyebrow">{lang === 'fr' ? 'CATALOGUE' : 'CATALOG'}</span>
        <h1 className="serif mt-8" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1 }}>
          {lang === 'fr' ? 'Activités & ' : 'Activities & '}
          <em style={{ color: 'var(--primary)' }}>{lang === 'fr' ? 'Expériences' : 'Experiences'}</em>
        </h1>
        <p className="muted mt-12" style={{ maxWidth: 560, fontSize: 16 }}>
          {lang === 'fr'
            ? 'Découvrez toutes les activités disponibles sur nos destinations, filtrez par pays et catégorie.'
            : 'Explore all available activities across our destinations, filter by country and category.'}
        </p>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="card-tile mb-32" style={{ padding: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label className="field-label">{lang === 'fr' ? 'Rechercher' : 'Search'}</label>
            <input
              className="input"
              placeholder={lang === 'fr' ? 'Nom d\'activité…' : 'Activity name…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">{lang === 'fr' ? 'Pays' : 'Country'}</label>
            <select className="input" value={filterPays} onChange={e => setFilterPays(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="">{lang === 'fr' ? 'Tous les pays' : 'All countries'}</option>
              {paysList.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">{lang === 'fr' ? 'Catégorie' : 'Category'}</label>
            <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="">{lang === 'fr' ? 'Toutes' : 'All'}</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Chips catégories */}
        {categories.length > 0 && (
          <div className="row gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
            <button
              className={`tag ${!filterCat ? 'tag-accent' : ''}`}
              style={{ cursor: 'pointer', padding: '6px 14px', borderRadius: 20 }}
              onClick={() => setFilterCat('')}
            >
              {lang === 'fr' ? 'Tout' : 'All'}
            </button>
            {categories.map(c => (
              <button
                key={c}
                className={`tag ${filterCat === c ? 'tag-accent' : ''}`}
                style={{ cursor: 'pointer', padding: '6px 14px', borderRadius: 20 }}
                onClick={() => setFilterCat(filterCat === c ? '' : c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Compteur */}
      <div className="between mb-24">
        <span className="muted" style={{ fontSize: 13 }}>
          {loading
            ? (lang === 'fr' ? 'Chargement…' : 'Loading…')
            : `${filtered.length} ${lang === 'fr' ? 'activité(s)' : 'activity/ies'}`}
        </span>
        {(filterCat || filterPays || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCat(''); setFilterPays(''); setSearch(''); }}>
            {lang === 'fr' ? '✕ Réinitialiser' : '✕ Clear filters'}
          </button>
        )}
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-3 gap-24">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card-tile" style={{ height: 280, opacity: 0.4 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-tile center" style={{ padding: 80 }}>
          <p className="serif" style={{ fontSize: 24 }}>{lang === 'fr' ? 'Aucune activité trouvée' : 'No activities found'}</p>
          <p className="muted mt-8">{lang === 'fr' ? 'Essayez d\'autres filtres.' : 'Try different filters.'}</p>
        </div>
      ) : (
        /* Sections par pays */
        Object.entries(grouped).map(([pays, items]) => (
          <div key={pays} className="mb-48">
            {/* Titre de section pays */}
            <div className="between mb-20" style={{ borderBottom: '2px solid var(--line)', paddingBottom: 12 }}>
              <h2 className="serif" style={{ fontSize: 28 }}>
                {pays}
              </h2>
              <span className="tag">{items.length} {lang === 'fr' ? 'activité(s)' : 'activity/ies'}</span>
            </div>

            <div className="grid grid-3 gap-24">
              {items.map(a => {
                const name   = lang === 'fr' ? a.nom_fr : a.nom_en;
                const desc   = lang === 'fr' ? a.description_fr : a.description_en;
                const isFull = full(a);
                return (
                  <div
                    key={a.id}
                    className="card-tile"
                    style={{ padding: 0, overflow: 'hidden', opacity: isFull ? 0.65 : 1, display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative' }}>
                      {a.dest_image_url ? (
                        <img
                          src={a.dest_image_url}
                          alt={name}
                          style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                        />
                      ) : null}
                      <div style={{ display: a.dest_image_url ? 'none' : 'block' }}>
                        <Placeholder
                          label={name?.split(' ').slice(0, 2).join(' ').toUpperCase() || ''}
                          ratio="16/9"
                          cat="activite"
                          style={{ borderRadius: 0 }}
                        />
                      </div>
                      {isFull && (
                        <span style={{
                          position: 'absolute', top: 10, right: 10,
                          background: 'var(--danger)', color: '#fff',
                          fontSize: 11, fontWeight: 700, padding: '3px 8px',
                          borderRadius: 4, letterSpacing: '0.05em',
                        }}>
                          {lang === 'fr' ? 'COMPLET' : 'SOLD OUT'}
                        </span>
                      )}
                      {a.categorie && (
                        <span style={{
                          position: 'absolute', top: 10, left: 10,
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          fontSize: 11, padding: '3px 8px', borderRadius: 4,
                        }}>
                          {a.categorie}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div className="serif" style={{ fontSize: 18, lineHeight: 1.2, marginBottom: 6 }}>{name}</div>
                      {a.ville && (
                        <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                          📍 {a.ville}
                        </div>
                      )}
                      <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                        {a.duree && `⏱ ${a.duree}`}
                        {a.places_restantes !== undefined && !isFull && (
                          <span style={{ marginLeft: 8, color: a.places_restantes < 5 ? 'var(--danger)' : 'var(--ok)' }}>
                            · {a.places_restantes} {lang === 'fr' ? 'places' : 'spots'}
                          </span>
                        )}
                      </div>
                      {desc && (
                        <p className="muted" style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
                          {desc.length > 100 ? desc.slice(0, 100) + '…' : desc}
                        </p>
                      )}
                      <div className="between" style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line-soft)' }}>
                        <span className="serif" style={{ fontSize: 22 }}>
                          {a.prix > 0 ? `${a.prix} €` : (lang === 'fr' ? 'Gratuit' : 'Free')}
                        </span>
                        {itineraryMode ? (
                          <button
                            className="btn btn-sm"
                            style={{ background: '#f59e0b', color: '#fff', border: 'none' }}
                            disabled={isFull}
                            onClick={() => {
                              if (isFull) return;
                              setItinModal(a);
                              setItinDate(toLocalISO(new Date()));
                              setItinNb(itineraryTravelers && itineraryTravelers > 0 ? itineraryTravelers : 1);
                            }}
                          >
                            {isFull ? (lang === 'fr' ? 'Complet' : 'Sold out') : (lang === 'fr' ? '+ Itinéraire' : '+ Itinerary')}
                          </button>
                        ) : (
                          <button
                            className="btn btn-outline btn-sm"
                            disabled={isFull}
                            onClick={() => {
                              if (isFull) return;
                              setCartModal(a);
                              setCartDate(toLocalISO(new Date()));
                              setCartNb(1);
                            }}
                          >
                            {isFull
                              ? (lang === 'fr' ? 'Complet' : 'Sold out')
                              : (lang === 'fr' ? '+ Panier' : '+ Cart')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Mini-modale ajout à l'itinéraire */}
      {itinModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => e.target === e.currentTarget && setItinModal(null)}
        >
          <div className="card-tile" style={{ padding: '36px 36px 28px', maxWidth: 440, width: '100%', background: 'var(--surface)', borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="tag" style={{ fontSize: 11, marginBottom: 6, display: 'inline-block', background: '#f59e0b', color: '#fff', border: 'none' }}>
                  {lang === 'fr' ? 'Itinéraire' : 'Itinerary'}
                </span>
                <h3 className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>
                  {lang === 'fr' ? itinModal.nom_fr : itinModal.nom_en}
                </h3>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  {itinModal.ville || ''}{itinModal.duree ? ' · ' + itinModal.duree : ''}
                </p>
              </div>
              <button onClick={() => setItinModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-faint)', padding: '4px 8px', lineHeight: 1 }}>✕</button>
            </div>
            <div className="col gap-16">
              <div>
                <label className="field-label">{lang === 'fr' ? 'Date de l\'activité' : 'Activity date'}</label>
                <input className="input" type="date" value={itinDate} min={toLocalISO(new Date())} style={{ width: '100%' }} onChange={e => setItinDate(e.target.value)} />
              </div>
              <div>
                <label className="field-label">
                  {lang === 'fr' ? 'Nombre de personnes' : 'Number of people'}
                  {itinModal.places_restantes !== undefined && (
                    <span className="muted" style={{ fontSize: 11, marginLeft: 8, fontWeight: 400 }}>(max {itinModal.places_restantes})</span>
                  )}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <button className="btn btn-outline btn-sm" style={{ width: 36, height: 36, padding: 0 }} onClick={() => setItinNb(n => Math.max(1, n - 1))}>−</button>
                  <span className="mono" style={{ fontSize: 18, minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{itinNb}</span>
                  <button className="btn btn-outline btn-sm" style={{ width: 36, height: 36, padding: 0 }} onClick={() => setItinNb(n => Math.min(itinModal.places_restantes ?? 99, n + 1))}>+</button>
                </div>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="muted" style={{ fontSize: 13 }}>
                  {itinNb} {lang === 'fr' ? 'pers.' : 'guest(s)'} × {parseFloat(itinModal.prix).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                </span>
                <span className="serif" style={{ fontSize: 20 }}>
                  {(parseFloat(itinModal.prix) * itinNb).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                </span>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 4, background: '#f59e0b', border: 'none' }}
                disabled={!itinDate}
                onClick={() => {
                  if (!addToItinerary || !itinDate) return;
                  addToItinerary({
                    type: 'activite',
                    ref_id: itinModal.id,
                    titre: lang === 'fr' ? itinModal.nom_fr : itinModal.nom_en,
                    sous_titre: `${itinModal.ville || ''}${itinModal.duree ? ' · ' + itinModal.duree : ''} · ${itinDate} · ${itinNb} ${lang === 'fr' ? 'pers.' : 'guest(s)'}`,
                    prix: parseFloat(itinModal.prix) * itinNb,
                    icone: '🎯',
                    date_item: itinDate,
                  });
                  setItinModal(null);
                }}
              >
                {lang === 'fr' ? '+ Ajouter à l\'itinéraire' : '+ Add to itinerary'} · {(parseFloat(itinModal.prix) * itinNb).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini-modale ajout au panier */}
      {cartModal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.52)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={e => e.target === e.currentTarget && setCartModal(null)}
        >
          <div
            className="card-tile"
            style={{
              padding: '36px 36px 28px',
              maxWidth: 440, width: '100%',
              background: 'var(--surface)',
              borderRadius: 16,
            }}
          >
            {/* En-tête */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <span className="tag" style={{ fontSize: 11, marginBottom: 6, display: 'inline-block' }}>
                  {cartModal.categorie || (lang === 'fr' ? 'Activité' : 'Activity')}
                </span>
                <h3 className="serif" style={{ fontSize: 22, lineHeight: 1.1 }}>
                  {lang === 'fr' ? cartModal.nom_fr : cartModal.nom_en}
                </h3>
                <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  {cartModal.ville || ''}{cartModal.duree ? ' · ' + cartModal.duree : ''}
                </p>
              </div>
              <button
                onClick={() => setCartModal(null)}
                style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-faint)', padding: '4px 8px', lineHeight: 1 }}
              >✕</button>
            </div>

            <div className="col gap-16">
              {/* Date */}
              <div>
                <label className="field-label">{lang === 'fr' ? 'Date de l\'activité' : 'Activity date'}</label>
                <input
                  className="input"
                  type="date"
                  value={cartDate}
                  min={toLocalISO(new Date())}
                  style={{ width: '100%' }}
                  onChange={e => setCartDate(e.target.value)}
                />
              </div>

              {/* Nombre de personnes */}
              <div>
                <label className="field-label">
                  {lang === 'fr' ? 'Nombre de personnes' : 'Number of people'}
                  {cartModal.places_restantes !== undefined && (
                    <span className="muted" style={{ fontSize: 11, marginLeft: 8, fontWeight: 400 }}>
                      (max {cartModal.places_restantes})
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ width: 36, height: 36, padding: 0 }}
                    onClick={() => setCartNb(n => Math.max(1, n - 1))}
                  >−</button>
                  <span className="mono" style={{ fontSize: 18, minWidth: 28, textAlign: 'center', fontWeight: 600 }}>{cartNb}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ width: 36, height: 36, padding: 0 }}
                    onClick={() => setCartNb(n => Math.min(cartModal.places_restantes ?? 99, n + 1))}
                  >+</button>
                </div>
              </div>

              {/* Récapitulatif prix */}
              <div style={{
                background: 'var(--surface-2)',
                borderRadius: 8,
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div className="muted" style={{ fontSize: 13 }}>
                  {cartNb} {lang === 'fr' ? 'pers.' : 'guest(s)'} × {parseFloat(cartModal.prix).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                </div>
                <div className="serif" style={{ fontSize: 22 }}>
                  {(parseFloat(cartModal.prix) * cartNb).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
                </div>
              </div>

              {/* Bouton confirmer */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: 4 }}
                disabled={!cartDate}
                onClick={() => {
                  if (!addToCart || !cartDate) return;
                  const name = lang === 'fr' ? cartModal.nom_fr : cartModal.nom_en;
                  addToCart([{
                    id: `activite-${cartModal.id}-${cartDate}`,
                    kind: 'activite',
                    title: name,
                    sub: `${cartModal.ville || ''}${cartModal.duree ? ' · ' + cartModal.duree : ''} · ${cartDate} · ${cartNb} ${lang === 'fr' ? 'pers.' : 'guest(s)'}`,
                    price: parseFloat(cartModal.prix) * cartNb,
                    icon: '◇',
                  }]);
                  setCartModal(null);
                }}
              >
                {lang === 'fr' ? 'Ajouter au panier' : 'Add to cart'} · {(parseFloat(cartModal.prix) * cartNb).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} €
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

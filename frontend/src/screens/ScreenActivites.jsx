import { useState, useEffect } from 'react';
import { getActivites } from '../services/activitesService.js';
import Placeholder from '../components/Placeholder.jsx';

export default function ScreenActivites({ T, lang, navigate }) {
  const [activites, setActivites]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterCat, setFilterCat]     = useState('');
  const [filterDest, setFilterDest]   = useState('');
  const [search, setSearch]           = useState('');

  useEffect(() => {
    setLoading(true);
    getActivites()
      .then(r => setActivites(Array.isArray(r.data) ? r.data : []))
      .catch(() => setActivites([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(activites.map(a => a.categorie).filter(Boolean))].sort();
  const destinations = [...new Set(activites.map(a => (lang === 'fr' ? a.ville : a.ville) || '').filter(Boolean))].sort();

  const filtered = activites.filter(a => {
    const name = lang === 'fr' ? a.nom_fr : a.nom_en;
    if (filterCat && a.categorie !== filterCat) return false;
    if (filterDest && a.ville !== filterDest) return false;
    if (search && !name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const full = (a) => a.places_restantes !== undefined && parseInt(a.places_restantes, 10) <= 0;

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      {/* En-tête */}
      <div className="mb-32">
        <span className="eyebrow">{lang === 'fr' ? 'CATALOGUE' : 'CATALOG'}</span>
        <h1 className="serif mt-8" style={{ fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1 }}>
          {lang === 'fr' ? 'Activités & ' : 'Activities & '}
          <em style={{ color: 'var(--primary)' }}>{lang === 'fr' ? 'Expériences' : 'Experiences'}</em>
        </h1>
        <p className="muted mt-12" style={{ maxWidth: 560, fontSize: 16 }}>
          {lang === 'fr'
            ? 'Découvrez toutes les activités disponibles sur nos destinations, filtrez par catégorie et trouvez l\'expérience parfaite.'
            : 'Explore all available activities across our destinations, filter by category and find the perfect experience.'}
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
            <label className="field-label">{lang === 'fr' ? 'Destination' : 'Destination'}</label>
            <select className="input" value={filterDest} onChange={e => setFilterDest(e.target.value)} style={{ cursor: 'pointer' }}>
              <option value="">{lang === 'fr' ? 'Toutes' : 'All'}</option>
              {destinations.map(d => <option key={d} value={d}>{d}</option>)}
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
      <div className="between mb-16">
        <span className="muted" style={{ fontSize: 13 }}>
          {loading
            ? (lang === 'fr' ? 'Chargement…' : 'Loading…')
            : `${filtered.length} ${lang === 'fr' ? 'activité(s)' : 'activity/ies'}`}
        </span>
        {(filterCat || filterDest || search) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFilterCat(''); setFilterDest(''); setSearch(''); }}>
            {lang === 'fr' ? '✕ Réinitialiser' : '✕ Clear filters'}
          </button>
        )}
      </div>

      {/* Grille d'activités */}
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
        <div className="grid grid-3 gap-24">
          {filtered.map(a => {
            const name = lang === 'fr' ? a.nom_fr : a.nom_en;
            const desc = lang === 'fr' ? a.description_fr : a.description_en;
            const isFull = full(a);
            return (
              <div
                key={a.id}
                className="card-tile"
                style={{ padding: 0, overflow: 'hidden', opacity: isFull ? 0.65 : 1, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'relative' }}>
                  <Placeholder
                    label={name?.split(' ').slice(0, 2).join(' ').toUpperCase() || ''}
                    ratio="16/9"
                    cat="activite"
                    style={{ borderRadius: 0 }}
                  />
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
                      📍 {a.ville}{a.pays_fr ? (lang === 'fr' ? ` · ${a.pays_fr}` : ` · ${a.pays_en || a.pays_fr}`) : ''}
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
                    {a.slug && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => navigate('detail', { id: a.slug })}
                      >
                        {lang === 'fr' ? 'Voir le séjour →' : 'View stay →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

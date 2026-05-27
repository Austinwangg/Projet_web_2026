import { useState, useMemo, useEffect } from 'react';
import { getDestinations } from '../services/destinationsService.js';
import Placeholder from '../components/Placeholder.jsx';
import Stars from '../components/Stars.jsx';
import SearchBar from '../components/SearchBar.jsx';

// Formate une Date en "1 juil." / "Aug 1"
function fmtDate(d, lang) {
  if (!d) return '';
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
}

// Calcule le nb de jours entre deux dates (inclus : 1→8 juil. = 8 jours)
function diffDays(start, end) {
  if (!start || !end) return null;
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}


export default function ScreenResults({ T, lang, search, setSearch, navigate, cardStyle }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [types, setTypes] = useState(search.type && search.type !== 'all' ? [search.type] : []);
  const [budget, setBudget] = useState(3000);
  const [duration, setDuration] = useState(null);
  const [sort, setSort] = useState('popular');
  const [view, setView] = useState('grid');
  const [textQuery, setTextQuery] = useState(search.where || '');

  // Durée calculée depuis les dates choisies dans la SearchBar
  const selectedDuration = useMemo(() => diffDays(search.dates?.start, search.dates?.end), [search.dates]);

  const dateLabel = useMemo(() => {
    if (!search.dates?.start || !search.dates?.end) return null;
    return `${fmtDate(search.dates.start, lang)} → ${fmtDate(search.dates.end, lang)}`;
  }, [search.dates, lang]);

  useEffect(() => {
    setLoading(true);
    getDestinations()
      .then(r => {
        // Normaliser les données de l'API vers le format attendu par l'UI
        const raw = Array.isArray(r.data) ? r.data : [];
        const normalized = raw.map(d => ({
          id: d.slug,
          dbId: d.id,
          city: d.ville,
          country: d.pays_fr,
          countryEn: d.pays_en,
          type: d.type,
          types: (() => { try { return JSON.parse(d.types_json || '[]'); } catch { return [d.type]; } })(),
          rating: parseFloat(d.note) || 4.5,
          reviews: d.nb_avis || 0,
          durationDays: d.duree_jours || 7,
          priceFrom: d.prix_depuis || 0,
          tag: d.tag_fr || '',
          tagEn: d.tag_en || '',
          blurb: d.resume_fr || '',
          blurbEn: d.resume_en || '',
          imageUrl: d.image_url || '',
          ph: `${(d.ville || '').toUpperCase()}`,
        }));
        setDestinations(normalized);
      })
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, []);

  // Sync textQuery avec search.where quand la prop change depuis la SearchBar
  useEffect(() => {
    if (search.where) setTextQuery(search.where);
  }, [search.where]);

  const filtered = useMemo(() => {
    let list = destinations.slice();

    // Filtre texte (ville ou pays)
    if (textQuery.trim()) {
      const q = textQuery.trim().toLowerCase();
      list = list.filter(d =>
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.countryEn.toLowerCase().includes(q)
      );
    }

    if (types.length) list = list.filter(d => d.types.some(t => types.includes(t)));
    list = list.filter(d => d.priceFrom <= budget);

    // Filtre durée : priorité aux dates choisies dans la SearchBar — correspondance exacte uniquement
    if (selectedDuration !== null) {
      list = list.filter(d => d.durationDays === selectedDuration);
    } else if (duration === 0) {
      list = list.filter(d => d.durationDays <= 3);
    } else if (duration === 1) {
      list = list.filter(d => d.durationDays >= 4 && d.durationDays <= 7);
    } else if (duration === 2) {
      list = list.filter(d => d.durationDays >= 8 && d.durationDays <= 14);
    } else if (duration === 3) {
      list = list.filter(d => d.durationDays >= 15);
    }

    if (sort === 'priceAsc')  list.sort((a, b) => a.priceFrom - b.priceFrom);
    if (sort === 'priceDesc') list.sort((a, b) => b.priceFrom - a.priceFrom);
    if (sort === 'rating')    list.sort((a, b) => b.rating - a.rating);
    if (sort === 'popular')   list.sort((a, b) => b.reviews - a.reviews);

    return list;
  }, [destinations, textQuery, types, budget, duration, selectedDuration, sort]);

  const toggleType = (t) => setTypes(types.includes(t) ? types.filter(x => x !== t) : [...types, t]);
  const resetDates = () => setSearch(prev => ({ ...prev, dates: { start: null, end: null } }));
  const reset = () => {
    setTypes([]); setBudget(3000); setDuration(null); setTextQuery('');
    resetDates();
  };

  return (
    <main className="container" style={{ paddingTop: 24 }}>
      <div style={{ marginBottom: 32 }}>
        <SearchBar T={T} lang={lang} value={search} setValue={setSearch} onSearch={() => {}} compact />
      </div>

      <div className="row mb-16" style={{ fontSize: 12.5, color: 'var(--ink-faint)' }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.12em' }}>
          {T.results.crumb[0].toUpperCase()} / {T.results.crumb[1].toUpperCase()}
        </span>
      </div>

      {/* Bannière filtre dates actif */}
      {dateLabel && (
        <div className="row" style={{ gap: 12, marginBottom: 16, padding: '10px 16px', background: 'color-mix(in oklab, var(--primary) 8%, var(--surface))', border: '1px solid color-mix(in oklab, var(--primary) 20%, transparent)', borderRadius: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 13 }}>
            📅 {lang === 'fr' ? 'Disponibles pour' : 'Available for'} <strong>{dateLabel}</strong>
            {selectedDuration !== null && <span className="muted" style={{ fontSize: 12 }}> · {selectedDuration} {lang === 'fr' ? 'jours' : 'days'}</span>}
          </span>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, marginLeft: 'auto', padding: '2px 8px' }} onClick={resetDates}>
            ✕ {lang === 'fr' ? 'Effacer les dates' : 'Clear dates'}
          </button>
        </div>
      )}

      <div className="between mb-32" style={{ alignItems: 'flex-end' }}>
        <div>
          <span className="eyebrow">{lang === 'fr' ? 'CATALOGUE' : 'CATALOG'}</span>
          <h2 className="serif mt-8" style={{ fontSize: 48, lineHeight: 1 }}>
            {loading ? (lang === 'fr' ? 'Chargement…' : 'Loading…') : T.results.foundN(filtered.length)}
          </h2>
        </div>
        <div className="row">
          <span className="muted" style={{ fontSize: 13 }}>{T.results.sortBy}</span>
          <select className="input" style={{ width: 'auto', padding: '8px 14px' }} value={sort} onChange={e => setSort(e.target.value)}>
            {Object.entries(T.results.sort).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="row gap-4" style={{ marginLeft: 12 }}>
            <button className={`btn btn-sm ${view === 'grid' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setView('grid')}>▦</button>
            <button className={`btn btn-sm ${view === 'list' ? 'btn-ink' : 'btn-outline'}`} onClick={() => setView('list')}>≡</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
        {/* FILTRES */}
        <aside className="filters">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <h4 style={{ fontFamily: 'JetBrains Mono', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-faint)', fontWeight: 500 }}>
              {T.results.filters}
            </h4>
            <button className="btn btn-ghost btn-sm" onClick={reset} style={{ fontSize: 11, height: 24, padding: '0 8px' }}>
              ↺ {T.results.reset}
            </button>
          </div>

          {/* Filtre texte */}
          <div className="filter-group">
            <h4>{lang === 'fr' ? 'Recherche' : 'Search'}</h4>
            <input
              type="text"
              className="input"
              placeholder={lang === 'fr' ? 'Ville ou pays…' : 'City or country…'}
              value={textQuery}
              onChange={e => setTextQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: 13 }}
            />
          </div>

          <div className="filter-group">
            <h4>{T.results.type}</h4>
            {T.home.categories.slice(1).map(c => (
              <label key={c.id} className={`check ${types.includes(c.id) ? 'checked' : ''}`}>
                <input type="checkbox" checked={types.includes(c.id)} onChange={() => toggleType(c.id)} />
                {c.label}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>{T.results.budget}</h4>
            <input type="range" min="200" max="3000" step="50" value={budget} onChange={e => setBudget(parseInt(e.target.value))} />
            <div className="between mono" style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 4 }}>
              <span>200 €</span>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>≤ {budget} €</span>
              <span>3 000 €</span>
            </div>
          </div>

          <div className="filter-group">
            <h4>{T.results.duration}</h4>
            {selectedDuration !== null ? (
              <div style={{ fontSize: 12, color: 'var(--primary)', padding: '6px 0' }}>
                <span>📅 {dateLabel}</span>
                <span className="muted" style={{ display: 'block', fontSize: 11, marginTop: 2 }}>
                  {lang === 'fr' ? `Filtre actif : ${selectedDuration} jours` : `Active filter: ${selectedDuration} days`}
                </span>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '2px 0', marginTop: 4 }} onClick={resetDates}>
                  ✕ {lang === 'fr' ? 'Effacer' : 'Clear'}
                </button>
              </div>
            ) : (
              T.results.durations.map((d, i) => (
                <label key={i} className={`check ${duration === i ? 'checked' : ''}`}>
                  <input type="radio" name="dur" checked={duration === i} onChange={() => setDuration(duration === i ? null : i)} />
                  {d}
                </label>
              ))
            )}
          </div>
        </aside>

        {/* RÉSULTATS */}
        <div>
          {loading ? (
            <div className="card-tile center" style={{ padding: 64 }}>
              <p className="muted">{lang === 'fr' ? 'Chargement des destinations…' : 'Loading destinations…'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-tile center" style={{ padding: 64 }}>
              <p className="muted">{T.results.none}</p>
              <button className="btn btn-outline mt-16" onClick={reset}>{T.results.reset}</button>
            </div>
          ) : view === 'grid' ? (
            <div className={`grid grid-3 ${cardStyle === 'illustrated' ? 'card-illustrated' : ''}`}>
              {filtered.map((d, i) => (
                <button key={d.id} className="dest fade-up" style={{ animationDelay: `${i * 30}ms` }} onClick={() => navigate('detail', { id: d.id })}>
                  <Placeholder label={d.ph} ratio="4/5" cat={d.type} className="dest-img" imageUrl={d.imageUrl} />
                  <div className="dest-meta">
                    <div>
                      <div className="dest-name">{d.city}</div>
                      <div className="dest-country">{lang === 'fr' ? d.country : d.countryEn} · {d.durationDays}{lang === 'fr' ? 'J' : 'D'}</div>
                    </div>
                    {d.tag && <span className="tag">{lang === 'fr' ? d.tag : d.tagEn}</span>}
                  </div>
                  {search.dates?.start && search.dates?.end && (
                    <div className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 4, letterSpacing: '0.06em' }}>
                      {fmtDate(search.dates.start, lang)} → {fmtDate(search.dates.end, lang)}
                    </div>
                  )}
                  <div className="between">
                    <Stars value={d.rating} />
                    <div className="dest-price">
                      <strong>{d.priceFrom} €</strong>
                      <span className="muted"> {T.detail.perPerson}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={`col gap-16 ${cardStyle === 'illustrated' ? 'card-illustrated' : ''}`}>
              {filtered.map((d, i) => (
                <button key={d.id} className="card fade-up" style={{ display: 'grid', gridTemplateColumns: '280px 1fr auto', gap: 24, padding: 16, alignItems: 'center', border: '1px solid var(--line-soft)', background: 'var(--surface)', textAlign: 'left', animationDelay: `${i * 30}ms` }} onClick={() => navigate('detail', { id: d.id })}>
                  <Placeholder label={d.ph} ratio="16/10" cat={d.type} imageUrl={d.imageUrl} />
                  <div>
                    <div className="row gap-8" style={{ marginBottom: 6 }}>
                      <span className="dest-country">{lang === 'fr' ? d.country : d.countryEn}</span>
                      {d.tag && <span className="tag">{lang === 'fr' ? d.tag : d.tagEn}</span>}
                    </div>
                    <div className="serif" style={{ fontSize: 28, lineHeight: 1.05, marginBottom: 6 }}>{d.city}</div>
                    <p className="muted" style={{ fontSize: 13.5, marginBottom: 8 }}>{lang === 'fr' ? d.blurb : d.blurbEn}</p>
                    <Stars value={d.rating} />
                    {search.dates?.start && search.dates?.end && (
                      <div className="mono" style={{ fontSize: 11, color: 'var(--primary)', marginTop: 8, letterSpacing: '0.06em' }}>
                        📅 {fmtDate(search.dates.start, lang)} → {fmtDate(search.dates.end, lang)}
                      </div>
                    )}
                  </div>
                  <div className="col" style={{ textAlign: 'right', alignItems: 'flex-end' }}>
                    <span className="muted" style={{ fontSize: 12 }}>{T.detail.from}</span>
                    <div className="serif" style={{ fontSize: 32 }}>{d.priceFrom} €</div>
                    <span className="muted" style={{ fontSize: 12 }}>{T.detail.perPerson} · {d.durationDays}{lang === 'fr' ? 'J' : 'D'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

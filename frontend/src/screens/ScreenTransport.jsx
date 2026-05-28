import { useState, useEffect, useMemo } from 'react';
import { searchTransports } from '../services/transportsService.js';
import { getDestinations } from '../services/destinationsService.js';

const TYPE_ICONS = { avion: '✈', train: '🚆', bus: '🚌', voiture: '🚗' };
const TYPE_LABELS = {
  fr: { avion: 'Avion', train: 'Train', bus: 'Bus', voiture: 'Voiture' },
  en: { avion: 'Plane', train: 'Train', bus: 'Bus', voiture: 'Car' },
};

const COMPANY_DOMAINS = {
  'air france': 'airfrance.com',
  'air france hop': 'airfrance.com',
  'transavia': 'transavia.com',
  'tap': 'flytap.com',
  'tap air portugal': 'flytap.com',
  'royal air maroc': 'royalairmaroc.com',
  'vietnam airlines': 'vietnamairlines.com',
  'norwegian': 'norwegian.com',
  'aeromexico': 'aeromexico.com',
  'aeroméxico': 'aeromexico.com',
  'sncf': 'sncf.com',
  'sncf + renfe': 'sncf.com',
  'sncf + ferry': 'sncf.com',
  'flixbus': 'flixbus.com',
  'ouigo': 'ouigo.com',
  'eurostar': 'eurostar.com',
  'eurolines': 'eurolines.com',
  'easyjet': 'easyjet.com',
  'ryanair': 'ryanair.com',
  'lufthansa': 'lufthansa.com',
  'british airways': 'britishairways.com',
  'emirates': 'emirates.com',
  'qatar airways': 'qatarairways.com',
  'vueling': 'vueling.com',
  'icelandair': 'icelandair.com',
  'aegean': 'aegeanair.com',
  'turkish airlines': 'turkishairlines.com',
  'air transat': 'airtransat.com',
  'china eastern': 'ceair.com',
  'cathay pacific': 'cathaypacific.com',
  'corsair': 'corsair.fr',
  'kenya airways': 'kenya-airways.com',
  'air austral': 'air-austral.com',
  'lan': 'latam.com',
  'latam': 'latam.com',
  'copa airlines': 'copaair.com',
};

// Palette déterministe selon la première lettre
function companyColor(name) {
  const palette = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
  const idx = (name?.charCodeAt(0) || 0) % palette.length;
  return palette[idx];
}

function CompanyLogo({ compagnie, type, size = 52 }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError]   = useState(false);
  const domain = compagnie ? COMPANY_DOMAINS[compagnie.toLowerCase()] : null;
  const initials = compagnie
    ? compagnie.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : TYPE_ICONS[type] || '✈';
  const bgColor = companyColor(compagnie);

  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: domain && !imgError ? '#fff' : bgColor,
      display: 'grid', placeItems: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      border: domain && !imgError ? '1px solid var(--line-soft)' : 'none',
      position: 'relative',
    }}>
      {/* Initiales (toujours présentes, cachées si image chargée) */}
      {(!domain || imgError) && (
        <span style={{ color: '#fff', fontWeight: 700, fontSize: Math.round(size * 0.3), letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif' }}>
          {initials}
        </span>
      )}
      {/* Favicon Google (tente de charger si on connaît le domaine) */}
      {domain && !imgError && (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={compagnie}
          style={{
            width: size - 18, height: size - 18,
            objectFit: 'contain',
            display: imgLoaded ? 'block' : 'none',
          }}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      )}
      {/* Placeholder coloré pendant le chargement */}
      {domain && !imgError && !imgLoaded && (
        <span style={{ color: bgColor, fontWeight: 700, fontSize: Math.round(size * 0.3), letterSpacing: '-0.02em' }}>
          {initials}
        </span>
      )}
    </div>
  );
}

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function today() { return toLocalISO(new Date()); }

function addDays(dateStr, n) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return toLocalISO(dt);
}

/** Valide les dates côté client — retourne un message d'erreur ou null */
function validateDates(depart, retour) {
  if (!depart) return 'Sélectionnez une date de départ.';
  if (!retour) return 'Sélectionnez une date de retour.';
  const d = new Date(depart);
  const r = new Date(retour);
  const t = new Date(today());
  if (d < t) return 'La date de départ ne peut pas être dans le passé.';
  if (r <= d) return 'La date de retour doit être postérieure à la date de départ.';
  return null;
}

export default function ScreenTransport({ T, lang, navigate, user, addToCart, searchDates, searchTravelers, itineraryMode, addToItinerary, itineraryTravelers, itineraryDates }) {
  const [destinations, setDestinations] = useState([]);

  // Filtres
  const [destId, setDestId]         = useState('');
  const [type, setType]             = useState('');
  const [prixMax, setPrixMax]       = useState('');
  const [prixMin, setPrixMin]       = useState('');
  const [sortBy, setSortBy]         = useState('prix_asc');

  // Dates — priorité à itineraryDates quand on vient de l'itinéraire
  const [dateDepart, setDateDepart] = useState(() => {
    if (itineraryDates?.depart) return itineraryDates.depart;
    return searchDates?.start instanceof Date ? toLocalISO(searchDates.start) : today();
  });
  const [dateRetour, setDateRetour] = useState(() => {
    if (itineraryDates?.retour) return itineraryDates.retour;
    return searchDates?.end instanceof Date ? toLocalISO(searchDates.end) : addDays(today(), 7);
  });
  const [dateError, setDateError]   = useState('');

  // Voyageurs — priorité à itineraryTravelers quand on vient de l'itinéraire
  const [nbVoyageurs, setNbVoyageurs] = useState(() => {
    if (itineraryTravelers && itineraryTravelers > 0) return itineraryTravelers;
    if (!searchTravelers) return 2;
    return (searchTravelers.adult || 0) + (searchTravelers.student || 0) + (searchTravelers.child || 0) || 2;
  });

  // Résultats
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    getDestinations()
      .then(r => setDestinations(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    // Charger tous les transports dès l'ouverture de la page
    setLoading(true);
    setSearched(true);
    searchTransports({}).then(r => {
      setResults(Array.isArray(r.data) ? r.data : []);
    }).catch(() => setResults([])).finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    const err = validateDates(dateDepart, dateRetour);
    if (err) { setDateError(err); return; }
    setDateError('');

    setLoading(true);
    setSearched(true);
    setSelected(null);

    const filters = {};
    if (destId)  filters.destination_id = destId;
    if (type)    filters.type = type;
    if (prixMin) filters.prix_min = prixMin;
    if (prixMax) filters.prix_max = prixMax;
    filters.places_min = nbVoyageurs;

    try {
      const res = await searchTransports(filters);
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => {
    const arr = [...results];
    if (sortBy === 'prix_asc')   return arr.sort((a, b) => a.prix - b.prix);
    if (sortBy === 'prix_desc')  return arr.sort((a, b) => b.prix - a.prix);
    if (sortBy === 'duree')      return arr.sort((a, b) => (a.duree || '').localeCompare(b.duree || ''));
    if (sortBy === 'dispo_desc') return arr.sort((a, b) => b.places_dispo - a.places_dispo);
    return arr;
  }, [results, sortBy]);

  const handleAddToCart = () => {
    if (!selected) return;
    const err = validateDates(dateDepart, dateRetour);
    if (err) { setDateError(err); return; }
    setDateError('');

    const t = results.find(r => r.id === selected);
    if (!t) return;

    const destName = destinations.find(d => d.id === t.destination_id);
    const destSlug = destName?.slug || '';

    addToCart([{
      id: 'transport-' + t.id,
      kind: 'flight',
      destSlug,
      transportDbId: t.id,
      title: `${lang === 'fr' ? 'Transport' : 'Transport'} · ${t.depart} → ${t.arrivee}`,
      sub: `${t.compagnie || ''} · ${t.duree || ''} · ${dateDepart} → ${dateRetour}`,
      price: parseFloat(t.prix) * nbVoyageurs,
      icon: TYPE_ICONS[t.type] || '✈',
      dateDepart,
      dateRetour,
      nbVoyageurs,
    }]);
    setAddedMsg(lang === 'fr' ? '✓ Transport ajouté au panier' : '✓ Transport added to cart');
    setTimeout(() => setAddedMsg(''), 3000);
  };

  const fr = lang === 'fr';
  const types = ['avion', 'train', 'bus', 'voiture'];

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
                  ? 'Sélectionnez un trajet puis cliquez sur "Ajouter à l\'itinéraire" pour revenir.'
                  : 'Select a route then click "Add to itinerary" to return.'}
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
        <span className="eyebrow">{fr ? 'PLANIFICATION DES TRAJETS' : 'TRIP PLANNING'}</span>
        <h1 className="serif mt-8" style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1 }}>
          {fr ? 'Recherche de ' : 'Find your '}<em style={{ color: 'var(--primary)' }}>{fr ? 'transports' : 'transport'}</em>
        </h1>
        <p className="muted mt-12" style={{ maxWidth: 560, fontSize: 16 }}>
          {fr
            ? 'Filtrez par destination, type, prix et disponibilité. Sélectionnez un trajet pour l\'ajouter à votre séjour.'
            : 'Filter by destination, type, price and availability. Select a route to add it to your stay.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 40, alignItems: 'flex-start' }}>

        {/* ── PANNEAU FILTRES ── */}
        <aside className="card-tile" style={{ padding: 28, position: 'sticky', top: 24 }}>
          <form onSubmit={handleSearch} className="col gap-20">
            <div>
              <span className="eyebrow">{fr ? 'FILTRES' : 'FILTERS'}</span>
            </div>

            {/* Destination */}
            <div>
              <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
                {fr ? 'DESTINATION' : 'DESTINATION'}
              </label>
              <select
                className="input"
                style={{ width: '100%' }}
                value={destId}
                onChange={e => setDestId(e.target.value)}
              >
                <option value="">{fr ? 'Toutes les destinations' : 'All destinations'}</option>
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.ville} ({fr ? d.pays_fr : d.pays_en})</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                {fr ? 'TYPE DE TRANSPORT' : 'TRANSPORT TYPE'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${type === '' ? 'btn-ink' : 'btn-outline'}`}
                  onClick={() => setType('')}
                >
                  {fr ? 'Tous' : 'All'}
                </button>
                {types.map(tp => (
                  <button
                    key={tp}
                    type="button"
                    className={`btn btn-sm ${type === tp ? 'btn-ink' : 'btn-outline'}`}
                    onClick={() => setType(tp)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}
                  >
                    {TYPE_ICONS[tp]} {TYPE_LABELS[fr ? 'fr' : 'en'][tp]}
                  </button>
                ))}
              </div>
            </div>

            {/* Prix */}
            <div>
              <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                {fr ? 'PRIX / PERSONNE (€)' : 'PRICE / PERSON (€)'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder={fr ? 'Min' : 'Min'}
                  value={prixMin}
                  onChange={e => setPrixMin(e.target.value)}
                />
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder={fr ? 'Max' : 'Max'}
                  value={prixMax}
                  onChange={e => setPrixMax(e.target.value)}
                />
              </div>
            </div>

            {/* Dates */}
            <div>
              <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                {fr ? 'DATES DU TRAJET' : 'TRAVEL DATES'}
              </label>
              <div className="col gap-8">
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {fr ? 'DÉPART' : 'DEPARTURE'}
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={dateDepart}
                    min={today()}
                    style={{ width: '100%', marginTop: 4 }}
                    onChange={e => {
                      setDateDepart(e.target.value);
                      setDateError('');
                      // Auto-ajuste retour si incohérent
                      if (dateRetour && e.target.value >= dateRetour) {
                        setDateRetour(addDays(e.target.value, 1));
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {fr ? 'RETOUR' : 'RETURN'}
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={dateRetour}
                    min={addDays(dateDepart, 1) || today()}
                    style={{ width: '100%', marginTop: 4 }}
                    onChange={e => {
                      setDateRetour(e.target.value);
                      setDateError('');
                    }}
                  />
                </div>
              </div>
              {dateError && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)', padding: '6px 10px', borderRadius: 6, background: 'color-mix(in oklab, var(--danger) 10%, transparent)' }}>
                  {dateError}
                </div>
              )}
            </div>

            {/* Voyageurs */}
            <div>
              <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                {fr ? 'VOYAGEURS' : 'TRAVELERS'}
              </label>
              <div className="row gap-8" style={{ alignItems: 'center' }}>
                <button type="button" className="btn btn-outline btn-sm" style={{ width: 32, height: 32, padding: 0 }} onClick={() => setNbVoyageurs(Math.max(1, nbVoyageurs - 1))}>−</button>
                <span className="mono" style={{ fontSize: 15, minWidth: 24, textAlign: 'center' }}>{nbVoyageurs}</span>
                <button type="button" className="btn btn-outline btn-sm" style={{ width: 32, height: 32, padding: 0 }} onClick={() => setNbVoyageurs(Math.min(20, nbVoyageurs + 1))}>+</button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (fr ? 'Recherche…' : 'Searching…') : (fr ? '🔍 Rechercher' : '🔍 Search')}
            </button>

            {(destId || type || prixMin || prixMax) && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => { setDestId(''); setType(''); setPrixMin(''); setPrixMax(''); }}
              >
                {fr ? '✕ Réinitialiser les filtres' : '✕ Reset filters'}
              </button>
            )}
          </form>
        </aside>

        {/* ── RÉSULTATS ── */}
        <div className="col gap-16">

          {/* Tri + compteur */}
          {searched && (
            <div className="between">
              <span className="muted" style={{ fontSize: 14 }}>
                {loading
                  ? (fr ? 'Chargement…' : 'Loading…')
                  : `${sorted.length} ${fr ? 'trajet(s) disponible(s)' : 'route(s) available'}`}
              </span>
              {!loading && sorted.length > 1 && (
                <select
                  className="input"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                >
                  <option value="prix_asc">{fr ? 'Prix croissant' : 'Price ↑'}</option>
                  <option value="prix_desc">{fr ? 'Prix décroissant' : 'Price ↓'}</option>
                  <option value="duree">{fr ? 'Durée' : 'Duration'}</option>
                  <option value="dispo_desc">{fr ? 'Disponibilité' : 'Availability'}</option>
                </select>
              )}
            </div>
          )}

          {/* État initial */}
          {!searched && !loading && (
            <div className="card-tile center" style={{ padding: '60px 40px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✈</div>
              <p className="serif" style={{ fontSize: 22, marginBottom: 8 }}>
                {fr ? 'Recherchez un trajet' : 'Search for a route'}
              </p>
              <p className="muted" style={{ fontSize: 14 }}>
                {fr
                  ? 'Utilisez les filtres à gauche et cliquez sur Rechercher.'
                  : 'Use the filters on the left and click Search.'}
              </p>
            </div>
          )}

          {/* Aucun résultat */}
          {searched && !loading && sorted.length === 0 && (
            <div className="card-tile center" style={{ padding: '60px 40px' }}>
              <p className="serif" style={{ fontSize: 22, marginBottom: 8 }}>
                {fr ? 'Aucun trajet disponible' : 'No routes available'}
              </p>
              <p className="muted" style={{ fontSize: 14 }}>
                {fr
                  ? 'Modifiez vos filtres ou choisissez une autre destination.'
                  : 'Try different filters or choose another destination.'}
              </p>
            </div>
          )}

          {/* Liste des résultats */}
          {sorted.map(t => {
            const isSelected = selected === t.id;
            const totalPrix  = parseFloat(t.prix) * nbVoyageurs;
            const dispo      = parseInt(t.places_dispo, 10);
            const lowDispo   = dispo <= 5;

            return (
              <div
                key={t.id}
                className="card-tile fade-up"
                style={{
                  padding: 24,
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--ink)' : '1px solid var(--line-soft)',
                  transition: 'border-color .15s',
                }}
                onClick={() => setSelected(isSelected ? null : t.id)}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 20, alignItems: 'center' }}>

                  {/* Logo compagnie */}
                  <CompanyLogo compagnie={t.compagnie} type={t.type} size={52} />

                  {/* Infos trajet */}
                  <div>
                    <div className="row gap-12" style={{ alignItems: 'center', marginBottom: 4 }}>
                      <span className="serif" style={{ fontSize: 20 }}>{t.compagnie || (fr ? 'Compagnie' : 'Company')}</span>
                      <span className="tag">{TYPE_LABELS[fr ? 'fr' : 'en'][t.type]}</span>
                    </div>
                    <div className="row gap-8" style={{ alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{t.depart}</span>
                      <span className="muted">→</span>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{t.arrivee}</span>
                      {t.duree && (
                        <>
                          <span className="muted">·</span>
                          <span className="mono muted" style={{ fontSize: 12 }}>{t.duree}</span>
                        </>
                      )}
                    </div>
                    {t.horaire && (
                      <div className="mono" style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 4, letterSpacing: '0.06em' }}>
                        {t.horaire}
                      </div>
                    )}
                    <div className="row gap-12 mt-8" style={{ flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: lowDispo ? 'var(--danger)' : 'var(--ok)', fontFamily: 'JetBrains Mono' }}>
                        {dispo} {fr ? 'place(s) disponible(s)' : 'seat(s) available'}
                        {lowDispo && ' ⚠'}
                      </span>
                      <span className="muted mono" style={{ fontSize: 11 }}>
                        {fr ? `${nbVoyageurs} voyageur(s)` : `${nbVoyageurs} traveler(s)`}
                      </span>
                    </div>
                  </div>

                  {/* Prix */}
                  <div style={{ textAlign: 'right' }}>
                    <div className="serif" style={{ fontSize: 28 }}>{totalPrix.toLocaleString(fr ? 'fr-FR' : 'en-US')} €</div>
                    <div className="muted" style={{ fontSize: 11 }}>
                      {parseFloat(t.prix).toLocaleString(fr ? 'fr-FR' : 'en-US')} € {fr ? '/ pers.' : '/ person'}
                    </div>
                  </div>

                  {/* Sélection */}
                  <div>
                    <button
                      className={`btn btn-sm ${isSelected ? 'btn-ink' : 'btn-outline'}`}
                      onClick={e => { e.stopPropagation(); setSelected(isSelected ? null : t.id); }}
                    >
                      {isSelected ? (fr ? '✓ Sélectionné' : '✓ Selected') : (fr ? 'Choisir' : 'Select')}
                    </button>
                  </div>
                </div>

                {/* Panneau dates (visible quand sélectionné) */}
                {isSelected && (
                  <div className="fade-up" style={{
                    marginTop: 20, paddingTop: 20,
                    borderTop: '1px solid var(--line-soft)',
                    display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'flex-end',
                  }}>
                    <div>
                      <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                        {fr ? 'DATE DE DÉPART' : 'DEPARTURE DATE'}
                      </label>
                      <input
                        className="input"
                        type="date"
                        value={dateDepart}
                        min={today()}
                        style={{ width: '100%' }}
                        onChange={e => {
                          setDateDepart(e.target.value);
                          setDateError('');
                          if (dateRetour && e.target.value >= dateRetour) {
                            setDateRetour(addDays(e.target.value, 1));
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 4 }}>
                        {fr ? 'DATE DE RETOUR' : 'RETURN DATE'}
                      </label>
                      <input
                        className="input"
                        type="date"
                        value={dateRetour}
                        min={addDays(dateDepart, 1) || today()}
                        style={{ width: '100%' }}
                        onChange={e => {
                          setDateRetour(e.target.value);
                          setDateError('');
                        }}
                      />
                    </div>
                    {itineraryMode ? (
                      <button
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap', height: 44, background: '#f59e0b', border: 'none' }}
                        onClick={() => {
                          const err = validateDates(dateDepart, dateRetour);
                          if (err) { setDateError(err); return; }
                          const t = results.find(r => r.id === selected);
                          if (!t || !addToItinerary) return;
                          addToItinerary({
                            type: 'transport',
                            ref_id: t.id,
                            titre: `${t.depart} → ${t.arrivee}`,
                            sous_titre: `${t.compagnie || ''} · ${t.duree || ''} · ${dateDepart} → ${dateRetour}`,
                            prix: parseFloat(t.prix) * nbVoyageurs,
                            icone: TYPE_ICONS[t.type] || '✈',
                            date_item: dateDepart,
                          });
                        }}
                      >
                        {fr ? '+ Ajouter à l\'itinéraire' : '+ Add to itinerary'}
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={handleAddToCart}
                        style={{ whiteSpace: 'nowrap', height: 44 }}
                      >
                        {fr ? '+ Ajouter au panier' : '+ Add to cart'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Message confirmation ajout panier */}
          {addedMsg && (
            <div style={{
              position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--ink)', color: 'var(--surface)', padding: '12px 24px',
              borderRadius: 12, fontSize: 14, fontWeight: 600, zIndex: 999,
              boxShadow: '0 4px 24px rgba(0,0,0,.25)',
            }}>
              {addedMsg}
            </div>
          )}

          {/* CTA si trajet sélectionné */}
          {selected && !addedMsg && (
            <div className="card-tile fade-up" style={{ padding: 24, background: 'color-mix(in oklab, var(--primary) 6%, var(--surface))' }}>
              <div className="between" style={{ alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {fr ? 'Trajet sélectionné' : 'Route selected'}
                  </div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                    {fr
                      ? 'Confirmez les dates ci-dessus puis ajoutez au panier.'
                      : 'Confirm dates above then add to cart.'}
                  </div>
                </div>
                <div className="row gap-12">
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('results')}>
                    {fr ? '← Retour aux destinations' : '← Back to destinations'}
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate('cart')}>
                    {fr ? 'Voir le panier →' : 'View cart →'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

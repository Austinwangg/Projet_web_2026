import { useState, useEffect } from 'react';
import { getUsers, setUserRole, deleteUser, createDestination, deleteDestination } from '../services/adminService.js';
import { getDestinations } from '../services/destinationsService.js';

const TYPES = ['ville', 'culture', 'aventure', 'plage', 'montagne'];

const EMPTY_OFFER = {
  ville: '', pays_fr: '', pays_en: '', type: 'ville', types_json: ['ville'],
  duree_jours: 7, prix_depuis: 0, note: 4.5, nb_avis: 0,
  tag_fr: '', tag_en: '', resume_fr: '', resume_en: '', image_url: '',
};

export default function ScreenAdmin({ T, lang, user }) {
  const [adminTab, setAdminTab] = useState('dashboard');

  // ── Utilisateurs
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersMsg, setUsersMsg] = useState('');

  // ── Offres / destinations
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersMsg, setOffersMsg] = useState('');

  // ── Modal ajout offre
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_OFFER });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Chargement utilisateurs
  useEffect(() => {
    if (adminTab === 'users') {
      setUsersLoading(true);
      getUsers()
        .then(r => setUsers(r.data))
        .catch(() => setUsers([]))
        .finally(() => setUsersLoading(false));
    }
  }, [adminTab]);

  // ── Chargement des offres (destinations réelles depuis l'API)
  useEffect(() => {
    if (adminTab === 'dashboard' || adminTab === 'offers') {
      setOffersLoading(true);
      getDestinations()
        .then(r => setOffers(Array.isArray(r.data) ? r.data : []))
        .catch(() => setOffers([]))
        .finally(() => setOffersLoading(false));
    }
  }, [adminTab]);

  const handleToggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (u.id === user?.id) { setUsersMsg(lang === 'fr' ? 'Vous ne pouvez pas modifier votre propre rôle.' : 'You cannot change your own role.'); return; }
    try {
      await setUserRole(u.id, newRole);
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, role: newRole } : x));
      setUsersMsg(lang === 'fr' ? `Rôle de ${u.nom} mis à jour.` : `${u.nom}'s role updated.`);
    } catch { setUsersMsg('Erreur.'); }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === user?.id) { setUsersMsg(lang === 'fr' ? 'Vous ne pouvez pas vous supprimer.' : 'You cannot delete yourself.'); return; }
    if (!window.confirm(lang === 'fr' ? `Supprimer ${u.nom} ?` : `Delete ${u.nom}?`)) return;
    try {
      await deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      setUsersMsg(lang === 'fr' ? `${u.nom} supprimé.` : `${u.nom} deleted.`);
    } catch { setUsersMsg('Erreur.'); }
  };

  // ── Suppression d'une offre/destination
  const handleDeleteOffer = async (dest) => {
    const name = dest.ville || dest.slug;
    if (!window.confirm(lang === 'fr' ? `Supprimer définitivement "${name}" et toutes ses données associées ?` : `Permanently delete "${name}" and all associated data?`)) return;
    try {
      await deleteDestination(dest.id, user?.role || 'admin');
      setOffers(prev => prev.filter(o => o.id !== dest.id));
      setOffersMsg(lang === 'fr' ? `"${name}" supprimé du catalogue.` : `"${name}" removed from catalog.`);
    } catch (e) {
      const msg = e?.response?.data?.error || 'Erreur lors de la suppression.';
      setOffersMsg(msg);
    }
  };

  // ── Ajout d'une offre
  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleTypeToggle = (t) => {
    setForm(prev => {
      const arr = prev.types_json.includes(t) ? prev.types_json.filter(x => x !== t) : [...prev.types_json, t];
      return { ...prev, types_json: arr, type: arr[0] || 'ville' };
    });
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.ville.trim()) { setFormError(lang === 'fr' ? 'Le nom de la ville est obligatoire.' : 'City name is required.'); return; }
    if (!form.pays_fr.trim()) { setFormError(lang === 'fr' ? 'Le pays (FR) est obligatoire.' : 'Country (FR) is required.'); return; }
    if (!form.pays_en.trim()) { setFormError(lang === 'fr' ? 'Le pays (EN) est obligatoire.' : 'Country (EN) is required.'); return; }
    if (form.prix_depuis <= 0) { setFormError(lang === 'fr' ? 'Le prix doit être supérieur à 0.' : 'Price must be > 0.'); return; }

    setFormSubmitting(true);
    try {
      const payload = {
        ...form,
        prix_depuis: parseInt(form.prix_depuis) || 0,
        duree_jours: parseInt(form.duree_jours) || 7,
        note: parseFloat(form.note) || 4.5,
        nb_avis: parseInt(form.nb_avis) || 0,
        types_json: form.types_json,
      };
      const res = await createDestination(payload, user?.role || 'admin');
      const newId = res.data?.id;
      // Recharger la liste pour voir le nouveau dans le catalogue
      const fresh = await getDestinations();
      setOffers(Array.isArray(fresh.data) ? fresh.data : []);
      setOffersMsg(lang === 'fr' ? `Destination "${form.ville}" ajoutée (ID ${newId}).` : `Destination "${form.ville}" added (ID ${newId}).`);
      setShowModal(false);
      setForm({ ...EMPTY_OFFER });
    } catch (e) {
      const msg = e?.response?.data?.error || (lang === 'fr' ? 'Erreur lors de la création.' : 'Error creating destination.');
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── KPIs & graphiques (statiques)
  const kpiValues = ['247', '12 480', '186 240 €', '4.2 %'];
  const kpiDirs = ['up', 'up', 'up', 'down'];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const sparks = [
    [12,18,14,22,26,24,30,34,32,38,42,47],
    [44,46,45,48,50,52,53,55,56,58,60,62],
    [80,90,95,110,120,135,145,160,165,175,180,186],
    [4.6,4.5,4.4,4.5,4.4,4.3,4.3,4.4,4.3,4.2,4.2,4.2]
  ];
  const bookings = [128,142,156,168,182,201,224,243,261,247,238,247];
  const lastYear = [102,118,131,145,156,172,189,201,214,220,219,225];

  const BarSpark = ({ vals, up }) => {
    const w = 96, h = 36, gap = 2;
    const max = Math.max(...vals);
    const bw = (w - gap * (vals.length - 1)) / vals.length;
    return (
      <svg width={w} height={h} style={{ display: 'block' }}>
        {vals.map((v, i) => {
          const bh = Math.max(2, (v / max) * h);
          return <rect key={i} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx="1" fill={i === vals.length - 1 ? (up ? 'var(--ok)' : 'var(--danger)') : 'color-mix(in oklab, var(--ink) 16%, transparent)'} />;
        })}
      </svg>
    );
  };

  const AreaChart = () => {
    const W = 720, H = 240, PAD_L = 36, PAD_R = 12, PAD_T = 16, PAD_B = 32;
    const max = Math.max(...bookings, ...lastYear) * 1.15;
    const sx = (i) => PAD_L + (i / (bookings.length - 1)) * (W - PAD_L - PAD_R);
    const sy = (v) => PAD_T + (1 - v / max) * (H - PAD_T - PAD_B);
    const linePath = (data) => data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i)} ${sy(v)}`).join(' ');
    const areaPath = `M ${sx(0)} ${sy(0)} ` + bookings.map((v, i) => `L ${sx(i)} ${sy(v)}`).join(' ') + ` L ${sx(bookings.length - 1)} ${sy(0)} Z`;
    const yticks = [0, max * 0.25, max * 0.5, max * 0.75, max].map(v => Math.round(v));
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {yticks.map((v, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={sy(v)} x2={W - PAD_R} y2={sy(v)} stroke="var(--line-soft)" strokeDasharray={i === 0 ? '' : '2 4'} />
            <text x={PAD_L - 8} y={sy(v) + 4} textAnchor="end" fontSize="10" fill="var(--ink-faint)" fontFamily="JetBrains Mono">{v}</text>
          </g>
        ))}
        {months.map((m, i) => (
          <text key={i} x={sx(i)} y={H - 10} textAnchor="middle" fontSize="10" fill="var(--ink-faint)" fontFamily="JetBrains Mono" letterSpacing="0.1em">{m}</text>
        ))}
        <path d={linePath(lastYear)} fill="none" stroke="var(--ink-faint)" strokeWidth="1.2" strokeDasharray="4 4" />
        <path d={areaPath} fill="url(#areaG)" />
        <path d={linePath(bookings)} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {bookings.map((v, i) => (
          <circle key={i} cx={sx(i)} cy={sy(v)} r={i === bookings.length - 1 ? 5 : 3} fill="var(--surface)" stroke="var(--primary)" strokeWidth={i === bookings.length - 1 ? 2.5 : 1.5} />
        ))}
      </svg>
    );
  };

  const topDest = [
    { name: 'Santorin', value: 67, type: 'plage' },
    { name: 'Bali', value: 42, type: 'aventure' },
    { name: 'Marrakech', value: 35, type: 'culture' },
    { name: 'Shanghai', value: 28, type: 'ville' },
    { name: 'Kyoto', value: 19, type: 'culture' },
    { name: 'Reykjavik', value: 8, type: 'aventure' }
  ];
  const topMax = Math.max(...topDest.map(d => d.value));

  const repart = [
    { label: lang === 'fr' ? 'Plage' : 'Beach', v: 38, c: 'var(--primary)' },
    { label: lang === 'fr' ? 'Culture' : 'Culture', v: 24, c: 'var(--accent)' },
    { label: lang === 'fr' ? 'Aventure' : 'Adventure', v: 18, c: 'var(--gold)' },
    { label: lang === 'fr' ? 'Ville' : 'City', v: 14, c: 'var(--primary-soft)' },
    { label: lang === 'fr' ? 'Montagne' : 'Mountain', v: 6, c: 'var(--accent-soft)' }
  ];

  const Donut = () => {
    const total = repart.reduce((s, r) => s + r.v, 0);
    let acc = 0;
    const R = 56, r = 36, cx = 70, cy = 70;
    const arcs = repart.map((s) => {
      const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
      acc += s.v;
      const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
      const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R);
      const [x2, y2] = p(a1, r), [x3, y3] = p(a0, r);
      return { d: `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 ${large} 0 ${x3} ${y3} Z`, c: s.c };
    });
    return (
      <svg width="140" height="140" viewBox="0 0 140 140">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.c} />)}
      </svg>
    );
  };

  return (
    <main className="container" style={{ paddingTop: 40 }}>
      <div className="between mb-24" style={{ alignItems: 'flex-end' }}>
        <div>
          <span className="eyebrow">{T.admin.eyebrow}</span>
          <h1 className="serif mt-8" style={{ fontSize: 'clamp(48px, 6vw, 72px)', lineHeight: 1 }}>
            {T.admin.title} <em style={{ color: 'var(--primary)' }}>{T.admin.titleEm}</em>
          </h1>
        </div>
        <div className="row gap-12">
          <select className="input" style={{ width: 'auto', padding: '8px 14px' }}>
            <option>{lang === 'fr' ? 'Mai 2026' : 'May 2026'}</option>
            <option>{lang === 'fr' ? 'Avril 2026' : 'April 2026'}</option>
          </select>
          <button className="btn btn-ink">{lang === 'fr' ? '↓ Exporter' : '↓ Export'}</button>
        </div>
      </div>

      <div className="tabs mb-32">
        {[
          { id: 'dashboard', label: lang === 'fr' ? 'Tableau de bord' : 'Dashboard' },
          { id: 'offers',    label: lang === 'fr' ? 'Offres & Destinations' : 'Offers & Destinations' },
          { id: 'users',     label: lang === 'fr' ? 'Utilisateurs' : 'Users' },
        ].map(t => (
          <div key={t.id} className={`tab ${adminTab === t.id ? 'active' : ''}`} onClick={() => setAdminTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {/* ── TAB UTILISATEURS */}
      {adminTab === 'users' && (
        <div className="fade-up">
          {usersMsg && (
            <div style={{ fontSize: 13, padding: '8px 14px', borderRadius: 8, marginBottom: 16, background: 'var(--surface-2)', color: 'var(--ink)' }}>
              {usersMsg}
            </div>
          )}
          <div className="card-tile" style={{ padding: 0 }}>
            <div className="between" style={{ padding: '24px 24px 16px' }}>
              <div>
                <span className="eyebrow">{lang === 'fr' ? 'GESTION' : 'MANAGEMENT'}</span>
                <h3 className="serif mt-4" style={{ fontSize: 22 }}>{lang === 'fr' ? 'Utilisateurs & rôles' : 'Users & roles'}</h3>
              </div>
              <span className="mono muted" style={{ fontSize: 12 }}>{users.length} {lang === 'fr' ? 'comptes' : 'accounts'}</span>
            </div>
            {usersLoading && <p className="muted" style={{ padding: '16px 24px' }}>{lang === 'fr' ? 'Chargement…' : 'Loading…'}</p>}
            {!usersLoading && (
              <table className="tbl">
                <thead>
                  <tr>
                    {[lang === 'fr' ? 'Nom' : 'Name', 'Email', lang === 'fr' ? 'Rôle' : 'Role', lang === 'fr' ? 'Inscrit le' : 'Joined', ''].map((c, i) => <th key={i}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="row gap-10">
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--surface-2)', color: 'var(--ink)' }}>
                            {(u.prenom || u.nom || '?')[0].toUpperCase()}
                          </div>
                          <strong>{u.prenom ? `${u.prenom} ${u.nom}` : u.nom}</strong>
                        </div>
                      </td>
                      <td className="muted" style={{ fontSize: 13 }}>{u.email}</td>
                      <td>
                        <span className="tag">
                          <span className={`dot ${u.role === 'admin' ? 'green' : ''}`}></span>
                          {u.role}
                        </span>
                      </td>
                      <td className="mono muted" style={{ fontSize: 12 }}>
                        {new Date(u.created_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div className="row gap-8">
                          <button className="btn btn-outline btn-sm" onClick={() => handleToggleRole(u)} disabled={u.id === user?.id}>
                            {u.role === 'admin' ? (lang === 'fr' ? '↓ Rétrograder' : '↓ Demote') : (lang === 'fr' ? '↑ Promouvoir' : '↑ Promote')}
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDeleteUser(u)} disabled={u.id === user?.id}>
                            {lang === 'fr' ? 'Supprimer' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB OFFRES / DESTINATIONS */}
      {adminTab === 'offers' && (
        <div className="fade-up">
          {offersMsg && (
            <div style={{ fontSize: 13, padding: '8px 14px', borderRadius: 8, marginBottom: 16, background: 'var(--surface-2)', color: 'var(--ink)' }}>
              {offersMsg}
            </div>
          )}
          <div className="card-tile" style={{ padding: 0 }}>
            <div className="between" style={{ padding: '24px 24px 16px' }}>
              <div>
                <span className="eyebrow">{lang === 'fr' ? 'OFFRES' : 'OFFERS'}</span>
                <h3 className="serif mt-4" style={{ fontSize: 22 }}>{T.admin.offersTitle}</h3>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setFormError(''); setForm({ ...EMPTY_OFFER }); }}>
                {T.admin.addOffer}
              </button>
            </div>

            {offersLoading ? (
              <p className="muted" style={{ padding: '16px 24px' }}>{lang === 'fr' ? 'Chargement…' : 'Loading…'}</p>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    {[
                      lang === 'fr' ? 'Destination' : 'Destination',
                      lang === 'fr' ? 'Pays' : 'Country',
                      'Type',
                      lang === 'fr' ? 'Prix depuis' : 'From price',
                      lang === 'fr' ? 'Durée' : 'Duration',
                      lang === 'fr' ? 'Note' : 'Rating',
                      ''
                    ].map((c, i) => <th key={i}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {offers.map(o => (
                    <tr key={o.id}>
                      <td><strong>{o.ville}</strong></td>
                      <td className="muted" style={{ fontSize: 13 }}>{lang === 'fr' ? o.pays_fr : o.pays_en}</td>
                      <td><span className="tag">{o.type}</span></td>
                      <td className="mono">{o.prix_depuis} €</td>
                      <td className="mono">{o.duree_jours}j</td>
                      <td className="mono">{parseFloat(o.note).toFixed(1)}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => handleDeleteOffer(o)}
                          title={lang === 'fr' ? 'Supprimer définitivement' : 'Delete permanently'}
                        >
                          {lang === 'fr' ? '✕ Supprimer' : '✕ Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {offers.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-faint)' }}>
                        {lang === 'fr' ? 'Aucune destination dans le catalogue.' : 'No destinations in catalog.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB DASHBOARD */}
      {adminTab === 'dashboard' && (
        <>
          <div className="grid grid-4 mb-32">
            {T.admin.kpis.map((k, i) => (
              <div key={i} className="kpi">
                <div className="l">{k.l}</div>
                <div className="between mt-8" style={{ alignItems: 'flex-end' }}>
                  <div>
                    <div className="v">{kpiValues[i]}</div>
                    <div className={`d ${kpiDirs[i]}`}>{kpiDirs[i] === 'up' ? '↗' : '↘'} {k.d}</div>
                  </div>
                  <BarSpark vals={sparks[i]} up={kpiDirs[i] === 'up'} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32, alignItems: 'stretch' }}>
            <div className="card-tile" style={{ padding: 28 }}>
              <div className="between mb-16">
                <div>
                  <span className="eyebrow">{lang === 'fr' ? 'RÉSERVATIONS · 12 MOIS' : 'BOOKINGS · 12 MONTHS'}</span>
                  <h3 className="serif mt-4" style={{ fontSize: 22 }}>{lang === 'fr' ? 'Évolution mensuelle' : 'Monthly trend'}</h3>
                </div>
                <div className="row gap-16">
                  <div className="row gap-8">
                    <span style={{ width: 14, height: 3, background: 'var(--primary)', borderRadius: 2 }}></span>
                    <span style={{ fontSize: 12 }}>2026</span>
                  </div>
                  <div className="row gap-8">
                    <span style={{ width: 14, height: 0, borderTop: '1.5px dashed var(--ink-faint)' }}></span>
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>2025</span>
                  </div>
                </div>
              </div>
              <AreaChart />
            </div>

            <div className="card-tile" style={{ padding: 28 }}>
              <span className="eyebrow">{lang === 'fr' ? 'PAR TYPE' : 'BY TYPE'}</span>
              <h3 className="serif mt-4 mb-16" style={{ fontSize: 22 }}>{lang === 'fr' ? 'Répartition' : 'Distribution'}</h3>
              <div className="row gap-24" style={{ alignItems: 'center' }}>
                <Donut />
                <div className="col gap-8" style={{ flex: 1 }}>
                  {repart.map((r, i) => (
                    <div key={i} className="between" style={{ fontSize: 13 }}>
                      <div className="row gap-8">
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: r.c }}></span>
                        <span>{r.label}</span>
                      </div>
                      <span className="mono" style={{ color: 'var(--ink-soft)' }}>{r.v}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div className="card-tile" style={{ padding: 28 }}>
              <span className="eyebrow">{lang === 'fr' ? 'TOP DESTINATIONS' : 'TOP DESTINATIONS'}</span>
              <h3 className="serif mt-4 mb-24" style={{ fontSize: 22 }}>{lang === 'fr' ? 'Réservations · Mai 2026' : 'Bookings · May 2026'}</h3>
              <div className="col gap-16">
                {topDest.map((d, i) => (
                  <div key={i}>
                    <div className="between mb-8">
                      <div className="row gap-12">
                        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', width: 18 }}>#{i + 1}</span>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>{d.name}</span>
                      </div>
                      <span className="mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{d.value} {lang === 'fr' ? 'rés.' : 'bk.'}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(d.value / topMax) * 100}%`, background: 'var(--primary)', borderRadius: 3, transition: 'width .4s ease' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-tile" style={{ padding: 28 }}>
              <span className="eyebrow">{lang === 'fr' ? 'ACTIVITÉ RÉCENTE' : 'RECENT ACTIVITY'}</span>
              <h3 className="serif mt-4 mb-24" style={{ fontSize: 22 }}>{lang === 'fr' ? "Aujourd'hui" : 'Today'}</h3>
              <div className="col gap-12">
                {[
                  { n: 'Camille R.', a: lang === 'fr' ? 'a réservé' : 'booked', t: 'Shanghai · 7j', when: '12:04' },
                  { n: 'Hugo M.', a: lang === 'fr' ? 'a annulé' : 'cancelled', t: 'Tulum · 5j', when: '11:48' },
                  { n: 'Léa B.', a: lang === 'fr' ? 'a créé un compte' : 'signed up', t: '', when: '11:20' },
                  { n: 'Paul T.', a: lang === 'fr' ? 'a payé' : 'paid', t: '1 408 €', when: '10:55' },
                  { n: 'Sarah K.', a: lang === 'fr' ? 'a évalué' : 'rated', t: '★ 5 · Kyoto', when: '10:18' },
                  { n: 'Marc D.', a: lang === 'fr' ? 'a ajouté aux favoris' : 'favorited', t: 'Patagonie', when: '09:42' }
                ].map((u, i) => (
                  <div key={i} className="row gap-12">
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--surface-2)', color: 'var(--ink)' }}>{u.n[0]}</div>
                    <div style={{ flex: 1, fontSize: 13 }}>
                      <strong>{u.n}</strong> <span className="muted">{u.a}</span> {u.t && <span>{u.t}</span>}
                    </div>
                    <span className="mono muted" style={{ fontSize: 11 }}>{u.when}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Aperçu rapide des offres sur le dashboard */}
          <div className="card-tile" style={{ padding: 0 }}>
            <div className="between" style={{ padding: '24px 24px 16px' }}>
              <div>
                <span className="eyebrow">{lang === 'fr' ? 'OFFRES' : 'OFFERS'}</span>
                <h3 className="serif mt-4" style={{ fontSize: 22 }}>{T.admin.offersTitle}</h3>
              </div>
              <div className="row gap-8">
                <span className="mono muted" style={{ fontSize: 12 }}>{offers.length} {lang === 'fr' ? 'destinations' : 'destinations'}</span>
                <button className="btn btn-primary btn-sm" onClick={() => setAdminTab('offers')}>
                  {lang === 'fr' ? 'Gérer →' : 'Manage →'}
                </button>
              </div>
            </div>
            <table className="tbl">
              <thead>
                <tr>{[lang === 'fr' ? 'Destination' : 'Destination', lang === 'fr' ? 'Pays' : 'Country', 'Type', lang === 'fr' ? 'Prix depuis' : 'From', lang === 'fr' ? 'Note' : 'Rating'].map((c, i) => <th key={i}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {offers.slice(0, 7).map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.ville}</strong></td>
                    <td className="muted" style={{ fontSize: 13 }}>{lang === 'fr' ? o.pays_fr : o.pays_en}</td>
                    <td><span className="tag">{o.type}</span></td>
                    <td className="mono">{o.prix_depuis} €</td>
                    <td className="mono">{parseFloat(o.note).toFixed(1)} ★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── MODAL AJOUT OFFRE */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'grid', placeItems: 'center', padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="card-tile" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 16, right: 16 }} onClick={() => setShowModal(false)}>✕</button>

            <span className="eyebrow">{lang === 'fr' ? 'NOUVELLE OFFRE' : 'NEW OFFER'}</span>
            <h3 className="serif mt-4 mb-24" style={{ fontSize: 24 }}>
              {lang === 'fr' ? 'Ajouter une destination au catalogue' : 'Add a destination to catalog'}
            </h3>

            {formError && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--danger-soft, #fee)', color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitOffer} className="col gap-16">
              <div className="grid grid-2 gap-16">
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {lang === 'fr' ? 'VILLE *' : 'CITY *'}
                  </label>
                  <input className="input" style={{ width: '100%', marginTop: 4 }} value={form.ville} onChange={e => handleFormChange('ville', e.target.value)} placeholder={lang === 'fr' ? 'Ex: Tokyo' : 'Ex: Tokyo'} required />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {lang === 'fr' ? 'PAYS (FR) *' : 'COUNTRY (FR) *'}
                  </label>
                  <input className="input" style={{ width: '100%', marginTop: 4 }} value={form.pays_fr} onChange={e => handleFormChange('pays_fr', e.target.value)} placeholder="Japon" required />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {lang === 'fr' ? 'PAYS (EN) *' : 'COUNTRY (EN) *'}
                  </label>
                  <input className="input" style={{ width: '100%', marginTop: 4 }} value={form.pays_en} onChange={e => handleFormChange('pays_en', e.target.value)} placeholder="Japan" required />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {lang === 'fr' ? 'PRIX DEPUIS (€) *' : 'PRICE FROM (€) *'}
                  </label>
                  <input type="number" min="1" className="input" style={{ width: '100%', marginTop: 4 }} value={form.prix_depuis} onChange={e => handleFormChange('prix_depuis', e.target.value)} required />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {lang === 'fr' ? 'DURÉE (JOURS)' : 'DURATION (DAYS)'}
                  </label>
                  <input type="number" min="1" max="30" className="input" style={{ width: '100%', marginTop: 4 }} value={form.duree_jours} onChange={e => handleFormChange('duree_jours', e.target.value)} />
                </div>
                <div>
                  <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                    {lang === 'fr' ? 'NOTE (/5)' : 'RATING (/5)'}
                  </label>
                  <input type="number" min="1" max="5" step="0.1" className="input" style={{ width: '100%', marginTop: 4 }} value={form.note} onChange={e => handleFormChange('note', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                  {lang === 'fr' ? 'TYPE(S) DE SÉJOUR' : 'STAY TYPE(S)'}
                </label>
                <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
                  {TYPES.map(t => (
                    <label key={t} className={`check ${form.types_json.includes(t) ? 'checked' : ''}`} style={{ marginBottom: 0 }}>
                      <input type="checkbox" checked={form.types_json.includes(t)} onChange={() => handleTypeToggle(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                  {lang === 'fr' ? 'TAG (FR)' : 'TAG (FR)'}
                </label>
                <input className="input" style={{ width: '100%', marginTop: 4 }} value={form.tag_fr} onChange={e => handleFormChange('tag_fr', e.target.value)} placeholder="Nouveau, Tendance…" />
              </div>

              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                  {lang === 'fr' ? 'TAG (EN)' : 'TAG (EN)'}
                </label>
                <input className="input" style={{ width: '100%', marginTop: 4 }} value={form.tag_en} onChange={e => handleFormChange('tag_en', e.target.value)} placeholder="New, Trending…" />
              </div>

              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                  {lang === 'fr' ? 'DESCRIPTION (FR)' : 'DESCRIPTION (FR)'}
                </label>
                <textarea className="input" rows="2" style={{ width: '100%', marginTop: 4, resize: 'vertical' }} value={form.resume_fr} onChange={e => handleFormChange('resume_fr', e.target.value)} placeholder={lang === 'fr' ? 'Courte description…' : 'Short description…'} />
              </div>

              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                  {lang === 'fr' ? 'DESCRIPTION (EN)' : 'DESCRIPTION (EN)'}
                </label>
                <textarea className="input" rows="2" style={{ width: '100%', marginTop: 4, resize: 'vertical' }} value={form.resume_en} onChange={e => handleFormChange('resume_en', e.target.value)} placeholder="Short description…" />
              </div>

              <div>
                <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                  {lang === 'fr' ? "URL D'IMAGE (Unsplash…)" : 'IMAGE URL (Unsplash…)'}
                </label>
                <input type="url" className="input" style={{ width: '100%', marginTop: 4 }} value={form.image_url} onChange={e => handleFormChange('image_url', e.target.value)} placeholder="https://images.unsplash.com/photo-…" />
              </div>

              <div className="row gap-12" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary" disabled={formSubmitting}>
                  {formSubmitting ? (lang === 'fr' ? 'Création…' : 'Creating…') : (lang === 'fr' ? '+ Créer la destination' : '+ Create destination')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

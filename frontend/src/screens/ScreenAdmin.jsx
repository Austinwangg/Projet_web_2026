import { adminOffers } from '../data.js';

export default function ScreenAdmin({ T, lang }) {
  const offers = adminOffers;
  const kpiValues = ['247', '12 480', '186 240 €', '4.2 %'];
  const kpiDirs = ['up', 'up', 'up', 'down'];
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  const BarSpark = ({ vals, up }) => {
    const w = 96, h = 36, gap = 2;
    const max = Math.max(...vals);
    const bw = (w - gap * (vals.length - 1)) / vals.length;
    return (
      <svg width={w} height={h} style={{ display: 'block' }}>
        {vals.map((v, i) => {
          const bh = Math.max(2, (v / max) * h);
          return (
            <rect
              key={i}
              x={i * (bw + gap)}
              y={h - bh}
              width={bw}
              height={bh}
              rx="1"
              fill={i === vals.length - 1 ? (up ? 'var(--ok)' : 'var(--danger)') : 'color-mix(in oklab, var(--ink) 16%, transparent)'}
            />
          );
        })}
      </svg>
    );
  };

  const sparks = [
    [12,18,14,22,26,24,30,34,32,38,42,47],
    [44,46,45,48,50,52,53,55,56,58,60,62],
    [80,90,95,110,120,135,145,160,165,175,180,186],
    [4.6,4.5,4.4,4.5,4.4,4.3,4.3,4.4,4.3,4.2,4.2,4.2]
  ];

  const bookings = [128,142,156,168,182,201,224,243,261,247,238,247];
  const lastYear = [102,118,131,145,156,172,189,201,214,220,219,225];

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
      <div className="between mb-32" style={{ alignItems: 'flex-end' }}>
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

      <div className="card-tile" style={{ padding: 0 }}>
        <div className="between" style={{ padding: '24px 24px 16px' }}>
          <div>
            <span className="eyebrow">{lang === 'fr' ? 'OFFRES' : 'OFFERS'}</span>
            <h3 className="serif mt-4" style={{ fontSize: 22 }}>{T.admin.offersTitle}</h3>
          </div>
          <button className="btn btn-primary btn-sm">{T.admin.addOffer}</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>{T.admin.cols.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id}>
                <td><strong>{o.dest}</strong></td>
                <td><span className="tag">{o.type}</span></td>
                <td className="mono">{o.price} €</td>
                <td className="mono">{o.bookings}</td>
                <td>
                  <span className={`dot ${o.status === 'active' ? 'green' : o.status === 'paused' ? 'amber' : 'red'}`}></span>
                  {o.status === 'active' ? (lang === 'fr' ? 'Actif' : 'Active') : o.status === 'paused' ? (lang === 'fr' ? 'En pause' : 'Paused') : (lang === 'fr' ? 'Brouillon' : 'Draft')}
                </td>
                <td className="muted">…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

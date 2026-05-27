// ─────────────────────────────────────────────────────────────────────────────
// TEST_PERSONS — Page de sélection d'équipe (test uniquement)
//
// POUR SUPPRIMER :
//   1. Effacer ce fichier  (ScreenPersons.jsx)
//   2. Dans App.jsx    → retirer les blocs  /* TEST_PERSONS */ … /* END TEST_PERSONS */
//   3. Dans Header.jsx → retirer les blocs  {/* TEST_PERSONS */} … {/* END TEST_PERSONS */}
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

// ── Données de l'équipe ───────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Mikaël',
    surname: 'Malavaux',
    initials: 'MM',
    role: 'Admin & Authentification',
    github: 'Mikaelmalavaux',
    branch: 'feature/admin-mika',
    color: '#1f3a2e',
    accent: '#6dbf9e',
    features: ['Espace admin', 'Gestion des rôles', 'Authentification JWT', 'Dashboard KPI'],
    commits: 34,
    additions: 2840,
    deletions: 412,
    lastCommit: '0b7521f',
    lastMsg: 'suite code mika',
    status: 'active',
    contributions: [4, 6, 3, 8, 12, 9, 14, 11, 16, 18, 20, 34],
  },
  {
    id: 2,
    name: 'Alexis',
    surname: '',
    initials: 'AL',
    role: 'Itinéraires & Planning',
    github: 'Austinwangg',
    branch: 'feature/Itineraires-Alexis',
    color: '#2563eb',
    accent: '#93c5fd',
    features: ['Écran itinéraire', 'Composition jour/jour', 'Calcul de coûts', 'Export PDF'],
    commits: 18,
    additions: 1560,
    deletions: 230,
    lastCommit: '4b05a34',
    lastMsg: 'Partie 2 Alexis',
    status: 'active',
    contributions: [2, 3, 5, 4, 7, 6, 9, 8, 10, 12, 15, 18],
  },
  {
    id: 3,
    name: 'Austin',
    surname: 'Wong',
    initials: 'AW',
    role: 'Frontend & UI',
    github: 'Austinwangg',
    branch: 'main',
    color: '#7c3aed',
    accent: '#c4b5fd',
    features: ['Composants UI', 'Design system', 'Recherche & filtres', 'Responsive'],
    commits: 22,
    additions: 1980,
    deletions: 310,
    lastCommit: 'fa06c8a',
    lastMsg: 'Merge branch main into feature/admin-mika',
    status: 'review',
    contributions: [3, 5, 4, 7, 6, 9, 8, 11, 13, 15, 18, 22],
  },
];

// ── Historique d'activité simulée ─────────────────────────────────────────────

const ACTIVITY_LOG = [
  { who: 'MM', action: 'a mergé', detail: 'feature/admin-mika → main', when: '2026-05-27 · 09:14', type: 'merge' },
  { who: 'MM', action: 'a poussé', detail: 'suite code mika (0b7521f)', when: '2026-05-26 · 22:40', type: 'push' },
  { who: 'MM', action: 'a mergé', detail: 'main → feature/admin-mika (fa06c8a)', when: '2026-05-26 · 14:12', type: 'merge' },
  { who: 'MM', action: 'a créé', detail: 'ScreenAdmin.jsx + AuthController.php', when: '2026-05-25 · 18:03', type: 'create' },
  { who: 'AL', action: 'a mergé', detail: 'feature/Itineraires-Alexis → main', when: '2026-05-24 · 16:55', type: 'merge' },
  { who: 'AL', action: 'a poussé', detail: 'Partie 2 Alexis (4b05a34)', when: '2026-05-23 · 20:11', type: 'push' },
  { who: 'AW', action: 'a ouvert', detail: 'PR #1 · Itinéraires Alexis', when: '2026-05-22 · 11:30', type: 'pr' },
  { who: 'MM', action: 'a créé', detail: 'création compte et admin (5c95b5b)', when: '2026-05-21 · 17:44', type: 'create' },
];

// ── Sous-composant : mini sparkline SVG ──────────────────────────────────────

function Sparkline({ data, color }) {
  const W = 120, H = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 6) - 3;
    return `${x},${y}`;
  });
  const areaBottom = `${W},${H} 0,${H}`;
  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${H - ((data[0] - min) / range) * (H - 6) - 3} ${pts.join(' ')} ${areaBottom}`}
        fill={`url(#spark-grad-${color.replace('#', '')})`}
      />
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={(data.length - 1) / (data.length - 1) * W}
        cy={H - ((data[data.length - 1] - min) / range) * (H - 6) - 3}
        r="3.5"
        fill="var(--surface)"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

// ── Sous-composant : barre de progression ────────────────────────────────────

function ProgressBar({ value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .6s ease' }} />
    </div>
  );
}

// ── Sous-composant : badge de statut ─────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    active:  { label: 'Actif',     dot: 'var(--ok)',     bg: 'color-mix(in oklab, var(--ok) 12%, transparent)' },
    review:  { label: 'En review', dot: 'var(--gold)',   bg: 'color-mix(in oklab, var(--gold) 12%, transparent)' },
    offline: { label: 'Inactif',   dot: 'var(--ink-faint)', bg: 'var(--surface-2)' },
  };
  const s = map[status] || map.offline;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.08em', padding: '3px 10px', borderRadius: 20,
      background: s.bg, color: 'var(--ink-soft)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

// ── Sous-composant : carte membre ────────────────────────────────────────────

function MemberCard({ member, selected, onSelect }) {
  const totalCommits = TEAM_MEMBERS.reduce((s, m) => s + m.commits, 0);

  return (
    <button
      onClick={() => onSelect(member.id)}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        background: 'var(--surface)',
        border: selected
          ? `2px solid ${member.color}`
          : '2px solid var(--line)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: selected ? `0 0 0 4px ${member.color}22` : 'var(--shadow)',
        transition: 'border-color .2s, box-shadow .2s',
      }}
    >
      {/* Bandeau coloré */}
      <div style={{ height: 6, background: member.color, width: '100%' }} />

      <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* En-tête : avatar + nom + statut */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: member.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em',
              flexShrink: 0,
            }}>
              {member.initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.2 }}>
                {member.name} {member.surname}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 3 }}>
                {member.role}
              </div>
            </div>
          </div>
          <StatusBadge status={member.status} />
        </div>

        {/* Branche Git */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--ink-faint)' }}>⎇</span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            color: 'var(--ink-soft)', letterSpacing: '0.04em',
          }}>
            {member.branch}
          </span>
        </div>

        {/* Stats commits + lignes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'Commits', value: member.commits, mono: true },
            { label: 'Ajouts', value: `+${member.additions.toLocaleString('fr-FR')}`, color: 'var(--ok)' },
            { label: 'Suppr.', value: `-${member.deletions}`, color: 'var(--danger)' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: s.mono ? "'JetBrains Mono', monospace" : 'inherit',
                fontSize: 20, fontWeight: 600, lineHeight: 1,
                color: s.color || 'var(--ink)',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Part des commits */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
            <span style={{ color: 'var(--ink-soft)' }}>Part du projet</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
              {Math.round((member.commits / totalCommits) * 100)}%
            </span>
          </div>
          <ProgressBar value={member.commits} max={totalCommits} color={member.color} />
        </div>

        {/* Sparkline activité */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            ACTIVITÉ · 12 SEMAINES
          </div>
          <Sparkline data={member.contributions} color={member.color} />
        </div>

        {/* Dernier commit */}
        <div style={{
          padding: '10px 12px', background: 'var(--bg-deep)',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--line-soft)',
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', marginBottom: 4 }}>
            DERNIER COMMIT · {member.lastCommit}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{member.lastMsg}</div>
        </div>

        {/* Features */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            PÉRIMÈTRE
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {member.features.map((f, i) => (
              <span key={i} style={{
                fontSize: 12, padding: '3px 10px',
                background: `${member.color}18`,
                color: member.color,
                borderRadius: 20, fontWeight: 500,
                border: `1px solid ${member.color}30`,
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bouton de sélection */}
        <div style={{
          marginTop: 4, padding: '12px 0',
          borderTop: '1px solid var(--line-soft)',
          textAlign: 'center',
        }}>
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: selected ? member.color : 'var(--ink-soft)',
          }}>
            {selected ? '✓ Sélectionné' : 'Choisir ce membre →'}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Sous-composant : log d'activité ──────────────────────────────────────────

function ActivityFeed() {
  const memberByInitials = Object.fromEntries(TEAM_MEMBERS.map(m => [m.initials, m]));
  const typeIcon = { merge: '⟵', push: '↑', create: '✦', pr: '⊙' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {ACTIVITY_LOG.map((ev, i) => {
        const m = memberByInitials[ev.who];
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '14px 0',
            borderBottom: i < ACTIVITY_LOG.length - 1 ? '1px solid var(--line-soft)' : 'none',
          }}>
            {/* Avatar petit */}
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: m?.color || 'var(--surface-2)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, fontWeight: 700,
            }}>
              {ev.who}
            </div>

            {/* Icône type */}
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 4,
              background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, color: 'var(--ink-soft)',
            }}>
              {typeIcon[ev.type] || '·'}
            </div>

            {/* Texte */}
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong style={{ fontWeight: 600 }}>{m?.name || ev.who}</strong>{' '}
              <span style={{ color: 'var(--ink-soft)' }}>{ev.action}</span>{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ink)' }}>{ev.detail}</span>
            </div>

            {/* Horodatage */}
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: 'var(--ink-faint)',
              whiteSpace: 'nowrap', paddingTop: 3,
            }}>
              {ev.when}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sous-composant : donut répartition commits ────────────────────────────────

function CommitDonut() {
  const total = TEAM_MEMBERS.reduce((s, m) => s + m.commits, 0);
  let acc = 0;
  const R = 52, r = 32, cx = 64, cy = 64;
  const arcs = TEAM_MEMBERS.map((m) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += m.commits;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (a, rr) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    const [x0, y0] = p(a0, R), [x1, y1] = p(a1, R);
    const [x2, y2] = p(a1, r), [x3, y3] = p(a0, r);
    return {
      d: `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r} ${r} 0 ${large} 0 ${x3} ${y3} Z`,
      color: m.color,
      pct: Math.round((m.commits / total) * 100),
      name: m.name,
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width="128" height="128" viewBox="0 0 128 128" style={{ flexShrink: 0 }}>
        {arcs.map((a, i) => (
          <path key={i} d={a.d} fill={a.color} />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="18" fontFamily="'JetBrains Mono', monospace" fill="var(--ink)" fontWeight="600">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fontFamily="'JetBrains Mono', monospace" fill="var(--ink-faint)" letterSpacing="0.1em">COMMITS</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: a.color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{a.name}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ink-soft)' }}>{a.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function ScreenPersons({ navigate }) {
  const [selected, setSelected] = useState(null);

  const handleConfirm = () => {
    if (selected !== null) navigate('home');
  };

  const selectedMember = TEAM_MEMBERS.find(m => m.id === selected);
  const totalAdditions = TEAM_MEMBERS.reduce((s, m) => s + m.additions, 0);
  const totalDeletions = TEAM_MEMBERS.reduce((s, m) => s + m.deletions, 0);
  const totalCommits = TEAM_MEMBERS.reduce((s, m) => s + m.commits, 0);

  return (
    <main>
      {/* ── En-tête de section ───────────────────────────────────────────── */}
      <section className="container" style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
          <div>
            <span className="eyebrow">TEST · SÉLECTION D'ÉQUIPE</span>
            <h1 className="serif mt-8" style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.05 }}>
              Qui navigue <em>aujourd'hui ?</em>
            </h1>
            <p className="muted mt-12" style={{ fontSize: 15, maxWidth: 520 }}>
              Sélectionnez un membre de l'équipe pour simuler sa vue. Cette page est réservée aux tests de démo.
            </p>
          </div>

          {/* Bouton confirmer */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button
              className={`btn btn-ink${selected ? '' : ''}`}
              style={{
                opacity: selected ? 1 : 0.4,
                pointerEvents: selected ? 'auto' : 'none',
                padding: '14px 32px', fontSize: 15,
              }}
              onClick={handleConfirm}
            >
              Continuer en tant que {selectedMember?.name ?? '…'} →
            </button>
            {!selected && (
              <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Choisissez un membre ci-dessous</span>
            )}
          </div>
        </div>

        {/* ── KPIs globaux du projet ──────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { label: 'Membres', value: TEAM_MEMBERS.length, mono: true },
            { label: 'Commits total', value: totalCommits, mono: true },
            { label: 'Lignes ajoutées', value: `+${totalAdditions.toLocaleString('fr-FR')}`, color: 'var(--ok)' },
            { label: 'Lignes supprimées', value: `-${totalDeletions.toLocaleString('fr-FR')}`, color: 'var(--danger)' },
          ].map((k, i) => (
            <div key={i} className="kpi">
              <div className="l">{k.label}</div>
              <div className="v mt-8" style={{ color: k.color || 'var(--ink)', fontFamily: k.mono ? "'JetBrains Mono', monospace" : 'inherit' }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Grille des membres ──────────────────────────────────────────────── */}
      <section className="container" style={{ paddingBottom: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
          {TEAM_MEMBERS.map(m => (
            <MemberCard
              key={m.id}
              member={m}
              selected={selected === m.id}
              onSelect={setSelected}
            />
          ))}
        </div>
      </section>

      {/* ── Ligne inférieure : activité + donut ─────────────────────────────── */}
      <section className="container" style={{ paddingBottom: 80 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

          {/* Fil d'activité */}
          <div className="card-tile" style={{ padding: 28 }}>
            <span className="eyebrow">ACTIVITÉ GIT · RÉCENTE</span>
            <h3 className="serif mt-4 mb-24" style={{ fontSize: 22 }}>Historique de l'équipe</h3>
            <ActivityFeed />
          </div>

          {/* Donut + stats globales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card-tile" style={{ padding: 28 }}>
              <span className="eyebrow">RÉPARTITION</span>
              <h3 className="serif mt-4 mb-20" style={{ fontSize: 22 }}>Commits par membre</h3>
              <CommitDonut />
            </div>

            {/* Carte branche courante */}
            <div className="card-tile" style={{ padding: 24 }}>
              <span className="eyebrow">BRANCHE ACTIVE</span>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {TEAM_MEMBERS.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: m.status === 'active' ? 'var(--ok)' : m.status === 'review' ? 'var(--gold)' : 'var(--ink-faint)',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, flex: 1, color: 'var(--ink-soft)' }}>
                      {m.branch}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 500 }}>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note de suppression */}
            <div style={{
              padding: '16px 20px',
              background: 'var(--surface-2)',
              border: '1px dashed var(--line)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.6,
            }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em', marginBottom: 6 }}>
                POUR SUPPRIMER CE MODULE
              </div>
              Effacer <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>ScreenPersons.jsx</code>
              {' '}+ retirer les blocs <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>TEST_PERSONS</code> dans{' '}
              <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>App.jsx</code> et{' '}
              <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>Header.jsx</code>.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

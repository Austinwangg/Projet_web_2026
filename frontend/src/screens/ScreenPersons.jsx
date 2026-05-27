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
    skills: { frontend: 80, backend: 95, design: 55, devops: 70, testing: 60 },
    timezone: 'UTC+1 · Paris',
    languages: ['PHP', 'JavaScript', 'SQL', 'React'],
    linesPerDay: [120, 80, 200, 160, 300, 240, 180, 220, 190, 280, 310, 260, 400, 380],
    openIssues: 2,
    closedIssues: 11,
    reviewsDone: 5,
    filesOwned: ['AuthController.php', 'ScreenAdmin.jsx', 'adminService.js', 'admin.php'],
  },
  {
    id: 2,
    name: 'Alexis',
    surname: '',
    initials: 'AL',
    role: 'Itinéraires & Planning',
    github: 'AlexisWang',
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
    skills: { frontend: 75, backend: 60, design: 65, devops: 40, testing: 50 },
    timezone: 'UTC+1 · Paris',
    languages: ['JavaScript', 'React', 'CSS'],
    linesPerDay: [60, 90, 140, 80, 110, 200, 150, 130, 170, 190, 210, 180, 220, 200],
    openIssues: 1,
    closedIssues: 6,
    reviewsDone: 2,
    filesOwned: ['ScreenItinerary.jsx', 'ItineraireController.php', 'itineraires.php'],
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
    skills: { frontend: 90, backend: 45, design: 85, devops: 35, testing: 55 },
    timezone: 'UTC+1 · Paris',
    languages: ['JavaScript', 'React', 'CSS', 'HTML'],
    linesPerDay: [80, 100, 120, 90, 160, 140, 180, 200, 170, 220, 240, 210, 260, 280],
    openIssues: 0,
    closedIssues: 8,
    reviewsDone: 7,
    filesOwned: ['Header.jsx', 'Footer.jsx', 'SearchBar.jsx', 'voyagevista.css', 'ScreenHome.jsx'],
  },
];

// ── Historique d'activité Git simulée ─────────────────────────────────────────

const ACTIVITY_LOG = [
  { who: 'MM', action: 'a mergé', detail: 'feature/admin-mika → main', when: '2026-05-27 · 09:14', type: 'merge' },
  { who: 'MM', action: 'a poussé', detail: 'suite code mika (0b7521f)', when: '2026-05-26 · 22:40', type: 'push' },
  { who: 'MM', action: 'a mergé', detail: 'main → feature/admin-mika (fa06c8a)', when: '2026-05-26 · 14:12', type: 'merge' },
  { who: 'MM', action: 'a créé', detail: 'ScreenAdmin.jsx + AuthController.php', when: '2026-05-25 · 18:03', type: 'create' },
  { who: 'AL', action: 'a mergé', detail: 'feature/Itineraires-Alexis → main', when: '2026-05-24 · 16:55', type: 'merge' },
  { who: 'AL', action: 'a poussé', detail: 'Partie 2 Alexis (4b05a34)', when: '2026-05-23 · 20:11', type: 'push' },
  { who: 'AW', action: 'a ouvert', detail: 'PR #1 · Itinéraires Alexis', when: '2026-05-22 · 11:30', type: 'pr' },
  { who: 'MM', action: 'a créé', detail: 'création compte et admin (5c95b5b)', when: '2026-05-21 · 17:44', type: 'create' },
  { who: 'AW', action: 'a poussé', detail: 'design system tokens', when: '2026-05-20 · 15:20', type: 'push' },
  { who: 'AL', action: 'a créé', detail: 'ScreenItinerary.jsx v1', when: '2026-05-19 · 12:00', type: 'create' },
  { who: 'MM', action: 'a fermé', detail: 'issue #4 · bug login redirect', when: '2026-05-18 · 09:30', type: 'close' },
  { who: 'AW', action: 'a commenté', detail: 'PR #1 · review composants', when: '2026-05-17 · 17:00', type: 'comment' },
];

// ── Pull Requests simulées ─────────────────────────────────────────────────────

const PULL_REQUESTS = [
  {
    id: 1,
    title: 'Itinéraires — Partie 1 & 2',
    author: 'AL',
    base: 'main',
    head: 'feature/Itineraires-Alexis',
    status: 'merged',
    additions: 1560,
    deletions: 230,
    files: 8,
    reviewers: ['MM', 'AW'],
    date: '2026-05-24',
    comments: 3,
  },
  {
    id: 2,
    title: 'Admin dashboard + gestion des rôles',
    author: 'MM',
    base: 'main',
    head: 'feature/admin-mika',
    status: 'open',
    additions: 2840,
    deletions: 412,
    files: 14,
    reviewers: ['AW'],
    date: '2026-05-27',
    comments: 1,
  },
  {
    id: 3,
    title: 'Fix: barre de recherche mobile',
    author: 'AW',
    base: 'main',
    head: 'fix/searchbar-mobile',
    status: 'merged',
    additions: 42,
    deletions: 18,
    files: 2,
    reviewers: ['MM'],
    date: '2026-05-20',
    comments: 0,
  },
  {
    id: 4,
    title: 'Refactor: CSS variables + dark mode',
    author: 'AW',
    base: 'main',
    head: 'refactor/dark-mode',
    status: 'closed',
    additions: 310,
    deletions: 280,
    files: 5,
    reviewers: ['MM', 'AL'],
    date: '2026-05-18',
    comments: 7,
  },
];

// ── Issues simulées ────────────────────────────────────────────────────────────

const ISSUES = [
  { id: 1,  title: 'Login redirect cassé après 401',              label: 'bug',         who: 'MM', status: 'closed', priority: 'high'   },
  { id: 2,  title: 'Ajouter pagination sur ScreenResults',        label: 'feature',     who: 'AW', status: 'open',   priority: 'medium' },
  { id: 3,  title: 'Calcul du total panier incorrect',            label: 'bug',         who: 'AL', status: 'closed', priority: 'high'   },
  { id: 4,  title: 'Export itinéraire en PDF',                    label: 'feature',     who: 'AL', status: 'open',   priority: 'low'    },
  { id: 5,  title: 'Optimiser les requêtes SQL destinations',     label: 'perf',        who: 'MM', status: 'closed', priority: 'medium' },
  { id: 6,  title: 'Accessibilité : contraste boutons',          label: 'a11y',        who: 'AW', status: 'closed', priority: 'low'    },
  { id: 7,  title: 'Toast notification disparaît trop vite',      label: 'bug',         who: 'AW', status: 'closed', priority: 'low'    },
  { id: 8,  title: 'Validation formulaire paiement',             label: 'feature',     who: 'MM', status: 'closed', priority: 'high'   },
  { id: 9,  title: 'Mode hors-ligne : graceful fallback',        label: 'enhancement', who: 'AW', status: 'open',   priority: 'low'    },
  { id: 10, title: 'Tests e2e — parcours réservation',           label: 'test',        who: 'MM', status: 'open',   priority: 'medium' },
];

// ── Données heatmap (52 semaines, valeurs 0–4) ────────────────────────────────

const HEATMAP_WEEKS = Array.from({ length: 52 }, (_, wi) =>
  Array.from({ length: 7 }, (_, di) => {
    const seed = (wi * 7 + di + 1) * 31337;
    return ((seed ^ (seed >> 5)) & 0xff) % 5;
  })
);

// ── Tâches sprint simulées ─────────────────────────────────────────────────────

const SPRINT_TASKS = {
  todo: [
    { id: 't1', title: 'Pagination résultats', who: 'AW', pts: 3 },
    { id: 't2', title: 'Export PDF itinéraire', who: 'AL', pts: 5 },
    { id: 't3', title: 'Tests e2e checkout', who: 'MM', pts: 8 },
  ],
  inprogress: [
    { id: 't4', title: 'Admin dashboard KPI', who: 'MM', pts: 5 },
    { id: 't5', title: 'Responsive mobile SearchBar', who: 'AW', pts: 2 },
  ],
  review: [
    { id: 't6', title: 'Gestion des rôles admin', who: 'MM', pts: 5 },
  ],
  done: [
    { id: 't7', title: 'Auth JWT + refresh token', who: 'MM', pts: 8 },
    { id: 't8', title: 'Écran itinéraire v2', who: 'AL', pts: 5 },
    { id: 't9', title: 'Dark mode CSS variables', who: 'AW', pts: 3 },
    { id: 't10', title: 'Barre de recherche', who: 'AW', pts: 3 },
    { id: 't11', title: 'Panier & checkout', who: 'MM', pts: 5 },
  ],
};

// ── Entrées de changelog simulées ─────────────────────────────────────────────

const CHANGELOG = [
  { version: 'v0.6.0', date: '2026-05-27', notes: ['Admin dashboard complet', 'Gestion utilisateurs + rôles', 'Merge feature/admin-mika'] },
  { version: 'v0.5.0', date: '2026-05-24', notes: ['Écran itinéraire jour/jour', 'Calcul de coûts live', 'Merge feature/Itineraires-Alexis'] },
  { version: 'v0.4.0', date: '2026-05-20', notes: ['Dark mode complet', 'CSS variables refactorisées', 'Fix responsive SearchBar'] },
  { version: 'v0.3.0', date: '2026-05-15', notes: ['Auth JWT', 'Création de compte', 'Page compte utilisateur'] },
  { version: 'v0.2.0', date: '2026-05-10', notes: ['Panier & paiement simulé', 'Toast notifications', 'Stars component'] },
  { version: 'v0.1.0', date: '2026-05-01', notes: ['Scaffold initial React + Vite', 'Design system VoyageVista', 'ScreenHome & ScreenResults'] },
];

// ── Annotations de code simulées ──────────────────────────────────────────────

const CODE_SNIPPETS = [
  {
    author: 'MM',
    file: 'AuthController.php',
    lang: 'php',
    lines: [
      'public function login(array $data): array {',
      '    $user = $this->model->findByEmail($data["email"]);',
      '    if (!$user || !password_verify($data["password"], $user["password"])) {',
      '        http_response_code(401);',
      '        return ["error" => "Identifiants invalides"];',
      '    }',
      '    $token = $this->generateJWT($user);',
      '    return ["token" => $token, "user" => $user];',
      '}',
    ],
  },
  {
    author: 'AL',
    file: 'ScreenItinerary.jsx',
    lang: 'jsx',
    lines: [
      'const total = days.reduce((sum, day) => {',
      '  return sum + day.items.reduce((s, item) => s + item.price, 0);',
      '}, 0);',
      '',
      'const formattedTotal = total.toLocaleString("fr-FR", {',
      '  style: "currency", currency: "EUR"',
      '});',
    ],
  },
  {
    author: 'AW',
    file: 'voyagevista.css',
    lang: 'css',
    lines: [
      ':root {',
      '  --bg: #f6f1e7;',
      '  --primary: #1f3a2e;',
      '  --accent: #c0623a;',
      '  --radius: 14px;',
      '}',
      '[data-theme="dark"] {',
      '  --bg: #0e1110;',
      '  --primary: #6dbf9e;',
      '}',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

// ── Sparkline SVG ─────────────────────────────────────────────────────────────

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
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle
        cx={W}
        cy={H - ((data[data.length - 1] - min) / range) * (H - 6) - 3}
        r="3.5"
        fill="var(--surface)"
        stroke={color}
        strokeWidth="2"
      />
    </svg>
  );
}

// ── Barre de progression ──────────────────────────────────────────────────────

function ProgressBar({ value, max, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden', flex: 1 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width .6s ease' }} />
    </div>
  );
}

// ── Badge de statut ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    active:  { label: 'Actif',     dot: 'var(--ok)',       bg: 'color-mix(in oklab, var(--ok) 12%, transparent)' },
    review:  { label: 'En review', dot: 'var(--gold)',     bg: 'color-mix(in oklab, var(--gold) 12%, transparent)' },
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

// ── Badge label issue ─────────────────────────────────────────────────────────

function LabelBadge({ label }) {
  const map = {
    bug:         { bg: '#fde8e8', color: '#a8442e' },
    feature:     { bg: '#e8f0fe', color: '#2563eb' },
    perf:        { bg: '#fef3c7', color: '#b48a3a' },
    a11y:        { bg: '#ede9fe', color: '#7c3aed' },
    enhancement: { bg: '#d1fae5', color: '#2d6a4a' },
    test:        { bg: '#f0fdf4', color: '#16a34a' },
  };
  const s = map[label] || { bg: 'var(--surface-2)', color: 'var(--ink-soft)' };
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 20,
      background: s.bg, color: s.color, fontWeight: 600,
    }}>
      {label}
    </span>
  );
}

// ── Radar / Spider chart SVG ──────────────────────────────────────────────────

function RadarChart({ skills, color }) {
  const keys = Object.keys(skills);
  const vals = Object.values(skills);
  const n = keys.length;
  const cx = 80, cy = 80, R = 60;
  const angle = (i) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const px = (i, r) => cx + Math.cos(angle(i)) * r;
  const py = (i, r) => cy + Math.sin(angle(i)) * r;

  const rings = [20, 40, 60];
  const dataPoints = vals.map((v, i) => `${px(i, (v / 100) * R)},${py(i, (v / 100) * R)}`).join(' ');

  return (
    <svg width="160" height="160" viewBox="0 0 160 160" style={{ overflow: 'visible' }}>
      {/* Rings */}
      {rings.map((r, ri) => (
        <polygon
          key={ri}
          points={keys.map((_, i) => `${px(i, r)},${py(i, r)}`).join(' ')}
          fill="none"
          stroke="var(--line-soft)"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      {keys.map((_, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={px(i, R)} y2={py(i, R)}
          stroke="var(--line-soft)"
          strokeWidth="1"
        />
      ))}
      {/* Data */}
      <polygon
        points={dataPoints}
        fill={`${color}30`}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Labels */}
      {keys.map((k, i) => {
        const lx = px(i, R + 14);
        const ly = py(i, R + 14);
        return (
          <text
            key={i}
            x={lx} y={ly + 4}
            textAnchor="middle"
            fontSize="9"
            fontFamily="'JetBrains Mono', monospace"
            fill="var(--ink-faint)"
            letterSpacing="0.05em"
          >
            {k.toUpperCase()}
          </text>
        );
      })}
      {/* Dots */}
      {vals.map((v, i) => (
        <circle
          key={i}
          cx={px(i, (v / 100) * R)}
          cy={py(i, (v / 100) * R)}
          r="3"
          fill={color}
        />
      ))}
    </svg>
  );
}

// ── Heatmap de contributions ──────────────────────────────────────────────────

function ContribHeatmap({ color }) {
  const levels = ['var(--surface-2)', `${color}30`, `${color}55`, `${color}88`, color];
  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 'max-content' }}>
        {HEATMAP_WEEKS.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((val, di) => (
              <div
                key={di}
                title={`Semaine ${wi + 1}, jour ${di + 1} : ${val} contributions`}
                style={{
                  width: 10, height: 10, borderRadius: 2,
                  background: levels[val],
                  transition: 'background .2s',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Carte Pull Request ────────────────────────────────────────────────────────

function PullRequestCard({ pr }) {
  const memberByInitials = Object.fromEntries(TEAM_MEMBERS.map(m => [m.initials, m]));
  const author = memberByInitials[pr.author];
  const statusMap = {
    merged: { label: 'Mergé',  color: '#7c3aed', bg: '#ede9fe' },
    open:   { label: 'Ouvert', color: '#2d6a4a', bg: '#d1fae5' },
    closed: { label: 'Fermé',  color: '#6b7280', bg: 'var(--surface-2)' },
  };
  const s = statusMap[pr.status];
  return (
    <div style={{
      padding: '16px 20px',
      border: '1px solid var(--line-soft)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      {/* Numéro */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
        color: 'var(--ink-faint)', width: 32, flexShrink: 0, textAlign: 'right',
      }}>
        #{pr.id}
      </div>

      {/* Titre + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {pr.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-faint)' }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: author?.color || 'var(--surface-2)',
            color: '#fff', display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0,
          }}>
            {pr.author}
          </span>
          <span>{author?.name || pr.author}</span>
          <span>·</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{pr.head}</span>
          <span>→</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{pr.base}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, fontSize: 12, flexShrink: 0 }}>
        <span style={{ color: 'var(--ok)', fontFamily: "'JetBrains Mono', monospace" }}>+{pr.additions}</span>
        <span style={{ color: 'var(--danger)', fontFamily: "'JetBrains Mono', monospace" }}>-{pr.deletions}</span>
        <span style={{ color: 'var(--ink-faint)' }}>{pr.files} fichiers</span>
        {pr.comments > 0 && <span style={{ color: 'var(--ink-faint)' }}>💬 {pr.comments}</span>}
      </div>

      {/* Status badge */}
      <span style={{
        fontSize: 11, padding: '3px 10px', borderRadius: 20,
        background: s.bg, color: s.color,
        fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
        flexShrink: 0,
      }}>
        {s.label}
      </span>
    </div>
  );
}

// ── Carte de tâche sprint ─────────────────────────────────────────────────────

function SprintTaskCard({ task }) {
  const memberByInitials = Object.fromEntries(TEAM_MEMBERS.map(m => [m.initials, m]));
  const m = memberByInitials[task.who];
  return (
    <div style={{
      padding: '12px 14px',
      background: 'var(--surface)',
      border: '1px solid var(--line-soft)',
      borderRadius: 'var(--radius-sm)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{task.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: m?.color || 'var(--surface-2)',
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 9, fontWeight: 700,
          }}>
            {task.who}
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>{m?.name || task.who}</span>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          padding: '2px 8px', background: 'var(--surface-2)',
          borderRadius: 20, color: 'var(--ink-soft)',
        }}>
          {task.pts} pts
        </span>
      </div>
    </div>
  );
}

// ── Bloc de code simulé ───────────────────────────────────────────────────────

function FakeCodeBlock({ snippet }) {
  const memberByInitials = Object.fromEntries(TEAM_MEMBERS.map(m => [m.initials, m]));
  const author = memberByInitials[snippet.author];
  return (
    <div style={{
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--line-soft)',
    }}>
      {/* Header barre */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px',
        background: 'var(--surface-2)',
        borderBottom: '1px solid var(--line-soft)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: author?.color || 'var(--ink-faint)',
            color: '#fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 9, fontWeight: 700,
          }}>
            {snippet.author}
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ink-soft)' }}>
            {snippet.file}
          </span>
        </div>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          color: 'var(--ink-faint)', letterSpacing: '0.08em',
        }}>
          {snippet.lang.toUpperCase()}
        </span>
      </div>
      {/* Lignes de code */}
      <div style={{ background: 'var(--bg-deep)', padding: '12px 0' }}>
        {snippet.lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', gap: 0 }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              color: 'var(--ink-faint)', padding: '1px 16px 1px 12px',
              textAlign: 'right', width: 40, flexShrink: 0, userSelect: 'none',
            }}>
              {i + 1}
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              color: 'var(--ink-soft)', padding: '1px 0',
              whiteSpace: 'pre',
            }}>
              {line || ' '}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Timeline changelog ────────────────────────────────────────────────────────

function ChangelogTimeline() {
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      {/* Ligne verticale */}
      <div style={{
        position: 'absolute', left: 7, top: 8, bottom: 8,
        width: 2, background: 'var(--line-soft)',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {CHANGELOG.map((entry, i) => (
          <div key={i} style={{ position: 'relative' }}>
            {/* Pastille */}
            <div style={{
              position: 'absolute', left: -21, top: 4,
              width: 12, height: 12, borderRadius: '50%',
              background: i === 0 ? 'var(--primary)' : 'var(--line)',
              border: '2px solid var(--surface)',
            }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                fontWeight: 700, color: i === 0 ? 'var(--primary)' : 'var(--ink)',
              }}>
                {entry.version}
              </span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-faint)' }}>
                {entry.date}
              </span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {entry.notes.map((note, ni) => (
                <li key={ni} style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--ink-faint)', flexShrink: 0 }}>·</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tableau issues ────────────────────────────────────────────────────────────

function IssueTable() {
  const memberByInitials = Object.fromEntries(TEAM_MEMBERS.map(m => [m.initials, m]));
  const priorityColor = { high: 'var(--danger)', medium: 'var(--gold)', low: 'var(--ink-faint)' };
  return (
    <table className="tbl" style={{ width: '100%' }}>
      <thead>
        <tr>
          {['#', 'Titre', 'Label', 'Priorité', 'Assigné', 'Statut'].map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ISSUES.map(issue => {
          const m = memberByInitials[issue.who];
          return (
            <tr key={issue.id}>
              <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ink-faint)' }}>
                #{issue.id}
              </td>
              <td style={{ fontSize: 13, fontWeight: 500 }}>{issue.title}</td>
              <td><LabelBadge label={issue.label} /></td>
              <td>
                <span style={{ fontSize: 12, color: priorityColor[issue.priority], fontWeight: 600 }}>
                  {issue.priority === 'high' ? '▲' : issue.priority === 'medium' ? '▶' : '▼'} {issue.priority}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: m?.color || 'var(--surface-2)',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 9, fontWeight: 700,
                  }}>
                    {issue.who}
                  </div>
                  <span style={{ fontSize: 12 }}>{m?.name || issue.who}</span>
                </div>
              </td>
              <td>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 20,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: issue.status === 'closed' ? 'color-mix(in oklab, var(--ok) 12%, transparent)' : 'color-mix(in oklab, var(--gold) 12%, transparent)',
                  color: issue.status === 'closed' ? 'var(--ok)' : 'var(--gold)',
                }}>
                  {issue.status}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ── Carte membre principale ───────────────────────────────────────────────────

function MemberCard({ member, selected, onSelect }) {
  const totalCommits = TEAM_MEMBERS.reduce((s, m) => s + m.commits, 0);
  return (
    <button
      onClick={() => onSelect(member.id)}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        border: selected ? `2px solid ${member.color}` : '2px solid var(--line)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        boxShadow: selected ? `0 0 0 4px ${member.color}22` : 'var(--shadow)',
        transition: 'border-color .2s, box-shadow .2s',
      }}
    >
      <div style={{ height: 6, background: member.color, width: '100%' }} />
      <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Avatar + nom + statut */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: member.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, flexShrink: 0,
            }}>
              {member.initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.2 }}>{member.name} {member.surname}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 3 }}>{member.role}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{member.timezone}</div>
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
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.04em' }}>
            {member.branch}
          </span>
        </div>

        {/* Stats commits */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { label: 'Commits', value: member.commits, mono: true },
            { label: 'Ajouts',  value: `+${member.additions.toLocaleString('fr-FR')}`, color: 'var(--ok)' },
            { label: 'Suppr.',  value: `-${member.deletions}`, color: 'var(--danger)' },
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

        {/* Issues + reviews */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Issues ouvertes', value: member.openIssues,   color: 'var(--gold)'   },
            { label: 'Issues fermées',  value: member.closedIssues, color: 'var(--ok)'     },
            { label: 'Reviews faites',  value: member.reviewsDone,  color: 'var(--ink-soft)' },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '10px 8px',
              background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-faint)', marginTop: 3, lineHeight: 1.3 }}>{s.label}</div>
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

        {/* Sparkline */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            ACTIVITÉ · 12 SEMAINES
          </div>
          <Sparkline data={member.contributions} color={member.color} />
        </div>

        {/* Langages */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            LANGAGES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {member.languages.map((l, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '2px 8px',
                background: 'var(--surface-2)',
                color: 'var(--ink-soft)',
                borderRadius: 20, fontFamily: "'JetBrains Mono', monospace",
              }}>
                {l}
              </span>
            ))}
          </div>
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
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
            PÉRIMÈTRE
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {member.features.map((f, i) => (
              <span key={i} style={{
                fontSize: 12, padding: '3px 10px',
                background: `${member.color}18`, color: member.color,
                borderRadius: 20, fontWeight: 500,
                border: `1px solid ${member.color}30`,
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bouton sélection */}
        <div style={{ marginTop: 4, padding: '12px 0', borderTop: '1px solid var(--line-soft)', textAlign: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: selected ? member.color : 'var(--ink-soft)' }}>
            {selected ? '✓ Sélectionné' : 'Choisir ce membre →'}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Log d'activité ────────────────────────────────────────────────────────────

function ActivityFeed() {
  const memberByInitials = Object.fromEntries(TEAM_MEMBERS.map(m => [m.initials, m]));
  const typeIcon = { merge: '⟵', push: '↑', create: '✦', pr: '⊙', close: '✓', comment: '💬' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {ACTIVITY_LOG.map((ev, i) => {
        const m = memberByInitials[ev.who];
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '12px 0',
            borderBottom: i < ACTIVITY_LOG.length - 1 ? '1px solid var(--line-soft)' : 'none',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: m?.color || 'var(--surface-2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700,
            }}>
              {ev.who}
            </div>
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 4,
              background: 'var(--surface-2)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 11, color: 'var(--ink-soft)',
            }}>
              {typeIcon[ev.type] || '·'}
            </div>
            <div style={{ flex: 1, fontSize: 13 }}>
              <strong>{m?.name || ev.who}</strong>{' '}
              <span style={{ color: 'var(--ink-soft)' }}>{ev.action}</span>{' '}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{ev.detail}</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--ink-faint)', whiteSpace: 'nowrap', paddingTop: 3 }}>
              {ev.when}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Donut commits ─────────────────────────────────────────────────────────────

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
      color: m.color, pct: Math.round((m.commits / total) * 100), name: m.name,
    };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <svg width="128" height="128" viewBox="0 0 128 128" style={{ flexShrink: 0 }}>
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
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

// ── Board sprint Kanban ───────────────────────────────────────────────────────

function SprintBoard() {
  const cols = [
    { key: 'todo',       label: 'À faire',    color: 'var(--ink-faint)' },
    { key: 'inprogress', label: 'En cours',   color: 'var(--gold)'      },
    { key: 'review',     label: 'En review',  color: '#7c3aed'          },
    { key: 'done',       label: 'Terminé',    color: 'var(--ok)'        },
  ];
  const totalPts = Object.values(SPRINT_TASKS).flat().reduce((s, t) => s + t.pts, 0);
  const donePts  = SPRINT_TASKS.done.reduce((s, t) => s + t.pts, 0);
  return (
    <div>
      {/* Progression sprint */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
          <span style={{ color: 'var(--ink-soft)' }}>Sprint 3 · Avancement</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
            {donePts} / {totalPts} pts
          </span>
        </div>
        <ProgressBar value={donePts} max={totalPts} color="var(--ok)" />
      </div>

      {/* Colonnes kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {cols.map(col => (
          <div key={col.key}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              paddingBottom: 8, borderBottom: `2px solid ${col.color}`,
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: col.color }}>{col.label}</span>
              <span style={{
                fontSize: 11, padding: '1px 7px', borderRadius: 20,
                background: 'var(--surface-2)', color: 'var(--ink-faint)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {SPRINT_TASKS[col.key].length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SPRINT_TASKS[col.key].map(task => (
                <SprintTaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function ScreenPersons({ navigate }) {
  const [selected,   setSelected]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('team');
  const [expandedMember, setExpanded] = useState(null);

  const handleConfirm = () => { if (selected !== null) navigate('home'); };

  const selectedMember  = TEAM_MEMBERS.find(m => m.id === selected);
  const totalAdditions  = TEAM_MEMBERS.reduce((s, m) => s + m.additions, 0);
  const totalDeletions  = TEAM_MEMBERS.reduce((s, m) => s + m.deletions, 0);
  const totalCommits    = TEAM_MEMBERS.reduce((s, m) => s + m.commits, 0);
  const totalFiles      = TEAM_MEMBERS.reduce((s, m) => s + m.filesOwned.length, 0);

  const tabs = [
    { id: 'team',       label: 'Équipe'       },
    { id: 'sprint',     label: 'Sprint'       },
    { id: 'prs',        label: 'Pull Requests' },
    { id: 'issues',     label: 'Issues'       },
    { id: 'skills',     label: 'Compétences'  },
    { id: 'code',       label: 'Extraits'     },
    { id: 'changelog',  label: 'Changelog'    },
  ];

  return (
    <main>

      {/* ── En-tête ───────────────────────────────────────────────────────── */}
      <section className="container" style={{ paddingTop: 56, paddingBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <span className="eyebrow">TEST · SÉLECTION D'ÉQUIPE</span>
            <h1 className="serif mt-8" style={{ fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1.05 }}>
              Qui navigue <em>aujourd'hui ?</em>
            </h1>
            <p className="muted mt-12" style={{ fontSize: 15, maxWidth: 520 }}>
              Sélectionnez un membre de l'équipe pour simuler sa vue. Page réservée aux tests de démo — branche {' '}
              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>feature/admin-mika</code>.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button
              className="btn btn-ink"
              style={{ opacity: selected ? 1 : 0.4, pointerEvents: selected ? 'auto' : 'none', padding: '14px 32px', fontSize: 15 }}
              onClick={handleConfirm}
            >
              Continuer en tant que {selectedMember?.name ?? '…'} →
            </button>
            {!selected && <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Choisissez un membre ci-dessous</span>}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 32 }}>
          {[
            { label: 'Membres',    value: TEAM_MEMBERS.length,                              mono: true },
            { label: 'Commits',    value: totalCommits,                                     mono: true },
            { label: 'Fichiers',   value: totalFiles,                                       mono: true },
            { label: 'Ajouts',     value: `+${totalAdditions.toLocaleString('fr-FR')}`,     color: 'var(--ok)'     },
            { label: 'Suppressions', value: `-${totalDeletions.toLocaleString('fr-FR')}`,   color: 'var(--danger)' },
            { label: 'Issues',     value: ISSUES.length,                                    mono: true },
          ].map((k, i) => (
            <div key={i} className="kpi">
              <div className="l">{k.label}</div>
              <div className="v mt-8" style={{ color: k.color || 'var(--ink)', fontFamily: k.mono ? "'JetBrains Mono', monospace" : 'inherit', fontSize: 22 }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="tabs mb-0" style={{ marginBottom: 32 }}>
          {tabs.map(t => (
            <div key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Onglet ÉQUIPE ─────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <>
          <section className="container" style={{ paddingBottom: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
              {TEAM_MEMBERS.map(m => (
                <MemberCard key={m.id} member={m} selected={selected === m.id} onSelect={setSelected} />
              ))}
            </div>
          </section>

          <section className="container" style={{ paddingBottom: 80 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              <div className="card-tile" style={{ padding: 28 }}>
                <span className="eyebrow">ACTIVITÉ GIT · RÉCENTE</span>
                <h3 className="serif mt-4 mb-24" style={{ fontSize: 22 }}>Historique de l'équipe</h3>
                <ActivityFeed />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div className="card-tile" style={{ padding: 28 }}>
                  <span className="eyebrow">RÉPARTITION</span>
                  <h3 className="serif mt-4 mb-20" style={{ fontSize: 22 }}>Commits par membre</h3>
                  <CommitDonut />
                </div>
                <div className="card-tile" style={{ padding: 24 }}>
                  <span className="eyebrow">BRANCHES ACTIVES</span>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {TEAM_MEMBERS.map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                          background: m.status === 'active' ? 'var(--ok)' : m.status === 'review' ? 'var(--gold)' : 'var(--ink-faint)',
                        }} />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, flex: 1, color: 'var(--ink-soft)' }}>
                          {m.branch}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 500 }}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{
                  padding: '16px 20px', background: 'var(--surface-2)',
                  border: '1px dashed var(--line)', borderRadius: 'var(--radius-sm)',
                  fontSize: 12, color: 'var(--ink-faint)', lineHeight: 1.6,
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.1em', marginBottom: 6 }}>
                    POUR SUPPRIMER CE MODULE
                  </div>
                  Effacer <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>ScreenPersons.jsx</code>
                  {' '}+ blocs <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>TEST_PERSONS</code> dans{' '}
                  <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>App.jsx</code> et{' '}
                  <code style={{ background: 'var(--line)', padding: '1px 5px', borderRadius: 3 }}>Header.jsx</code>.
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Onglet SPRINT ─────────────────────────────────────────────────── */}
      {activeTab === 'sprint' && (
        <section className="container" style={{ paddingBottom: 80 }}>
          <div className="card-tile" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
              <div>
                <span className="eyebrow">SPRINT 3 · 19 MAI – 30 MAI 2026</span>
                <h3 className="serif mt-4" style={{ fontSize: 28 }}>Tableau Kanban</h3>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                <span style={{ color: 'var(--ink-faint)' }}>Vélocité estimée :</span>
                <strong>36 pts</strong>
              </div>
            </div>
            <SprintBoard />
          </div>
        </section>
      )}

      {/* ── Onglet PULL REQUESTS ──────────────────────────────────────────── */}
      {activeTab === 'prs' && (
        <section className="container" style={{ paddingBottom: 80 }}>
          <div className="card-tile" style={{ padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <div>
                <span className="eyebrow">PULL REQUESTS</span>
                <h3 className="serif mt-4" style={{ fontSize: 28 }}>Historique des PRs</h3>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <span style={{ color: 'var(--ok)' }}>
                  ● {PULL_REQUESTS.filter(p => p.status === 'merged').length} mergées
                </span>
                <span style={{ color: 'var(--gold)' }}>
                  ● {PULL_REQUESTS.filter(p => p.status === 'open').length} ouvertes
                </span>
                <span style={{ color: 'var(--ink-faint)' }}>
                  ● {PULL_REQUESTS.filter(p => p.status === 'closed').length} fermées
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PULL_REQUESTS.map(pr => <PullRequestCard key={pr.id} pr={pr} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Onglet ISSUES ─────────────────────────────────────────────────── */}
      {activeTab === 'issues' && (
        <section className="container" style={{ paddingBottom: 80 }}>
          <div className="card-tile" style={{ padding: 0 }}>
            <div style={{ padding: '28px 28px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span className="eyebrow">ISSUES</span>
                <h3 className="serif mt-4" style={{ fontSize: 28 }}>Suivi des bugs & features</h3>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                <span style={{ color: 'var(--ok)' }}>✓ {ISSUES.filter(i => i.status === 'closed').length} fermées</span>
                <span style={{ color: 'var(--gold)' }}>○ {ISSUES.filter(i => i.status === 'open').length} ouvertes</span>
              </div>
            </div>
            <IssueTable />
          </div>
        </section>
      )}

      {/* ── Onglet COMPÉTENCES ────────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <section className="container" style={{ paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {TEAM_MEMBERS.map(m => (
              <div key={m.id} className="card-tile" style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', margin: '0 auto 10px',
                    background: m.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700,
                  }}>
                    {m.initials}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{m.name} {m.surname}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 3 }}>{m.role}</div>
                </div>
                <RadarChart skills={m.skills} color={m.color} />
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(m.skills).map(([key, val]) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: 'var(--ink-soft)', textTransform: 'capitalize' }}>{key}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{val}%</span>
                      </div>
                      <ProgressBar value={val} max={100} color={m.color} />
                    </div>
                  ))}
                </div>
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em' }}>
                    HEATMAP CONTRIBUTIONS
                  </div>
                  <ContribHeatmap color={m.color} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Onglet EXTRAITS DE CODE ───────────────────────────────────────── */}
      {activeTab === 'code' && (
        <section className="container" style={{ paddingBottom: 80 }}>
          <div style={{ marginBottom: 24 }}>
            <span className="eyebrow">EXTRAITS DE CODE</span>
            <h3 className="serif mt-4" style={{ fontSize: 28 }}>Contributions représentatives</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {CODE_SNIPPETS.map((snippet, i) => (
              <FakeCodeBlock key={i} snippet={snippet} />
            ))}
          </div>
          {/* Fichiers par membre */}
          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {TEAM_MEMBERS.map(m => (
              <div key={m.id} className="card-tile" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: m.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {m.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{m.filesOwned.length} fichiers</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {m.filesOwned.map((f, fi) => (
                    <div key={fi} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)',
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>📄</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ink-soft)' }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Onglet CHANGELOG ──────────────────────────────────────────────── */}
      {activeTab === 'changelog' && (
        <section className="container" style={{ paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
            <div className="card-tile" style={{ padding: 32 }}>
              <span className="eyebrow">CHANGELOG</span>
              <h3 className="serif mt-4 mb-32" style={{ fontSize: 28 }}>Historique des versions</h3>
              <ChangelogTimeline />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card-tile" style={{ padding: 24 }}>
                <span className="eyebrow">VERSION ACTUELLE</span>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: 'var(--primary)' }}>
                    v0.6.0
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 6 }}>Publiée le 27 mai 2026</div>
                </div>
              </div>
              <div className="card-tile" style={{ padding: 24 }}>
                <span className="eyebrow">PROCHAINE RELEASE</span>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, color: 'var(--ink-soft)' }}>v0.7.0</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-faint)', marginTop: 6 }}>Objectif : 10 juin 2026</div>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {['Pagination résultats', 'Export itinéraire PDF', 'Tests e2e checkout', 'Notifications temps réel'].map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--ink-soft)' }}>
                        <span style={{ color: 'var(--ink-faint)' }}>○</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-tile" style={{ padding: 24 }}>
                <span className="eyebrow">STACK TECHNIQUE</span>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { cat: 'Frontend',  stack: 'React 18 · Vite · CSS custom' },
                    { cat: 'Backend',   stack: 'PHP 8.2 · MVC · PDO'         },
                    { cat: 'Base',      stack: 'MySQL · MAMP'                 },
                    { cat: 'Auth',      stack: 'JWT · bcrypt'                 },
                    { cat: 'Versioning', stack: 'Git · GitHub'               },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                      <span style={{ color: 'var(--ink-faint)', width: 70, flexShrink: 0 }}>{s.cat}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--ink-soft)' }}>{s.stack}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}

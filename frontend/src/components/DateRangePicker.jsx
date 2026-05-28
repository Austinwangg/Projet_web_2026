import { useState, useEffect, useRef } from 'react';

function toLocalISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function Calendar({ monthDate, start, end, hover, onPick, onHover, T }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const y = monthDate.getFullYear(), m = monthDate.getMonth();
  const firstDay = new Date(y, m, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const isSame = (a, b) => a && b && a.toDateString() === b.toDateString();
  const inRange = (d) => {
    if (!start) return false;
    const end2 = end || hover;
    if (!end2) return false;
    return d > start && d < end2;
  };

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));

  return (
    <div>
      <div className="cal-month-h">
        <div className="name">{T.search.months[m]} {y}</div>
      </div>
      <div className="cal-grid">
        {T.search.weekdays.map((d, i) => <div key={i} className="cal-dayname">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i}></div>;
          const past = d < today;
          const isStart = isSame(d, start);
          const isEnd = isSame(d, end);
          const inR = inRange(d);
          return (
            <button key={i}
              className={`cal-day ${isStart ? 'start' : ''} ${isEnd ? 'end' : ''} ${inR ? 'in' : ''} ${past ? 'past' : ''}`}
              disabled={past}
              onMouseEnter={() => onHover(d)}
              onClick={(e) => { e.stopPropagation(); onPick(d); }}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * DateRangePicker — même DA que le calendrier de l'accueil.
 * Props :
 *   depart: string ISO (YYYY-MM-DD)
 *   retour: string ISO
 *   onChangeDates: ({ depart, retour }) => void
 *   T: traductions
 *   lang: 'fr'|'en'
 *   label: string (optionnel, ex: "Dates du trajet")
 */
export default function DateRangePicker({ depart, retour, onChangeDates, T, lang, label }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(null);
  const [popoverStyle, setPopoverStyle] = useState({});
  const ref = useRef(null);
  const btnRef = useRef(null);

  const start = parseISO(depart);
  const end   = parseISO(retour);

  const initialView = start || new Date();
  const [view, setView] = useState(new Date(initialView.getFullYear(), initialView.getMonth(), 1));

  // Calcule si le popover doit s'ouvrir vers le haut ou le bas
  const updatePopoverPosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const popoverH = 380; // hauteur approximative du calendrier double
    if (spaceBelow < popoverH && rect.top > popoverH) {
      // Ouvrir vers le haut
      setPopoverStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
        zIndex: 9999,
      });
    } else {
      // Ouvrir vers le bas (par défaut)
      setPopoverStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left,
        zIndex: 9999,
      });
    }
  };

  useEffect(() => {
    if (!open) return;
    updatePopoverPosition();
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('resize', updatePopoverPosition);
    window.addEventListener('scroll', updatePopoverPosition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('resize', updatePopoverPosition);
      window.removeEventListener('scroll', updatePopoverPosition, true);
    };
  }, [open]);

  const pick = (d) => {
    if (!start || (start && end)) {
      onChangeDates({ depart: toLocalISO(d), retour: '' });
      setHover(null);
    } else if (d <= start) {
      onChangeDates({ depart: toLocalISO(d), retour: '' });
    } else {
      onChangeDates({ depart: toLocalISO(start), retour: toLocalISO(d) });
      setTimeout(() => setOpen(false), 200);
    }
  };

  const prev = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const next = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));
  const nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);

  const fmt = (d) => {
    if (!d) return '—';
    const m = T.search.monthsShort;
    return `${d.getDate()} ${m[d.getMonth()]}`;
  };

  const datesLabel = (() => {
    if (!start) return lang === 'fr' ? 'Choisir les dates' : 'Select dates';
    const m = T.search.monthsShort;
    if (!end) return `${start.getDate()} ${m[start.getMonth()]} → …`;
    if (start.getMonth() === end.getMonth())
      return `${start.getDate()} → ${end.getDate()} ${m[start.getMonth()]}`;
    return `${start.getDate()} ${m[start.getMonth()]} → ${end.getDate()} ${m[end.getMonth()]}`;
  })();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label className="mono" style={{ fontSize: 10, color: 'var(--ink-faint)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
          {label.toUpperCase()}
        </label>
      )}
      <button
        ref={btnRef}
        type="button"
        className="input"
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          background: open ? 'var(--surface-2)' : undefined,
          borderColor: open ? 'var(--ink)' : undefined,
        }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{ fontSize: 15 }}>📅</span>
        <span style={{ fontSize: 14, color: start ? 'var(--ink)' : 'var(--ink-faint)' }}>{datesLabel}</span>
      </button>

      {open && (
        <div
          className="popover"
          style={{ minWidth: 560, ...popoverStyle }}
          onClick={e => e.stopPropagation()}
        >
          <div className="between mb-16">
            <button className="cal-nav" onClick={prev}>‹</button>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.12em' }}>
              {fmt(start)} → {fmt(end)}
            </span>
            <button className="cal-nav" onClick={next}>›</button>
          </div>
          <div className="cal-months">
            <Calendar monthDate={view} start={start} end={end} hover={hover} onPick={pick} onHover={setHover} T={T} />
            <Calendar monthDate={nextMonth} start={start} end={end} hover={hover} onPick={pick} onHover={setHover} T={T} />
          </div>
          <div className="cal-foot">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { onChangeDates({ depart: '', retour: '' }); setHover(null); }}
            >
              ↺ {T.results?.reset || (lang === 'fr' ? 'Réinitialiser' : 'Reset')}
            </button>
            <button className="btn btn-ink btn-sm" onClick={() => setOpen(false)}>
              {T.search?.apply || (lang === 'fr' ? 'Appliquer' : 'Apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo, useRef } from 'react';

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

function DatePickerPopover({ value, onChange, T, onClose }) {
  const [hover, setHover] = useState(null);
  const initialView = value.start || new Date(2026, 5, 1);
  const [view, setView] = useState(new Date(initialView.getFullYear(), initialView.getMonth(), 1));

  const pick = (d) => {
    if (!value.start || (value.start && value.end)) {
      onChange({ start: d, end: null });
      setHover(null);
    } else if (d <= value.start) {
      onChange({ start: d, end: null });
    } else {
      onChange({ start: value.start, end: d });
      setTimeout(onClose, 200);
    }
  };

  const prev = () => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
  const next = () => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));
  const nextMonth = new Date(view.getFullYear(), view.getMonth() + 1, 1);
  const fmt = (d) => d ? `${d.getDate()} ${T.search.monthsShort[d.getMonth()]}` : '—';

  return (
    <div className="popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 640 }}>
      <div className="between mb-16">
        <button className="cal-nav" onClick={prev}>‹</button>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: '0.12em' }}>
          {fmt(value.start)} → {fmt(value.end)}
        </span>
        <button className="cal-nav" onClick={next}>›</button>
      </div>
      <div className="cal-months">
        <Calendar monthDate={view} start={value.start} end={value.end} hover={hover} onPick={pick} onHover={setHover} T={T} />
        <Calendar monthDate={nextMonth} start={value.start} end={value.end} hover={hover} onPick={pick} onHover={setHover} T={T} />
      </div>
      <div className="cal-foot">
        <button className="btn btn-ghost btn-sm" onClick={() => { onChange({ start: null, end: null }); setHover(null); }}>
          ↺ {T.results.reset}
        </button>
        <button className="btn btn-ink btn-sm" onClick={onClose}>{T.search.apply}</button>
      </div>
    </div>
  );
}

function TravelersPopover({ value, onChange, T, onClose }) {
  const types = [
    { key: 'adult', ...T.search.travTypes.adult },
    { key: 'student', ...T.search.travTypes.student },
    { key: 'child', ...T.search.travTypes.child }
  ];
  const total = value.adult + value.student + value.child;
  const update = (k, delta) => {
    const next = { ...value, [k]: Math.max(0, value[k] + delta) };
    const nextTotal = next.adult + next.student + next.child;
    if (nextTotal < 1 || nextTotal > 9) return;
    onChange(next);
  };

  return (
    <div className="popover popover-right" onClick={(e) => e.stopPropagation()} style={{ minWidth: 340 }}>
      {types.map(t => (
        <div key={t.key} className="trav-row">
          <div>
            <div className="label">{t.label}</div>
            <div className="sub">{t.sub}</div>
          </div>
          <div className="trav-stepper">
            <button className="trav-btn" disabled={value[t.key] <= 0 || total <= 1} onClick={() => update(t.key, -1)}>−</button>
            <span className="trav-count">{value[t.key]}</span>
            <button className="trav-btn" disabled={total >= 9} onClick={() => update(t.key, 1)}>+</button>
          </div>
        </div>
      ))}
      <div className="cal-foot">
        <span className="range">{T.search.travelersVal(value).toUpperCase()}</span>
        <button className="btn btn-ink btn-sm" onClick={onClose}>{T.search.apply}</button>
      </div>
    </div>
  );
}

export default function SearchBar({ T, lang, value, setValue, onSearch, compact = false }) {
  const [openPop, setOpenPop] = useState(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!openPop) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenPop(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openPop]);

  const datesLabel = useMemo(() => {
    if (!value.dates || !value.dates.start) return T.search.datesPh;
    const m = T.search.monthsShort;
    const s = value.dates.start, e = value.dates.end;
    if (!e) return `${s.getDate()} ${m[s.getMonth()]} → …`;
    if (s.getMonth() === e.getMonth()) return `${s.getDate()} → ${e.getDate()} ${m[s.getMonth()]}`;
    return `${s.getDate()} ${m[s.getMonth()]} → ${e.getDate()} ${m[e.getMonth()]}`;
  }, [value.dates, lang]);

  const gridCols = '2fr 1.4fr 1.3fr 1fr auto';

  return (
    <div className="searchbar" ref={wrapRef} style={compact ? { boxShadow: 'none', borderRadius: 12, gridTemplateColumns: gridCols } : { gridTemplateColumns: gridCols }}>
      <div className="field">
        <span className="field-label">{T.search.destination}</span>
        <input
          className="field-input"
          placeholder={T.search.destinationPh}
          value={value.where}
          onChange={(e) => setValue({ ...value, where: e.target.value })}
        />
      </div>

      <div className="field pop-wrap" onClick={() => setOpenPop(openPop === 'dates' ? null : 'dates')}>
        <span className="field-label">{T.search.dates}</span>
        <span className="field-input" style={{ display: 'block', color: value.dates?.start ? 'var(--ink)' : 'var(--ink-faint)' }}>
          {datesLabel}
        </span>
        {openPop === 'dates' && (
          <DatePickerPopover
            value={value.dates || { start: null, end: null }}
            onChange={(d) => setValue({ ...value, dates: d })}
            T={T}
            onClose={() => setOpenPop(null)}
          />
        )}
      </div>

      <div className="field pop-wrap" onClick={() => setOpenPop(openPop === 'travelers' ? null : 'travelers')}>
        <span className="field-label">{T.search.travelers}</span>
        <span className="field-input" style={{ display: 'block', color: 'var(--ink)' }}>
          {T.search.travelersVal(value.travelers)}
        </span>
        {openPop === 'travelers' && (
          <TravelersPopover
            value={value.travelers}
            onChange={(t) => setValue({ ...value, travelers: t })}
            T={T}
            onClose={() => setOpenPop(null)}
          />
        )}
      </div>

      <div className="field">
        <span className="field-label">{T.search.type}</span>
        <select
          className="field-input"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}
          value={value.type}
          onChange={(e) => setValue({ ...value, type: e.target.value })}>
          {T.home.categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <button className="btn btn-primary" onClick={onSearch}>
        <span>✦</span> {T.search.go}
      </button>
    </div>
  );
}

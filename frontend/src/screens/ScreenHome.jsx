import { useState } from 'react';
import { destinations } from '../data.js';
import Placeholder from '../components/Placeholder.jsx';
import Stars from '../components/Stars.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function ScreenHome({ T, lang, search, setSearch, navigate, cardStyle }) {
  const D = destinations;
  const [activeCat, setActiveCat] = useState('all');
  const filtered = activeCat === 'all' ? D.slice(0, 8) : D.filter(d => d.types.includes(activeCat)).slice(0, 8);
  const shanghaiDest = D.find(d => d.id === 'shanghai');

  return (
    <main>
      {/* HERO */}
      <section className="container" style={{ paddingTop: 24 }}>
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-content">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)' }}>{T.hero.eyebrow}</span>
              <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>
                N°026 / VOL.II
              </span>
            </div>
            <h1 className="hero-title">
              {T.hero.titleA} <em>{T.hero.titleB}</em><br />{T.hero.titleC}
            </h1>
            <p className="hero-sub">{T.hero.sub}</p>
            <div style={{ paddingBottom: 24 }}>
              <SearchBar T={T} lang={lang} value={search} setValue={setSearch} onSearch={() => navigate('results')} />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES & GRID */}
      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">{lang === 'fr' ? 'CATALOGUE · 2026' : 'CATALOG · 2026'}</span>
            <h2 className="section-title mt-8">
              {T.home.catTitle} <em>{T.home.catSub}</em>
            </h2>
          </div>
          <a className="muted" style={{ fontSize: 13, cursor: 'pointer' }} onClick={() => navigate('results')}>{T.home.viewAll}</a>
        </div>

        <div className="row" style={{ flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
          {T.home.categories.map(c => (
            <button
              key={c.id}
              className={`pill ${activeCat === c.id ? 'active' : ''}`}
              onClick={() => setActiveCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        <div className={`grid grid-4 ${cardStyle === 'illustrated' ? 'card-illustrated' : ''}`}>
          {filtered.map((d, i) => (
            <button key={d.id} className="dest fade-up" style={{ animationDelay: `${i * 40}ms` }} onClick={() => navigate('detail', { id: d.id })}>
              <Placeholder label={d.ph} ratio="4/5" cat={d.type} className="dest-img" imageUrl={d.imageUrl} />
              <div className="dest-meta">
                <div>
                  <div className="dest-name">{d.city}</div>
                  <div className="dest-country">{lang === 'fr' ? d.country : d.countryEn}</div>
                </div>
                {d.tag && <span className="tag">{lang === 'fr' ? d.tag : d.tagEn}</span>}
              </div>
              <div className="dest-price">
                <span className="muted">{T.detail.from} </span>
                <strong>{d.priceFrom} €</strong>
                <span className="muted"> {T.detail.perPerson}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 64, alignItems: 'flex-start' }}>
          <div style={{ position: 'sticky', top: 96 }}>
            <span className="eyebrow">{lang === 'fr' ? 'MÉTHODE' : 'METHOD'}</span>
            <h2 className="section-title mt-8">
              {T.home.howTitle} <em>{T.home.howTitleEm}</em>
            </h2>
            <p className="muted mt-16" style={{ fontSize: 15 }}>{T.home.howSub}</p>
          </div>
          <div className="col gap-24">
            {T.home.steps.map((s, i) => (
              <div key={i} className="card-tile" style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 24, padding: 32 }}>
                <div className="serif" style={{ fontSize: 52, lineHeight: 1, color: 'var(--primary)' }}>{s.n}</div>
                <div>
                  <h3 className="serif" style={{ fontSize: 28, marginBottom: 8 }}>{s.t}</h3>
                  <p className="muted">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED: SHANGHAI */}
      <section className="section container">
        <div className="card" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: 480, padding: 0, overflow: 'hidden' }}>
          <Placeholder label="SHANGHAI · BUND" ratio="auto" cat="ville" style={{ minHeight: 480, height: '100%', borderRadius: 0 }} imageUrl={shanghaiDest?.imageUrl} />
          <div style={{ padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 32 }}>
            <div>
              <span className="eyebrow">{T.home.featuredEyebrow}</span>
              <h3 className="serif mt-16" style={{ fontSize: 48, lineHeight: 1.0 }}>{T.home.featuredTitle}</h3>
              <p className="muted mt-16">{T.home.featuredSub}</p>
            </div>
            <div className="col gap-12">
              <div className="between">
                <Stars value={4.8} />
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-faint)', letterSpacing: '0.1em' }}>
                  612 {lang === 'fr' ? 'AVIS' : 'REVIEWS'}
                </span>
              </div>
              <div className="between">
                <div className="serif" style={{ fontSize: 36 }}>
                  1 408 €<span className="muted" style={{ fontSize: 14, marginLeft: 8 }}>{T.detail.perPerson}</span>
                </div>
                <button className="btn btn-ink" onClick={() => navigate('detail', { id: 'shanghai' })}>
                  {T.home.featuredCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

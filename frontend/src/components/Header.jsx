import Logo from './Logo.jsx';
import Notifications from './Notifications.jsx';

export default function Header({ T, lang, setLang, theme, setTheme, screen, navigate, user, onSignIn, onSignOut, cartCount }) {
  const links = [
    { id: 'destinations', label: T.nav.destinations },
    { id: 'stays', label: T.nav.stays },
    { id: 'activities', label: T.nav.activities },
    { id: 'transport', label: T.nav.transport }
  ];
  return (
    <header className="vv-header">
      <div className="container vv-header-inner">
        <button onClick={() => navigate('home')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
          <Logo />
        </button>
        <nav className="vv-nav">
          {links.map(l => (
            <a key={l.id}
               className={screen === l.id || (l.id === 'destinations' && screen === 'results') ? 'active' : ''}
               onClick={() => navigate('results')}
               style={{ cursor: 'pointer' }}>
              {l.label}
            </a>
          ))}
          {user?.role === 'admin' && (
            <a onClick={() => navigate('admin')} style={{ cursor: 'pointer' }} className={screen === 'admin' ? 'active' : ''}>Admin</a>
          )}
        </nav>
        <div className="vv-header-actions">
          <div className="lang-switch">
            <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
            <span style={{ color: 'var(--ink-faint)' }}>·</span>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="theme"
            title="Theme">
            {theme === 'dark' ? '◐' : '◑'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('cart')} style={{ position: 'relative' }}>
            ⊕ {cartCount > 0 ? `(${cartCount})` : ''}
          </button>
          <Notifications user={user} />
          {user ? (
            <button onClick={() => navigate('account')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
              <div className="avatar">{user.initials}</div>
            </button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => onSignIn('signin')}>{T.cta.signin}</button>
              <button className="btn btn-ink btn-sm" onClick={() => onSignIn('signup')}>{T.cta.signup}</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

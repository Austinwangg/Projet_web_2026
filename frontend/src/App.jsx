import { useState, useEffect } from 'react';
import { VV_I18N } from './i18n.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import Toast from './components/Toast.jsx';
import ScreenHome from './screens/ScreenHome.jsx';
import ScreenResults from './screens/ScreenResults.jsx';
import ScreenDetail from './screens/ScreenDetail.jsx';
import ScreenItinerary from './screens/ScreenItinerary.jsx';
import ScreenCart from './screens/ScreenCart.jsx';
import ScreenPayment from './screens/ScreenPayment.jsx';
import ScreenAccount from './screens/ScreenAccount.jsx';
import ScreenAdmin from './screens/ScreenAdmin.jsx';
import ScreenTransport from './screens/ScreenTransport.jsx';
import ScreenHebergement from './screens/ScreenHebergement.jsx';

export default function App() {
  const [lang, setLang] = useState('fr');
  const [screen, setScreen] = useState('home');
  const [detailId, setDetailId] = useState('shanghai');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState({
    where: '',
    dates: { start: new Date(2026, 5, 15), end: new Date(2026, 5, 22) },
    travelers: { adult: 2, student: 0, child: 0 },
    type: 'all'
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vv_user')) || null; } catch { return null; }
  });
  const [authMode, setAuthMode] = useState(null);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState('light');
  const [cardStyle] = useState('clean');

  const T = VV_I18N[lang];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const navigate = (s, args = {}) => {
    if (s === 'detail' && args.id) setDetailId(args.id);
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const addToCart = (items) => {
    setCart(prev => {
      const ids = new Set(prev.map(p => p.id));
      const next = [...prev];
      items.forEach(it => { if (!ids.has(it.id)) next.push(it); });
      return next;
    });
    setToast(lang === 'fr' ? 'Ajouté à votre panier' : 'Added to cart');
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const onAuth = (userData) => {
    if (!userData || typeof userData !== 'object') return;
    // Reconstruit un nom affichable depuis prenom + nom ou nom seul
    const prenom = userData.prenom || '';
    const nomFam = userData.nom   || '';
    const displayName = [prenom, nomFam].filter(Boolean).join(' ') || userData.name || '';
    const parts    = displayName.trim().split(' ');
    const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    // On conserve TOUS les champs renvoyés par l'API (id, email, role, nom, prenom…)
    const enriched = {
      ...userData,
      name:     displayName,
      initials: initials.toUpperCase(),
    };
    setUser(enriched);
    localStorage.setItem('vv_user', JSON.stringify(enriched));
    setAuthMode(null);
    setToast(lang === 'fr' ? `Bienvenue, ${parts[0] || displayName}` : `Welcome, ${parts[0] || displayName}`);
  };

  const onUpdateUser = (userData) => {
    const nom = userData.nom || '';
    const parts = nom.trim().split(' ');
    const initials = (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    const enriched = { ...user, ...userData, name: nom, initials: initials.toUpperCase() };
    setUser(enriched);
    localStorage.setItem('vv_user', JSON.stringify(enriched));
  };

  const onSignOut = () => {
    setUser(null);
    localStorage.removeItem('vv_user');
    navigate('home');
  };

  return (
    <>
      <Header
        T={T} lang={lang} setLang={setLang}
        theme={theme} setTheme={setTheme}
        screen={screen} navigate={navigate}
        user={user} onSignIn={(m) => setAuthMode(m)} onSignOut={onSignOut}
        cartCount={cart.length}
      />

      {screen === 'home' && (
        <ScreenHome T={T} lang={lang} search={search} setSearch={setSearch} navigate={navigate} cardStyle={cardStyle} />
      )}
      {screen === 'results' && (
        <ScreenResults T={T} lang={lang} search={search} setSearch={setSearch} navigate={navigate} cardStyle={cardStyle} />
      )}
      {screen === 'detail' && (
        <ScreenDetail T={T} lang={lang} navigate={navigate} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} destId={detailId} cardStyle={cardStyle} searchDates={search.dates} searchTravelers={search.travelers} />
      )}
      {screen === 'itinerary' && (
        <ScreenItinerary T={T} lang={lang} navigate={navigate} cart={cart} user={user} onToast={setToast} />
      )}
      {screen === 'cart' && (
        <ScreenCart T={T} lang={lang} cart={cart} removeFromCart={removeFromCart} navigate={navigate} />
      )}
      {screen === 'payment' && (
        <ScreenPayment T={T} lang={lang} cart={cart} navigate={navigate} onPaid={() => setCart([])} user={user} search={search} detailId={detailId} />
      )}
      {screen === 'account' && (
        <ScreenAccount T={T} lang={lang} navigate={navigate} user={user} onSignOut={onSignOut} onUpdateUser={onUpdateUser} />
      )}
      {screen === 'transport' && (
        <ScreenTransport T={T} lang={lang} navigate={navigate} user={user} addToCart={addToCart} searchDates={search.dates} searchTravelers={search.travelers} />
      )}
      {screen === 'hebergement' && (
        <ScreenHebergement T={T} lang={lang} navigate={navigate} user={user} onSignIn={(m) => setAuthMode(m)} />
      )}
      {screen === 'admin' && user?.role === 'admin' && (
        <ScreenAdmin T={T} lang={lang} navigate={navigate} user={user} />
      )}
{screen === 'admin' && user?.role !== 'admin' && (
        <main className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
          <p className="serif" style={{ fontSize: 32 }}>Accès refusé</p>
          <p className="muted mt-8">Cette section est réservée aux administrateurs.</p>
          <button className="btn btn-primary mt-24" onClick={() => navigate('home')}>Retour à l'accueil</button>
        </main>
      )}

      <Footer T={T} />

      <AuthModal mode={authMode} T={T} onClose={() => setAuthMode(null)} onAuth={onAuth} />
      <Toast message={toast} onClose={() => setToast('')} />
    </>
  );
}

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
import ScreenActivites from './screens/ScreenActivites.jsx';
import ScreenPassengers from './screens/ScreenPassengers.jsx';
import { getFavoris, toggleFavori } from './services/favorisService.js';

export default function App() {
  const [lang, setLang] = useState('fr');
  const [screen, setScreen] = useState('home');
  const [detailId, setDetailId] = useState('shanghai');
  const [cart, setCart] = useState([]);
  const [itineraryMode, setItineraryMode] = useState(false);
  const [search, setSearch] = useState({
    where: '',
    dates: { start: new Date(2026, 5, 15), end: new Date(2026, 5, 22) },
    travelers: { adult: 2, student: 0, child: 0 },
    type: 'all'
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vv_user')) || null; } catch { return null; }
  });
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('vv_favorites')) || [];
      // Purge old slug-based favorites (strings) — keep only numeric IDs
      const clean = raw.filter(v => typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v)));
      if (clean.length !== raw.length) localStorage.setItem('vv_favorites', JSON.stringify(clean));
      return clean.map(Number);
    } catch { return []; }
  });
  const [authMode, setAuthMode] = useState(null);
  const [toast, setToast] = useState('');
  const [theme, setTheme] = useState('light');
  const [cardStyle] = useState('clean');

  // ── État de l'itinéraire — persisté pendant toute la session ──────────────
  const [itinItems, setItinItems] = useState([]);
  const [itinNbVoyageurs, setItinNbVoyageurs] = useState(1);
  const [itinDates, setItinDates] = useState({ depart: '', retour: '' });
  const [passengers, setPassengers] = useState([]);

  const T = VV_I18N[lang];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Sync favorites from DB when user logs in
  useEffect(() => {
    if (!user?.id) return;
    getFavoris(user.id)
      .then(res => {
        if (Array.isArray(res.data)) {
          setFavorites(res.data);
          localStorage.setItem('vv_favorites', JSON.stringify(res.data));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const navigate = (s, args = {}) => {
    if (s === 'detail' && args.id) setDetailId(args.id);
    if (args.fromItinerary) setItineraryMode(true);
    if (s === 'itinerary') setItineraryMode(false);
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const addToItinerary = (item) => {
    setItinItems(prev => [...prev, item]);
    navigate('itinerary');
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

  const toggleFavorite = (destId) => {
    setFavorites(prev => {
      const next = prev.includes(destId) ? prev.filter(id => id !== destId) : [...prev, destId];
      localStorage.setItem('vv_favorites', JSON.stringify(next));
      return next;
    });
    if (user?.id) {
      toggleFavori(user.id, destId).catch(() => {});
    }
  };

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
        <ScreenResults T={T} lang={lang} search={search} setSearch={setSearch} navigate={navigate} cardStyle={cardStyle} itineraryMode={itineraryMode} addToItinerary={addToItinerary} favorites={favorites} toggleFavorite={toggleFavorite} />
      )}
      {screen === 'detail' && (
        <ScreenDetail T={T} lang={lang} navigate={navigate} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} destId={detailId} cardStyle={cardStyle} searchDates={search.dates} searchTravelers={search.travelers} favorites={favorites} toggleFavorite={toggleFavorite} />
      )}
      {screen === 'itinerary' && (
        <ScreenItinerary
          T={T} lang={lang} navigate={navigate}
          user={user} onToast={setToast}
          itinItems={itinItems} setItinItems={setItinItems}
          itinNbVoyageurs={itinNbVoyageurs} setItinNbVoyageurs={setItinNbVoyageurs}
          itinDates={itinDates} setItinDates={setItinDates}
        />
      )}
      {screen === 'cart' && (
        <ScreenCart T={T} lang={lang} cart={cart} removeFromCart={removeFromCart} navigate={navigate} />
      )}
      {screen === 'passengers' && (
        <ScreenPassengers T={T} lang={lang} cart={cart} itinItems={itinItems} itinNbVoyageurs={itinNbVoyageurs} navigate={navigate} onPassengersSaved={setPassengers} />
      )}
      {screen === 'payment' && (
        <ScreenPayment T={T} lang={lang} cart={cart} navigate={navigate} onPaid={() => { setCart([]); setItinItems([]); setPassengers([]); }} user={user} search={search} detailId={detailId} itinItems={itinItems} itinNbVoyageurs={itinNbVoyageurs} itinDates={itinDates} passengers={passengers} />
      )}
      {screen === 'account' && (
        <ScreenAccount T={T} lang={lang} navigate={navigate} user={user} onSignOut={onSignOut} onUpdateUser={onUpdateUser} favorites={favorites} toggleFavorite={toggleFavorite} />
      )}
      {screen === 'transport' && (
        <ScreenTransport T={T} lang={lang} navigate={navigate} user={user} addToCart={addToCart} searchDates={search.dates} searchTravelers={search.travelers} itineraryMode={itineraryMode} addToItinerary={addToItinerary} itineraryTravelers={itinNbVoyageurs} itineraryDates={itinDates} />
      )}
      {screen === 'hebergement' && (
        <ScreenHebergement T={T} lang={lang} navigate={navigate} user={user} onSignIn={(m) => setAuthMode(m)} addToCart={addToCart} itineraryMode={itineraryMode} addToItinerary={addToItinerary} itineraryTravelers={itinNbVoyageurs} itineraryDates={itinDates} />
      )}
      {screen === 'activites' && (
        <ScreenActivites T={T} lang={lang} navigate={navigate} user={user} addToCart={addToCart} itineraryMode={itineraryMode} addToItinerary={addToItinerary} itineraryTravelers={itinNbVoyageurs} itineraryDates={itinDates} />
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

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar.jsx'
import Footer from '../components/common/Footer.jsx'
import NotFound from '../components/common/NotFound.jsx'

// Import de toutes les pages principales
import Home          from '../pages/Home.jsx'
import Destinations  from '../pages/Destinations.jsx'
import Hebergements  from '../pages/Hebergements.jsx'
import Transports    from '../pages/Transports.jsx'
import Activites     from '../pages/Activites.jsx'
import Reservations  from '../pages/Reservations.jsx'

/**
 * AppRouter centralise toutes les routes de l'application.
 *
 * Structure :
 *  /                  → page d'accueil
 *  /destinations      → liste des destinations
 *  /hebergements      → liste des hébergements
 *  /transports        → liste des transports
 *  /activites         → liste des activités
 *  /reservations      → gestion des réservations
 *  *                  → page 404 personnalisée
 *
 * La Navbar et le Footer sont rendus en dehors de <Routes> pour être
 * présents sur TOUTES les pages sans répétition de code.
 */
function AppRouter() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/"               element={<Home />} />
          <Route path="/destinations"   element={<Destinations />} />
          <Route path="/hebergements"   element={<Hebergements />} />
          <Route path="/transports"     element={<Transports />} />
          <Route path="/activites"      element={<Activites />} />
          <Route path="/reservations"   element={<Reservations />} />

          {/* Redirection de /home vers / pour la robustesse des liens */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Toute route inconnue → page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  )
}

export default AppRouter

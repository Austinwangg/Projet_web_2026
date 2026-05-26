import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import '../../styles/Navbar.css'

/**
 * Navbar – barre de navigation principale de VoyageVista.
 *
 * Choix techniques :
 * - NavLink (react-router-dom) ajoute automatiquement la classe "active"
 *   sur le lien de la page courante → feedback visuel immédiat pour l'utilisateur.
 * - Le menu hamburger (état `menuOpen`) permet l'affichage responsive
 *   sur mobile sans JavaScript externe.
 * - Aucun rechargement de page : la navigation est 100 % côté client (SPA).
 */
function Navbar() {
  // Contrôle l'ouverture/fermeture du menu burger sur mobile
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => setMenuOpen(prev => !prev)
  // Ferme le menu après un clic sur un lien (UX mobile)
  const closeMenu  = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      {/* ── Logo / Marque ── */}
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="brand-icon">✈</span>
        <span className="brand-name">VoyageVista</span>
      </Link>

      {/* ── Bouton hamburger (visible uniquement sur mobile) ── */}
      <button
        className={`navbar-burger ${menuOpen ? 'is-active' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu de navigation"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* ── Liens de navigation ── */}
      <ul className={`navbar-links ${menuOpen ? 'is-open' : ''}`}>
        <li>
          <NavLink to="/destinations" onClick={closeMenu}>
            🌍 Destinations
          </NavLink>
        </li>
        <li>
          <NavLink to="/hebergements" onClick={closeMenu}>
            🏨 Hébergements
          </NavLink>
        </li>
        <li>
          <NavLink to="/transports" onClick={closeMenu}>
            🚌 Transports
          </NavLink>
        </li>
        <li>
          <NavLink to="/activites" onClick={closeMenu}>
            🎯 Activités
          </NavLink>
        </li>

        {/* Réservations mis en évidence en tant que CTA principal */}
        <li>
          <NavLink to="/reservations" className="navbar-cta" onClick={closeMenu}>
            📋 Réservations
          </NavLink>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar

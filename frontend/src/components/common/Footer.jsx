import { Link } from 'react-router-dom'
import '../../styles/Footer.css'

/**
 * Footer – pied de page commun à toutes les pages.
 * Rappelle les liens principaux pour une navigation secondaire rapide.
 */
function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="brand-icon">✈</span>
          <span className="brand-name">VoyageVista</span>
          <p>Planifiez vos voyages de rêve en toute simplicité.</p>
        </div>

        <div className="footer-links">
          <h4>Explorer</h4>
          <ul>
            <li><Link to="/destinations">Destinations</Link></li>
            <li><Link to="/hebergements">Hébergements</Link></li>
            <li><Link to="/transports">Transports</Link></li>
            <li><Link to="/activites">Activités</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Mon compte</h4>
          <ul>
            <li><Link to="/reservations">Mes Réservations</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} VoyageVista – Projet ECE Ing2</p>
      </div>
    </footer>
  )
}

export default Footer

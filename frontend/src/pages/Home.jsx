import { Link } from 'react-router-dom'
import '../styles/pages.css'

/**
 * Page d'accueil – présente la plateforme et guide l'utilisateur
 * vers les 5 espaces principaux via des cartes cliquables.
 */
function Home() {
  const sections = [
    { to: '/destinations',  icon: '🌍', label: 'Destinations',  desc: 'Explorez des centaines de destinations à travers le monde.' },
    { to: '/hebergements',  icon: '🏨', label: 'Hébergements',  desc: 'Hôtels, villas, auberges — trouvez où dormir.' },
    { to: '/transports',    icon: '🚌', label: 'Transports',    desc: 'Vols, trains, bus — organisez vos déplacements.' },
    { to: '/activites',     icon: '🎯', label: 'Activités',     desc: 'Visites, sports, culture — remplissez votre séjour.' },
    { to: '/reservations',  icon: '📋', label: 'Réservations',  desc: 'Gérez et consultez toutes vos réservations.' },
  ]

  return (
    <div className="page home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenue sur <span className="brand-highlight">VoyageVista</span></h1>
          <p className="hero-subtitle">
            La plateforme tout-en-un pour planifier vos voyages de rêve :
            destinations, hébergements, transports, activités et réservations.
          </p>
          <Link to="/destinations" className="btn-primary">
            Découvrir les destinations →
          </Link>
        </div>
      </section>

      {/* Grille des sections principales */}
      <section className="sections-grid">
        <h2 className="section-title">Explorer la plateforme</h2>
        <div className="cards-grid">
          {sections.map(({ to, icon, label, desc }) => (
            <Link key={to} to={to} className="section-card">
              <span className="card-icon">{icon}</span>
              <h3>{label}</h3>
              <p>{desc}</p>
              <span className="card-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home

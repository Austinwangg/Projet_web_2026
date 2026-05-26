import '../styles/pages.css'

/**
 * Page Destinations – liste des destinations disponibles.
 * [Placeholder] : le contenu sera chargé depuis l'API PHP /api/destinations
 */
function Destinations() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🌍</span>
        <h1>Destinations</h1>
        <p className="page-subtitle">
          Partez à la découverte de destinations extraordinaires aux quatre coins du monde.
        </p>
      </div>

      <div className="placeholder-notice">
        <p>🚧 Module en cours de développement</p>
        <p className="placeholder-detail">
          Cette section affichera les destinations récupérées depuis l'API PHP
          (<code>GET /api/destinations</code>).
        </p>
      </div>
    </div>
  )
}

export default Destinations

import '../styles/pages.css'

/**
 * Page Activités – liste des activités proposées.
 * [Placeholder] : le contenu sera chargé depuis l'API PHP /api/activites
 */
function Activites() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🎯</span>
        <h1>Activités</h1>
        <p className="page-subtitle">
          Randonnées, visites culturelles, sports nautiques — enrichissez votre séjour.
        </p>
      </div>

      <div className="placeholder-notice">
        <p>🚧 Module en cours de développement</p>
        <p className="placeholder-detail">
          Cette section affichera les activités récupérées depuis l'API PHP
          (<code>GET /api/activites</code>).
        </p>
      </div>
    </div>
  )
}

export default Activites

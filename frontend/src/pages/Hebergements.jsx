import '../styles/pages.css'

/**
 * Page Hébergements – liste des hébergements disponibles.
 * [Placeholder] : le contenu sera chargé depuis l'API PHP /api/hebergements
 */
function Hebergements() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🏨</span>
        <h1>Hébergements</h1>
        <p className="page-subtitle">
          Hôtels, villas, auberges de jeunesse — trouvez l'hébergement qui vous correspond.
        </p>
      </div>

      <div className="placeholder-notice">
        <p>🚧 Module en cours de développement</p>
        <p className="placeholder-detail">
          Cette section affichera les hébergements récupérés depuis l'API PHP
          (<code>GET /api/hebergements</code>).
        </p>
      </div>
    </div>
  )
}

export default Hebergements

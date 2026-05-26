import '../styles/pages.css'

/**
 * Page Transports – liste des options de transport.
 * [Placeholder] : le contenu sera chargé depuis l'API PHP /api/transports
 */
function Transports() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🚌</span>
        <h1>Transports</h1>
        <p className="page-subtitle">
          Vols, trains, bus, location de voiture — organisez vos déplacements simplement.
        </p>
      </div>

      <div className="placeholder-notice">
        <p>🚧 Module en cours de développement</p>
        <p className="placeholder-detail">
          Cette section affichera les transports récupérés depuis l'API PHP
          (<code>GET /api/transports</code>).
        </p>
      </div>
    </div>
  )
}

export default Transports

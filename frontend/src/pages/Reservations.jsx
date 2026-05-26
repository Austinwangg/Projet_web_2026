import '../styles/pages.css'

/**
 * Page Réservations – gestion des réservations de l'utilisateur.
 * [Placeholder] : le contenu sera chargé depuis l'API PHP /api/reservations
 */
function Reservations() {
  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">📋</span>
        <h1>Mes Réservations</h1>
        <p className="page-subtitle">
          Consultez, modifiez ou annulez vos réservations en cours.
        </p>
      </div>

      <div className="placeholder-notice">
        <p>🚧 Module en cours de développement</p>
        <p className="placeholder-detail">
          Cette section affichera les réservations récupérées depuis l'API PHP
          (<code>GET /api/reservations</code>).
        </p>
      </div>
    </div>
  )
}

export default Reservations

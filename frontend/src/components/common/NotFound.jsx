import { Link } from 'react-router-dom'

/**
 * Page 404 – affiché pour toute route inconnue.
 * Propose un retour rapide vers l'accueil.
 */
function NotFound() {
  return (
    <div className="page-placeholder" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <div style={{ fontSize: '5rem' }}>🗺️</div>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>404</h1>
      <h2>Page introuvable</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        La destination que vous cherchez n'existe pas encore.
      </p>
      <Link to="/" className="btn-primary">Retour à l'accueil</Link>
    </div>
  )
}

export default NotFound

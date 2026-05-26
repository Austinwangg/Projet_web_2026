import { useState, useEffect } from 'react'
import { getActivites } from '../services/activitesService'
import '../styles/pages.css'

function Activites() {
  const [activites, setActivites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getActivites()
      .then(res => setActivites(res.data))
      .catch(() => setError('Impossible de charger les activités.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🎯</span>
        <h1>Activités</h1>
        <p className="page-subtitle">
          Randonnées, visites culturelles, sports nautiques — enrichissez votre séjour.
        </p>
      </div>

      {loading && <p className="data-loading">Chargement...</p>}
      {error && <p className="data-error">{error}</p>}

      <div className="data-grid">
        {activites.map(a => (
          <div key={a.id} className="data-card">
            <div className="card-body">
              <div className="card-meta">
                {a.categorie && <span className="card-badge badge-green">{a.categorie}</span>}
                <span className="card-price-inline">
                  {Number(a.prix) > 0 ? `${a.prix} €` : 'Gratuit'}
                </span>
              </div>
              <h3 className="card-title">{a.nom}</h3>
              <p className="card-desc">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Activites

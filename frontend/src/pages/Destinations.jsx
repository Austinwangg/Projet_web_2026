import { useState, useEffect } from 'react'
import { getDestinations } from '../services/destinationsService'
import '../styles/pages.css'

function Destinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDestinations()
      .then(res => setDestinations(res.data))
      .catch(() => setError('Impossible de charger les destinations.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🌍</span>
        <h1>Destinations</h1>
        <p className="page-subtitle">
          Partez à la découverte de destinations extraordinaires aux quatre coins du monde.
        </p>
      </div>

      {loading && <p className="data-loading">Chargement...</p>}
      {error && <p className="data-error">{error}</p>}

      <div className="data-grid">
        {destinations.map(dest => (
          <div key={dest.id} className="data-card">
            {dest.image_url && (
              <img src={dest.image_url} alt={dest.nom} className="card-img" />
            )}
            <div className="card-body">
              <span className="card-badge">{dest.pays}</span>
              <h3 className="card-title">{dest.nom}</h3>
              <p className="card-desc">{dest.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Destinations

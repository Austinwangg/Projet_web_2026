import { useState, useEffect } from 'react'
import { getHebergements } from '../services/hebergementsService'
import '../styles/pages.css'

const TYPE_LABELS = { hotel: 'Hôtel', villa: 'Villa', auberge: 'Auberge', appartement: 'Appartement' }

function Stars({ n }) {
  return (
    <span className="stars">
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

function Hebergements() {
  const [hebergements, setHebergements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getHebergements()
      .then(res => setHebergements(res.data))
      .catch(() => setError('Impossible de charger les hébergements.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🏨</span>
        <h1>Hébergements</h1>
        <p className="page-subtitle">
          Hôtels, villas, auberges de jeunesse — trouvez l'hébergement qui vous correspond.
        </p>
      </div>

      {loading && <p className="data-loading">Chargement...</p>}
      {error && <p className="data-error">{error}</p>}

      <div className="data-grid">
        {hebergements.map(h => (
          <div key={h.id} className="data-card">
            {h.image_url && (
              <img src={h.image_url} alt={h.nom} className="card-img" />
            )}
            <div className="card-body">
              <span className="card-badge">{TYPE_LABELS[h.type] || h.type}</span>
              <h3 className="card-title">{h.nom}</h3>
              <Stars n={Number(h.nb_etoiles)} />
              <p className="card-price">{h.prix_nuit} € <span className="price-unit">/nuit</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hebergements

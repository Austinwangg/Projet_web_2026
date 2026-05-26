import { useState, useEffect } from 'react'
import { getTransports } from '../services/transportsService'
import '../styles/pages.css'

const TYPE_ICONS = { avion: '✈️', train: '🚆', bus: '🚌', voiture: '🚗' }
const TYPE_LABELS = { avion: 'Avion', train: 'Train', bus: 'Bus', voiture: 'Voiture' }

function Transports() {
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTransports()
      .then(res => setTransports(res.data))
      .catch(() => setError('Impossible de charger les transports.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">🚌</span>
        <h1>Transports</h1>
        <p className="page-subtitle">
          Vols, trains, bus, location de voiture — organisez vos déplacements simplement.
        </p>
      </div>

      {loading && <p className="data-loading">Chargement...</p>}
      {error && <p className="data-error">{error}</p>}

      <div className="data-list">
        {transports.map(t => (
          <div key={t.id} className="transport-card">
            <span className="transport-icon">{TYPE_ICONS[t.type] || '🚀'}</span>
            <div className="transport-info">
              <div className="transport-top">
                <h3>{t.compagnie || TYPE_LABELS[t.type]}</h3>
                <span className="card-badge">{TYPE_LABELS[t.type] || t.type}</span>
              </div>
              <p className="transport-route">{t.depart} → {t.arrivee}</p>
            </div>
            <p className="card-price-right">{t.prix} €</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Transports

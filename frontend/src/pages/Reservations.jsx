import { useState, useEffect } from 'react'
import { getReservations, createReservation, deleteReservation } from '../services/reservationsService'
import { getDestinations } from '../services/destinationsService'
import '../styles/pages.css'

const STATUT_LABELS = {
  en_attente: { label: 'En attente', cls: 'badge-orange' },
  confirmee:  { label: 'Confirmée',  cls: 'badge-green'  },
  annulee:    { label: 'Annulée',    cls: 'badge-red'    },
}

const EMPTY_FORM = { destination_id: '', date_depart: '', date_retour: '' }

function Reservations() {
  const [reservations, setReservations] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    const [res, dest] = await Promise.all([getReservations(), getDestinations()])
    setReservations(res.data)
    setDestinations(dest.data)
  }

  useEffect(() => {
    load()
      .catch(() => setError('Impossible de charger les données.'))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createReservation({ ...form, utilisateur_id: 1, statut: 'en_attente' })
      setForm(EMPTY_FORM)
      await load()
    } catch {
      setError('Erreur lors de la création de la réservation.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Supprimer cette réservation ?')) return
    try {
      await deleteReservation(id)
      setReservations(r => r.filter(x => x.id !== id))
    } catch {
      setError('Erreur lors de la suppression.')
    }
  }

  function destName(id) {
    return destinations.find(d => d.id === Number(id))?.nom || `Destination #${id}`
  }

  return (
    <div className="page">
      <div className="page-header">
        <span className="page-icon">📋</span>
        <h1>Mes Réservations</h1>
        <p className="page-subtitle">
          Consultez, créez ou supprimez vos réservations.
        </p>
      </div>

      <section className="form-section">
        <h2 className="section-title">Nouvelle réservation</h2>
        <form className="reservation-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Destination</label>
            <select name="destination_id" value={form.destination_id} onChange={handleChange} required>
              <option value="">-- Choisir une destination --</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.nom} ({d.pays})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date de départ</label>
            <input type="date" name="date_depart" value={form.date_depart} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Date de retour</label>
            <input type="date" name="date_retour" value={form.date_retour} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Création...' : 'Réserver'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="section-title">Mes réservations</h2>
        {error && <p className="data-error">{error}</p>}
        {loading && <p className="data-loading">Chargement...</p>}
        {!loading && reservations.length === 0 && (
          <p className="data-empty">Aucune réservation pour le moment.</p>
        )}
        <div className="data-list">
          {reservations.map(r => {
            const s = STATUT_LABELS[r.statut] || { label: r.statut, cls: '' }
            return (
              <div key={r.id} className="reservation-card">
                <div className="reservation-info">
                  <h3>{destName(r.destination_id)}</h3>
                  <p className="transport-route">{r.date_depart} → {r.date_retour}</p>
                </div>
                <span className={`card-badge ${s.cls}`}>{s.label}</span>
                <button className="btn-delete" onClick={() => handleDelete(r.id)}>Supprimer</button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Reservations

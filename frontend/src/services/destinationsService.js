import api from './api.js'

/** Récupère toutes les destinations */
export const getDestinations = () => api.get('/destinations')

/** Récupère une destination par son id */
export const getDestination = (id) => api.get(`/destinations/${id}`)

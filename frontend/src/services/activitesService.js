import api from './api.js'

export const getActivites = ()    => api.get('/activites')
export const getActivite  = (id) => api.get(`/activites/${id}`)

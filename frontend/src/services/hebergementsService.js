import api from './api.js'

export const getHebergements = ()    => api.get('/hebergements')
export const getHebergement  = (id) => api.get(`/hebergements/${id}`)

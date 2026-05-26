import api from './api.js'

export const getTransports = ()    => api.get('/transports')
export const getTransport  = (id) => api.get(`/transports/${id}`)

import api from './api.js';

export const getTransports = () => api.get('/transports');
export const getTransportsByDest = (destId) => api.get(`/transports?destination_id=${destId}`);
export const getTransport = (id) => api.get(`/transports?id=${id}`);
export const createTransport = (data) => api.post('/transports', data);
export const deleteTransport = (id) => api.delete(`/transports?id=${id}`);

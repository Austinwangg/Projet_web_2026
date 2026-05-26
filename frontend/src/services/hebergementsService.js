import api from './api.js';

export const getHebergements = () => api.get('/hebergements');
export const getHebergementsByDest = (destId) => api.get(`/hebergements?destination_id=${destId}`);
export const getHebergement = (id) => api.get(`/hebergements?id=${id}`);
export const createHebergement = (data) => api.post('/hebergements', data);
export const deleteHebergement = (id) => api.delete(`/hebergements?id=${id}`);

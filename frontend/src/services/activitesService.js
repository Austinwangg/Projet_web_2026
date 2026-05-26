import api from './api.js';

export const getActivites = () => api.get('/activites');
export const getActivitesByDest = (destId) => api.get(`/activites?destination_id=${destId}`);
export const getActivite = (id) => api.get(`/activites?id=${id}`);
export const createActivite = (data) => api.post('/activites', data);
export const deleteActivite = (id) => api.delete(`/activites?id=${id}`);

import api from './api.js';

export const getItinerairesByUser = (userId) => api.get(`/itineraires?user_id=${userId}`);
export const getItineraire = (id) => api.get(`/itineraires?id=${id}`);
export const createItineraire = (data) => api.post('/itineraires', data);
export const updateItineraire = (id, data) => api.put(`/itineraires?id=${id}`, data);
export const deleteItineraire = (id) => api.delete(`/itineraires?id=${id}`);

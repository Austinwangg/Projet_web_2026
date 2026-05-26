import api from './api.js';

export const getReservations = () => api.get('/reservations');
export const getReservationsByUser = (userId) => api.get(`/reservations?user_id=${userId}`);
export const getReservation = (id) => api.get(`/reservations?id=${id}`);
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservationStatus = (id, statut) => api.put(`/reservations?id=${id}`, { statut });
export const deleteReservation = (id) => api.delete(`/reservations?id=${id}`);

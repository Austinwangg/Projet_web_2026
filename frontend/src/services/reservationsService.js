import api from './api.js';

export const getReservations = () => api.get('/reservations');
export const getReservationsByUser = (userId) => api.get(`/reservations?user_id=${userId}`);
export const getReservation = (id) => api.get(`/reservations?id=${id}`);
export const createReservation = (data) => api.post('/reservations', data);
export const updateReservationStatus = (id, statut) => api.put(`/reservations?id=${id}`, { statut });
export const updateReservation = (id, data) => api.put(`/reservations?id=${id}`, data);
export const deleteReservation = (id) => api.delete(`/reservations?id=${id}`);
export const cancelActiviteFromReservation = (reservationId, activiteId) =>
  api.put(`/reservations?id=${reservationId}`, { cancel_activite_id: activiteId });

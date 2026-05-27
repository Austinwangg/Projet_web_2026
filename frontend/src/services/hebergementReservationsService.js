import api from './api.js';

export const getHebergementReservationsByUser = (userId) =>
  api.get(`/reservations_hebergement?user_id=${userId}`);

export const getHebergementReservation = (id) =>
  api.get(`/reservations_hebergement?id=${id}`);

export const createHebergementReservation = (data) =>
  api.post('/reservations_hebergement', data);

export const cancelHebergementReservation = (id) =>
  api.put(`/reservations_hebergement?id=${id}`, { statut: 'annulee' });

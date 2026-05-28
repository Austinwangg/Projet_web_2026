import api from './api.js';

export const getFavoris = (userId) => api.get(`/favoris?user_id=${userId}`);

export const toggleFavori = (userId, destinationId) =>
  api.post('/favoris', { user_id: userId, destination_id: destinationId });

import api from './api.js';

export const getTransports = () => api.get('/transports');
export const getTransportsByDest = (destId) => api.get(`/transports?destination_id=${destId}`);
export const getTransport = (id) => api.get(`/transports?id=${id}`);
export const createTransport = (data) => api.post('/transports', data);
export const deleteTransport = (id) => api.delete(`/transports?id=${id}`);

/**
 * Recherche de transports avec filtres.
 * filters: { destination_id?, type?, compagnie?, prix_min?, prix_max?, places_min? }
 */
export const searchTransports = (filters = {}) => {
  const params = new URLSearchParams({ search: '1' });
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== '' && v !== null && v !== undefined) params.append(k, v);
  });
  return api.get(`/transports?${params.toString()}`);
};

export const checkTransportAvailability = (id, nb = 1) =>
  api.get(`/transports?check_dispo=${id}&nb=${nb}`);

/** Restitue des places après annulation d'un transport */
export const cancelTransportPlaces = (id, nb = 1) =>
  api.put(`/transports?id=${id}`, { nb });

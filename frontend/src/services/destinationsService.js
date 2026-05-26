import api from './api.js';

/** Toutes les destinations */
export const getDestinations = () => api.get('/destinations');

/** Une destination par son ID numérique */
export const getDestinationById = (id) => api.get(`/destinations?id=${id}`);

/** Une destination par son slug ('shanghai', 'bali', …) avec hébergements + activités + vols */
export const getDestinationBySlug = (slug) => api.get(`/destinations?slug=${slug}`);

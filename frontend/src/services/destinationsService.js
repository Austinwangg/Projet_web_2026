import api from './api.js';

/** Toutes les destinations */
export const getDestinations = () => api.get('/destinations.php');

/** Une destination par son ID numérique */
export const getDestinationById = (id) => api.get(`/destinations.php?id=${id}`);

/** Une destination par son slug */
export const getDestinationBySlug = (slug) => api.get(`/destinations.php?slug=${slug}`);
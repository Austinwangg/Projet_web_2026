import api from './api.js';

// ── Utilisateurs ────────────────────────────────────────────────────────────

export const getUsers = () =>
  api.get('/admin', { params: { resource: 'users' } });

export const setUserRole = (id, role) =>
  api.put(`/admin?resource=users&id=${id}`, { role });

export const deleteUser = (id) =>
  api.delete(`/admin?resource=users&id=${id}`);

// ── Destinations / Offres (admin only) ──────────────────────────────────────

/**
 * Crée une destination.
 * @param {object} data  Champs de la destination (ville, pays_fr, pays_en, type, …)
 * @param {string} role  Rôle de l'utilisateur connecté (doit être 'admin')
 */
export const createDestination = (data, role = 'admin') =>
  api.post('/destinations', data, { headers: { 'X-User-Role': role } });

/**
 * Met à jour une destination existante.
 * @param {number} id
 * @param {object} data
 * @param {string} role
 */
export const updateDestination = (id, data, role = 'admin') =>
  api.put(`/destinations?id=${id}`, data, { headers: { 'X-User-Role': role } });

/**
 * Supprime définitivement une destination (cascade sur hébergements/activités/transports).
 * @param {number} id  ID numérique de la destination en base
 * @param {string} role
 */
export const deleteDestination = (id, role = 'admin') =>
  api.delete(`/destinations?id=${id}`, { headers: { 'X-User-Role': role } });

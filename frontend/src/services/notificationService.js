import api from './api.js';

/** Récupère toutes les notifications d'un utilisateur + compteur non-lues */
export const getNotifications = (userId) =>
  api.get('/notifications', { params: { user_id: userId } });

/**
 * Crée une notification.
 * @param {{ utilisateur_id: number, type: string, titre: string, message?: string }} data
 */
export const createNotification = (data) =>
  api.post('/notifications', data);

/** Marque une notification comme lue (passe l'id en query param) */
export const markRead = (id) =>
  api.put(`/notifications?id=${id}`, {});

/** Marque toutes les notifications d'un utilisateur comme lues */
export const markAllRead = (userId) =>
  api.put('/notifications', { utilisateur_id: userId, action: 'mark_all_read' });

/** Supprime une notification */
export const deleteNotification = (id) =>
  api.delete(`/notifications?id=${id}`);

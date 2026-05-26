import api from './api.js';

/** Récupère toutes les notifications d'un utilisateur + compteur non-lues */
export const getNotifications = (userId) =>
  api.get('/notifications', { params: { user_id: userId } });

/** Crée une notification */
export const createNotification = (utilisateur_id, type, titre, message = '') =>
  api.post('/notifications', { utilisateur_id, type, titre, message });

/** Marque une notification comme lue */
export const markRead = (id) =>
  api.put('/notifications', null, { params: { id } });

/** Marque toutes les notifications comme lues */
export const markAllRead = (utilisateur_id) =>
  api.put('/notifications', { utilisateur_id, action: 'mark_all_read' });

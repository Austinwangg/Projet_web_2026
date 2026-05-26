import api from './api.js';

export const getNotifications = (userId) =>
  api.get('/notifications', { params: { user_id: userId } });

export const markRead = (id) =>
  api.put(`/notifications?id=${id}`, {});

export const markAllRead = (userId) =>
  api.put('/notifications', { mark_all_read: userId });

export const deleteNotification = (id) =>
  api.delete(`/notifications?id=${id}`);

export const createNotification = (data) =>
  api.post('/notifications', data);

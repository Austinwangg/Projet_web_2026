import api from './api.js';

export const getUsers = () =>
  api.get('/admin', { params: { resource: 'users' } });

export const setUserRole = (id, role) =>
  api.put(`/admin?resource=users&id=${id}`, { role });

export const deleteUser = (id) =>
  api.delete(`/admin?resource=users&id=${id}`);

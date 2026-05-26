import api from './api.js';

export const register = (nom, email, password) =>
  api.post('/auth', { action: 'register', nom, email, password });

export const login = (email, password) =>
  api.post('/auth', { action: 'login', email, password });

export const updateProfile = (data) =>
  api.post('/auth', { action: 'update_profile', ...data });

export const changePassword = (id, current_password, new_password) =>
  api.post('/auth', { action: 'change_password', id, current_password, new_password });

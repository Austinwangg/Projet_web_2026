import api from './api.js';

/** Inscription */
export const register = (nom, email, password) =>
  api.post('/auth', { action: 'register', nom, email, password });

/** Connexion — retourne { id, nom, email, role } */
export const login = (email, password) =>
  api.post('/auth', { action: 'login', email, password });

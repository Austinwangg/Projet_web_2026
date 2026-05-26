import axios from 'axios'

/**
 * Instance Axios centralisée.
 * - baseURL pointe sur le proxy Vite → serveur PHP (voir vite.config.js).
 * - Le header Content-Type est forcé en JSON pour toutes les requêtes.
 *
 * Ajouter ici : gestion des tokens JWT (intercepteurs), retry, etc.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export default api

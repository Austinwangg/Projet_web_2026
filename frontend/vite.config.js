import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        // Adapter ce chemin au nom du dossier dans htdocs (= nom du repo GitHub)
        rewrite: (path) => path.replace(/^\/api/, '/Projet-web-2026/backend/api'),
      },
    },
  },
})

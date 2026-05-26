import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite proxie les appels /api vers le serveur PHP (XAMPP sur le port 80 par défaut)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8888,
    proxy: {
      '/api': {
        // MAMP utilise le port 8888 par défaut (XAMPP utiliserait 80)
        target: 'http://localhost:8888',
        changeOrigin: true,
      },
    },
  },
})

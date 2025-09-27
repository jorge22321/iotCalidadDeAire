//vite.config.js
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Redirige cualquier petición que empiece con /api a tu backend
      '/api': {
        target: 'http://localhost:3000', // La URL de tu servidor Express
        changeOrigin: true, // Necesario para evitar problemas de CORS
        // No necesitas reescribir la ruta, ya que tu backend ya espera /api
      },
    },
  },
})

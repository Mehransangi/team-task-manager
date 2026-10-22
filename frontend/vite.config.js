import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In development, /api calls are forwarded to the Express server so cookies stay same-origin.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})

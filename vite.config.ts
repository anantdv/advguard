import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://182.71.135.110:8088',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

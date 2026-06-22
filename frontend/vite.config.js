import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      // Proxy API calls to the deployed AWS backend server-side so the browser
      // stays same-origin (avoids CORS during local dev). Requires the client to
      // use the relative '/api' base (see .env.development).
      '/api': {
        target: 'https://aywg9l5gba.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})

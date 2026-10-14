import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // /api calls go to the backend, so the browser never hits a CORS problem
    proxy: { '/api': 'http://localhost:5000' },
  },
});
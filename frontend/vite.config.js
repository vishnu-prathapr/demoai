import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // In development the React app runs on :5173 and the API on :5000.
    // This forwards /api requests so the frontend can use relative URLs,
    // exactly as it does in production on Vercel.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});

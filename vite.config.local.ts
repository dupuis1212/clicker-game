import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  cacheDir: '/sessions/kind-affectionate-ptolemy/vite-cache',
  server: {
    port: 5173,
    open: false,
    host: '127.0.0.1',
  },
});

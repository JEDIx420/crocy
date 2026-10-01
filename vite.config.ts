import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base for reliable GitHub Pages hosting regardless of repo name
  base: './',
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500
  },
  server: {
    host: true,
    port: 5173
  }
});

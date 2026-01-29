import { defineConfig } from 'vite';

export default defineConfig({
  // Configuration de base pour Vite
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  test: {
    // Configuration Vitest
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/main.js']
    }
  }
});

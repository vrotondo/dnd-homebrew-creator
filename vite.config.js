import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set the correct base path if deploying to GitHub Pages
  // For a project at https://username.github.io/repo-name/
  base: '/dnd-homebrew-creator/',
  server: {
    // This prevents CORS issues during development
    open: true,
    // Configure HMR behavior
    hmr: {
      overlay: true,
    },
  },
  // Ensure proper build settings
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});

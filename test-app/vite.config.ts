import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  server: {
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
  },
});

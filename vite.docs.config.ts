import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(import.meta.dirname, 'docs'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@docs': resolve(import.meta.dirname, 'docs/src'),
    },
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist-docs'),
    emptyOutDir: true,
  },
});

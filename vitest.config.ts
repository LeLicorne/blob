import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
      '@docs': resolve(import.meta.dirname, 'docs/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/commons/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'docs/src/**/*.test.{ts,tsx}'],
  },
});

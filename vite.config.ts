/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'frontend',
          globals: true,
          environment: 'jsdom',
          pool: 'vmThreads',
          setupFiles: './src/test/setup.ts',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        test: {
          name: 'backend',
          globals: true,
          environment: 'node',
          pool: 'threads',
          include: ['server/**/*.test.ts'],
        },
      },
    ],
  },
});

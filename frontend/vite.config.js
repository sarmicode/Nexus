import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Dev server only: the sandbox/preview hostname is dynamic per session
    // (e.g. 5173-<sandboxId>.e2b.app), so it can't be allowlisted statically.
    // `true` relaxes Vite's DNS-rebinding host check for local development.
    allowedHosts: true,
    // Browser calls relative /api/… → proxied to the Express gateway.
    // Keeps local dev and sandboxed/preview environments working with
    // one config (no hardcoded localhost URLs in the app, RULES.md §5).
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});

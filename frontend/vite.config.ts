import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  envPrefix: 'PUBLIC_',
  server: {
    port: 5173,
  },
  build: {
    target: 'es2022',
  },
});

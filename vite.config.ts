import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        privacy: fileURLToPath(new URL('./privacy/index.html', import.meta.url)),
        terms: fileURLToPath(new URL('./terms/index.html', import.meta.url))
      }
    }
  }
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

// Build from ./public to ./dist with hashed assets.
export default defineConfig({
  root: resolve(__dirname, 'public'),
  base: '/',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      }
    }
  }
});

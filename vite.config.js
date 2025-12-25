import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        twitchdactle: resolve(__dirname, 'src/content/twitchdactle/twitchDactle.html')
      }
    }
  },
});

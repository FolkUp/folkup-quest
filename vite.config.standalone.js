import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: './',  // КРИТИЧНО: относительные пути для file://
  build: {
    outDir: 'dist-standalone-v2',
    emptyOutDir: true,
    target: 'es2015',  // совместимость с браузерами
    rollupOptions: {
      input: 'index-standalone.html',  // standalone HTML template
      output: {
        format: 'iife',  // КРИТИЧНО: IIFE вместо ES modules
        inlineDynamicImports: true,  // всё в один файл
        manualChunks: undefined,  // предотвращаем чанки
      }
    },
    assetsInlineLimit: 8192,  // inline small assets
  },
  define: {
    // Предотвращаем ошибки в production build
    'import.meta.hot': 'undefined'
  }
});
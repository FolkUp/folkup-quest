import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Constitutional Performance Budget Optimizations
    // FQST-014.2 Phase 1C-Alpha: Banking-level build optimization
    target: 'es2015',
    minify: 'terser',
    cssMinify: true,

    // Asset optimization for constitutional budget compliance
    assetsInlineLimit: 4096,  // Inline small assets (<4KB)

    rollupOptions: {
      output: {
        // Constitutional chunk splitting for optimal loading
        manualChunks: {
          vendor: ['inkjs'],
          'panel-system': [
            './src/engine/panel-progression.js',
            './src/ui/panel-modal.js',
            './src/ui/panel-reader.js'
          ]
        },

        // Constitutional asset naming for cache optimization
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash].${ext}`;
          }
          return `assets/[ext]/[name]-[hash].${ext}`;
        }
      }
    },

    // Constitutional performance targets
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600  // 600KB chunks align with constitutional budget
  },

  server: {
    port: 3000,
    open: true,
  },

  // Constitutional development optimizations
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }
});

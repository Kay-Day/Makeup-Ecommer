import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
    modulePreload: {
      resolveDependencies(_url, deps) {
        return deps.filter((dep) => !dep.includes('editor-') && !dep.includes('motion-'));
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion') || id.includes('node_modules/swiper')) {
            return undefined;
          }
          if (id.includes('node_modules/@tiptap') || id.includes('node_modules/prosemirror-')) {
            return undefined;
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
    },
  },
})

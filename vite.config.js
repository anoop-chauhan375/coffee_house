import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Required for deployment to a GitHub Pages repository.
  // Change this if your repository has a different name.
  base: '/buland-coffee-house/',

  plugins: [react()],

  server: {
    // NOIR CAFÉ owns 5180 and HOUSE OF GARDEN owns 5190.
    // BULAND runs on 5200.
    port: 5200,
    host: true,
    strictPort: false,
  },

  preview: {
    port: 5201,
  },

  build: {
    target: 'es2019',
    chunkSizeWarningLimit: 1200,

    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion', 'gsap'],
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // NOIR CAFÉ owns 5180 and HOUSE OF GARDEN owns 5190, so BULAND runs on 5200.
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
        // Keep the heavy 3D / animation libraries in their own long-lived
        // chunks so the initial HTML + app code stays small and cacheable.
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

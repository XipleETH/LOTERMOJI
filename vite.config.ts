import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'web3-vendor': ['wagmi', 'viem', 'connectkit']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'firebase/app', 'firebase/firestore', 'firebase/auth']
  }
});

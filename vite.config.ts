import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          convex: ['convex/react', '@clerk/clerk-react'],
          pdf: ['pdf-lib', '@pdf-lib/fontkit'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
// Force rebuild Wed Feb  4 06:05:47 PM UTC 2026
// Deploy trigger Wed Feb  4 06:53:35 PM UTC 2026

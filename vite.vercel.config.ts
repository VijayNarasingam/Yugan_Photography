import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vercel serves the SPA as static files and runs /api through a function, so
// the Cloudflare Vite plugin (worker + assets) is deliberately left out here.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', emptyOutDir: true },
})

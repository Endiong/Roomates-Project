import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
  },
  // Skip scanning the nested design iterations folder (just static HTML files, not part of build)
  build: {
    rollupOptions: {
      external: [],
    }
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/react-pdf-signing-vite/',
  plugins: [react()],
  build: {
    outDir: 'docs',
  },
})
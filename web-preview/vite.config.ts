import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/commit-from-branch/', // GitHub Pages 저장소 경로
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})

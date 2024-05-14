// vite.config.js
import {resolve} from 'node:path'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'scripts/',
    manifest: false,
    rollupOptions: {
      input: [resolve(__dirname, 'src/content.ts'), resolve(__dirname, 'src/background.ts'), resolve(__dirname, 'index.html')],
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  }
})

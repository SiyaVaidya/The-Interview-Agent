import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: '/dashboard',   // auto-opens this path when the dev server starts
    browser: 'chrome',   // opens in Chrome specifically
  },
})


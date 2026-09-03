import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honor the dev-server harness's assigned port instead of Vite's own
    // 5173→5174→… conflict scan.
    port: Number(process.env.PORT) || 5173,
  },
})

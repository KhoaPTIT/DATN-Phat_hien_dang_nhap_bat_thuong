import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // Dùng chung file .env ở gốc repo với docker-compose/backend.
  envDir: '../',
})

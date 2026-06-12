import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react-swc'
import path from "path"


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/restaurant': 'http://localhost:8080',
      '/menu': 'http://localhost:8080',
      '/order': 'http://localhost:8080',
      '/reservation': 'http://localhost:8080',
      '/checkout': 'http://localhost:8080',
      '/rating': 'http://localhost:8080',
      '/notification': 'http://localhost:8080',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

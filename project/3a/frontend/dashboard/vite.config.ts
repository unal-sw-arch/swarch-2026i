import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react-swc'
import path from "path"


// https://vite.dev/config/
//
// Secure Channel: the API Gateway terminates TLS, so the dev server proxies to
// it over HTTPS. `secure: false` makes the proxy accept the gateway's
// self-signed certificate (the browser only ever talks plain HTTP to Vite, so
// no client-side cert trust is needed in dev). REST and the kitchen STOMP/
// WebSocket (`ws: true`) both flow through this single secure proxy.
const GATEWAY_TARGET = process.env.VITE_PROXY_TARGET ?? 'https://localhost:8080'
const secureProxy = { target: GATEWAY_TARGET, changeOrigin: true, secure: false }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': secureProxy,
      '/restaurant': secureProxy,
      '/menu': secureProxy,
      '/order': secureProxy,
      '/reservation': secureProxy,
      '/checkout': secureProxy,
      '/rating': secureProxy,
      '/notification': secureProxy,
      '/ws': { ...secureProxy, ws: true },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

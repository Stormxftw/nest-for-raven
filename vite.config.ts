/** Local UI server; Raven retains authentication and ownership of its RPC. */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxy = {
  '/rpc': { target: 'http://127.0.0.1:18792', ws: true, changeOrigin: false },
  '/auth': { target: 'http://127.0.0.1:18792', changeOrigin: false },
  '/health': { target: 'http://127.0.0.1:18792', changeOrigin: false },
}
export default defineConfig({ plugins: [react()], server: { proxy }, preview: { proxy } })

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_TARGET || 'http://localhost:3000'

  const apiProxy = {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
    bypass: (req) => {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return req.url;
      }
    }
  };

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/Signup': apiProxy,
        '/login': apiProxy,
        '/logout': apiProxy,
        '/profile': apiProxy,
        '/feed': apiProxy,
        '/request': apiProxy,
        '/connections': apiProxy,
        '/chat': apiProxy,
        '/api': apiProxy,
        '/socket.io': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  }
})

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'img-proxy',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url.startsWith('/img?')) return next()
          const url = new URL(req.url, 'http://localhost').searchParams.get('url')
          if (!url) { res.statusCode = 400; res.end('Missing url'); return }
          fetch(url)
            .then(async (upstream) => {
              res.setHeader('Content-Type', upstream.headers.get('Content-Type') || 'image/jpeg')
              res.end(Buffer.from(await upstream.arrayBuffer()))
            })
            .catch((e) => { res.statusCode = 502; res.end(e.message) })
        })
      },
    },
  ],
  server: {
    proxy: {
      '/api/nasa': {
        target: 'https://mars.nasa.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/nasa', '/rss/api/'),
      },
    },
  },
})

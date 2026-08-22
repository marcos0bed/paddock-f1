import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/* A visible build marker. With a service worker in play — especially in an
   installed iOS PWA, which can keep serving a cached build across launches —
   "is the fix even on my phone yet?" is otherwise unanswerable. */
const BUILD_ID =
  process.env.GITHUB_SHA?.slice(0, 7) ??
  new Date().toISOString().slice(5, 16).replace('T', ' ').replace('-', '/')

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Paddock — Formula 1',
        short_name: 'Paddock',
        description: 'Live timing, standings and race history for Formula 1.',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        // start_url and scope are intentionally omitted: vite-plugin-pwa derives
        // them from Vite's `base`, which differs between local dev (/) and
        // GitHub Pages (/<repo>/). Hard-coding "/" breaks the installed app.
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Drop precaches from previous builds instead of letting them linger
        // and shadow the current one.
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Historical data is immutable once a race is over — cache hard.
            urlPattern: /^https:\/\/api\.jolpi\.ca\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'jolpica-f1',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Live timing must never be served stale.
            urlPattern: /^https:\/\/api\.openf1\.org\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})

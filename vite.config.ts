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
            // Historical data is immutable once a race is over — cache hard,
            // and generously: a single driver/constructor career view fans out
            // to one request per season (Ferrari alone is 77), so a small
            // budget here gets blown by one page visit and evicts everything
            // else. StaleWhileRevalidate still refreshes in the background on
            // every hit, so a bigger budget costs storage, not freshness.
            urlPattern: /^https:\/\/api\.jolpi\.ca\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'jolpica-f1',
              expiration: { maxEntries: 3000, maxAgeSeconds: 60 * 60 * 24 * 90 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Weekend metadata and finished-session results: once a session
            // ends this is immutable, and it's exactly what a live-session
            // block hides — OpenF1's free tier blocks EVERY request (history
            // included) during the ±30min window around any session, so
            // without this a user who opens the app mid-block sees nothing
            // even for a session they successfully loaded five minutes
            // earlier. StaleWhileRevalidate still attempts a fresh fetch on
            // every request; during a block that attempt just fails quietly
            // (same as today) while the last-good cached copy is served
            // instantly. Must come before the catch-all NetworkOnly rule
            // below — Workbox uses the first matching pattern.
            urlPattern:
              /^https:\/\/api\.openf1\.org\/v1\/(meetings|sessions|drivers|session_result|pit|weather|stints)(\?|$)/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'openf1-weekend',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Position/interval/lap feeds: this is the live timing tower
            // itself, must never be served stale.
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

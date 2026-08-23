import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { useTranslation } from 'react-i18next'

import { AppShell, Page } from './components/AppShell'
import { EmptyState } from './components/states'
import { Home } from './routes/Home'
import { Schedule } from './routes/Schedule'
import { Standings } from './routes/Standings'
import { Seasons } from './routes/Seasons'
import { SeasonDetail } from './routes/SeasonDetail'
import { RaceDetail } from './routes/RaceDetail'
import { DriverDetail } from './routes/DriverDetail'
import { TeamDetail } from './routes/TeamDetail'
import { Live } from './routes/Live'
import { Weekend } from './routes/Weekend'

/* Every route is imported eagerly, on purpose.
 *
 * Route-level code splitting looks like a free win, but it interacts badly
 * with a service worker on a static host: GitHub Pages only ever serves the
 * newest build, so once a deploy lands, the previously-hashed chunks are gone.
 * An installed PWA still running the old cached shell then asks for a chunk
 * that 404s the moment you tap a tab, the dynamic import rejects, and the app
 * dies — looking exactly like "the tabs don't work".
 *
 * One bundle makes the precache atomic: whatever shell you're running, the
 * code for every screen is already in it. At ~160 KB gzipped that costs a few
 * milliseconds on first load and removes a whole class of failure.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      // Historical F1 data doesn't change; avoid needless refetching.
      staleTime: 5 * 60 * 1000,
    },
  },
})

/**
 * Persist React Query's cache to localStorage, independent of the service
 * worker's own HTTP-level cache (vite.config.ts). They cover different
 * failure modes: the SW cache survives a fresh page load but only if the
 * browser's Cache Storage for this origin is intact; localStorage is a
 * simpler, more directly inspectable mechanism and isn't touched by SW
 * updates at all. Belt and braces — a race weekend's results loading once
 * should mean they stay available, not depend on exactly which layer held on
 * to them.
 *
 * Live timing must never be replayed as if it were current, so anything
 * under the 'live' query-key namespace (useLive.ts) is explicitly excluded.
 */
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'paddock-query-cache',
})

function NotFound() {
  const { t } = useTranslation()
  return (
    <Page title={t('common.notFound')}>
      <EmptyState message={t('common.notFoundBody')} />
    </Page>
  )
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days — well past any single race weekend
        // Tie persisted data to the exact build that wrote it. A future
        // deploy that changes a response shape just starts fresh instead of
        // rehydrating something the new code doesn't expect.
        buster: __BUILD_ID__,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.queryKey[0] !== 'live',
        },
      }}
    >
      {/* GitHub Pages serves project sites from /<repo>/, so every route must
          be prefixed. BASE_URL comes from Vite's --base at build time. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/weekend" element={<Weekend />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/schedule/:season" element={<Schedule />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/standings/:season" element={<Standings />} />
            <Route path="/seasons" element={<Seasons />} />
            <Route path="/season/:season" element={<SeasonDetail />} />
            <Route path="/race/:season/:round" element={<RaceDetail />} />
            <Route path="/driver/:driverId" element={<DriverDetail />} />
            <Route path="/team/:constructorId" element={<TeamDetail />} />
            <Route path="/live" element={<Live />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </PersistQueryClientProvider>
  )
}

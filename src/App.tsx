import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { AppShell, Page } from './components/AppShell'
import { EmptyState, LoadingRows } from './components/states'
import { Home } from './routes/Home'

/* Only the home screen ships in the initial bundle; the rest arrive on demand
   so first paint on a phone at the circuit stays fast. */
const Schedule = lazy(() => import('./routes/Schedule').then((m) => ({ default: m.Schedule })))
const Standings = lazy(() => import('./routes/Standings').then((m) => ({ default: m.Standings })))
const Seasons = lazy(() => import('./routes/Seasons').then((m) => ({ default: m.Seasons })))
const SeasonDetail = lazy(() =>
  import('./routes/SeasonDetail').then((m) => ({ default: m.SeasonDetail })),
)
const RaceDetail = lazy(() =>
  import('./routes/RaceDetail').then((m) => ({ default: m.RaceDetail })),
)
const DriverDetail = lazy(() =>
  import('./routes/DriverDetail').then((m) => ({ default: m.DriverDetail })),
)
const TeamDetail = lazy(() =>
  import('./routes/TeamDetail').then((m) => ({ default: m.TeamDetail })),
)
const Live = lazy(() => import('./routes/Live').then((m) => ({ default: m.Live })))

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

function NotFound() {
  const { t } = useTranslation()
  return (
    <Page title={t('common.notFound')}>
      <EmptyState message={t('common.notFoundBody')} />
    </Page>
  )
}

function RouteFallback() {
  return (
    <Page>
      <LoadingRows rows={8} />
    </Page>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* GitHub Pages serves project sites from /<repo>/, so every route must
          be prefixed. BASE_URL comes from Vite's --base at build time. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppShell>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
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
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

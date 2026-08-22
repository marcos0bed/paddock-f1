import type {
  ConstructorTableResponse,
  DriverTableResponse,
  Race,
  RaceTableResponse,
  SeasonTableResponse,
  StandingsList,
  StandingsResponse,
} from './types'

const BASE = 'https://api.jolpi.ca/ergast/f1'

export class JolpicaError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'JolpicaError'
    this.status = status
  }
}

/**
 * Jolpica's documented free-tier limit is 4 requests/second burst, 500/hour
 * sustained (github.com/jolpica/jolpica-f1/blob/main/docs/rate_limits.md).
 * Most screens fire one or two calls, well under that — but a driver or
 * constructor career view fans out to one request per season (up to 20+ for
 * long-running teams), and Ergast's old bulk "whole career in one call"
 * endpoint no longer exists. Funnelling every request through one queue means
 * callers can fire them all with Promise.all without thinking about pacing;
 * this serialises the actual network calls at a safe ~3.7/s regardless.
 *
 * The gap only applies when it's earned: once the service worker has these
 * responses cached (see vite.config.ts), a repeat fetch resolves in a couple
 * of milliseconds — pacing those at 270ms apart too would make a warm cache
 * feel exactly as slow as a cold one, defeating the point of caching a
 * 77-request career fetch in the first place. A fetch that resolves fast
 * almost certainly didn't hit Jolpica's server, so only fetches slower than
 * the threshold pay the pacing tax.
 */
const MIN_GAP_MS = 270
const CACHE_HIT_THRESHOLD_MS = 30
let chain: Promise<unknown> = Promise.resolve()

function throttle<T>(task: () => Promise<T>): Promise<T> {
  let gapMs = 0
  const run = chain.then(
    async () => {
      const started = performance.now()
      try {
        return await task()
      } finally {
        gapMs = performance.now() - started > CACHE_HIT_THRESHOLD_MS ? MIN_GAP_MS : 0
      }
    },
    async () => {
      const started = performance.now()
      try {
        return await task()
      } finally {
        gapMs = performance.now() - started > CACHE_HIT_THRESHOLD_MS ? MIN_GAP_MS : 0
      }
    },
  )
  chain = run.then(
    () => (gapMs > 0 ? new Promise<void>((r) => setTimeout(r, gapMs)) : undefined),
    () => (gapMs > 0 ? new Promise<void>((r) => setTimeout(r, gapMs)) : undefined),
  )
  return run
}

/**
 * A career view fans out to one request per season, all funnelled through the
 * same throttle queue. If any single one of them still lands on a 429 —
 * shared-IP contention, an imprecise sliding window, whatever — retrying just
 * that request is far cheaper than the alternative: React Query's default
 * retry re-runs the *whole* queryFn, which for a 20+ season career means
 * re-issuing every request in the batch to recover from one failure.
 */
async function fetchWithRetry(url: URL, attempt = 0): Promise<Response> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (res.status === 429 && attempt < 4) {
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    return fetchWithRetry(url, attempt + 1)
  }
  return res
}

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE}/${path}.json`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  const res = await throttle(() => fetchWithRetry(url))
  if (!res.ok) {
    throw new JolpicaError(
      res.status === 429
        ? 'Rate limited by the F1 data service. Try again shortly.'
        : `F1 data request failed (${res.status}).`,
      res.status,
    )
  }
  return (await res.json()) as T
}

/* ── Schedule ──────────────────────────────────────────────── */

export async function getSchedule(season: string | number = 'current'): Promise<Race[]> {
  const d = await get<RaceTableResponse>(`${season}/races`, { limit: 100 })
  return d.MRData.RaceTable.Races
}

export async function getRace(season: string | number, round: string | number): Promise<Race | null> {
  const d = await get<RaceTableResponse>(`${season}/${round}/races`, { limit: 1 })
  return d.MRData.RaceTable.Races[0] ?? null
}

/* ── Results ───────────────────────────────────────────────── */

export async function getRaceResults(
  season: string | number,
  round: string | number,
): Promise<Race | null> {
  const d = await get<RaceTableResponse>(`${season}/${round}/results`, { limit: 100 })
  return d.MRData.RaceTable.Races[0] ?? null
}

export async function getQualifyingResults(
  season: string | number,
  round: string | number,
): Promise<Race | null> {
  const d = await get<RaceTableResponse>(`${season}/${round}/qualifying`, { limit: 100 })
  return d.MRData.RaceTable.Races[0] ?? null
}

export async function getSprintResults(
  season: string | number,
  round: string | number,
): Promise<Race | null> {
  const d = await get<RaceTableResponse>(`${season}/${round}/sprint`, { limit: 100 })
  return d.MRData.RaceTable.Races[0] ?? null
}

/* ── Standings ─────────────────────────────────────────────── */

export async function getDriverStandings(
  season: string | number = 'current',
): Promise<StandingsList | null> {
  const d = await get<StandingsResponse>(`${season}/driverstandings`, { limit: 100 })
  return d.MRData.StandingsTable.StandingsLists[0] ?? null
}

export async function getConstructorStandings(
  season: string | number = 'current',
): Promise<StandingsList | null> {
  const d = await get<StandingsResponse>(`${season}/constructorstandings`, { limit: 100 })
  return d.MRData.StandingsTable.StandingsLists[0] ?? null
}

/* ── Entities ──────────────────────────────────────────────── */

export async function getDrivers(season: string | number = 'current') {
  const d = await get<DriverTableResponse>(`${season}/drivers`, { limit: 100 })
  return d.MRData.DriverTable.Drivers
}

export async function getConstructors(season: string | number = 'current') {
  const d = await get<ConstructorTableResponse>(`${season}/constructors`, { limit: 100 })
  return d.MRData.ConstructorTable.Constructors
}

export async function getSeasons() {
  const d = await get<SeasonTableResponse>('seasons', { limit: 100, offset: 0 })
  const total = Number(d.MRData.total)
  const seasons = [...d.MRData.SeasonTable.Seasons]
  // Ergast caps a page at 100; there are 75+ seasons so one extra page suffices.
  if (total > seasons.length) {
    const more = await get<SeasonTableResponse>('seasons', { limit: 100, offset: seasons.length })
    seasons.push(...more.MRData.SeasonTable.Seasons)
  }
  return seasons.reverse()
}

/** Every race a driver has entered in a season, with their result. */
export async function getDriverSeasonResults(driverId: string, season: string | number) {
  const d = await get<RaceTableResponse>(`${season}/drivers/${driverId}/results`, { limit: 100 })
  return d.MRData.RaceTable.Races
}

/**
 * Career championship placings for a driver, oldest first.
 *
 * `drivers/{id}/driverstandings` without a season used to return the whole
 * career in one call; Jolpica now rejects it with "Missing required parameter
 * season_year". There's no bulk replacement, so this fetches the driver's
 * season list first (cheap, one call) and then every season's standings in
 * parallel — more requests, but each is small and the result is cached
 * indefinitely once fetched.
 */
export async function getDriverStandingsHistory(driverId: string) {
  const seasons = await get<SeasonTableResponse>(`drivers/${driverId}/seasons`, { limit: 100 })
  const years = seasons.MRData.SeasonTable.Seasons.map((s) => s.season)
  const perSeason = await Promise.all(
    years.map((year) =>
      get<StandingsResponse>(`${year}/drivers/${driverId}/driverstandings`, { limit: 1 }).then(
        (d) => d.MRData.StandingsTable.StandingsLists[0],
      ),
    ),
  )
  return perSeason.filter((l): l is StandingsList => Boolean(l))
}

export async function getConstructorStandingsHistory(constructorId: string) {
  const seasons = await get<SeasonTableResponse>(`constructors/${constructorId}/seasons`, {
    limit: 100,
  })
  const years = seasons.MRData.SeasonTable.Seasons.map((s) => s.season)
  const perSeason = await Promise.all(
    years.map((year) =>
      get<StandingsResponse>(`${year}/constructors/${constructorId}/constructorstandings`, {
        limit: 1,
      }).then((d) => d.MRData.StandingsTable.StandingsLists[0]),
    ),
  )
  return perSeason.filter((l): l is StandingsList => Boolean(l))
}

export async function getDriverWins(driverId: string) {
  const d = await get<RaceTableResponse>(`drivers/${driverId}/results/1/races`, { limit: 100 })
  return d.MRData.RaceTable.Races
}

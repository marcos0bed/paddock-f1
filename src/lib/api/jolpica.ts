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

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${BASE}/${path}.json`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
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

/** Career championship placings for a driver, oldest first. */
export async function getDriverStandingsHistory(driverId: string) {
  const d = await get<StandingsResponse>(`drivers/${driverId}/driverstandings`, { limit: 100 })
  return d.MRData.StandingsTable.StandingsLists
}

export async function getConstructorStandingsHistory(constructorId: string) {
  const d = await get<StandingsResponse>(`constructors/${constructorId}/constructorstandings`, {
    limit: 100,
  })
  return d.MRData.StandingsTable.StandingsLists
}

export async function getDriverWins(driverId: string) {
  const d = await get<RaceTableResponse>(`drivers/${driverId}/results/1/races`, { limit: 100 })
  return d.MRData.RaceTable.Races
}

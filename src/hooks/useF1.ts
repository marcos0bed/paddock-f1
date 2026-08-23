import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import * as api from '../lib/api/jolpica'
import { countdownTo, raceDate, type Countdown } from '../lib/format'
import type { Race } from '../lib/api/types'

/** Finished races never change — cache them for a long time. */
const STATIC = { staleTime: 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 }
/** Standings shift after each round; an hour is plenty. */
const SEASONAL = { staleTime: 30 * 60 * 1000, gcTime: 6 * 60 * 60 * 1000 }

export function useLocale(): string {
  const { i18n } = useTranslation()
  return i18n.resolvedLanguage ?? i18n.language ?? 'en'
}

export function useSchedule(season: string | number = 'current') {
  return useQuery({
    queryKey: ['schedule', season],
    queryFn: () => api.getSchedule(season),
    ...SEASONAL,
  })
}

export function useDriverStandings(season: string | number = 'current') {
  return useQuery({
    queryKey: ['driverStandings', season],
    queryFn: () => api.getDriverStandings(season),
    ...SEASONAL,
  })
}

export function useConstructorStandings(season: string | number = 'current') {
  return useQuery({
    queryKey: ['constructorStandings', season],
    queryFn: () => api.getConstructorStandings(season),
    ...SEASONAL,
  })
}

export function useRaceResults(season: string | number, round: string | number) {
  return useQuery({
    queryKey: ['raceResults', season, round],
    queryFn: () => api.getRaceResults(season, round),
    enabled: Boolean(season && round),
    ...STATIC,
  })
}

export function useQualifyingResults(season: string | number, round: string | number) {
  return useQuery({
    queryKey: ['qualifying', season, round],
    queryFn: () => api.getQualifyingResults(season, round),
    enabled: Boolean(season && round),
    ...STATIC,
  })
}

export function useSprintResults(season: string | number, round: string | number) {
  return useQuery({
    queryKey: ['sprint', season, round],
    queryFn: () => api.getSprintResults(season, round).catch(() => null),
    enabled: Boolean(season && round),
    ...STATIC,
  })
}

export function useRace(season: string | number, round: string | number) {
  return useQuery({
    queryKey: ['race', season, round],
    queryFn: () => api.getRace(season, round),
    enabled: Boolean(season && round),
    ...STATIC,
  })
}

export function useSeasons() {
  return useQuery({ queryKey: ['seasons'], queryFn: api.getSeasons, ...STATIC })
}

export function useConstructors(season: string | number = 'current') {
  return useQuery({
    queryKey: ['constructors', season],
    queryFn: () => api.getConstructors(season),
    ...SEASONAL,
  })
}

export function useDriverStandingsHistory(driverId: string) {
  return useQuery({
    queryKey: ['driverHistory', driverId],
    queryFn: () => api.getDriverStandingsHistory(driverId),
    enabled: Boolean(driverId),
    ...STATIC,
    // A career fetch is itself up to ~20 requests, each already retried
    // individually on 429 inside the client (see jolpica.ts). Letting React
    // Query's default retry re-run this whole batch on top of that would
    // multiply, not add, retry attempts — the wrong response to a server
    // that's already asking everyone to slow down.
    retry: false,
  })
}

export function useDriverSeasonResults(driverId: string, season: string | number) {
  return useQuery({
    queryKey: ['driverSeason', driverId, season],
    queryFn: () => api.getDriverSeasonResults(driverId, season),
    enabled: Boolean(driverId),
    ...SEASONAL,
  })
}

export function useConstructorStandingsHistory(constructorId: string) {
  return useQuery({
    queryKey: ['constructorHistory', constructorId],
    queryFn: () => api.getConstructorStandingsHistory(constructorId),
    enabled: Boolean(constructorId),
    ...STATIC,
    retry: false, // see useDriverStandingsHistory — same reasoning
  })
}

/**
 * A race isn't "over" the instant it starts — it's still running for roughly
 * two hours, longer with a red flag. Jolpica gives no end time, so this is a
 * generous estimate (same order of magnitude as the race-session window used
 * to detect OpenF1 blocks in lib/weekendWindow.ts): long enough that a race
 * in progress is never mistaken for finished, short enough that a real
 * finished race doesn't linger as "next".
 */
const RACE_DURATION_MS = 3.5 * 60 * 60 * 1000

/**
 * Split the calendar around "now". A race only counts as past once it's
 * actually likely to be over — previously this flipped the instant the start
 * time elapsed, which meant Home jumped straight to next round's countdown
 * while the current race was still being run.
 */
export function useSeasonState(season: string | number = 'current') {
  const query = useSchedule(season)

  const derived = useMemo(() => {
    const races = query.data ?? []
    if (races.length === 0) {
      return { races: [], next: null, last: null, past: [], upcoming: [], live: null }
    }

    const now = Date.now()
    const past: Race[] = []
    const upcoming: Race[] = []
    let live: Race | null = null
    for (const r of races) {
      const start = raceDate(r.date, r.time).getTime()
      if (now < start) {
        upcoming.push(r)
      } else if (now <= start + RACE_DURATION_MS) {
        // Started, probably still running — stays "this weekend", not past.
        live = r
        upcoming.push(r)
      } else {
        past.push(r)
      }
    }
    return {
      races,
      past,
      upcoming,
      live,
      next: upcoming[0] ?? null,
      last: past[past.length - 1] ?? null,
    }
  }, [query.data])

  return { ...query, ...derived }
}

/** Ticking countdown. Stops updating once the target passes. */
export function useCountdown(target: Date | null): Countdown | null {
  const [value, setValue] = useState<Countdown | null>(() =>
    target ? countdownTo(target) : null,
  )

  // Depend on the primitive epoch, not the Date object. Callers that build
  // `target` inline (`raceDate(race.date, race.time)`, say) hand this effect a
  // new object every render; keying on object identity made the effect
  // re-fire on every tick — clear timer, setState synchronously, re-render,
  // repeat — a runaway loop that pegs the main thread hard enough to make
  // taps elsewhere on the page stop registering, intermittently, for as long
  // as the component stays mounted.
  const epoch = target?.getTime() ?? null

  useEffect(() => {
    if (epoch == null) {
      setValue(null)
      return
    }
    const t = new Date(epoch)
    setValue(countdownTo(t))
    const id = setInterval(() => {
      const next = countdownTo(t)
      setValue(next)
      if (next.total <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch])

  return value
}

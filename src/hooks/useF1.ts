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
 * Split the calendar around "now". A race counts as past once its start time
 * has elapsed, so the hero flips to the next round while the flag is still out
 * rather than a day later.
 */
export function useSeasonState(season: string | number = 'current') {
  const query = useSchedule(season)

  const derived = useMemo(() => {
    const races = query.data ?? []
    if (races.length === 0) return { races: [], next: null, last: null, past: [], upcoming: [] }

    const now = Date.now()
    const past: Race[] = []
    const upcoming: Race[] = []
    for (const r of races) {
      if (raceDate(r.date, r.time).getTime() < now) past.push(r)
      else upcoming.push(r)
    }
    return {
      races,
      past,
      upcoming,
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

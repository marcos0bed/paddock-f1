import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import * as openf1 from '../lib/api/openf1'
import { OpenF1RestrictedError } from '../lib/api/openf1'
import type { OpenF1Stint } from '../lib/api/types'

const FINISHED = { staleTime: 60 * 60 * 1000, gcTime: 24 * 60 * 60 * 1000 }

function noRetryWhenRestricted(failureCount: number, error: unknown) {
  if (error instanceof OpenF1RestrictedError) return false
  return failureCount < 2
}

export interface FastestLap {
  driverNumber: number
  duration: number
  lapNumber: number
}

export interface DriverStrategy {
  driverNumber: number
  stints: OpenF1Stint[]
  pitCount: number
}

export interface WeatherSummary {
  trackTemp: number
  airTemp: number
  humidity: number
  rain: boolean
}

/**
 * Everything beyond the classification for one session: fastest lap, tyre
 * strategy, pit stop counts, track conditions. Fetched only once a session
 * card is opened — five extra endpoints per session would be wasteful (and,
 * on the free tier's 3 req/s cap, slow) for sessions the user never expands.
 */
export function useSessionExtras(sessionKey: number | null, enabled: boolean) {
  const active = enabled && sessionKey != null

  const laps = useQuery({
    queryKey: ['weekend', 'laps', sessionKey],
    queryFn: () => openf1.getLaps(sessionKey!),
    enabled: active,
    ...FINISHED,
    retry: noRetryWhenRestricted,
  })

  const stints = useQuery({
    queryKey: ['weekend', 'stints', sessionKey],
    queryFn: () => openf1.getStints(sessionKey!),
    enabled: active,
    ...FINISHED,
    retry: noRetryWhenRestricted,
  })

  const pits = useQuery({
    queryKey: ['weekend', 'pits', sessionKey],
    queryFn: () => openf1.getPitStops(sessionKey!),
    enabled: active,
    ...FINISHED,
    retry: noRetryWhenRestricted,
  })

  const weather = useQuery({
    queryKey: ['weekend', 'weather', sessionKey],
    queryFn: () => openf1.getWeather(sessionKey!),
    enabled: active,
    ...FINISHED,
    retry: noRetryWhenRestricted,
  })

  const fastestLap = useMemo<FastestLap | null>(() => {
    let best: FastestLap | null = null
    for (const lap of laps.data ?? []) {
      // Out laps and in laps aren't representative pace — a car exiting the
      // pits on a cold tyre can post a slow "lap" that isn't a real number.
      if (lap.is_pit_out_lap || lap.lap_duration == null) continue
      if (!best || lap.lap_duration < best.duration) {
        best = { driverNumber: lap.driver_number, duration: lap.lap_duration, lapNumber: lap.lap_number }
      }
    }
    return best
  }, [laps.data])

  const strategyByDriver = useMemo<Map<number, DriverStrategy>>(() => {
    const map = new Map<number, DriverStrategy>()
    for (const s of stints.data ?? []) {
      const entry = map.get(s.driver_number) ?? { driverNumber: s.driver_number, stints: [], pitCount: 0 }
      entry.stints.push(s)
      map.set(s.driver_number, entry)
    }
    for (const entry of map.values()) entry.stints.sort((a, b) => a.stint_number - b.stint_number)
    for (const p of pits.data ?? []) {
      const entry = map.get(p.driver_number)
      if (entry) entry.pitCount += 1
    }
    return map
  }, [stints.data, pits.data])

  const weatherSummary = useMemo<WeatherSummary | null>(() => {
    const readings = weather.data ?? []
    if (readings.length === 0) return null
    // The session-average reads more truthfully than the single latest
    // sample, which can be a transient gust or a sensor blip.
    const avg = (f: (w: (typeof readings)[number]) => number) =>
      readings.reduce((sum, w) => sum + f(w), 0) / readings.length
    return {
      trackTemp: avg((w) => w.track_temperature),
      airTemp: avg((w) => w.air_temperature),
      humidity: avg((w) => w.humidity),
      rain: readings.some((w) => w.rainfall > 0),
    }
  }, [weather.data])

  return {
    fastestLap,
    strategyByDriver,
    weather: weatherSummary,
    isLoading: laps.isLoading || stints.isLoading,
  }
}

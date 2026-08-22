import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import * as openf1 from '../lib/api/openf1'
import { OpenF1RestrictedError } from '../lib/api/openf1'
import type { OpenF1Lap, OpenF1Stint } from '../lib/api/types'

/** Timing screens are worthless when stale — poll hard, but only while live. */
const LIVE_POLL_MS = 4000

function noRetryWhenRestricted(failureCount: number, error: unknown) {
  if (error instanceof OpenF1RestrictedError) return false
  return failureCount < 2
}

export function useLatestSession() {
  return useQuery({
    queryKey: ['live', 'session'],
    queryFn: openf1.getLatestSession,
    refetchInterval: 60_000,
    retry: noRetryWhenRestricted,
  })
}

/** True while a session is actually running (not merely the most recent one). */
export function isSessionLive(start?: string, end?: string): boolean {
  if (!start || !end) return false
  const now = Date.now()
  return now >= new Date(start).getTime() && now <= new Date(end).getTime()
}

export function useLiveTiming(sessionKey: number | null, enabled: boolean) {
  const drivers = useQuery({
    queryKey: ['live', 'drivers', sessionKey],
    queryFn: () => openf1.getSessionDrivers(sessionKey!),
    enabled: enabled && sessionKey != null,
    staleTime: 5 * 60 * 1000,
    retry: noRetryWhenRestricted,
  })

  const positions = useQuery({
    queryKey: ['live', 'positions', sessionKey],
    queryFn: () => openf1.getPositions(sessionKey!),
    enabled: enabled && sessionKey != null,
    refetchInterval: LIVE_POLL_MS,
    retry: noRetryWhenRestricted,
  })

  const intervals = useQuery({
    queryKey: ['live', 'intervals', sessionKey],
    queryFn: () => openf1.getIntervals(sessionKey!),
    enabled: enabled && sessionKey != null,
    refetchInterval: LIVE_POLL_MS,
    retry: noRetryWhenRestricted,
  })

  const laps = useQuery({
    queryKey: ['live', 'laps', sessionKey],
    queryFn: () => openf1.getLaps(sessionKey!),
    enabled: enabled && sessionKey != null,
    refetchInterval: LIVE_POLL_MS * 2,
    retry: noRetryWhenRestricted,
  })

  const stints = useQuery({
    queryKey: ['live', 'stints', sessionKey],
    queryFn: () => openf1.getStints(sessionKey!),
    enabled: enabled && sessionKey != null,
    refetchInterval: 30_000,
    retry: noRetryWhenRestricted,
  })

  const raceControl = useQuery({
    queryKey: ['live', 'raceControl', sessionKey],
    queryFn: () => openf1.getRaceControl(sessionKey!),
    enabled: enabled && sessionKey != null,
    refetchInterval: 15_000,
    retry: noRetryWhenRestricted,
  })

  const rows = useMemo(() => {
    const order = openf1.latestPositions(positions.data ?? [])
    const gaps = openf1.latestIntervals(intervals.data ?? [])
    const driverById = new Map((drivers.data ?? []).map((d) => [d.driver_number, d]))

    const lastLapByDriver = new Map<number, OpenF1Lap>()
    const bestLapByDriver = new Map<number, number>()
    for (const lap of laps.data ?? []) {
      const prev = lastLapByDriver.get(lap.driver_number)
      if (!prev || lap.lap_number > prev.lap_number) lastLapByDriver.set(lap.driver_number, lap)
      if (lap.lap_duration != null) {
        const best = bestLapByDriver.get(lap.driver_number)
        if (best == null || lap.lap_duration < best) {
          bestLapByDriver.set(lap.driver_number, lap.lap_duration)
        }
      }
    }

    const currentStint = new Map<number, OpenF1Stint>()
    for (const s of stints.data ?? []) {
      const prev = currentStint.get(s.driver_number)
      if (!prev || s.stint_number > prev.stint_number) currentStint.set(s.driver_number, s)
    }

    // Session-best lap drives the purple highlight on the timing tower.
    const sessionBest = [...bestLapByDriver.values()].reduce<number | null>(
      (min, v) => (min == null || v < min ? v : min),
      null,
    )

    return order.map((p) => ({
      position: p.position,
      driverNumber: p.driver_number,
      driver: driverById.get(p.driver_number),
      gapToLeader: gaps.get(p.driver_number)?.gap_to_leader ?? null,
      interval: gaps.get(p.driver_number)?.interval ?? null,
      lastLap: lastLapByDriver.get(p.driver_number)?.lap_duration ?? null,
      bestLap: bestLapByDriver.get(p.driver_number) ?? null,
      isSessionBest:
        sessionBest != null && bestLapByDriver.get(p.driver_number) === sessionBest,
      lapNumber: lastLapByDriver.get(p.driver_number)?.lap_number ?? null,
      inPit: lastLapByDriver.get(p.driver_number)?.is_pit_out_lap ?? false,
      compound: currentStint.get(p.driver_number)?.compound,
      stintLaps: currentStint.get(p.driver_number)?.lap_start,
    }))
  }, [positions.data, intervals.data, drivers.data, laps.data, stints.data])

  const restricted = [positions.error, drivers.error, intervals.error].some(
    (e) => e instanceof OpenF1RestrictedError,
  )

  const messages = useMemo(
    () =>
      [...(raceControl.data ?? [])]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 12),
    [raceControl.data],
  )

  return {
    rows,
    messages,
    restricted,
    isLoading: positions.isLoading || drivers.isLoading,
    error: positions.error ?? drivers.error,
    maxLap: rows.reduce((m, r) => Math.max(m, r.lapNumber ?? 0), 0),
  }
}

export { OpenF1RestrictedError }
export const hasLiveAccess = openf1.hasLiveAccess

import { raceDate } from './format'
import type { Race, SessionSlot } from './api/types'

/**
 * Approximates OpenF1's ±30-minute block window around every session of a
 * race weekend, using only Jolpica's session start times.
 *
 * Why this exists: OpenF1's free tier answers a live-session block with a
 * JSON `detail` body — normally readable, so the app can detect it and show
 * a clear "needs a sponsor key" notice. But that block response has been
 * observed coming back as HTTP 401 with no `Access-Control-Allow-Origin`
 * header, which the browser refuses to expose to JS at all: fetch() just
 * rejects with an opaque error, indistinguishable from "no internet." When
 * that happens, this lets the UI fall back to the correct explanation
 * instead of a misleading "check your connection" — the connection is fine,
 * OpenF1 is deliberately blocking, we just can't prove it from the response
 * this time.
 *
 * Durations are generous estimates (Jolpica gives start times only, no
 * duration) — overshooting a little is the safe direction, since this only
 * ever gets consulted after an OpenF1 request has already failed.
 */
const SESSION_DURATION_MIN = {
  practice: 90,
  qualifying: 90,
  sprint: 75,
  race: 180,
} as const

export function isLikelyOpenF1RestrictedNow(race: Race, now: Date = new Date()): boolean {
  const slots: [SessionSlot | undefined, number][] = [
    [race.FirstPractice, SESSION_DURATION_MIN.practice],
    [race.SecondPractice, SESSION_DURATION_MIN.practice],
    [race.ThirdPractice, SESSION_DURATION_MIN.practice],
    [race.SprintQualifying ?? race.SprintShootout, SESSION_DURATION_MIN.sprint],
    [race.Sprint, SESSION_DURATION_MIN.sprint],
    [race.Qualifying, SESSION_DURATION_MIN.qualifying],
    [{ date: race.date, time: race.time }, SESSION_DURATION_MIN.race],
  ]

  return slots.some(([slot, durationMin]) => {
    if (!slot) return false
    const start = raceDate(slot.date, slot.time).getTime()
    const windowStart = start - 30 * 60_000
    const windowEnd = start + (durationMin + 30) * 60_000
    const t = now.getTime()
    return t >= windowStart && t <= windowEnd
  })
}

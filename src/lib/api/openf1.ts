import type {
  OpenF1DriverInfo,
  OpenF1Interval,
  OpenF1Lap,
  OpenF1Position,
  OpenF1RaceControl,
  OpenF1Session,
  OpenF1Stint,
} from './types'

const BASE = 'https://api.openf1.org/v1'

/** Sponsor-tier key. Absent on the free tier — the app degrades, not breaks. */
const API_KEY = import.meta.env.VITE_OPENF1_API_KEY as string | undefined

export const hasLiveAccess = Boolean(API_KEY)

/**
 * OpenF1's free tier blocks *all* requests — historical included — from 30
 * minutes before a session until 30 minutes after it ends. We surface that as
 * its own error type so the UI can explain it rather than showing "failed".
 */
export class OpenF1RestrictedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OpenF1RestrictedError'
  }
}

export class OpenF1Error extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'OpenF1Error'
    this.status = status
  }
}

async function get<T>(path: string, params: Record<string, string | number> = {}): Promise<T[]> {
  const url = new URL(`${BASE}/${path}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    },
  })

  const body: unknown = await res.json().catch(() => null)

  // The restriction arrives as a JSON body with a `detail` field, and can come
  // back with a 2xx status, so check the shape rather than the status code.
  if (body && typeof body === 'object' && 'detail' in body) {
    const detail = String((body as { detail: unknown }).detail)
    if (/live .*session in progress|restricted/i.test(detail)) {
      throw new OpenF1RestrictedError(detail)
    }
    throw new OpenF1Error(detail, res.status)
  }

  if (!res.ok) throw new OpenF1Error(`Live timing request failed (${res.status}).`, res.status)
  return (Array.isArray(body) ? body : []) as T[]
}

/** The session happening now, if any. */
export async function getLatestSession(): Promise<OpenF1Session | null> {
  const s = await get<OpenF1Session>('sessions', { session_key: 'latest' })
  return s[0] ?? null
}

export async function getSessions(year: number): Promise<OpenF1Session[]> {
  return get<OpenF1Session>('sessions', { year })
}

export async function getSessionDrivers(sessionKey: number | 'latest') {
  return get<OpenF1DriverInfo>('drivers', { session_key: sessionKey })
}

export async function getPositions(sessionKey: number | 'latest') {
  return get<OpenF1Position>('position', { session_key: sessionKey })
}

export async function getIntervals(sessionKey: number | 'latest') {
  return get<OpenF1Interval>('intervals', { session_key: sessionKey })
}

export async function getLaps(sessionKey: number | 'latest', driverNumber?: number) {
  return get<OpenF1Lap>('laps', {
    session_key: sessionKey,
    ...(driverNumber ? { driver_number: driverNumber } : {}),
  })
}

export async function getStints(sessionKey: number | 'latest') {
  return get<OpenF1Stint>('stints', { session_key: sessionKey })
}

export async function getRaceControl(sessionKey: number | 'latest') {
  return get<OpenF1RaceControl>('race_control', { session_key: sessionKey })
}

/**
 * Collapse the position feed to the current order: the feed is append-only,
 * so the last entry per driver wins.
 */
export function latestPositions(feed: OpenF1Position[]): OpenF1Position[] {
  const byDriver = new Map<number, OpenF1Position>()
  for (const p of feed) {
    const prev = byDriver.get(p.driver_number)
    if (!prev || p.date > prev.date) byDriver.set(p.driver_number, p)
  }
  return [...byDriver.values()].sort((a, b) => a.position - b.position)
}

export function latestIntervals(feed: OpenF1Interval[]): Map<number, OpenF1Interval> {
  const byDriver = new Map<number, OpenF1Interval>()
  for (const i of feed) {
    const prev = byDriver.get(i.driver_number)
    if (!prev || i.date > prev.date) byDriver.set(i.driver_number, i)
  }
  return byDriver
}

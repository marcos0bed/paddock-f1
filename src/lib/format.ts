/* Formatting helpers. Everything that reaches the user goes through Intl with
   the active locale — dates, numbers and relative time all differ per language,
   and hard-coding English shapes is the usual way multi-language apps leak. */

/** Combine Ergast's separate `date` + `time` (UTC) into a real Date. */
export function raceDate(date: string, time?: string): Date {
  return new Date(time ? `${date}T${time}` : `${date}T00:00:00Z`)
}

export function formatDate(d: Date, locale: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(locale, opts ?? { day: 'numeric', month: 'short' }).format(d)
}

export function formatDateLong(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/** Local wall-clock time for the user — race times arrive in UTC. */
export function formatTime(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d)
}

export function formatNumber(n: number, locale: string, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, opts).format(n)
}

/** Ordinal position — "1st" / "1.º" / "1er", per locale rules where available. */
export function formatOrdinal(n: number, locale: string): string {
  try {
    const pr = new Intl.PluralRules(locale, { type: 'ordinal' })
    const suffixes: Record<string, Record<string, string>> = {
      en: { one: 'st', two: 'nd', few: 'rd', other: 'th' },
    }
    const lang = locale.split('-')[0]
    const table = suffixes[lang]
    if (table) return `${n}${table[pr.select(n)] ?? table.other}`
  } catch {
    /* fall through */
  }
  return String(n)
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function countdownTo(target: Date, from: Date = new Date()): Countdown {
  const total = Math.max(0, target.getTime() - from.getTime())
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  }
}

/** Seconds → "1:32.451", the shape used on every timing screen. */
export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds)) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${s.toFixed(3).padStart(6, '0')}` : s.toFixed(3)
}

/** Gap to the car ahead: "+1.204", "+1 LAP", or "—" for the leader. */
export function formatGap(gap: number | string | null | undefined): string {
  if (gap == null || gap === '') return '—'
  if (typeof gap === 'string') return gap.startsWith('+') ? gap : `+${gap}`
  if (!Number.isFinite(gap)) return '—'
  return `+${gap.toFixed(3)}`
}

/**
 * Ergast reports finishing status as free text ("Finished", "+1 Lap",
 * "Engine"). Split it so we can style retirements differently from finishers.
 */
export function isClassified(status: string): boolean {
  return status === 'Finished' || /^\+\d+ Lap/.test(status)
}

/** Compact "in 3 days" / "hace 2 horas", localised. */
export function formatRelative(target: Date, locale: string, from: Date = new Date()): string {
  const diff = target.getTime() - from.getTime()
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const abs = Math.abs(diff)
  if (abs < 60_000) return rtf.format(Math.round(diff / 1000), 'second')
  if (abs < 3_600_000) return rtf.format(Math.round(diff / 60_000), 'minute')
  if (abs < 86_400_000) return rtf.format(Math.round(diff / 3_600_000), 'hour')
  if (abs < 2_592_000_000) return rtf.format(Math.round(diff / 86_400_000), 'day')
  return rtf.format(Math.round(diff / 2_592_000_000), 'month')
}

/** Points can arrive as "25" or "25.5" — render without trailing noise. */
export function formatPoints(points: string | number, locale: string): string {
  const n = typeof points === 'string' ? Number.parseFloat(points) : points
  if (!Number.isFinite(n)) return '0'
  return formatNumber(n, locale, { maximumFractionDigits: 1 })
}

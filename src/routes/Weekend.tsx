import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'

import { Page } from '../components/AppShell'
import { ErrorState, LoadingRows } from '../components/states'
import { useLocale } from '../hooks/useF1'
import {
  resultShape,
  sessionState,
  useSessionResult,
  useWeekend,
  type SessionState,
} from '../hooks/useWeekend'
import { useSessionExtras, type DriverStrategy } from '../hooks/useSessionExtras'
import { countryIso, flagEmoji, localizedCountry } from '../lib/countries'
import { formatLapTime, formatTime } from '../lib/format'
import { tyreColor } from '../lib/teams'
import type {
  OpenF1DriverInfo,
  OpenF1Measure,
  OpenF1Session,
  OpenF1SessionResult,
} from '../lib/api/types'

const OPENF1_PLANS = 'https://openf1.org/#pricing'

/** Seconds → "30:25.318" for race totals, which run past a minute. */
function formatTotal(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mm = h > 0 ? String(m).padStart(2, '0') : String(m)
  return `${h > 0 ? `${h}:` : ''}${mm}:${s.toFixed(3).padStart(6, '0')}`
}

/** Qualifying arrays are [Q1, Q2, Q3]; the last time set is the one that counts. */
function lastSet(v: OpenF1Measure): number | string | null {
  if (v == null) return null
  if (!Array.isArray(v)) return v
  for (let i = v.length - 1; i >= 0; i--) if (v[i] != null) return v[i]!
  return null
}

function timeLabel(v: OpenF1Measure, shape: 'practice' | 'qualifying' | 'race'): string {
  const raw = lastSet(v)
  if (raw == null) return '—'
  const n = typeof raw === 'string' ? Number.parseFloat(raw) : raw
  if (!Number.isFinite(n)) return String(raw)
  return shape === 'race' ? formatTotal(n) : formatLapTime(n)
}

function gapLabel(v: OpenF1Measure): string {
  const raw = lastSet(v)
  if (raw == null) return '—'
  if (typeof raw === 'string') {
    // "+1 LAP" and friends aren't numeric — show them as they come.
    const n = Number.parseFloat(raw)
    if (!Number.isFinite(n) || /[a-z]/i.test(raw)) {
      return raw.startsWith('+') ? raw : `+${raw}`
    }
    return `+${n.toFixed(3)}`
  }
  return `+${raw.toFixed(3)}`
}

function StateBadge({ state }: { state: SessionState }) {
  const { t } = useTranslation()
  if (state === 'live') {
    return (
      <span className="pulse-live inline-flex items-center text-[0.6rem] font-700 tracking-widest text-speed uppercase">
        {t('weekend.live')}
      </span>
    )
  }
  return (
    <span
      className={`text-[0.6rem] font-700 tracking-widest uppercase ${
        state === 'done' ? 'text-ink-faint' : 'text-signal'
      }`}
    >
      {t(state === 'done' ? 'weekend.done' : 'weekend.upcoming')}
    </span>
  )
}

function ResultRows({
  results,
  drivers,
  shape,
}: {
  results: OpenF1SessionResult[]
  drivers: Map<number, OpenF1DriverInfo>
  shape: 'practice' | 'qualifying' | 'race'
}) {
  const { t } = useTranslation()

  const ordered = [...results].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99),
  )

  return (
    <div className="border-t border-line">
      <div className="grid grid-cols-[2rem_1fr_5.5rem_4.5rem] gap-2 border-b border-line px-3 py-2">
        <span className="eyebrow">{t('standings.pos')}</span>
        <span className="eyebrow">{t('standings.driver')}</span>
        <span className="eyebrow text-right">
          {t(shape === 'race' ? 'weekend.total' : 'weekend.best')}
        </span>
        <span className="eyebrow text-right">{t('race.gap')}</span>
      </div>

      <ol>
        {ordered.map((r) => {
          const d = drivers.get(r.driver_number)
          const color = d?.team_colour ? `#${d.team_colour}` : '#6b7280'
          const out = r.dnf || r.dns || r.dsq

          return (
            <li
              key={r.driver_number}
              className="team-edge grid grid-cols-[2rem_1fr_5.5rem_4.5rem] items-center gap-2 border-b border-line px-3 py-2.5 last:border-b-0"
              style={{ ['--team' as string]: color }}
            >
              <span data-timing className="font-mono text-xs font-700 text-ink">
                {out ? '—' : (r.position ?? '—')}
              </span>

              <div className="flex min-w-0 items-center gap-2">
                <span data-timing className="font-mono text-[0.7rem]" style={{ color }}>
                  {r.driver_number}
                </span>
                <span className="truncate text-sm font-semibold text-ink">
                  {d?.name_acronym ?? d?.full_name ?? `#${r.driver_number}`}
                </span>
                {out && (
                  <span className="shrink-0 font-mono text-[0.55rem] font-700 text-loss">
                    {r.dsq ? 'DSQ' : r.dns ? 'DNS' : 'DNF'}
                  </span>
                )}
                {r.number_of_laps != null && (
                  <span
                    data-timing
                    className="ml-auto shrink-0 font-mono text-[0.6rem] text-ink-faint"
                  >
                    {r.number_of_laps} {t('weekend.lapsShort')}
                  </span>
                )}
              </div>

              <span
                data-timing
                className="text-right font-mono text-xs"
                style={{
                  color: r.position === 1 ? 'var(--color-best-session)' : 'var(--color-ink)',
                }}
              >
                {timeLabel(r.duration, shape)}
              </span>

              <span data-timing className="text-right font-mono text-xs text-ink-dim">
                {r.position === 1 ? '—' : gapLabel(r.gap_to_leader)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function WeatherLine({
  trackTemp,
  airTemp,
  humidity,
  rain,
}: {
  trackTemp: number
  airTemp: number
  humidity: number
  rain: boolean
}) {
  const { t } = useTranslation()
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-4 py-2.5 text-xs text-ink-faint">
      <span>
        {rain ? '🌧️' : '☀️'} {t('weekend.trackTemp')} {trackTemp.toFixed(0)}°C
      </span>
      <span>🌡️ {t('weekend.airTemp')} {airTemp.toFixed(0)}°C</span>
      <span>💧 {humidity.toFixed(0)}%</span>
    </p>
  )
}

function FastestLapBadge({
  driverLabel,
  duration,
  lapNumber,
}: {
  driverLabel: string
  duration: number
  lapNumber: number
}) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2.5 border-t border-line bg-best-session/5 px-4 py-2.5">
      <span className="text-base leading-none" aria-hidden>
        ⚡
      </span>
      <span className="text-[0.65rem] font-700 tracking-widest text-best-session uppercase">
        {t('race.fastestLap')}
      </span>
      <span className="ml-auto flex items-baseline gap-2">
        <span className="text-sm font-semibold text-ink">{driverLabel}</span>
        <span data-timing className="font-mono text-sm font-700 text-best-session">
          {formatLapTime(duration)}
        </span>
        <span data-timing className="font-mono text-[0.65rem] text-ink-faint">
          L{lapNumber}
        </span>
      </span>
    </div>
  )
}

/** One driver's tyre stints as a proportional segmented bar, plus pit count. */
function StrategyRow({
  strategy,
  driver,
}: {
  strategy: DriverStrategy
  driver: OpenF1DriverInfo | undefined
}) {
  const { t } = useTranslation()
  const totalLaps = strategy.stints.reduce(
    (sum, s) => sum + (s.lap_end - s.lap_start + 1),
    0,
  )
  if (totalLaps === 0) return null

  return (
    <li className="flex items-center gap-2 px-4 py-2">
      <span className="w-9 shrink-0 truncate text-xs font-semibold text-ink">
        {driver?.name_acronym ?? `#${strategy.driverNumber}`}
      </span>
      <span className="flex h-3 flex-1 gap-px overflow-hidden rounded-sm bg-surface-3">
        {strategy.stints.map((s, i) => {
          const laps = s.lap_end - s.lap_start + 1
          return (
            <span
              key={i}
              title={`${s.compound} · L${s.lap_start}-${s.lap_end}`}
              className="h-full"
              style={{
                width: `${(laps / totalLaps) * 100}%`,
                background: tyreColor(s.compound),
              }}
            />
          )
        })}
      </span>
      <span
        data-timing
        className="w-14 shrink-0 text-right font-mono text-[0.65rem] text-ink-faint"
      >
        {strategy.pitCount > 0
          ? t('weekend.pitCount', { count: strategy.pitCount })
          : '—'}
      </span>
    </li>
  )
}

function SessionCard({
  session,
  drivers,
  open,
  onToggle,
}: {
  session: OpenF1Session
  drivers: Map<number, OpenF1DriverInfo>
  open: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const locale = useLocale()
  const state = sessionState(session)
  const shape = resultShape(session)
  const hasResults = state === 'done'

  const { data, isLoading, error } = useSessionResult(session.session_key, open && hasResults)
  const extras = useSessionExtras(session.session_key, open && hasResults)

  const strategyRows = [...extras.strategyByDriver.values()].sort((a, b) => {
    const posA = data?.find((r) => r.driver_number === a.driverNumber)?.position ?? 99
    const posB = data?.find((r) => r.driver_number === b.driverNumber)?.position ?? 99
    return posA - posB
  })

  return (
    <section className="panel">
      <button
        type="button"
        onClick={onToggle}
        disabled={!hasResults}
        aria-expanded={open}
        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition ${
          hasResults ? 'hover:bg-surface-2' : 'cursor-default opacity-70'
        }`}
      >
        <span
          className={`h-9 w-1 shrink-0 ${
            state === 'live' ? 'bg-speed' : state === 'done' ? 'bg-line-bright' : 'bg-signal/40'
          }`}
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-display text-lg font-600 tracking-wide text-ink uppercase">
              {session.session_name}
            </span>
            <StateBadge state={state} />
          </span>
          <span data-timing className="block text-xs text-ink-faint">
            {new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(
              new Date(session.date_start),
            )}{' '}
            · {formatTime(new Date(session.date_start), locale)}
          </span>
        </span>
        {hasResults && (
          <span
            className={`shrink-0 text-signal transition-transform ${open ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ›
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && hasResults && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {isLoading && <LoadingRows rows={5} />}
            {error ? <ErrorState error={error} /> : null}

            {extras.weather && (
              <WeatherLine
                trackTemp={extras.weather.trackTemp}
                airTemp={extras.weather.airTemp}
                humidity={extras.weather.humidity}
                rain={extras.weather.rain}
              />
            )}

            {extras.fastestLap && (
              <FastestLapBadge
                driverLabel={
                  drivers.get(extras.fastestLap.driverNumber)?.name_acronym ??
                  `#${extras.fastestLap.driverNumber}`
                }
                duration={extras.fastestLap.duration}
                lapNumber={extras.fastestLap.lapNumber}
              />
            )}

            {data && data.length > 0 && (
              <ResultRows results={data} drivers={drivers} shape={shape} />
            )}
            {data && data.length === 0 && (
              <p className="border-t border-line px-4 py-6 text-center text-sm text-ink-faint">
                {t('weekend.noResults')}
              </p>
            )}

            {strategyRows.length > 0 && (
              <div className="border-t border-line">
                <p className="eyebrow px-4 py-2.5">{t('weekend.tyreStrategy')}</p>
                <ul className="divide-y divide-line/50">
                  {strategyRows.map((s) => (
                    <StrategyRow
                      key={s.driverNumber}
                      strategy={s}
                      driver={drivers.get(s.driverNumber)}
                    />
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function Weekend() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { meeting, sessions, driversByNumber, isLoading, restricted, error, refetch } =
    useWeekend()
  const [openKey, setOpenKey] = useState<number | null>(null)

  // Open the most recently finished session by default — during a race weekend
  // that is almost always the thing you opened the app to check.
  useEffect(() => {
    if (openKey != null || sessions.length === 0) return
    const done = sessions.filter((s) => sessionState(s) === 'done')
    const live = sessions.find((s) => sessionState(s) === 'live')
    const target = live ?? done[done.length - 1]
    if (target) setOpenKey(target.session_key)
  }, [sessions, openKey])

  if (isLoading) {
    return (
      <Page title={t('weekend.title')}>
        <LoadingRows rows={5} />
      </Page>
    )
  }

  if (restricted) {
    return (
      <Page title={t('weekend.title')} eyebrow={t('nav.weekend')}>
        <div className="panel relative overflow-hidden p-6">
          <div
            className="hazard absolute inset-x-0 top-0 h-1.5"
            style={{ ['--hazard' as string]: 'var(--color-flag-yellow)' }}
          />
          <h2 className="font-display text-xl font-700 tracking-wide text-ink uppercase">
            {t('weekend.restrictedTitle')}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-dim">
            {t('weekend.restrictedBody')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={OPENF1_PLANS}
              target="_blank"
              rel="noreferrer noopener"
              className="border border-flag-yellow/50 px-4 py-2 text-xs font-700 tracking-widest text-flag-yellow uppercase transition hover:bg-flag-yellow/10"
            >
              {t('live.restricted.cta')}
            </a>
            <Link
              to="/schedule"
              className="border border-line-bright px-4 py-2 text-xs font-700 tracking-widest text-ink-dim uppercase transition hover:text-ink"
            >
              {t('live.restricted.dismiss')}
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  if (error) {
    return (
      <Page title={t('weekend.title')}>
        <ErrorState error={error} onRetry={refetch} />
      </Page>
    )
  }

  if (!meeting || sessions.length === 0) {
    return (
      <Page title={t('weekend.title')}>
        <div className="panel px-6 py-14 text-center">
          <p className="text-sm text-ink-dim">{t('weekend.noWeekend')}</p>
        </div>
      </Page>
    )
  }

  const iso = countryIso(meeting.country_name)

  return (
    <Page>
      <div className="flex flex-col gap-4">
        <header className="panel relative overflow-hidden p-5">
          <div
            className="hazard absolute inset-x-0 top-0 h-1"
            style={{ ['--hazard' as string]: 'var(--color-speed)' }}
          />
          <p className="eyebrow mb-1.5">{t('weekend.title')}</p>
          <h1 className="flex items-center gap-3 font-display text-3xl leading-tight font-700 tracking-tight text-ink uppercase sm:text-4xl">
            <span aria-hidden>{flagEmoji(iso)}</span>
            {meeting.meeting_name}
          </h1>
          <p className="mt-1 text-sm text-ink-faint">
            {/* At many venues the circuit and the town share a name
                (Zandvoort, Monza, Spa) — don't print it twice. */}
            {[
              meeting.circuit_short_name,
              meeting.location === meeting.circuit_short_name ? null : meeting.location,
              localizedCountry(meeting.country_name, locale),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </header>

        {sessions.map((s) => (
          <SessionCard
            key={s.session_key}
            session={s}
            drivers={driversByNumber}
            open={openKey === s.session_key}
            onToggle={() => setOpenKey(openKey === s.session_key ? null : s.session_key)}
          />
        ))}
      </div>
    </Page>
  )
}

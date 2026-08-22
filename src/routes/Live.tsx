import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'

import { Page } from '../components/AppShell'
import { ErrorState, LoadingRows } from '../components/states'
import { useLatestSession, useLiveTiming, isSessionLive } from '../hooks/useLive'
import { hasLiveAccess } from '../lib/api/openf1'
import { OpenF1RestrictedError } from '../lib/api/openf1'
import { formatGap, formatLapTime } from '../lib/format'
import { tyreColor } from '../lib/teams'

const OPENF1_PLANS = 'https://openf1.org/#pricing'

/**
 * Shown when OpenF1's free tier locks us out. This is the expected state for
 * anyone without a sponsor key during a race weekend, so it explains the rule
 * rather than reading like a failure.
 */
function RestrictedNotice() {
  const { t } = useTranslation()
  return (
    <div className="panel relative overflow-hidden p-6 sm:p-8">
      <div
        className="hazard absolute inset-x-0 top-0 h-1.5"
        style={{ ['--hazard' as string]: 'var(--color-flag-yellow)' }}
      />
      <h2 className="font-display text-2xl font-700 tracking-wide text-ink uppercase sm:text-3xl">
        {t('live.restricted.title')}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">
        {t('live.restricted.body')}
      </p>
      <p className="mt-4 border-l-2 border-line-bright pl-3 font-mono text-xs text-ink-faint">
        {t('live.restricted.howTo')}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
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
          className="border border-line-bright px-4 py-2 text-xs font-700 tracking-widest text-ink-dim uppercase transition hover:border-ink-dim hover:text-ink"
        >
          {t('live.restricted.dismiss')}
        </Link>
      </div>
    </div>
  )
}

function TyrePill({ compound }: { compound?: string }) {
  if (!compound) return <span className="text-ink-faint">—</span>
  const color = tyreColor(compound)
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 font-mono text-[0.6rem] font-700"
      style={{ borderColor: color, color }}
      title={compound}
    >
      {compound.charAt(0).toUpperCase()}
    </span>
  )
}

/** The timing tower: position, driver, gap, interval, last lap, tyre. */
function TimingTower({ rows }: { rows: ReturnType<typeof useLiveTiming>['rows'] }) {
  const { t } = useTranslation()

  return (
    <div className="panel overflow-x-auto">
      <div className="grid min-w-[38rem] grid-cols-[2.5rem_1fr_5rem_5rem_6rem_3rem] gap-2 border-b border-line px-3 py-2.5">
        <span className="eyebrow">{t('live.position')}</span>
        <span className="eyebrow">{t('live.driver')}</span>
        <span className="eyebrow text-right">{t('live.gapToLeader')}</span>
        <span className="eyebrow text-right">{t('live.interval')}</span>
        <span className="eyebrow text-right">{t('live.lastLap')}</span>
        <span className="eyebrow text-center">{t('live.tyre')}</span>
      </div>

      <ol className="min-w-[38rem]">
        <AnimatePresence initial={false}>
          {rows.map((r) => {
            const color = r.driver?.team_colour ? `#${r.driver.team_colour}` : '#6b7280'
            return (
              <motion.li
                key={r.driverNumber}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
                className="team-edge grid grid-cols-[2.5rem_1fr_5rem_5rem_6rem_3rem] items-center gap-2 border-b border-line px-3 py-2.5 last:border-b-0"
                style={{ ['--team' as string]: color }}
              >
                <span
                  data-timing
                  className={`flex h-7 w-7 items-center justify-center font-mono text-xs font-700 ${
                    r.position === 1 ? 'bg-speed text-white' : 'bg-surface-3 text-ink'
                  }`}
                >
                  {r.position}
                </span>

                <div className="flex min-w-0 items-center gap-2">
                  <span
                    data-timing
                    className="font-mono text-xs font-700"
                    style={{ color }}
                  >
                    {r.driverNumber}
                  </span>
                  <span className="truncate text-sm font-semibold text-ink">
                    {r.driver?.name_acronym ?? r.driver?.broadcast_name ?? '—'}
                  </span>
                  {r.inPit && (
                    <span className="shrink-0 bg-flag-yellow px-1 font-mono text-[0.55rem] font-700 text-black">
                      {t('live.out')}
                    </span>
                  )}
                </div>

                <span data-timing className="text-right font-mono text-xs text-ink-dim">
                  {r.position === 1 ? '—' : formatGap(r.gapToLeader)}
                </span>
                <span data-timing className="text-right font-mono text-xs text-ink-dim">
                  {r.position === 1 ? '—' : formatGap(r.interval)}
                </span>
                <span
                  data-timing
                  className="text-right font-mono text-xs font-600"
                  style={{
                    color: r.isSessionBest ? 'var(--color-best-session)' : 'var(--color-ink)',
                  }}
                >
                  {formatLapTime(r.lastLap)}
                </span>
                <span className="flex justify-center">
                  <TyrePill compound={r.compound} />
                </span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ol>
    </div>
  )
}

function RaceControlFeed({ messages }: { messages: ReturnType<typeof useLiveTiming>['messages'] }) {
  const { t } = useTranslation()
  if (messages.length === 0) return null

  const flagColor = (flag: string | null) => {
    switch ((flag ?? '').toUpperCase()) {
      case 'YELLOW':
      case 'DOUBLE YELLOW':
        return 'var(--color-flag-yellow)'
      case 'RED':
        return 'var(--color-flag-red)'
      case 'GREEN':
      case 'CLEAR':
        return 'var(--color-gain)'
      default:
        return 'var(--color-line-bright)'
    }
  }

  return (
    <section className="panel">
      <h2 className="eyebrow border-b border-line px-4 py-2.5">{t('live.raceControl')}</h2>
      <ul className="max-h-72 divide-y divide-line overflow-y-auto">
        {messages.map((m, i) => (
          <li
            key={`${m.date}-${i}`}
            className="flex gap-3 px-4 py-2.5 text-xs"
            style={{ boxShadow: `inset 3px 0 0 0 ${flagColor(m.flag)}` }}
          >
            <span data-timing className="shrink-0 font-mono text-ink-faint">
              {new Date(m.date).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-ink-dim">{m.message}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function Live() {
  const { t } = useTranslation()
  const session = useLatestSession()

  const sessionKey = session.data?.session_key ?? null
  const live = isSessionLive(session.data?.date_start, session.data?.date_end)
  const timing = useLiveTiming(sessionKey, Boolean(sessionKey))

  // The free tier blocks everything during a session window — say so plainly.
  const restricted =
    timing.restricted || session.error instanceof OpenF1RestrictedError || !hasLiveAccess

  if (session.isLoading) {
    return (
      <Page title={t('live.title')}>
        <LoadingRows rows={8} />
      </Page>
    )
  }

  if (restricted) {
    return (
      <Page title={t('live.title')} eyebrow={t('nav.live')}>
        <RestrictedNotice />
      </Page>
    )
  }

  if (session.error) {
    return (
      <Page title={t('live.title')}>
        <ErrorState error={session.error} onRetry={() => void session.refetch()} />
      </Page>
    )
  }

  if (!session.data || !live) {
    return (
      <Page title={t('live.title')} eyebrow={t('nav.live')}>
        <div className="panel px-6 py-16 text-center">
          <p className="font-display text-2xl font-700 text-ink uppercase">
            {t('live.noSession')}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-dim">{t('live.noSessionBody')}</p>
          <Link
            to="/schedule"
            className="mt-6 inline-block border border-line-bright px-4 py-2 text-xs font-700 tracking-widest text-ink-dim uppercase transition hover:border-speed hover:text-speed"
          >
            {t('schedule.title')}
          </Link>
        </div>
      </Page>
    )
  }

  return (
    <Page
      title={session.data.session_name}
      eyebrow={
        <span className="pulse-live inline-flex items-center text-speed">
          {session.data.circuit_short_name} · {t('home.liveNow')}
        </span>
      }
    >
      <div className="flex flex-col gap-5">
        {timing.isLoading ? (
          <LoadingRows rows={10} />
        ) : timing.rows.length > 0 ? (
          <TimingTower rows={timing.rows} />
        ) : (
          <div className="panel px-6 py-12 text-center text-sm text-ink-dim">
            {t('live.connecting')}
          </div>
        )}
        <RaceControlFeed messages={timing.messages} />
      </div>
    </Page>
  )
}

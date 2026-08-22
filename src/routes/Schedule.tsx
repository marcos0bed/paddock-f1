import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { Page } from '../components/AppShell'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import { useLocale, useSeasonState } from '../hooks/useF1'
import { countryIso, flagEmoji, localizedCountry } from '../lib/countries'
import { formatDate, formatTime, raceDate } from '../lib/format'
import type { Race } from '../lib/api/types'

function RaceRow({ race, done }: { race: Race; done: boolean }) {
  const locale = useLocale()
  const { t } = useTranslation()
  const start = raceDate(race.date, race.time)
  const iso = countryIso(race.Circuit.Location.country)
  const isSprint = Boolean(race.Sprint)

  return (
    <Link
      to={`/race/${race.season}/${race.round}`}
      className={`group flex items-center gap-4 border-b border-line px-4 py-4 transition last:border-b-0 hover:bg-surface-2 ${
        done ? 'opacity-60 hover:opacity-100' : ''
      }`}
    >
      <span
        data-timing
        className="flex h-10 w-10 shrink-0 flex-col items-center justify-center border border-line bg-surface-2 font-mono text-sm font-700 text-ink-dim"
      >
        {race.round}
      </span>

      <span className="text-2xl leading-none" aria-hidden>
        {flagEmoji(iso)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-display text-lg font-600 tracking-wide text-ink uppercase">
            {race.raceName}
          </span>
          {isSprint && (
            <span className="border border-signal/40 px-1.5 py-0.5 text-[0.6rem] font-700 tracking-widest text-signal uppercase">
              {t('session.sprint')}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-ink-faint">
          {race.Circuit.circuitName} · {localizedCountry(race.Circuit.Location.country, locale)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p data-timing className="font-mono text-sm text-ink">
          {formatDate(start, locale, { day: '2-digit', month: 'short' })}
        </p>
        <p data-timing className="text-xs text-ink-faint">
          {formatTime(start, locale)}
        </p>
      </div>
    </Link>
  )
}

export function Schedule() {
  const { t } = useTranslation()
  const { season: seasonParam } = useParams()
  const season = seasonParam ?? 'current'
  const { races, past, upcoming, isLoading, error, refetch } = useSeasonState(season)

  if (isLoading) {
    return (
      <Page title={t('schedule.title')} eyebrow={t('common.season')}>
        <LoadingRows rows={10} />
      </Page>
    )
  }
  if (error) {
    return (
      <Page title={t('schedule.title')}>
        <ErrorState error={error} onRetry={() => void refetch()} />
      </Page>
    )
  }
  if (races.length === 0) {
    return (
      <Page title={t('schedule.title')}>
        <EmptyState message={t('schedule.noRaces')} />
      </Page>
    )
  }

  return (
    <Page
      title={t('schedule.title')}
      eyebrow={`${t('common.season')} ${races[0]?.season ?? ''}`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-6"
      >
        {upcoming.length > 0 && (
          <section>
            <h2 className="eyebrow mb-2 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 bg-speed" />
              {t('schedule.upcoming')}
              <span className="font-mono text-ink-faint">({upcoming.length})</span>
            </h2>
            <div className="panel">
              {upcoming.map((r) => (
                <RaceRow key={r.round} race={r} done={false} />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="eyebrow mb-2 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 bg-line-bright" />
              {t('schedule.completed')}
              <span className="font-mono text-ink-faint">({past.length})</span>
            </h2>
            <div className="panel">
              {[...past].reverse().map((r) => (
                <RaceRow key={r.round} race={r} done />
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </Page>
  )
}

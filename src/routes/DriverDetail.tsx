import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { Page } from '../components/AppShell'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import { useDriverSeasonResults, useDriverStandingsHistory, useLocale } from '../hooks/useF1'
import { useRaceName } from '../hooks/useRaceName'
import { flagEmoji, localizedNationality, nationalityIso } from '../lib/countries'
import { formatDate, formatPoints, isClassified, raceDate } from '../lib/format'
import { teamColor } from '../lib/teams'

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent?: string
  icon?: string
}) {
  return (
    <div className="panel px-4 py-3">
      <p className="eyebrow mb-1">{label}</p>
      <p
        data-timing
        className="flex items-center gap-1.5 font-mono text-2xl font-700 text-ink"
        style={accent ? { color: accent } : undefined}
      >
        {icon && (
          <span className="text-lg" aria-hidden>
            {icon}
          </span>
        )}
        {value}
      </p>
    </div>
  )
}

/** Championship placing per season — a career at a glance. */
function CareerChart({
  seasons,
  color,
}: {
  seasons: { season: string; position: number; points: number }[]
  color: string
}) {
  const { t } = useTranslation()
  if (seasons.length < 2) return null

  const worst = Math.max(...seasons.map((s) => s.position), 5)

  return (
    <section className="panel p-4">
      <h2 className="eyebrow mb-4">{t('driver.career')}</h2>
      <div className="flex h-44 gap-1 overflow-x-auto pb-1">
        {seasons.map((s) => {
          // Invert the axis: P1 must be the tallest bar, not the shortest.
          const height = ((worst - s.position + 1) / worst) * 100
          const isTitle = s.position === 1
          return (
            <Link
              key={s.season}
              to={`/season/${s.season}`}
              className="group flex h-full min-w-[1.75rem] flex-1 flex-col items-center gap-1"
              title={`${s.season} · P${s.position} · ${s.points}`}
            >
              <span
                data-timing
                className="font-mono text-[0.6rem] text-ink-faint group-hover:text-ink"
              >
                {s.position}
              </span>
              {/* flex-1 gives the bar a definite box to size its % against */}
              <span className="flex w-full flex-1 items-end">
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 6)}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="block w-full transition-opacity group-hover:opacity-100"
                  style={{
                    background: isTitle ? 'var(--color-best-session)' : color,
                    opacity: isTitle ? 1 : 0.7,
                  }}
                />
              </span>
              <span className="font-mono text-[0.55rem] text-ink-faint">
                {s.season.slice(2)}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export function DriverDetail() {
  const { t } = useTranslation()
  const locale = useLocale()
  const raceName = useRaceName()
  const { driverId = '' } = useParams()

  const history = useDriverStandingsHistory(driverId)
  const currentSeason = useDriverSeasonResults(driverId, 'current')

  if (history.isLoading) {
    return (
      <Page>
        <LoadingRows rows={8} />
      </Page>
    )
  }
  if (history.error) {
    return (
      <Page>
        <ErrorState error={history.error} onRetry={() => void history.refetch()} />
      </Page>
    )
  }

  const lists = history.data ?? []
  const latest = lists[lists.length - 1]
  const standing = latest?.DriverStandings?.[0]
  const driver = standing?.Driver

  if (!driver) {
    return (
      <Page title={t('common.notFound')}>
        <EmptyState message={t('common.notFoundBody')} />
      </Page>
    )
  }

  const team = standing?.Constructors?.[0]
  const color = teamColor(team?.constructorId)

  const titles = lists.filter((l) => l.DriverStandings?.[0]?.position === '1').length
  const careerWins = lists.reduce(
    (sum, l) => sum + Number(l.DriverStandings?.[0]?.wins ?? 0),
    0,
  )
  const careerPoints = lists.reduce(
    (sum, l) => sum + (Number.parseFloat(l.DriverStandings?.[0]?.points ?? '0') || 0),
    0,
  )
  const bestFinish = Math.min(
    ...lists.map((l) => Number(l.DriverStandings?.[0]?.position ?? 99)),
  )

  const careerSeries = lists.map((l) => ({
    season: l.season,
    position: Number(l.DriverStandings?.[0]?.position ?? 99),
    points: Number.parseFloat(l.DriverStandings?.[0]?.points ?? '0') || 0,
  }))

  return (
    <Page>
      <div className="flex flex-col gap-5">
        <header
          className="panel team-edge relative overflow-hidden p-5 sm:p-7"
          style={{ ['--team' as string]: color }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow mb-2">{team?.name}</p>
              <h1 className="font-display text-4xl leading-[0.95] font-700 tracking-tight uppercase sm:text-6xl">
                <span className="block text-ink-dim">{driver.givenName}</span>
                <span className="block text-ink">{driver.familyName}</span>
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-dim">
                <span className="text-lg leading-none" aria-hidden>
                  {flagEmoji(nationalityIso(driver.nationality))}
                </span>
                <span>{localizedNationality(driver.nationality, locale)}</span>
                {driver.dateOfBirth && (
                  <>
                    <span className="text-ink-faint">·</span>
                    <span>
                      {t('driver.born')}{' '}
                      {formatDate(new Date(driver.dateOfBirth), locale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </>
                )}
              </p>
            </div>
            {driver.permanentNumber && (
              <span
                data-timing
                className="font-display text-6xl leading-none font-700 sm:text-8xl"
                style={{ color, opacity: 0.9 }}
              >
                {driver.permanentNumber}
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label={t('driver.championships')}
            value={String(titles)}
            accent={titles > 0 ? 'var(--color-best-session)' : undefined}
            icon={titles > 0 ? '🏆' : undefined}
          />
          <Stat label={t('driver.careerWins')} value={String(careerWins)} />
          <Stat label={t('standings.pts')} value={formatPoints(careerPoints, locale)} />
          <Stat label={t('driver.bestFinish')} value={`P${bestFinish}`} />
        </div>

        <CareerChart seasons={careerSeries} color={color} />

        <section>
          <h2 className="eyebrow mb-2">{t('driver.seasonResults')}</h2>
          {currentSeason.isLoading ? (
            <LoadingRows rows={6} />
          ) : currentSeason.data?.length ? (
            <div className="panel">
              {currentSeason.data.map((race) => {
                const r = race.Results?.[0]
                if (!r) return null
                const finished = isClassified(r.status)
                return (
                  <Link
                    key={race.round}
                    to={`/race/${race.season}/${race.round}`}
                    className="flex items-center gap-3 border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-surface-2"
                  >
                    <span
                      data-timing
                      className={`flex h-8 w-8 shrink-0 items-center justify-center font-mono text-xs font-700 ${
                        r.position === '1'
                          ? 'bg-speed text-white'
                          : finished
                            ? 'bg-surface-3 text-ink'
                            : 'bg-surface-3 text-ink-faint'
                      }`}
                    >
                      {finished ? r.position : '—'}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">
                      {raceName(race.raceName)}
                    </span>
                    <span data-timing className="shrink-0 font-mono text-xs text-ink-faint">
                      {formatDate(raceDate(race.date, race.time), locale, {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span
                      data-timing
                      className="w-10 shrink-0 text-right font-mono text-sm font-700 text-ink"
                    >
                      {r.points}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </Page>
  )
}

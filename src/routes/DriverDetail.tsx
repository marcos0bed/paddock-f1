import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Page } from '../components/AppShell'
import { CareerBarChart, EntityHeader, StatTile } from '../components/EntityDetail'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import { useDriverSeasonResults, useDriverStandingsHistory, useLocale } from '../hooks/useF1'
import { useRaceName } from '../hooks/useRaceName'
import { flagEmoji, localizedNationality, nationalityIso } from '../lib/countries'
import { formatDate, formatPoints, isClassified, raceDate } from '../lib/format'
import { teamColor } from '../lib/teams'

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
    wins: Number(l.DriverStandings?.[0]?.wins ?? 0),
  }))

  return (
    <Page>
      <div className="flex flex-col gap-5">
        <EntityHeader
          color={color}
          eyebrow={team?.name}
          hero={driver.permanentNumber}
          title={
            <h1 className="font-display text-4xl leading-[0.95] font-700 tracking-tight uppercase sm:text-6xl">
              <span className="block text-ink-dim">{driver.givenName}</span>
              <span className="block text-ink">{driver.familyName}</span>
            </h1>
          }
          meta={
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
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label={t('driver.championships')}
            value={String(titles)}
            icon={titles > 0 ? '🏆' : undefined}
            accent={titles > 0 ? 'var(--color-best-session)' : undefined}
            hero={titles > 0}
          />
          <StatTile label={t('driver.careerWins')} value={String(careerWins)} accent={color} />
          <StatTile label={t('standings.pts')} value={formatPoints(careerPoints, locale)} />
          <StatTile label={t('driver.bestFinish')} value={`P${bestFinish}`} />
        </div>

        <CareerBarChart seasons={careerSeries} color={color} title={t('driver.career')} />

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

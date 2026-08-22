import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Page } from '../components/AppShell'
import {
  ConstructorStandingsTable,
  DriverStandingsTable,
} from '../components/StandingsTable'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import {
  useConstructorStandings,
  useDriverStandings,
  useLocale,
  useSchedule,
} from '../hooks/useF1'
import { useRaceName } from '../hooks/useRaceName'
import { countryIso, flagEmoji, nationalityIso } from '../lib/countries'
import { formatDate, formatPoints, raceDate } from '../lib/format'
import { teamColor } from '../lib/teams'

/** Champion banner — the headline fact about any past season. */
function ChampionBanner({
  eyebrow,
  name,
  sub,
  points,
  color,
  to,
  flag,
}: {
  eyebrow: string
  name: string
  sub?: string
  points: string
  color: string
  to: string
  flag?: string
}) {
  return (
    <Link
      to={to}
      className="panel team-edge relative flex items-center justify-between gap-4 overflow-hidden p-5 transition hover:bg-surface-2"
      style={{ ['--team' as string]: color }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
      <div className="relative min-w-0">
        <p className="eyebrow mb-1">{eyebrow}</p>
        <p className="flex items-center gap-2 font-display text-2xl leading-tight font-700 text-ink uppercase sm:text-3xl">
          {flag && (
            <span className="text-xl" aria-hidden>
              {flag}
            </span>
          )}
          <span className="truncate">{name}</span>
        </p>
        {sub && <p className="mt-0.5 truncate text-xs text-ink-faint">{sub}</p>}
      </div>
      <p data-timing className="relative shrink-0 font-mono text-2xl font-700" style={{ color }}>
        {points}
      </p>
    </Link>
  )
}

export function SeasonDetail() {
  const { t } = useTranslation()
  const locale = useLocale()
  const raceName = useRaceName()
  const { season = '' } = useParams()

  const schedule = useSchedule(season)
  const drivers = useDriverStandings(season)
  const teams = useConstructorStandings(season)

  const champion = drivers.data?.DriverStandings?.[0]
  const championTeam = teams.data?.ConstructorStandings?.[0]

  if (drivers.error && schedule.error) {
    return (
      <Page title={season}>
        <ErrorState error={drivers.error} onRetry={() => void drivers.refetch()} />
      </Page>
    )
  }

  return (
    <Page title={season} eyebrow={t('common.season')}>
      <div className="flex flex-col gap-6">
        {(drivers.isLoading || teams.isLoading) && <LoadingRows rows={3} />}

        <div className="grid gap-4 lg:grid-cols-2">
          {champion && (
            <ChampionBanner
              eyebrow={t('seasons.worldChampion')}
              name={`${champion.Driver.givenName} ${champion.Driver.familyName}`}
              sub={champion.Constructors[0]?.name}
              points={formatPoints(champion.points, locale)}
              color={teamColor(champion.Constructors[0]?.constructorId)}
              to={`/driver/${champion.Driver.driverId}`}
              flag={flagEmoji(nationalityIso(champion.Driver.nationality))}
            />
          )}
          {championTeam && (
            <ChampionBanner
              eyebrow={t('seasons.constructorChampion')}
              name={championTeam.Constructor.name}
              points={formatPoints(championTeam.points, locale)}
              color={teamColor(championTeam.Constructor.constructorId)}
              to={`/team/${championTeam.Constructor.constructorId}`}
            />
          )}
        </div>

        {/* Calendar with winners, the quickest way to scan a season */}
        <section>
          <h2 className="eyebrow mb-2">{t('schedule.title')}</h2>
          {schedule.isLoading ? (
            <LoadingRows rows={8} />
          ) : schedule.data?.length ? (
            <div className="panel">
              {schedule.data.map((race) => {
                const iso = countryIso(race.Circuit.Location.country)
                return (
                  <Link
                    key={race.round}
                    to={`/race/${race.season}/${race.round}`}
                    className="flex items-center gap-3 border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-surface-2"
                  >
                    <span
                      data-timing
                      className="w-6 shrink-0 font-mono text-xs text-ink-faint"
                    >
                      {race.round}
                    </span>
                    <span className="text-lg leading-none" aria-hidden>
                      {flagEmoji(iso)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                      {raceName(race.raceName)}
                    </span>
                    <span data-timing className="shrink-0 font-mono text-xs text-ink-faint">
                      {formatDate(raceDate(race.date, race.time), locale, {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState message={t('schedule.noRaces')} />
          )}
        </section>

        {drivers.data?.DriverStandings?.length ? (
          <section>
            <h2 className="eyebrow mb-2">{t('standings.drivers')}</h2>
            <DriverStandingsTable standings={drivers.data.DriverStandings} />
          </section>
        ) : null}

        {teams.data?.ConstructorStandings?.length ? (
          <section>
            <h2 className="eyebrow mb-2">{t('standings.constructors')}</h2>
            <ConstructorStandingsTable standings={teams.data.ConstructorStandings} />
          </section>
        ) : null}
      </div>
    </Page>
  )
}

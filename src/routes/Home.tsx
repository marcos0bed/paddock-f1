import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Page } from '../components/AppShell'
import { NextRaceHero } from '../components/NextRaceHero'
import { ErrorState, LoadingRows } from '../components/states'
import {
  useConstructorStandings,
  useDriverStandings,
  useLocale,
  useRaceResults,
  useSeasonState,
} from '../hooks/useF1'
import { flagEmoji, nationalityIso } from '../lib/countries'
import { formatDate, formatPoints, raceDate } from '../lib/format'
import { teamColor } from '../lib/teams'

/** Compact "who's leading" tile, one for each championship. */
function LeaderCard({
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
      className="panel team-edge group flex flex-col justify-between gap-4 p-4 transition hover:bg-surface-2"
      style={{ ['--team' as string]: color }}
    >
      <p className="eyebrow">{eyebrow}</p>
      <div>
        <p className="flex items-center gap-2 font-display text-2xl leading-tight font-700 text-ink uppercase">
          {flag && (
            <span className="text-lg" aria-hidden>
              {flag}
            </span>
          )}
          <span className="truncate">{name}</span>
        </p>
        {sub && <p className="mt-0.5 truncate text-xs text-ink-faint">{sub}</p>}
      </div>
      <p data-timing className="font-mono text-3xl font-700" style={{ color }}>
        {points}
      </p>
    </Link>
  )
}

function LastRaceCard({ season, round }: { season: string; round: string }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const { data, isLoading } = useRaceResults(season, round)

  if (isLoading) return <LoadingRows rows={3} />
  if (!data?.Results?.length) return null

  const podium = data.Results.slice(0, 3)

  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="eyebrow">{t('home.lastRace')}</p>
          <h2 className="mt-0.5 font-display text-xl font-600 text-ink uppercase">
            {data.raceName}
          </h2>
        </div>
        <span className="text-xs text-ink-faint">
          {formatDate(raceDate(data.date, data.time), locale, {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </div>

      <ol className="divide-y divide-line">
        {podium.map((r, i) => {
          const color = teamColor(r.Constructor.constructorId)
          const iso = nationalityIso(r.Driver.nationality)
          return (
            <li
              key={r.Driver.driverId}
              className="team-edge flex items-center gap-3 px-4 py-3"
              style={{ ['--team' as string]: color }}
            >
              <span
                data-timing
                className={`flex h-7 w-7 items-center justify-center font-mono text-xs font-700 ${
                  i === 0 ? 'bg-speed text-white' : 'bg-surface-3 text-ink-dim'
                }`}
              >
                {r.position}
              </span>
              {iso && (
                <span className="text-sm" aria-hidden>
                  {flagEmoji(iso)}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">
                {r.Driver.familyName}
              </span>
              <span className="hidden truncate text-xs text-ink-faint sm:block">
                {r.Constructor.name}
              </span>
              <span data-timing className="font-mono text-xs text-ink-dim">
                {r.Time?.time ?? r.status}
              </span>
            </li>
          )
        })}
      </ol>

      <Link
        to={`/race/${season}/${round}`}
        className="flex items-center justify-between border-t border-line px-4 py-3 text-xs font-semibold tracking-widest text-ink-dim uppercase transition hover:bg-surface-2 hover:text-ink"
      >
        {t('race.results')}
        <span className="text-signal">→</span>
      </Link>
    </section>
  )
}

export function Home() {
  const { t } = useTranslation()
  const locale = useLocale()
  const season = useSeasonState()
  const drivers = useDriverStandings()
  const teams = useConstructorStandings()

  if (season.isLoading) {
    return (
      <Page>
        <LoadingRows rows={6} />
      </Page>
    )
  }

  if (season.error) {
    return (
      <Page>
        <ErrorState error={season.error} onRetry={() => void season.refetch()} />
      </Page>
    )
  }

  const topDriver = drivers.data?.DriverStandings?.[0]
  const topTeam = teams.data?.ConstructorStandings?.[0]

  return (
    <Page>
      <div className="flex flex-col gap-5">
        {season.next ? (
          <NextRaceHero race={season.next} totalRounds={season.races.length} />
        ) : (
          <div className="panel px-6 py-12 text-center">
            <p className="eyebrow mb-2">{t('common.season')}</p>
            <p className="font-display text-3xl font-700 text-ink uppercase">
              {t('home.seasonOver')}
            </p>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          {topDriver && (
            <LeaderCard
              eyebrow={t('home.championshipLeader')}
              name={`${topDriver.Driver.givenName} ${topDriver.Driver.familyName}`}
              sub={topDriver.Constructors[0]?.name}
              points={`${formatPoints(topDriver.points, locale)} ${t('common.points')}`}
              color={teamColor(topDriver.Constructors[0]?.constructorId)}
              to={`/driver/${topDriver.Driver.driverId}`}
              flag={flagEmoji(nationalityIso(topDriver.Driver.nationality))}
            />
          )}
          {topTeam && (
            <LeaderCard
              eyebrow={t('home.constructorLeader')}
              name={topTeam.Constructor.name}
              points={`${formatPoints(topTeam.points, locale)} ${t('common.points')}`}
              color={teamColor(topTeam.Constructor.constructorId)}
              to={`/team/${topTeam.Constructor.constructorId}`}
            />
          )}
        </div>

        {season.last && <LastRaceCard season={season.last.season} round={season.last.round} />}
      </div>
    </Page>
  )
}

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { Page } from '../components/AppShell'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import {
  useLocale,
  useQualifyingResults,
  useRace,
  useRaceResults,
  useSprintResults,
} from '../hooks/useF1'
import { countryIso, flagEmoji, localizedCountry, nationalityIso } from '../lib/countries'
import { formatDateLong, isClassified, raceDate } from '../lib/format'
import { teamColor } from '../lib/teams'
import type { QualifyingResult, RaceResult } from '../lib/api/types'

type Tab = 'race' | 'qualifying' | 'sprint'

function ResultsTable({ results }: { results: RaceResult[] }) {
  const { t } = useTranslation()

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[34rem]">
        <thead>
          <tr className="border-b border-line">
            <th className="eyebrow px-3 py-2.5 text-left">{t('standings.pos')}</th>
            <th className="eyebrow px-3 py-2.5 text-left">{t('standings.driver')}</th>
            <th className="eyebrow px-3 py-2.5 text-right">{t('race.grid')}</th>
            <th className="eyebrow px-3 py-2.5 text-right">{t('race.laps')}</th>
            <th className="eyebrow px-3 py-2.5 text-right">{t('race.time')}</th>
            <th className="eyebrow px-3 py-2.5 text-right">{t('standings.pts')}</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const color = teamColor(r.Constructor.constructorId)
            const finished = isClassified(r.status)
            const gained = Number(r.grid) - Number(r.position)

            return (
              <motion.tr
                key={r.Driver.driverId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className="team-edge border-b border-line last:border-b-0 hover:bg-surface-2"
                style={{ ['--team' as string]: color }}
              >
                <td data-timing className="px-3 py-3 font-mono text-sm font-700 text-ink">
                  {finished ? r.position : '—'}
                </td>
                <td className="px-3 py-3">
                  <Link to={`/driver/${r.Driver.driverId}`} className="group block min-w-0">
                    <span className="flex items-center gap-1.5">
                      <span className="text-xs" aria-hidden>
                        {flagEmoji(nationalityIso(r.Driver.nationality))}
                      </span>
                      <span className="truncate text-sm font-semibold text-ink group-hover:text-signal">
                        {r.Driver.familyName}
                      </span>
                    </span>
                    <span className="block truncate text-[0.7rem] text-ink-faint">
                      {r.Constructor.name}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-3 text-right">
                  <span data-timing className="font-mono text-sm text-ink-dim">
                    {r.grid}
                  </span>
                  {finished && gained !== 0 && (
                    <span
                      className="ml-1.5 font-mono text-[0.65rem]"
                      style={{ color: gained > 0 ? 'var(--color-gain)' : 'var(--color-loss)' }}
                    >
                      {gained > 0 ? `▲${gained}` : `▼${Math.abs(gained)}`}
                    </span>
                  )}
                </td>
                <td data-timing className="px-3 py-3 text-right font-mono text-sm text-ink-dim">
                  {r.laps}
                </td>
                <td className="px-3 py-3 text-right">
                  <span
                    data-timing
                    className={`font-mono text-xs ${finished ? 'text-ink' : 'text-ink-faint'}`}
                  >
                    {r.Time?.time ?? r.status}
                  </span>
                  {r.FastestLap?.rank === '1' && (
                    <span
                      className="ml-1.5 text-[0.6rem] font-700"
                      style={{ color: 'var(--color-best-session)' }}
                      title={t('race.fastestLap')}
                    >
                      ⏱
                    </span>
                  )}
                </td>
                <td data-timing className="px-3 py-3 text-right font-mono text-sm font-700 text-ink">
                  {r.points}
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function QualifyingTable({ results }: { results: QualifyingResult[] }) {
  const { t } = useTranslation()

  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[32rem]">
        <thead>
          <tr className="border-b border-line">
            <th className="eyebrow px-3 py-2.5 text-left">{t('standings.pos')}</th>
            <th className="eyebrow px-3 py-2.5 text-left">{t('standings.driver')}</th>
            <th className="eyebrow px-3 py-2.5 text-right">Q1</th>
            <th className="eyebrow px-3 py-2.5 text-right">Q2</th>
            <th className="eyebrow px-3 py-2.5 text-right">Q3</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const color = teamColor(r.Constructor.constructorId)
            return (
              <tr
                key={r.Driver.driverId}
                className="team-edge border-b border-line last:border-b-0 hover:bg-surface-2"
                style={{ ['--team' as string]: color }}
              >
                <td data-timing className="px-3 py-3 font-mono text-sm font-700 text-ink">
                  {r.position}
                </td>
                <td className="px-3 py-3">
                  <Link to={`/driver/${r.Driver.driverId}`} className="group block min-w-0">
                    <span className="truncate text-sm font-semibold text-ink group-hover:text-signal">
                      {r.Driver.familyName}
                    </span>
                    <span className="block truncate text-[0.7rem] text-ink-faint">
                      {r.Constructor.name}
                    </span>
                  </Link>
                </td>
                {[r.Q1, r.Q2, r.Q3].map((q, qi) => (
                  <td
                    key={qi}
                    data-timing
                    className="px-3 py-3 text-right font-mono text-xs"
                    style={{
                      // Purple marks the best time in each segment, as on TV
                      color: q && r.position === '1' && qi === 2 ? 'var(--color-best-session)' : undefined,
                    }}
                  >
                    <span className={q ? 'text-ink' : 'text-ink-faint'}>{q || '—'}</span>
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function RaceDetail() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { season = '', round = '' } = useParams()
  const [tab, setTab] = useState<Tab>('race')

  const race = useRace(season, round)
  const results = useRaceResults(season, round)
  const qualifying = useQualifyingResults(season, round)
  const sprint = useSprintResults(season, round)

  const info = race.data ?? results.data
  const hasSprint = Boolean(sprint.data?.SprintResults?.length)

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'race', label: t('race.results'), show: true },
    { id: 'qualifying', label: t('race.qualifying'), show: true },
    { id: 'sprint', label: t('race.sprint'), show: hasSprint },
  ]

  if (race.isLoading && results.isLoading) {
    return (
      <Page>
        <LoadingRows rows={10} />
      </Page>
    )
  }

  if (race.error && results.error) {
    return (
      <Page>
        <ErrorState error={race.error} onRetry={() => void race.refetch()} />
      </Page>
    )
  }

  if (!info) {
    return (
      <Page title={t('common.notFound')}>
        <EmptyState message={t('common.notFoundBody')} />
      </Page>
    )
  }

  const start = raceDate(info.date, info.time)
  const iso = countryIso(info.Circuit.Location.country)

  return (
    <Page>
      <div className="flex flex-col gap-5">
        <header className="panel relative overflow-hidden p-5 sm:p-7">
          <div
            className="hazard absolute inset-x-0 top-0 h-1"
            style={{ ['--hazard' as string]: 'var(--color-speed)' }}
          />
          <div className="flex items-center gap-2">
            <span className="eyebrow">
              {t('common.round')} {info.round}
            </span>
            <span className="h-3 w-px bg-line-bright" />
            <Link to={`/season/${info.season}`} className="eyebrow hover:text-signal">
              {info.season}
            </Link>
          </div>
          <h1 className="mt-2 flex items-center gap-3 font-display text-3xl leading-tight font-700 tracking-tight text-ink uppercase sm:text-5xl">
            <span aria-hidden>{flagEmoji(iso)}</span>
            {info.raceName}
          </h1>
          <p className="mt-2 text-sm text-ink-dim">
            {info.Circuit.circuitName} · {info.Circuit.Location.locality},{' '}
            {localizedCountry(info.Circuit.Location.country, locale)}
          </p>
          <p className="mt-0.5 text-xs text-ink-faint capitalize">
            {formatDateLong(start, locale)}
          </p>
        </header>

        <div role="tablist" className="flex border border-line bg-surface">
          {tabs
            .filter((x) => x.show)
            .map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => setTab(x.id)}
                className={`relative flex-1 px-3 py-2.5 text-xs font-700 tracking-widest uppercase transition ${
                  tab === x.id ? 'text-ink' : 'text-ink-faint hover:text-ink-dim'
                }`}
              >
                {x.label}
                {tab === x.id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-speed" />}
              </button>
            ))}
        </div>

        {tab === 'race' &&
          (results.isLoading ? (
            <LoadingRows rows={10} />
          ) : results.data?.Results?.length ? (
            <ResultsTable results={results.data.Results} />
          ) : (
            <EmptyState
              message={start.getTime() > Date.now() ? t('race.notRunYet') : t('race.noResults')}
            />
          ))}

        {tab === 'qualifying' &&
          (qualifying.isLoading ? (
            <LoadingRows rows={10} />
          ) : qualifying.data?.QualifyingResults?.length ? (
            <QualifyingTable results={qualifying.data.QualifyingResults} />
          ) : (
            <EmptyState message={t('race.noResults')} />
          ))}

        {tab === 'sprint' && sprint.data?.SprintResults?.length ? (
          <ResultsTable results={sprint.data.SprintResults} />
        ) : null}
      </div>
    </Page>
  )
}

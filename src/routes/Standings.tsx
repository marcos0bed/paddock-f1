import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Page } from '../components/AppShell'
import {
  ConstructorStandingsTable,
  DriverStandingsTable,
} from '../components/StandingsTable'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import { useConstructorStandings, useDriverStandings } from '../hooks/useF1'

type Tab = 'drivers' | 'constructors'

/** Segmented control — two championships, one screen. */
function Tabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const { t } = useTranslation()
  const tabs: { id: Tab; label: string }[] = [
    { id: 'drivers', label: t('standings.drivers') },
    { id: 'constructors', label: t('standings.constructors') },
  ]

  return (
    <div role="tablist" className="flex border border-line bg-surface">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex-1 px-4 py-2.5 text-xs font-700 tracking-widest uppercase transition ${
            value === tab.id ? 'text-ink' : 'text-ink-faint hover:text-ink-dim'
          }`}
        >
          {tab.label}
          {value === tab.id && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-speed" />}
        </button>
      ))}
    </div>
  )
}

export function Standings() {
  const { t } = useTranslation()
  const { season: seasonParam } = useParams()
  const season = seasonParam ?? 'current'
  const [tab, setTab] = useState<Tab>('drivers')

  const drivers = useDriverStandings(season)
  const teams = useConstructorStandings(season)
  const active = tab === 'drivers' ? drivers : teams

  const round = drivers.data?.round ?? teams.data?.round
  const resolvedSeason = drivers.data?.season ?? teams.data?.season ?? ''

  return (
    <Page
      title={t('standings.title')}
      eyebrow={
        round
          ? `${resolvedSeason} · ${t('standings.afterRound', { round })}`
          : `${t('common.season')} ${resolvedSeason}`
      }
    >
      <div className="flex flex-col gap-4">
        <Tabs value={tab} onChange={setTab} />

        {active.isLoading && <LoadingRows rows={10} />}
        {active.error && (
          <ErrorState error={active.error} onRetry={() => void active.refetch()} />
        )}

        {!active.isLoading &&
          !active.error &&
          (tab === 'drivers' ? (
            drivers.data?.DriverStandings?.length ? (
              <DriverStandingsTable standings={drivers.data.DriverStandings} />
            ) : (
              <EmptyState />
            )
          ) : teams.data?.ConstructorStandings?.length ? (
            <ConstructorStandingsTable standings={teams.data.ConstructorStandings} />
          ) : (
            <EmptyState />
          ))}
      </div>
    </Page>
  )
}

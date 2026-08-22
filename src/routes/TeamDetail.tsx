import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Page } from '../components/AppShell'
import { CareerBarChart, EntityHeader, StatTile } from '../components/EntityDetail'
import { EmptyState, ErrorState, LoadingRows } from '../components/states'
import { useConstructorStandingsHistory, useLocale } from '../hooks/useF1'
import { flagEmoji, localizedNationality, nationalityIso } from '../lib/countries'
import { formatPoints } from '../lib/format'
import { teamStyle } from '../lib/teams'

export function TeamDetail() {
  const { t } = useTranslation()
  const locale = useLocale()
  const { constructorId = '' } = useParams()

  const history = useConstructorStandingsHistory(constructorId)
  const style = teamStyle(constructorId)

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
  const currentStanding = latest?.ConstructorStandings?.[0]
  const constructor = currentStanding?.Constructor

  if (!constructor) {
    return (
      <Page title={t('common.notFound')}>
        <EmptyState message={t('common.notFoundBody')} />
      </Page>
    )
  }

  const titles = lists.filter((l) => l.ConstructorStandings?.[0]?.position === '1').length
  const totalWins = lists.reduce(
    (s, l) => s + Number(l.ConstructorStandings?.[0]?.wins ?? 0),
    0,
  )
  const currentPoints = currentStanding?.points ?? '0'

  const careerSeries = lists.map((l) => {
    const s = l.ConstructorStandings?.[0]
    return {
      season: l.season,
      position: Number(s?.position ?? 99),
      points: Number.parseFloat(s?.points ?? '0') || 0,
      wins: Number(s?.wins ?? 0),
    }
  })

  return (
    <Page>
      <div className="flex flex-col gap-5">
        <EntityHeader
          color={style.color}
          eyebrow={
            <>
              <span aria-hidden>{flagEmoji(nationalityIso(constructor.nationality))}</span>
              {localizedNationality(constructor.nationality, locale)}
            </>
          }
          hero={currentStanding ? `P${currentStanding.position}` : undefined}
          heroLabel={t('standings.title')}
          title={
            <h1
              className="font-display text-4xl leading-none font-700 tracking-tight uppercase sm:text-6xl"
              style={{ color: style.color }}
            >
              {constructor.name}
            </h1>
          }
        />

        <div className="grid grid-cols-3 gap-3">
          <StatTile
            label={t('team.championships')}
            value={String(titles)}
            icon={titles > 0 ? '🏆' : undefined}
            accent={titles > 0 ? 'var(--color-best-session)' : undefined}
            hero={titles > 0}
          />
          <StatTile label={t('standings.wins')} value={String(totalWins)} accent={style.color} />
          <StatTile
            label={t('team.seasonPoints')}
            value={formatPoints(currentPoints, locale)}
          />
        </div>

        <CareerBarChart seasons={careerSeries} color={style.color} title={t('team.history')} />
      </div>
    </Page>
  )
}

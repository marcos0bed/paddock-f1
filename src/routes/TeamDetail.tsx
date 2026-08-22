import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { Page } from '../components/AppShell'
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
  const constructor = latest?.ConstructorStandings?.[0]?.Constructor

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
  const currentPoints = latest?.ConstructorStandings?.[0]?.points ?? '0'
  const worst = Math.max(
    ...lists.map((l) => Number(l.ConstructorStandings?.[0]?.position ?? 10)),
    5,
  )

  return (
    <Page>
      <div className="flex flex-col gap-5">
        <header
          className="panel team-edge relative overflow-hidden p-5 sm:p-7"
          style={{ ['--team' as string]: style.color }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
            style={{ background: `radial-gradient(circle, ${style.color}, transparent 70%)` }}
          />
          <div className="relative">
            <p className="eyebrow mb-2 flex items-center gap-2">
              <span aria-hidden>{flagEmoji(nationalityIso(constructor.nationality))}</span>
              {localizedNationality(constructor.nationality, locale)}
            </p>
            <h1
              className="font-display text-4xl leading-none font-700 tracking-tight uppercase sm:text-6xl"
              style={{ color: style.color }}
            >
              {constructor.name}
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-3">
          <div className="panel px-4 py-3">
            <p className="eyebrow mb-1">{t('team.championships')}</p>
            <p
              data-timing
              className="font-mono text-2xl font-700"
              style={{ color: titles > 0 ? 'var(--color-best-session)' : 'var(--color-ink)' }}
            >
              {titles}
            </p>
          </div>
          <div className="panel px-4 py-3">
            <p className="eyebrow mb-1">{t('standings.wins')}</p>
            <p data-timing className="font-mono text-2xl font-700 text-ink">
              {totalWins}
            </p>
          </div>
          <div className="panel px-4 py-3">
            <p className="eyebrow mb-1">{t('team.seasonPoints')}</p>
            <p data-timing className="font-mono text-2xl font-700 text-ink">
              {formatPoints(currentPoints, locale)}
            </p>
          </div>
        </div>

        <section className="panel p-4">
          <h2 className="eyebrow mb-4">{t('team.history')}</h2>
          <div className="flex h-44 gap-1 overflow-x-auto pb-1">
            {lists.map((l) => {
              const s = l.ConstructorStandings?.[0]
              const pos = Number(s?.position ?? worst)
              const height = ((worst - pos + 1) / worst) * 100
              const isTitle = pos === 1
              return (
                <Link
                  key={l.season}
                  to={`/season/${l.season}`}
                  className="group flex h-full min-w-[1.75rem] flex-1 flex-col items-center gap-1"
                  title={`${l.season} · P${pos} · ${s?.points ?? 0}`}
                >
                  <span
                    data-timing
                    className="font-mono text-[0.6rem] text-ink-faint group-hover:text-ink"
                  >
                    {pos}
                  </span>
                  <span className="flex w-full flex-1 items-end">
                    <motion.span
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 6)}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="block w-full"
                      style={{
                        background: isTitle ? 'var(--color-best-session)' : style.color,
                        opacity: isTitle ? 1 : 0.7,
                      }}
                    />
                  </span>
                  <span className="font-mono text-[0.55rem] text-ink-faint">
                    {l.season.slice(2)}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </Page>
  )
}

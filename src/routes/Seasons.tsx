import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { Page } from '../components/AppShell'
import { ErrorState, LoadingRows } from '../components/states'
import { useSeasons } from '../hooks/useF1'

/**
 * The full archive back to 1950. Rendered as a dense grid of year tiles rather
 * than a list — 75+ rows of one number each would be a lot of scrolling.
 */
export function Seasons() {
  const { t } = useTranslation()
  const { data, isLoading, error, refetch } = useSeasons()

  return (
    <Page title={t('seasons.title')} eyebrow={t('seasons.subtitle')}>
      {isLoading && <LoadingRows rows={6} />}
      {error && <ErrorState error={error} onRetry={() => void refetch()} />}

      {data && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
          {data.map((s, i) => (
            <motion.div
              key={s.season}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.008, 0.5), duration: 0.3 }}
            >
              <Link
                to={`/season/${s.season}`}
                className="panel group flex aspect-4/3 flex-col items-center justify-center gap-1 transition hover:border-speed hover:bg-surface-2"
              >
                <span
                  data-timing
                  className="font-mono text-xl font-700 text-ink transition group-hover:text-speed"
                >
                  {s.season}
                </span>
                <span className="h-px w-5 bg-line-bright transition group-hover:w-8 group-hover:bg-speed" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </Page>
  )
}

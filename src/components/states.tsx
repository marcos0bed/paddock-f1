import { useTranslation } from 'react-i18next'

/** Skeleton rows that match the timing-table rhythm, so nothing jumps on load. */
export function LoadingRows({ rows = 8 }: { rows?: number }) {
  const { t } = useTranslation()
  return (
    <div className="panel divide-y divide-line" role="status" aria-busy="true">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="shimmer flex items-center gap-4 px-4 py-3.5">
          <div className="h-4 w-6 bg-surface-3" />
          <div className="h-4 flex-1 bg-surface-3" style={{ maxWidth: `${45 + ((i * 13) % 30)}%` }} />
          <div className="h-4 w-12 bg-surface-3" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  const { t } = useTranslation()
  const detail = error instanceof Error ? error.message : null

  return (
    <div className="panel flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="hazard h-1.5 w-24" style={{ ['--hazard' as string]: 'var(--color-flag-red)' }} />
      <h2 className="font-display text-2xl font-600 tracking-wide text-ink uppercase">
        {t('common.error')}
      </h2>
      <p className="max-w-sm text-sm text-ink-dim">{detail ?? t('common.errorBody')}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 border border-line-bright px-4 py-2 text-xs font-semibold tracking-widest text-ink uppercase transition hover:border-speed hover:text-speed"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}

export function EmptyState({ message }: { message?: string }) {
  const { t } = useTranslation()
  return (
    <div className="panel px-6 py-14 text-center">
      <p className="text-sm text-ink-faint">{message ?? t('common.noData')}</p>
    </div>
  )
}

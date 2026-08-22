import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { useLocale } from '../hooks/useF1'
import { flagEmoji, localizedNationality, nationalityIso } from '../lib/countries'
import { formatPoints } from '../lib/format'
import { teamColor, teamStyle } from '../lib/teams'
import type { ConstructorStanding, DriverStanding } from '../lib/api/types'

/** Points bar relative to the leader — turns a column of numbers into a shape. */
function PointsBar({ ratio, color }: { ratio: number; color: string }) {
  return (
    <div className="mt-1.5 h-[3px] w-full bg-surface-3" aria-hidden>
      <motion.div
        className="h-full origin-left"
        style={{ background: color }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(ratio, 0.015) }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

function PositionBadge({ position, isLeader }: { position: string; isLeader: boolean }) {
  return (
    <span
      data-timing
      className={`flex h-9 w-9 shrink-0 items-center justify-center font-mono text-sm font-700 ${
        isLeader ? 'bg-speed text-white' : 'bg-surface-3 text-ink-dim'
      }`}
    >
      {position}
    </span>
  )
}

export function DriverStandingsTable({ standings }: { standings: DriverStanding[] }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const leaderPoints = Number.parseFloat(standings[0]?.points ?? '0') || 1

  return (
    <div className="panel">
      <div className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 border-b border-line px-3 py-2.5 sm:grid-cols-[2.25rem_1fr_5rem_4rem] sm:px-4">
        <span className="eyebrow">{t('standings.pos')}</span>
        <span className="eyebrow">{t('standings.driver')}</span>
        <span className="eyebrow hidden text-right sm:block">{t('standings.wins')}</span>
        <span className="eyebrow text-right">{t('standings.pts')}</span>
      </div>

      <ol>
        {standings.map((s, i) => {
          const team = s.Constructors[0]
          const color = teamColor(team?.constructorId)
          const iso = nationalityIso(s.Driver.nationality)
          const points = Number.parseFloat(s.points) || 0

          return (
            <motion.li
              key={s.Driver.driverId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4), duration: 0.35 }}
              className="team-edge border-b border-line last:border-b-0"
              style={{ ['--team' as string]: color }}
            >
              <Link
                to={`/driver/${s.Driver.driverId}`}
                className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-3 py-3 transition hover:bg-surface-2 sm:grid-cols-[2.25rem_1fr_5rem_4rem] sm:px-4"
              >
                <PositionBadge position={s.positionText} isLeader={i === 0} />

                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    {iso && (
                      <span className="text-sm leading-none" aria-hidden>
                        {flagEmoji(iso)}
                      </span>
                    )}
                    <span className="truncate font-semibold text-ink">
                      <span className="text-ink-dim">{s.Driver.givenName} </span>
                      {s.Driver.familyName}
                    </span>
                    {i === 0 && (
                      <span className="text-sm leading-none" aria-hidden>
                        👑
                      </span>
                    )}
                    {s.Driver.code && (
                      <span
                        data-timing
                        className="hidden font-mono text-[0.7rem] tracking-wider text-ink-faint sm:inline"
                      >
                        {s.Driver.code}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-xs text-ink-faint">{team?.name}</span>
                    <span className="sr-only">
                      {localizedNationality(s.Driver.nationality, locale)}
                    </span>
                  </div>
                  <PointsBar ratio={points / leaderPoints} color={color} />
                </div>

                <span
                  data-timing
                  className="hidden text-right font-mono text-sm text-ink-dim sm:block"
                >
                  {s.wins}
                </span>

                <span
                  data-timing
                  className="text-right font-mono text-lg font-700 text-ink tabular-nums"
                >
                  {formatPoints(s.points, locale)}
                </span>
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

export function ConstructorStandingsTable({ standings }: { standings: ConstructorStanding[] }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const leaderPoints = Number.parseFloat(standings[0]?.points ?? '0') || 1

  return (
    <div className="panel">
      <div className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 border-b border-line px-3 py-2.5 sm:grid-cols-[2.25rem_1fr_5rem_4rem] sm:px-4">
        <span className="eyebrow">{t('standings.pos')}</span>
        <span className="eyebrow">{t('standings.team')}</span>
        <span className="eyebrow hidden text-right sm:block">{t('standings.wins')}</span>
        <span className="eyebrow text-right">{t('standings.pts')}</span>
      </div>

      <ol>
        {standings.map((s, i) => {
          const style = teamStyle(s.Constructor.constructorId)
          const points = Number.parseFloat(s.points) || 0

          return (
            <motion.li
              key={s.Constructor.constructorId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4), duration: 0.35 }}
              className="team-edge border-b border-line last:border-b-0"
              style={{ ['--team' as string]: style.color }}
            >
              <Link
                to={`/team/${s.Constructor.constructorId}`}
                className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-3 py-3 transition hover:bg-surface-2 sm:grid-cols-[2.25rem_1fr_5rem_4rem] sm:px-4"
              >
                <PositionBadge position={s.positionText} isLeader={i === 0} />

                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate font-semibold text-ink">{s.Constructor.name}</span>
                    <span
                      data-timing
                      className="hidden font-mono text-[0.7rem] tracking-wider text-ink-faint sm:inline"
                    >
                      {style.short}
                    </span>
                  </div>
                  <span className="text-xs text-ink-faint">
                    {localizedNationality(s.Constructor.nationality, locale)}
                  </span>
                  <PointsBar ratio={points / leaderPoints} color={style.color} />
                </div>

                <span
                  data-timing
                  className="hidden text-right font-mono text-sm text-ink-dim sm:block"
                >
                  {s.wins}
                </span>

                <span data-timing className="text-right font-mono text-lg font-700 text-ink">
                  {formatPoints(s.points, locale)}
                </span>
              </Link>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

/**
 * Large diagonal livery stripes bleeding off the header's edge — the same
 * angled-bar motif as the app's own logo, scaled up and tinted to the
 * entity's colour. Replaces a plain blurred colour blob with something that
 * actually ties back to the app's visual identity instead of being generic
 * "dark card with a glow" filler.
 */
export function LiveryMark({
  color,
  compact = false,
}: {
  color: string
  compact?: boolean
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute flex opacity-[0.16] ${
        compact
          ? '-top-6 -right-4 h-[180%] gap-2.5'
          : '-top-10 -right-8 h-[160%] gap-4'
      }`}
    >
      <span
        className={`block -skew-x-[14deg] ${compact ? 'w-6' : 'w-10'}`}
        style={{ background: color }}
      />
      <span
        className={`block -skew-x-[14deg] ${compact ? 'w-6' : 'w-10'}`}
        style={{ background: color, opacity: 0.55 }}
      />
      <span
        className={`block -skew-x-[14deg] ${compact ? 'w-6' : 'w-10'}`}
        style={{ background: color, opacity: 0.25 }}
      />
    </div>
  )
}

export function EntityHeader({
  color,
  eyebrow,
  title,
  meta,
  hero,
  heroLabel,
}: {
  color: string
  eyebrow: React.ReactNode
  title: React.ReactNode
  meta?: React.ReactNode
  hero?: React.ReactNode
  heroLabel?: string
}) {
  return (
    <header
      className="panel team-edge relative overflow-hidden p-5 sm:p-7"
      style={{ ['--team' as string]: color }}
    >
      <LiveryMark color={color} />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow mb-2 flex items-center gap-2">{eyebrow}</p>
          {title}
          {meta}
        </div>
        {hero != null && (
          <div className="shrink-0 text-right">
            <span
              data-timing
              className="block font-display text-6xl leading-none font-700 sm:text-8xl"
              style={{ color, opacity: 0.9 }}
            >
              {hero}
            </span>
            {heroLabel && (
              <span className="mt-1 block text-[0.6rem] font-700 tracking-widest text-ink-faint uppercase">
                {heroLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export function StatTile({
  label,
  value,
  icon,
  accent,
  hero = false,
}: {
  label: string
  value: string
  icon?: string
  accent?: string
  hero?: boolean
}) {
  return (
    <div
      className="panel relative overflow-hidden px-4 py-3.5"
      style={{ boxShadow: `inset 0 2px 0 0 ${accent ?? 'var(--color-line-bright)'}` }}
    >
      <p className="eyebrow mb-1.5">{label}</p>
      <p
        data-timing
        className={`flex items-center gap-1.5 font-mono font-700 text-ink ${hero ? 'text-3xl' : 'text-2xl'}`}
        style={accent ? { color: accent } : undefined}
      >
        {icon && (
          <span className="text-lg leading-none" aria-hidden>
            {icon}
          </span>
        )}
        {value}
      </p>
    </div>
  )
}

export interface CareerSeason {
  season: string
  position: number
  points: number
  wins: number
}

/**
 * Championship placing per season, height-encoded by position. A team or
 * driver on a winning streak produces a run of identical P1 bars — position
 * alone saturates and stops telling a story. Title years label their bar
 * with that season's win count instead of a redundant "1", so a run of
 * titles reads as "11 wins, then 9, then 5" rather than a flat wall.
 */
export function CareerBarChart({
  seasons,
  color,
  title,
}: {
  seasons: CareerSeason[]
  color: string
  title: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Most recent seasons are what you almost always want first — open the
  // chart scrolled to the end instead of making that a manual swipe.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [seasons.length])

  if (seasons.length < 2) return null

  const worst = Math.max(...seasons.map((s) => s.position), 5)

  return (
    <section className="panel p-4">
      <h2 className="eyebrow mb-4">{title}</h2>
      <div ref={scrollRef} className="flex h-44 gap-1 overflow-x-auto pb-1 pr-3">
        {seasons.map((s) => {
          // Invert the axis: P1 must be the tallest bar, not the shortest.
          const height = ((worst - s.position + 1) / worst) * 100
          const isTitle = s.position === 1
          return (
            <Link
              key={s.season}
              to={`/season/${s.season}`}
              className="group flex h-full min-w-[2rem] flex-1 flex-col items-center gap-1"
              title={`${s.season} · P${s.position} · ${s.wins}W · ${s.points}pts`}
            >
              <span
                data-timing
                className={`font-mono text-[0.6rem] group-hover:text-ink ${
                  isTitle ? 'font-700 text-best-session' : 'text-ink-faint'
                }`}
              >
                {isTitle ? `${s.wins}W` : s.position}
              </span>
              {/* flex-1 gives the bar a definite box to size its % against */}
              <span className="flex w-full flex-1 items-end">
                <motion.span
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 6)}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="block w-full transition-opacity group-hover:opacity-100"
                  style={{
                    background: isTitle ? 'var(--color-best-session)' : color,
                    opacity: isTitle ? 1 : 0.7,
                  }}
                />
              </span>
              <span className="font-mono text-[0.55rem] text-ink-faint">
                {s.season.slice(2)}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

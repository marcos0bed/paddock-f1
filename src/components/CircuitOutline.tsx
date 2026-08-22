import { circuitOutlinePath } from '../lib/circuitTrack'

/**
 * The track layout as a line drawing — not a photo, not official media, just
 * the circuit's own GPS shape traced as a stroke. Renders nothing if the
 * circuit isn't in the local dataset, so callers can drop it in unconditionally.
 */
export function CircuitOutline({
  circuitId,
  color = 'currentColor',
  className,
}: {
  circuitId: string
  color?: string
  className?: string
}) {
  const path = circuitOutlinePath(circuitId)
  if (!path) return null

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

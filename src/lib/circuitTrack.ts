import tracks from '../data/circuitTracks.json'

/**
 * Circuit outlines as [longitude, latitude] point arrays, keyed by Jolpica's
 * circuitId. Sourced once from github.com/bacinger/f1-circuits (MIT) and
 * baked into the app as a static asset — no runtime fetch, no external
 * dependency, works offline. Covers every circuit on the current calendar
 * plus recent past venues; an unmapped circuitId (a defunct one from F1's
 * deeper history) just means no outline renders, not a crash.
 */
const TRACKS = tracks as unknown as Record<string, [number, number][]>

export function hasTrackOutline(circuitId: string): boolean {
  return circuitId in TRACKS
}

/**
 * Project a track's lon/lat points onto a 0..100 SVG viewBox, preserving true
 * shape. Longitude degrees shrink relative to latitude degrees the further
 * from the equator you are (a degree of longitude at Zandvoort's ~52°N covers
 * a lot less ground than a degree of latitude) — scaling X by cos(latitude)
 * before fitting keeps the outline's real proportions instead of stretching
 * it toward a square.
 */
export function circuitOutlinePath(circuitId: string, padding = 6): string | null {
  const coords = TRACKS[circuitId]
  if (!coords || coords.length < 2) return null

  const meanLat = coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length
  const cosLat = Math.cos((meanLat * Math.PI) / 180)

  const projected = coords.map(([lon, lat]) => ({ x: lon * cosLat, y: -lat }))
  const xs = projected.map((p) => p.x)
  const ys = projected.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1

  const box = 100 - padding * 2
  const scale = box / Math.max(spanX, spanY)
  const offsetX = padding + (box - spanX * scale) / 2
  const offsetY = padding + (box - spanY * scale) / 2

  const points = projected.map(
    (p) => [offsetX + (p.x - minX) * scale, offsetY + (p.y - minY) * scale] as const,
  )

  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

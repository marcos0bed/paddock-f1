/* Constructor identity: colour, short label, and a hex we can drop straight
   into a CSS custom property. Keys are Jolpica `constructorId` values.

   Colours are livery approximations — tweak here and every row, chart and
   badge in the app follows. Historical teams fall back to a neutral grey. */

export interface TeamStyle {
  /** Livery accent, used for row edges, bars and badges. */
  color: string
  /** Compact label for narrow columns. */
  short: string
}

export const TEAMS: Record<string, TeamStyle> = {
  mercedes: { color: '#27f4d2', short: 'MER' },
  ferrari: { color: '#e8002d', short: 'FER' },
  red_bull: { color: '#3671c6', short: 'RBR' },
  mclaren: { color: '#ff8000', short: 'MCL' },
  aston_martin: { color: '#229971', short: 'AMR' },
  alpine: { color: '#0093cc', short: 'ALP' },
  williams: { color: '#64c4ff', short: 'WIL' },
  rb: { color: '#6692ff', short: 'RB' },
  haas: { color: '#b6babd', short: 'HAA' },
  audi: { color: '#bb0a30', short: 'AUD' },
  cadillac: { color: '#b79a5b', short: 'CAD' },

  /* Recent predecessors, so historical seasons still read correctly */
  alphatauri: { color: '#5e8faa', short: 'AT' },
  alfa: { color: '#c92d4b', short: 'ALF' },
  sauber: { color: '#00e701', short: 'SAU' },
  racing_point: { color: '#f596c8', short: 'RP' },
  renault: { color: '#fff500', short: 'REN' },
  toro_rosso: { color: '#469bff', short: 'STR' },
  force_india: { color: '#f596c8', short: 'FI' },
  lotus_f1: { color: '#ffb800', short: 'LOT' },
  brawn: { color: '#b8fd6e', short: 'BRW' },
  toyota: { color: '#cc1e4a', short: 'TOY' },
  bmw_sauber: { color: '#0054a6', short: 'BMW' },
  honda: { color: '#e8002d', short: 'HON' },
  jordan: { color: '#ffd700', short: 'JOR' },
  benetton: { color: '#00a551', short: 'BEN' },
  tyrrell: { color: '#1b3fa8', short: 'TYR' },
  lotus: { color: '#017a3c', short: 'LOT' },
  brabham: { color: '#0f4c8c', short: 'BRA' },
  matra: { color: '#0b4ea2', short: 'MAT' },
  cooper: { color: '#0d5d33', short: 'COO' },
  maserati: { color: '#c8102e', short: 'MAS' },
  vanwall: { color: '#0b5c2e', short: 'VAN' },
  brm: { color: '#0a6146', short: 'BRM' },
}

const NEUTRAL: TeamStyle = { color: '#6b7280', short: '—' }

export function teamStyle(constructorId: string | undefined): TeamStyle {
  if (!constructorId) return NEUTRAL
  return TEAMS[constructorId] ?? NEUTRAL
}

export function teamColor(constructorId: string | undefined): string {
  return teamStyle(constructorId).color
}

/** Inline style object that exposes the livery as `--team` to CSS. */
export function teamVar(constructorId: string | undefined): React.CSSProperties {
  return { ['--team' as string]: teamColor(constructorId) }
}

/** Tyre compound → colour, matching broadcast graphics. */
export const TYRE_COLORS: Record<string, string> = {
  SOFT: '#ff3333',
  MEDIUM: '#ffd400',
  HARD: '#f0f0f0',
  INTERMEDIATE: '#43d15f',
  WET: '#2f7fff',
  UNKNOWN: '#6b7280',
}

export function tyreColor(compound: string | undefined): string {
  return TYRE_COLORS[(compound ?? '').toUpperCase()] ?? TYRE_COLORS.UNKNOWN
}

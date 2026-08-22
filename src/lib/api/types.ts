/* Types mirror the Ergast/Jolpica JSON wire format exactly — every scalar
   arrives as a string, including positions and points. Convert at the edge,
   never assume a number. */

export interface Driver {
  driverId: string
  permanentNumber?: string
  code?: string
  url: string
  givenName: string
  familyName: string
  dateOfBirth?: string
  nationality?: string
}

export interface Constructor {
  constructorId: string
  url: string
  name: string
  nationality?: string
}

export interface Location {
  lat: string
  long: string
  locality: string
  country: string
}

export interface Circuit {
  circuitId: string
  url: string
  circuitName: string
  Location: Location
}

/** A scheduled session within a race weekend. */
export interface SessionSlot {
  date: string
  time?: string
}

export interface Race {
  season: string
  round: string
  url?: string
  raceName: string
  Circuit: Circuit
  date: string
  time?: string
  FirstPractice?: SessionSlot
  SecondPractice?: SessionSlot
  ThirdPractice?: SessionSlot
  Qualifying?: SessionSlot
  Sprint?: SessionSlot
  SprintQualifying?: SessionSlot
  SprintShootout?: SessionSlot
  Results?: RaceResult[]
  QualifyingResults?: QualifyingResult[]
  SprintResults?: RaceResult[]
}

export interface FastestLap {
  rank?: string
  lap?: string
  Time?: { time: string }
  AverageSpeed?: { units: string; speed: string }
}

export interface RaceResult {
  number: string
  position: string
  positionText: string
  points: string
  Driver: Driver
  Constructor: Constructor
  grid: string
  laps: string
  status: string
  Time?: { millis?: string; time: string }
  FastestLap?: FastestLap
}

export interface QualifyingResult {
  number: string
  position: string
  Driver: Driver
  Constructor: Constructor
  Q1?: string
  Q2?: string
  Q3?: string
}

export interface DriverStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Driver: Driver
  Constructors: Constructor[]
}

export interface ConstructorStanding {
  position: string
  positionText: string
  points: string
  wins: string
  Constructor: Constructor
}

export interface StandingsList {
  season: string
  round: string
  DriverStandings?: DriverStanding[]
  ConstructorStandings?: ConstructorStanding[]
}

/** Envelope shared by every Ergast-compatible response. */
export interface MRData<T> {
  MRData: {
    xmlns: string
    series: string
    url: string
    limit: string
    offset: string
    total: string
  } & T
}

export type RaceTableResponse = MRData<{ RaceTable: { season?: string; Races: Race[] } }>
export type StandingsResponse = MRData<{
  StandingsTable: { season?: string; StandingsLists: StandingsList[] }
}>
export type DriverTableResponse = MRData<{ DriverTable: { Drivers: Driver[] } }>
export type ConstructorTableResponse = MRData<{
  ConstructorTable: { Constructors: Constructor[] }
}>
export type SeasonTableResponse = MRData<{
  SeasonTable: { Seasons: { season: string; url: string }[] }
}>

/* ── OpenF1 (live timing) ───────────────────────────────────── */

export interface OpenF1Session {
  session_key: number
  meeting_key: number
  session_name: string
  session_type: string
  date_start: string
  date_end: string
  country_name: string
  circuit_short_name: string
  location: string
  year: number
}

export interface OpenF1DriverInfo {
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  headshot_url?: string
  session_key: number
}

export interface OpenF1Position {
  driver_number: number
  position: number
  date: string
  session_key: number
}

export interface OpenF1Interval {
  driver_number: number
  gap_to_leader: number | string | null
  interval: number | string | null
  date: string
}

export interface OpenF1Lap {
  driver_number: number
  lap_number: number
  lap_duration: number | null
  is_pit_out_lap: boolean
  date_start: string
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
  st_speed: number | null
}

export interface OpenF1Stint {
  driver_number: number
  compound: string
  lap_start: number
  lap_end: number
  tyre_age_at_start: number
  stint_number: number
}

export interface OpenF1Meeting {
  meeting_key: number
  meeting_name: string
  meeting_official_name: string
  circuit_short_name: string
  country_name: string
  location: string
  date_start: string
  year: number
}

/**
 * Final classification for one session. The shape of `duration` and
 * `gap_to_leader` depends on the session type, which is the whole reason this
 * needs care:
 *   Practice        → number  (best lap, seconds)
 *   Qualifying      → number[] ([Q1, Q2, Q3], seconds; nulls for segments not run)
 *   Race / Sprint   → number  (total race time, seconds)
 */
export interface OpenF1SessionResult {
  position: number | null
  driver_number: number
  number_of_laps: number | null
  dnf: boolean
  dns: boolean
  dsq: boolean
  duration: OpenF1Measure
  /** Lapped cars come back as text ("+1 LAP"), not a number — never assume. */
  gap_to_leader: OpenF1Measure
  meeting_key: number
  session_key: number
}

/** A time or gap: scalar, per-segment array, or free text like "+1 LAP". */
export type OpenF1Measure = number | string | (number | string | null)[] | null

export interface OpenF1RaceControl {
  date: string
  category: string
  flag: string | null
  message: string
  scope: string | null
  driver_number: number | null
  lap_number: number | null
}

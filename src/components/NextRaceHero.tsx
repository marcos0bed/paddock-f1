import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

import { useCountdown, useLocale } from '../hooks/useF1'
import { useRaceName } from '../hooks/useRaceName'
import { countryIso, flagEmoji, localizedCountry } from '../lib/countries'
import { formatDateLong, formatTime, raceDate } from '../lib/format'
import type { Race, SessionSlot } from '../lib/api/types'

/** Weekend sessions in running order, skipping whatever this format omits. */
function weekendSessions(race: Race): { key: string; slot: SessionSlot }[] {
  const map: [string, SessionSlot | undefined][] = [
    ['session.fp1', race.FirstPractice],
    ['session.sprintQualifying', race.SprintQualifying ?? race.SprintShootout],
    ['session.fp2', race.SecondPractice],
    ['session.sprint', race.Sprint],
    ['session.fp3', race.ThirdPractice],
    ['session.qualifying', race.Qualifying],
    ['session.race', { date: race.date, time: race.time }],
  ]
  return map
    .filter((e): e is [string, SessionSlot] => Boolean(e[1]))
    .map(([key, slot]) => ({ key, slot }))
    .sort(
      (a, b) =>
        raceDate(a.slot.date, a.slot.time).getTime() - raceDate(b.slot.date, b.slot.time).getTime(),
    )
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        data-timing
        className="font-mono text-3xl leading-none font-700 text-ink sm:text-5xl lg:text-6xl"
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-2 text-[0.6rem] tracking-[0.2em] text-ink-faint uppercase sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export function NextRaceHero({ race, totalRounds }: { race: Race; totalRounds: number }) {
  const { t } = useTranslation()
  const locale = useLocale()
  const raceName = useRaceName()
  const start = raceDate(race.date, race.time)
  const countdown = useCountdown(start)
  const iso = countryIso(race.Circuit.Location.country)
  const sessions = weekendSessions(race)

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="panel relative overflow-hidden"
    >
      {/* Track-surface glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-20 h-72 w-72 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--color-speed), transparent 70%)' }}
      />
      <div className="hazard absolute inset-x-0 top-0 h-1" style={{ ['--hazard' as string]: 'var(--color-speed)' }} />

      <div className="relative p-5 sm:p-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow flex items-center gap-1.5 text-speed">
            <span aria-hidden>🏎️</span>
            {t('home.nextRace')}
          </span>
          <span className="h-3 w-px bg-line-bright" />
          <span className="eyebrow">
            {t('common.roundOf', { round: race.round, total: totalRounds })}
          </span>
        </div>

        <h1 className="mt-3 font-display text-4xl leading-[0.95] font-700 tracking-tight text-ink uppercase sm:text-6xl lg:text-7xl">
          {raceName(race.raceName)}
        </h1>

        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-dim">
          {iso && (
            <span className="text-lg leading-none" aria-hidden>
              {flagEmoji(iso)}
            </span>
          )}
          <span>{race.Circuit.circuitName}</span>
          {/* Hidden once the line wraps, so the separator never dangles at the
              end of a row on a narrow phone. */}
          <span className="hidden text-ink-faint sm:inline">·</span>
          <span>
            {race.Circuit.Location.locality},{' '}
            {localizedCountry(race.Circuit.Location.country, locale)}
          </span>
        </p>

        <p className="mt-1 text-sm text-ink-faint capitalize">
          {formatDateLong(start, locale)} · {formatTime(start, locale)}
        </p>

        {countdown && countdown.total > 0 && (
          <div className="mt-7">
            <p className="eyebrow mb-3">{t('home.raceStartsIn')}</p>
            <div className="flex items-start gap-5 sm:gap-9">
              <CountdownCell value={countdown.days} label={t('countdown.days')} />
              <span className="font-mono text-3xl leading-none font-300 text-line-bright sm:text-5xl lg:text-6xl">
                :
              </span>
              <CountdownCell value={countdown.hours} label={t('countdown.hours')} />
              <span className="font-mono text-3xl leading-none font-300 text-line-bright sm:text-5xl lg:text-6xl">
                :
              </span>
              <CountdownCell value={countdown.minutes} label={t('countdown.minutes')} />
              <span className="font-mono text-3xl leading-none font-300 text-line-bright sm:text-5xl lg:text-6xl">
                :
              </span>
              <CountdownCell value={countdown.seconds} label={t('countdown.seconds')} />
            </div>
          </div>
        )}
      </div>

      {/* Weekend timetable */}
      <div className="relative border-t border-line bg-surface-2/40">
        <p className="eyebrow px-5 pt-4 sm:px-8">{t('home.weekendSchedule')}</p>
        <ul className="grid grid-cols-2 gap-px px-5 pt-3 pb-5 sm:grid-cols-3 sm:px-8 lg:grid-cols-5">
          {sessions.map(({ key, slot }) => {
            const d = raceDate(slot.date, slot.time)
            const isRace = key === 'session.race'
            return (
              <li
                key={key}
                className={`flex flex-col gap-0.5 border-l-2 py-2 pl-3 ${
                  isRace ? 'border-speed' : 'border-line-bright'
                }`}
              >
                <span
                  className={`text-[0.65rem] font-semibold tracking-widest uppercase ${
                    isRace ? 'text-speed' : 'text-ink-faint'
                  }`}
                >
                  {t(key)}
                </span>
                <span data-timing className="font-mono text-sm text-ink">
                  {formatTime(d, locale)}
                </span>
                <span className="text-[0.7rem] text-ink-faint capitalize">
                  {new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(d)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <Link
        to={`/race/${race.season}/${race.round}`}
        className="relative flex items-center justify-between border-t border-line px-5 py-3.5 text-xs font-semibold tracking-widest text-ink-dim uppercase transition hover:bg-surface-2 hover:text-ink sm:px-8"
      >
        {t('home.raceDetails')}
        <span className="text-signal">→</span>
      </Link>
    </motion.section>
  )
}

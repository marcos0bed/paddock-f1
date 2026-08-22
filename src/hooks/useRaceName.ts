import { useCallback } from 'react'

import { RACE_NAMES, type RaceNameTranslations } from '../lib/raceNames'
import { useLocale } from './useF1'

type TranslatedLang = keyof RaceNameTranslations

/**
 * Localises a Grand Prix name.
 *
 * Jolpica only ever returns English names, so every screen that shows one has
 * to go through here. Anything missing from the table falls back to the
 * English name — a race we don't have a translation for should still read
 * correctly, never render blank or as a raw key.
 */
export function useRaceName(): (englishName: string) => string {
  const locale = useLocale()

  return useCallback(
    (englishName: string) => {
      const lang = locale.split('-')[0]
      if (lang === 'en') return englishName
      const entry = RACE_NAMES[englishName]
      if (!entry) return englishName
      return entry[lang as TranslatedLang] ?? englishName
    },
    [locale],
  )
}

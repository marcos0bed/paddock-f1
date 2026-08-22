import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'it'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

/** Endonyms — a language picker should always name languages in themselves. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    // "es-ES" and "es-419" should both resolve to our "es" bundle.
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    detection: {
      // English is the default on purpose — navigator detection is NOT in the
      // order, so a Spanish-locale phone still opens in English. Only an
      // explicit pick from the toggle (stored here) changes it.
      order: ['localStorage'],
      lookupLocalStorage: 'paddock.lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  })

// Keep the document in sync so screen readers and hyphenation follow the UI.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

export default i18n

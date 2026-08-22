/* Jolpica returns country and nationality strings in English ("Netherlands",
   "Dutch"). Mapping both to ISO 3166-1 alpha-2 buys us two things at once:
   localisation via Intl.DisplayNames, and flag emoji without any assets. */

const COUNTRY_TO_ISO: Record<string, string> = {
  Australia: 'AU',
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Bahrain: 'BH',
  Belgium: 'BE',
  Brazil: 'BR',
  Canada: 'CA',
  China: 'CN',
  France: 'FR',
  Germany: 'DE',
  Hungary: 'HU',
  India: 'IN',
  Italy: 'IT',
  Japan: 'JP',
  Korea: 'KR',
  Malaysia: 'MY',
  Mexico: 'MX',
  Monaco: 'MC',
  Morocco: 'MA',
  Netherlands: 'NL',
  Portugal: 'PT',
  Qatar: 'QA',
  Russia: 'RU',
  Singapore: 'SG',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Turkey: 'TR',
  UAE: 'AE',
  'United Arab Emirates': 'AE',
  UK: 'GB',
  'United Kingdom': 'GB',
  USA: 'US',
  'United States': 'US',
  'United States of America': 'US',
  Argentina: 'AR',
  Saudi: 'SA',
  'Saudi Arabia': 'SA',
  'South Africa': 'ZA',
  Vietnam: 'VN',
  Indonesia: 'ID',
}

const NATIONALITY_TO_ISO: Record<string, string> = {
  American: 'US',
  Argentine: 'AR',
  Argentinian: 'AR',
  Australian: 'AU',
  Austrian: 'AT',
  Belgian: 'BE',
  Brazilian: 'BR',
  British: 'GB',
  Canadian: 'CA',
  Chilean: 'CL',
  Chinese: 'CN',
  Colombian: 'CO',
  Czech: 'CZ',
  Danish: 'DK',
  Dutch: 'NL',
  East_German: 'DE',
  Finnish: 'FI',
  French: 'FR',
  German: 'DE',
  Hungarian: 'HU',
  Indian: 'IN',
  Indonesian: 'ID',
  Irish: 'IE',
  Israeli: 'IL',
  Italian: 'IT',
  Japanese: 'JP',
  Liechtensteiner: 'LI',
  Malaysian: 'MY',
  Mexican: 'MX',
  Monegasque: 'MC',
  'New Zealander': 'NZ',
  Polish: 'PL',
  Portuguese: 'PT',
  Rhodesian: 'ZW',
  Russian: 'RU',
  Spanish: 'ES',
  Swedish: 'SE',
  Swiss: 'CH',
  Thai: 'TH',
  Uruguayan: 'UY',
  Venezuelan: 'VE',
  'South African': 'ZA',
}

export function countryIso(country: string | undefined): string | null {
  if (!country) return null
  return COUNTRY_TO_ISO[country.trim()] ?? null
}

export function nationalityIso(nationality: string | undefined): string | null {
  if (!nationality) return null
  return NATIONALITY_TO_ISO[nationality.trim().replace(/\s+/g, ' ')] ?? null
}

/** Regional-indicator flag emoji, e.g. "ES" → 🇪🇸. */
export function flagEmoji(iso: string | null | undefined): string {
  if (!iso || iso.length !== 2) return ''
  const base = 0x1f1e6
  return String.fromCodePoint(
    base + (iso.toUpperCase().charCodeAt(0) - 65),
    base + (iso.toUpperCase().charCodeAt(1) - 65),
  )
}

/** Country name in the active UI language, falling back to the English input. */
export function localizedCountry(country: string | undefined, locale: string): string {
  const iso = countryIso(country)
  if (!iso) return country ?? ''
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso) ?? country ?? ''
  } catch {
    return country ?? ''
  }
}

/** Nationality rendered as a localised country name (no adjectival forms). */
export function localizedNationality(nationality: string | undefined, locale: string): string {
  const iso = nationalityIso(nationality)
  if (!iso) return nationality ?? ''
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(iso) ?? nationality ?? ''
  } catch {
    return nationality ?? ''
  }
}

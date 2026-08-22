/* Jolpica returns race names in English only. This table gives each one its
   idiomatic form in the other four languages — the form that country's own
   broadcasters use, not a literal translation.
   Keys are the exact English `raceName` string from the API. */

export interface RaceNameTranslations {
  es: string
  fr: string
  de: string
  it: string
}

export const RACE_NAMES: Record<string, RaceNameTranslations> = {
  'British Grand Prix': {
    es: 'Gran Premio de Gran Bretaña',
    fr: 'Grand Prix de Grande-Bretagne',
    de: 'Großer Preis von Großbritannien',
    it: 'Gran Premio di Gran Bretagna',
  },
  'Monaco Grand Prix': {
    es: 'Gran Premio de Mónaco',
    fr: 'Grand Prix de Monaco',
    de: 'Großer Preis von Monaco',
    it: 'Gran Premio di Monaco',
  },
  'Belgian Grand Prix': {
    es: 'Gran Premio de Bélgica',
    fr: 'Grand Prix de Belgique',
    de: 'Großer Preis von Belgien',
    it: 'Gran Premio del Belgio',
  },
  'Italian Grand Prix': {
    es: 'Gran Premio de Italia',
    fr: 'Grand Prix d\'Italie',
    de: 'Großer Preis von Italien',
    it: 'Gran Premio d\'Italia',
  },
  'Spanish Grand Prix': {
    es: 'Gran Premio de España',
    fr: 'Grand Prix d\'Espagne',
    de: 'Großer Preis von Spanien',
    it: 'Gran Premio di Spagna',
  },
  'Dutch Grand Prix': {
    es: 'Gran Premio de los Países Bajos',
    fr: 'Grand Prix des Pays-Bas',
    de: 'Großer Preis der Niederlande',
    it: 'Gran Premio d\'Olanda',
  },
  'United States Grand Prix': {
    es: 'Gran Premio de Estados Unidos',
    fr: 'Grand Prix des États-Unis',
    de: 'Großer Preis der USA',
    it: 'Gran Premio degli Stati Uniti',
  },
  'Austrian Grand Prix': {
    es: 'Gran Premio de Austria',
    fr: 'Grand Prix d\'Autriche',
    de: 'Großer Preis von Österreich',
    it: 'Gran Premio d\'Austria',
  },
  'Canadian Grand Prix': {
    es: 'Gran Premio de Canadá',
    fr: 'Grand Prix du Canada',
    de: 'Großer Preis von Kanada',
    it: 'Gran Premio del Canada',
  },
  'Brazilian Grand Prix': {
    es: 'Gran Premio de Brasil',
    fr: 'Grand Prix du Brésil',
    de: 'Großer Preis von Brasilien',
    it: 'Gran Premio del Brasile',
  },
  'Japanese Grand Prix': {
    es: 'Gran Premio de Japón',
    fr: 'Grand Prix du Japon',
    de: 'Großer Preis von Japan',
    it: 'Gran Premio del Giappone',
  },
  'Australian Grand Prix': {
    es: 'Gran Premio de Australia',
    fr: 'Grand Prix d\'Australie',
    de: 'Großer Preis von Australien',
    it: 'Gran Premio d\'Australia',
  },
  'Hungarian Grand Prix': {
    es: 'Gran Premio de Hungría',
    fr: 'Grand Prix de Hongrie',
    de: 'Großer Preis von Ungarn',
    it: 'Gran Premio d\'Ungheria',
  },
  'Chinese Grand Prix': {
    es: 'Gran Premio de China',
    fr: 'Grand Prix de Chine',
    de: 'Großer Preis von China',
    it: 'Gran Premio di Cina',
  },
  'Singapore Grand Prix': {
    es: 'Gran Premio de Singapur',
    fr: 'Grand Prix de Singapour',
    de: 'Großer Preis von Singapur',
    it: 'Gran Premio di Singapore',
  },
  'Abu Dhabi Grand Prix': {
    es: 'Gran Premio de Abu Dabi',
    fr: 'Grand Prix d\'Abou Dabi',
    de: 'Großer Preis von Abu Dhabi',
    it: 'Gran Premio di Abu Dhabi',
  },
  'Azerbaijan Grand Prix': {
    es: 'Gran Premio de Azerbaiyán',
    fr: 'Grand Prix d\'Azerbaïdjan',
    de: 'Großer Preis von Aserbaidschan',
    it: 'Gran Premio dell\'Azerbaigian',
  },
  'Mexico City Grand Prix': {
    es: 'Gran Premio de la Ciudad de México',
    fr: 'Grand Prix de Mexico',
    de: 'Großer Preis von Mexiko-Stadt',
    it: 'Gran Premio di Città del Messico',
  },
  'Qatar Grand Prix': {
    es: 'Gran Premio de Catar',
    fr: 'Grand Prix du Qatar',
    de: 'Großer Preis von Katar',
    it: 'Gran Premio del Qatar',
  },
  'Miami Grand Prix': {
    es: 'Gran Premio de Miami',
    fr: 'Grand Prix de Miami',
    de: 'Großer Preis von Miami',
    it: 'Gran Premio di Miami',
  },
  'Las Vegas Grand Prix': {
    es: 'Gran Premio de Las Vegas',
    fr: 'Grand Prix de Las Vegas',
    de: 'Großer Preis von Las Vegas',
    it: 'Gran Premio di Las Vegas',
  },
  'Barcelona Grand Prix': {
    es: 'Gran Premio de Barcelona',
    fr: 'Grand Prix de Barcelone',
    de: 'Großer Preis von Barcelona',
    it: 'Gran Premio di Barcellona',
  },
  'Bahrain Grand Prix in Malaysia': {
    es: 'Gran Premio de Baréin en Malasia',
    fr: 'Grand Prix de Bahreïn en Malaisie',
    de: 'Großer Preis von Bahrain in Malaysia',
    it: 'Gran Premio del Bahrain in Malesia',
  },
  'Bahrain Grand Prix': {
    es: 'Gran Premio de Baréin',
    fr: 'Grand Prix de Bahreïn',
    de: 'Großer Preis von Bahrain',
    it: 'Gran Premio del Bahrain',
  },
  'Emilia Romagna Grand Prix': {
    es: 'Gran Premio de Emilia-Romaña',
    fr: 'Grand Prix d\'Émilie-Romagne',
    de: 'Großer Preis der Emilia-Romagna',
    it: 'Gran Premio dell\'Emilia-Romagna',
  },
  'São Paulo Grand Prix': {
    es: 'Gran Premio de Sao Paulo',
    fr: 'Grand Prix de São Paulo',
    de: 'Großer Preis von São Paulo',
    it: 'Gran Premio di San Paolo',
  },
  'Saudi Arabian Grand Prix': {
    es: 'Gran Premio de Arabia Saudí',
    fr: 'Grand Prix d\'Arabie saoudite',
    de: 'Großer Preis von Saudi-Arabien',
    it: 'Gran Premio dell\'Arabia Saudita',
  },
  'French Grand Prix': {
    es: 'Gran Premio de Francia',
    fr: 'Grand Prix de France',
    de: 'Großer Preis von Frankreich',
    it: 'Gran Premio di Francia',
  },
  'Portuguese Grand Prix': {
    es: 'Gran Premio de Portugal',
    fr: 'Grand Prix du Portugal',
    de: 'Großer Preis von Portugal',
    it: 'Gran Premio del Portogallo',
  },
  'Turkish Grand Prix': {
    es: 'Gran Premio de Turquía',
    fr: 'Grand Prix de Turquie',
    de: 'Großer Preis der Türkei',
    it: 'Gran Premio di Turchia',
  },
  'Russian Grand Prix': {
    es: 'Gran Premio de Rusia',
    fr: 'Grand Prix de Russie',
    de: 'Großer Preis von Russland',
    it: 'Gran Premio di Russia',
  },
  'Styrian Grand Prix': {
    es: 'Gran Premio de Estiria',
    fr: 'Grand Prix de Styrie',
    de: 'Großer Preis der Steiermark',
    it: 'Gran Premio di Stiria',
  },
  '70th Anniversary Grand Prix': {
    es: 'Gran Premio del 70.º Aniversario',
    fr: 'Grand Prix du 70e anniversaire',
    de: 'Großer Preis zum 70-jährigen Jubiläum',
    it: 'Gran Premio del 70º Anniversario',
  },
  'Tuscan Grand Prix': {
    es: 'Gran Premio de la Toscana',
    fr: 'Grand Prix de Toscane',
    de: 'Großer Preis der Toskana',
    it: 'Gran Premio della Toscana',
  },
  'Eifel Grand Prix': {
    es: 'Gran Premio de Eifel',
    fr: 'Grand Prix de l\'Eifel',
    de: 'Großer Preis der Eifel',
    it: 'Gran Premio dell\'Eifel',
  },
  'Sakhir Grand Prix': {
    es: 'Gran Premio de Sakhir',
    fr: 'Grand Prix de Sakhir',
    de: 'Großer Preis von Sakhir',
    it: 'Gran Premio del Sakhir',
  },
  'German Grand Prix': {
    es: 'Gran Premio de Alemania',
    fr: 'Grand Prix d\'Allemagne',
    de: 'Großer Preis von Deutschland',
    it: 'Gran Premio di Germania',
  },
  'Mexican Grand Prix': {
    es: 'Gran Premio de México',
    fr: 'Grand Prix du Mexique',
    de: 'Großer Preis von Mexiko',
    it: 'Gran Premio del Messico',
  },
  'Malaysian Grand Prix': {
    es: 'Gran Premio de Malasia',
    fr: 'Grand Prix de Malaisie',
    de: 'Großer Preis von Malaysia',
    it: 'Gran Premio della Malesia',
  },
  'European Grand Prix': {
    es: 'Gran Premio de Europa',
    fr: 'Grand Prix d\'Europe',
    de: 'Großer Preis von Europa',
    it: 'Gran Premio d\'Europa',
  },
  'Argentine Grand Prix': {
    es: 'Gran Premio de Argentina',
    fr: 'Grand Prix d\'Argentine',
    de: 'Großer Preis von Argentinien',
    it: 'Gran Premio d\'Argentina',
  },
  'Caesars Palace Grand Prix': {
    es: 'Gran Premio del Caesars Palace',
    fr: 'Grand Prix du Caesars Palace',
    de: 'Großer Preis von Caesars Palace',
    it: 'Gran Premio del Caesars Palace',
  },
  'Dallas Grand Prix': {
    es: 'Gran Premio de Dallas',
    fr: 'Grand Prix de Dallas',
    de: 'Großer Preis von Dallas',
    it: 'Gran Premio di Dallas',
  },
  'Detroit Grand Prix': {
    es: 'Gran Premio de Detroit',
    fr: 'Grand Prix de Detroit',
    de: 'Großer Preis von Detroit',
    it: 'Gran Premio di Detroit',
  },
  'Indian Grand Prix': {
    es: 'Gran Premio de la India',
    fr: 'Grand Prix d\'Inde',
    de: 'Großer Preis von Indien',
    it: 'Gran Premio d\'India',
  },
  'Indianapolis 500': {
    es: '500 Millas de Indianápolis',
    fr: '500 Miles d\'Indianapolis',
    de: '500 Meilen von Indianapolis',
    it: '500 Miglia di Indianapolis',
  },
  'Korean Grand Prix': {
    es: 'Gran Premio de Corea',
    fr: 'Grand Prix de Corée',
    de: 'Großer Preis von Korea',
    it: 'Gran Premio di Corea',
  },
  'Luxembourg Grand Prix': {
    es: 'Gran Premio de Luxemburgo',
    fr: 'Grand Prix du Luxembourg',
    de: 'Großer Preis von Luxemburg',
    it: 'Gran Premio del Lussemburgo',
  },
  'Moroccan Grand Prix': {
    es: 'Gran Premio de Marruecos',
    fr: 'Grand Prix du Maroc',
    de: 'Großer Preis von Marokko',
    it: 'Gran Premio del Marocco',
  },
  'Pacific Grand Prix': {
    es: 'Gran Premio del Pacífico',
    fr: 'Grand Prix du Pacifique',
    de: 'Großer Preis des Pazifiks',
    it: 'Gran Premio del Pacifico',
  },
  'Pescara Grand Prix': {
    es: 'Gran Premio de Pescara',
    fr: 'Grand Prix de Pescara',
    de: 'Großer Preis von Pescara',
    it: 'Gran Premio di Pescara',
  },
  'San Marino Grand Prix': {
    es: 'Gran Premio de San Marino',
    fr: 'Grand Prix de Saint-Marin',
    de: 'Großer Preis von San Marino',
    it: 'Gran Premio di San Marino',
  },
  'South African Grand Prix': {
    es: 'Gran Premio de Sudáfrica',
    fr: 'Grand Prix d\'Afrique du Sud',
    de: 'Großer Preis von Südafrika',
    it: 'Gran Premio del Sudafrica',
  },
  'Swedish Grand Prix': {
    es: 'Gran Premio de Suecia',
    fr: 'Grand Prix de Suède',
    de: 'Großer Preis von Schweden',
    it: 'Gran Premio di Svezia',
  },
  'Swiss Grand Prix': {
    es: 'Gran Premio de Suiza',
    fr: 'Grand Prix de Suisse',
    de: 'Großer Preis der Schweiz',
    it: 'Gran Premio di Svizzera',
  },
  'United States Grand Prix West': {
    es: 'Gran Premio del Oeste de Estados Unidos',
    fr: 'Grand Prix des États-Unis Ouest',
    de: 'Großer Preis der USA West',
    it: 'Gran Premio degli Stati Uniti Ovest',
  },
}

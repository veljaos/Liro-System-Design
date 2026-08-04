/**
 * Ciste funkcije formatiranja. Namerno bez `'use client'`.
 *
 * Direktiva oznacava ceo fajl, pa bi njeno prisustvo ovde znacilo da serverska
 * komponenta, API ruta ili PDF generator ne mogu pozvati `formatCurrency`.
 * React sloj (`i18n.tsx`) uvozi odavde, ne obrnuto.
 */

export type Locale = 'sr' | 'sr-Cyrl' | 'en'

/** Ili gotov string (kada prevod nije potreban) ili mapa po jeziku. */
export type LocalizedLabel = string | Partial<Record<Locale, string>>

/** BCP 47 oznake za `Intl` API. Cirilica i latinica dele isti format brojeva. */
export const LOCALE_TAGS: Record<Locale, string> = {
  sr: 'sr-RS',
  'sr-Cyrl': 'sr-RS',
  en: 'en-US',
}

export const LOCALES: Locale[] = ['sr', 'sr-Cyrl', 'en']

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value)
}

/**
 * Fallback lanac: trazeni jezik -> srpski -> engleski -> prva neprazna
 * vrednost. Poslednji korak postoji da nedostajuci prevod nikada ne
 * proizvede prazan ekran.
 */
export function resolveLabel(label: LocalizedLabel | undefined, locale: Locale): string {
  if (!label) return ''
  if (typeof label === 'string') return label
  return label[locale] || label.sr || label.en || Object.values(label).find(Boolean) || ''
}

export function formatNumber(
  value: number | string | null | undefined,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  const num = typeof value === 'string' ? Number(value) : value
  if (num === null || num === undefined || Number.isNaN(num)) return '—'
  return new Intl.NumberFormat(LOCALE_TAGS[locale], options).format(num)
}

/**
 * Iznos plus oznaka valute kao sufiks, jer je to format koji se koristi na
 * srpskim izvodima i fakturama - `1.234,56 RSD`, ne `RSD 1.234,56`.
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currencyCode: string,
  locale: Locale,
  decimals = 2,
): string {
  const formatted = formatDecimal(value, locale, decimals)
  return formatted === '—' ? formatted : `${formatted} ${currencyCode}`
}

/**
 * Broj sa tackom kao razdvajacem hiljada i zarezom za decimale: `1.234.567,89`.
 *
 * Broj decimala je podesiv jer se u knjigovodstvu ne koristi jedan: iznosi idu
 * na dve, kursevi NBS-a na cetiri, koeficijenti ponekad na sest.
 */
export function formatDecimal(
  value: number | string | null | undefined,
  locale: Locale,
  decimals = 2,
): string {
  return formatNumber(value, locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Broj bez nametnutih decimala - koliko ih vrednost stvarno ima. */
export function formatQuantity(
  value: number | string | null | undefined,
  locale: Locale,
  maxDecimals = 3,
): string {
  return formatNumber(value, locale, { maximumFractionDigits: maxDecimals })
}

export function formatDate(
  value: Date | string | number | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' },
): string {
  if (value === null || value === undefined || value === '') return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], options).format(date)
}

/** Podrazumevano ime kolacica u kojem zivi izbor jezika. */
export const LOCALE_COOKIE = 'liro-locale'
'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * Namerno nije ni i18next ni react-intl.
 *
 * Liro ekrani nose labele koje su vezane za konkretno polje ili kolonu, a ne za
 * globalni recnik kljuceva. Kada `label` zivi pored definicije kolone, prevod
 * se ne moze zaboraviti - vidi se odmah da fali. Zato je jedinica prevoda
 * objekat, a ne kljuc: `{ sr: 'Iznos', en: 'Amount' }`.
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

/**
 * Cista funkcija - radi i van React stabla (u utility fajlovima, PDF
 * generatorima, API rutama).
 *
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
 * na dve, kursevi NBS-a na cetiri, koeficijenti ponekad na sest. Podrazumevane
 * su dve, ali `formatDecimal(value, locale, 4)` radi isto tako.
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

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (label: LocalizedLabel | undefined, fallback?: string) => string
  formatNumber: (value: number | string | null | undefined, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number | string | null | undefined, currencyCode: string, decimals?: number) => string
  /** `1.234.567,89` - broj decimala je podesiv. */
  formatDecimal: (value: number | string | null | undefined, decimals?: number) => string
  formatQuantity: (value: number | string | null | undefined, maxDecimals?: number) => string
  formatDate: (value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export interface I18nProviderProps {
  children: ReactNode
  /**
   * Prosledi sa servera (npr. iz profila korisnika ili kolacica).
   * Nikada ne citaj `localStorage` pri inicijalizaciji - server bi renderovao
   * jedan jezik, klijent drugi, i hidratacija bi pukla.
   */
  initialLocale?: Locale
  /** Ime kolacica u koji se upisuje izbor jezika. */
  cookieName?: string
}

export function I18nProvider({
  children,
  initialLocale = 'sr',
  cookieName = 'liro-locale',
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next)
      if (typeof document !== 'undefined') {
        document.cookie = `${cookieName}=${next}; path=/; max-age=31536000; samesite=lax`
      }
    },
    [cookieName],
  )

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (label, fallback) => resolveLabel(label, locale) || fallback || '',
      formatNumber: (input, options) => formatNumber(input, locale, options),
      formatCurrency: (input, currencyCode, decimals) => formatCurrency(input, currencyCode, locale, decimals),
      formatDecimal: (input, decimals) => formatDecimal(input, locale, decimals),
      formatQuantity: (input, maxDecimals) => formatQuantity(input, locale, maxDecimals),
      formatDate: (input, options) => formatDate(input, locale, options),
    }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n mora biti pozvan unutar <I18nProvider>')
  return ctx
}

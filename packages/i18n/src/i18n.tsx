'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  LOCALE_COOKIE,
  formatCurrency,
  formatDate,
  formatDecimal,
  formatNumber,
  formatQuantity,
  resolveLabel,
  type Locale,
  type LocalizedLabel,
} from './format'

/**
 * Namerno nije ni i18next ni react-intl.
 *
 * Liro ekrani nose labele koje su vezane za konkretno polje ili kolonu, a ne za
 * globalni recnik kljuceva. Kada `label` zivi pored definicije kolone, prevod
 * se ne moze zaboraviti - vidi se odmah da fali. Zato je jedinica prevoda
 * objekat, a ne kljuc: `{ sr: 'Iznos', en: 'Amount' }`.
 */

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
  cookieName = LOCALE_COOKIE,
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
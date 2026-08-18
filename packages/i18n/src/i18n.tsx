'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_LOCALE,
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
 * Deliberately neither i18next nor react-intl.
 *
 * Liro screens carry labels tied to a specific field or column, not to a
 * global dictionary of keys. When `label` lives next to the column
 * definition, a translation cannot be forgotten — it is immediately obvious
 * that one is missing. That is why the unit of translation is an object, not
 * a key: `{ sr: 'Iznos', en: 'Amount' }`.
 */

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (label: LocalizedLabel | undefined, fallback?: string) => string
  formatNumber: (value: number | string | null | undefined, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number | string | null | undefined, currencyCode: string, decimals?: number) => string
  /** `1.234.567,89` - the number of decimals is configurable. */
  formatDecimal: (value: number | string | null | undefined, decimals?: number) => string
  formatQuantity: (value: number | string | null | undefined, maxDecimals?: number) => string
  formatDate: (value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export interface I18nProviderProps {
  children: ReactNode
  /**
   * Pass from the server (e.g. from the user's profile or a cookie).
   * Never read `localStorage` during initialization — the server would
   * render one language, the client another, and hydration would break.
   */
  initialLocale?: Locale
  /** Name of the cookie the language choice is written to. */
  cookieName?: string
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
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
  if (!ctx) throw new Error('useI18n must be called within <I18nProvider>')
  return ctx
}
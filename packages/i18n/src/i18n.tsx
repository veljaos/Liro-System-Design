'use client'

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from 'react'
import {
  DEFAULT_LOCALE,
  DEFAULT_FORMAT_PREFERENCES,
  LOCALE_COOKIE,
  type Catalog,
  type FormatPreferences,
  formatCompact,
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  formatDecimal,
  formatNumber,
  formatQuantity,
  loadCatalog,
  registerCatalog,
  resolveLabel,
  type Locale,
  type LocalizedLabel,
  setActiveLocale,
} from './format'

/**
 * Deliberately neither i18next nor react-intl.
 *
 * Liro screens carry labels tied to a specific field or column, not to a
 * global dictionary of keys. When `label` lives next to the column
 * definition, a translation cannot be forgotten - it is immediately obvious
 * that one is missing. That is why the unit of translation is an object, not
 * a key: `{ 'sr-Latn': 'Iznos', en: 'Amount' }`.
 */

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** The format settings in force. Read them when a component formats by hand. */
  preferences: FormatPreferences
  t: (
    label: LocalizedLabel | undefined,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string
  formatNumber: (value: number | string | null | undefined, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number | string | null | undefined, currencyCode: string, decimals?: number) => string
  /** `1.234.567,89` - the number of decimals is configurable. */
  formatDecimal: (value: number | string | null | undefined, decimals?: number) => string
  formatQuantity: (value: number | string | null | undefined, maxDecimals?: number) => string
  /** `1,2 mil.` - for chart axes and tight columns. */
  formatCompact: (value: number | string | null | undefined) => string
  formatDate: (value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string
  /** `10:05` or `10:05 AM`, per the user's preference. */
  formatTime: (value: Date | string | number | null | undefined) => string
  formatDateTime: (value: Date | string | number | null | undefined) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export interface I18nProviderProps {
  children: ReactNode
  /**
   * Pass from the server (e.g. from the user's profile or a cookie).
   * Never read `localStorage` during initialization - the server would
   * render one language, the client another, and hydration would break.
   */
  initialLocale?: Locale
  /**
   * The catalog the server rendered with.
   *
   * Registered before the first render, so the client starts from the same text
   * the server produced. Without it, a locale that is a lazy chunk hydrates
   * against the fallback - the server has every catalog because it reads them from
   * disk, while the client's bundle carries only the source and default ones - and
   * React reports a mismatch. The user sees the wrong language for a frame.
   *
   * Sending one catalog inline is not a step back from lazy loading: it is the one
   * in use, it arrives with the HTML rather than as a second request, and the other
   * thirty-two are still chunks nobody downloads.
   *
   * From `getServerCatalog(locale)` in `@liro/i18n/server`.
   */
  initialCatalog?: Catalog
  /** Name of the cookie the language choice is written to. */
  cookieName?: string
  /**
   * How numbers and dates look, as opposed to what language they are in.
   *
   * From the user's profile. A bookkeeper in Belgrade running an English interface
   * still wants `1.234,56` - the language decides what is written, this decides how
   * it looks.
   *
   * Passed in rather than stored here, because it lives in the user's profile and
   * the design system does not own that. Omit it and every user gets the Serbian
   * defaults.
   */
  preferences?: FormatPreferences
}

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
  initialCatalog,
  cookieName = LOCALE_COOKIE,
  preferences = DEFAULT_FORMAT_PREFERENCES,
}: I18nProviderProps) {
  /*
   * Registered during render, not in an effect.
   *
   * An effect runs after the first paint, and the first paint is exactly the frame
   * that has to be right - it is the one React compares against the server's HTML.
   *
   * Safe here because registering a catalog is idempotent and touches no React
   * state, unlike `setActiveLocale` below, which is a side effect and stays in its
   * effect.
   */
  if (initialCatalog) registerCatalog(initialLocale, initialCatalog)

  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  /*
   * Keeps the module variable in step with the context, for the functions that
   * cannot use a hook - `notice` above all.
   *
   * `useEffect` rather than during render, because setting a module variable while
   * rendering is a side effect, and React may render twice in development.
   */
  useEffect(() => {
    setActiveLocale(locale)
  }, [locale])

  /*
   * The initial locale may be a lazy chunk that `initialCatalog` did not cover -
   * a client-only application with no server render, for instance.
   *
   * Costs nothing when the catalog is already there, which it is whenever the
   * server passed one.
   */
  useEffect(() => {
    void loadCatalog(initialLocale)
  }, [initialLocale])

  const setLocale = useCallback(
    (next: Locale) => {
      /*
       * The catalog is loaded BEFORE the language changes.
       *
       * Switching first would show the fallback for a frame - a catalog is a
       * separate chunk now, and a chunk takes a moment to arrive. Loading first
       * costs nothing when it is already in memory, which it is after the first
       * switch and always for the two that ship statically.
       *
       * `void` because `setLocale` stays synchronous for its callers: a language
       * picker should not have to await anything.
       */
      void loadCatalog(next).then(() => {
        setLocaleState(next)
      })

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
      preferences,
      t: (label, fallback, params) => resolveLabel(label, locale, params) || fallback || '',
      formatNumber: (input, options) => formatNumber(input, locale, options, preferences),
      formatCurrency: (input, currencyCode, decimals) =>
        formatCurrency(input, currencyCode, locale, decimals, preferences),
      formatDecimal: (input, decimals) => formatDecimal(input, locale, decimals, preferences),
      formatQuantity: (input, maxDecimals) => formatQuantity(input, locale, maxDecimals, preferences),
      formatCompact: (input) => formatCompact(input, locale, preferences),
      formatDate: (input, options) => formatDate(input, locale, options, preferences),
      formatTime: (input) => formatTime(input, preferences),
      formatDateTime: (input) => formatDateTime(input, locale, preferences),
    }),
    [locale, setLocale, preferences],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be called within <I18nProvider>')
  return ctx
}
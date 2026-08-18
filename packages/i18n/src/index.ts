/*
 * Pure functions are exported directly from `./format`, not through
 * `./i18n`.
 *
 * Reason: `i18n.tsx` carries `'use client'`, and that directive applies to
 * the whole module. If `resolveLabel` were re-exported from there, a server
 * component that imports it would get a client reference instead of the
 * function.
 */
export {
  resolveLabel,
  resolveFieldError,
  resolveLocaleTag,
  fallbackChain,
  formatNumber,
  formatCurrency,
  formatDecimal,
  formatQuantity,
  formatDate,
  formatTime,
  formatDateTime,
  isLocale,
  localeName,
  LOCALE_TAGS,
  LOCALES,
  LOCALE_COOKIE,
  DEFAULT_LOCALE,
  SOURCE_LOCALE,
  DEFAULT_FORMAT_PREFERENCES,
  type FormatPreferences,
  type NumberFormatName,
  type DateFormatName,
  type Locale,
  type LocalizedLabel,
  localeDirection
} from './format'

export {
  I18nProvider,
  useI18n,
  type I18nContextValue,
  type I18nProviderProps,
} from './i18n'

export { FIELD_ERROR_LABELS } from './errors'
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
  formatNumber,
  formatCurrency,
  formatDecimal,
  formatQuantity,
  formatDate,
  isLocale,
  localeName,
  LOCALE_TAGS,
  LOCALES,
  LOCALE_COOKIE,
  type Locale,
  type LocalizedLabel,
} from './format'

export {
  I18nProvider,
  useI18n,
  type I18nContextValue,
  type I18nProviderProps,
} from './i18n'

export { FIELD_ERROR_LABELS } from './errors'
/*
 * Ciste funkcije se izvoze direktno iz `./format`, a ne preko `./i18n`.
 *
 * Razlog: `i18n.tsx` nosi `'use client'`, a ta direktiva vazi za ceo modul.
 * Kada bi se `resolveLabel` reeksportovao odatle, serverska komponenta koja ga
 * uveze dobila bi klijentsku referencu umesto funkcije.
 */
export {
  resolveLabel,
  formatNumber,
  formatCurrency,
  formatDecimal,
  formatQuantity,
  formatDate,
  isLocale,
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
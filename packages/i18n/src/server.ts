import { cache } from 'react'
import { cookies } from 'next/headers'
import {
  LOCALE_COOKIE,
  formatCurrency,
  formatDate,
  formatDecimal,
  formatNumber,
  formatQuantity,
  isLocale,
  resolveLabel,
  type Locale,
  type LocalizedLabel,
} from './format'

/**
 * Jezik u serverskim komponentama.
 *
 * Server ne moze da procita React kontekst - kontekst postoji tek posle
 * hidratacije. Jedini podatak koji server ima je zahtev, pa jezik citamo iz
 * istog kolacica u koji ga `I18nProvider` upisuje.
 *
 * `cache` iz Reacta znaci da se kolacic cita jednom po zahtevu, bez obzira
 * koliko komponenti u stablu pozove ovu funkciju.
 */
export const getServerLocale = cache(async (cookieName: string = LOCALE_COOKIE): Promise<Locale> => {
  const store = await cookies()
  const value = store.get(cookieName)?.value
  return isLocale(value) ? value : 'sr'
})

/** Isti oblik kao `useI18n()`, samo dobijen sa `await` umesto iz konteksta. */
export interface ServerI18n {
  locale: Locale
  t: (label: LocalizedLabel | undefined, fallback?: string) => string
  formatNumber: (value: number | string | null | undefined, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number | string | null | undefined, currencyCode: string, decimals?: number) => string
  formatDecimal: (value: number | string | null | undefined, decimals?: number) => string
  formatQuantity: (value: number | string | null | undefined, maxDecimals?: number) => string
  formatDate: (value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string
}

/**
 * Namerno ima isti oblik kao `useI18n()` da bi prelazak ekrana sa klijenta na
 * server bio zamena jednog reda:
 *
 *   const { t, formatCurrency } = useI18n()            // klijent
 *   const { t, formatCurrency } = await getServerI18n() // server
 */
export async function getServerI18n(cookieName?: string): Promise<ServerI18n> {
  const locale = await getServerLocale(cookieName)

  return {
    locale,
    t: (label, fallback) => resolveLabel(label, locale) || fallback || '',
    formatNumber: (value, options) => formatNumber(value, locale, options),
    formatCurrency: (value, currencyCode, decimals) => formatCurrency(value, currencyCode, locale, decimals),
    formatDecimal: (value, decimals) => formatDecimal(value, locale, decimals),
    formatQuantity: (value, maxDecimals) => formatQuantity(value, locale, maxDecimals),
    formatDate: (value, options) => formatDate(value, locale, options),
  }
}
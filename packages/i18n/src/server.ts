import { cache } from 'react'
import { cookies } from 'next/headers'
import {
  LOCALE_COOKIE,
  resolveLocaleTag,
  DEFAULT_LOCALE,
  formatCurrency,
  formatDate,
  formatDecimal,
  formatNumber,
  formatQuantity,
  resolveLabel,
  type Locale,
  type LocalizedLabel,
  loadCatalog,
  getCatalog,
  type Catalog,
} from './format'

/**
 * Language in server components.
 *
 * The server cannot read React context — context only exists after
 * hydration. The only data the server has is the request, so the language
 * is read from the same cookie `I18nProvider` writes it to.
 *
 * React's `cache` means the cookie is read once per request, no matter how
 * many components in the tree call this function.
 */
export const getServerLocale = cache(async (cookieName: string = LOCALE_COOKIE): Promise<Locale> => {
  const store = await cookies()
  const value = store.get(cookieName)?.value
  /*
  * `resolveLocaleTag`, not `isLocale`.
  * 
  * The cookie may hold a value this release does not know as a `Locale` - `sr`
  * from before the script subtag existed, or `sr-RS` written by an older client.
  * `isLocale` rejects both and every one of those users silently gets the
  * default.
  */
  return resolveLocaleTag(value) ?? DEFAULT_LOCALE
})

/**
 * The catalog the server rendered with, to be handed to the client.
 *
 * Without it the client's first paint uses whatever is in the bundle - the source
 * locale and the default one - while the server used the real catalog. React
 * reports that as a hydration mismatch, and the user sees the wrong language for a
 * frame.
 *
 * Sending it inline is not a step backwards from lazy loading: it is ONE catalog,
 * the one in use, and it arrives with the HTML rather than as a second request.
 * The other thirty-two are still chunks nobody downloads.
 */
export const getServerCatalog = cache(async (locale: Locale): Promise<Catalog | undefined> => {
  await loadCatalog(locale)
  return getCatalog(locale)
})

/** Same shape as `useI18n()`, just obtained with `await` instead of from context. */
export interface ServerI18n {
  locale: Locale
  t: (
    label: LocalizedLabel | undefined,
    fallback?: string,
    params?: Record<string, string | number>,
  ) => string
  formatNumber: (value: number | string | null | undefined, options?: Intl.NumberFormatOptions) => string
  formatCurrency: (value: number | string | null | undefined, currencyCode: string, decimals?: number) => string
  formatDecimal: (value: number | string | null | undefined, decimals?: number) => string
  formatQuantity: (value: number | string | null | undefined, maxDecimals?: number) => string
  formatDate: (value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions) => string
}

/**
 * Deliberately has the same shape as `useI18n()` so that moving a screen from
 * client to server is a one-line swap:
 *
 *   const { t, formatCurrency } = useI18n()            // client
 *   const { t, formatCurrency } = await getServerI18n() // server
 */
export async function getServerI18n(cookieName?: string): Promise<ServerI18n> {
  const locale = await getServerLocale(cookieName)

  return {
    locale,
    t: (label, fallback, params) => resolveLabel(label, locale, params) || fallback || '',
    formatNumber: (value, options) => formatNumber(value, locale, options),
    formatCurrency: (value, currencyCode, decimals) => formatCurrency(value, currencyCode, locale, decimals),
    formatDecimal: (value, decimals) => formatDecimal(value, locale, decimals),
    formatQuantity: (value, maxDecimals) => formatQuantity(value, locale, maxDecimals),
    formatDate: (value, options) => formatDate(value, locale, options),
  }
}
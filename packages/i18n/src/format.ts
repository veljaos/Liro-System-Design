/**
 * Pure formatting functions. Deliberately without `'use client'`.
 *
 * The directive marks the whole file, so its presence here would mean a
 * server component, API route, or PDF generator could not call
 * `formatCurrency`. The React layer (`i18n.tsx`) imports from here, not the
 * other way around.
 */

export type Locale = 'sr' | 'sr-Cyrl' | 'en'

/** Either a plain string (when no translation is needed) or a map by language. */
export type LocalizedLabel = string | Partial<Record<Locale, string>>

/**
 * BCP 47 tags for the `Intl` API.
 *
 * NOT `sr-RS` for both. In this system `sr` means LATIN SCRIPT, while to
 * `Intl` `sr-RS` means Cyrillic — so a Latin-script user got "авг" and "нед"
 * instead of "avg" and "ned". The script must be stated explicitly.
 */
export const LOCALE_TAGS: Record<Locale, string> = {
  sr: 'sr-Latn-RS',
  'sr-Cyrl': 'sr-Cyrl-RS',
  en: 'en-US',
}

export const LOCALES: Locale[] = ['sr', 'sr-Cyrl', 'en']

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value)
}

/*
* `Intl.NumberFormat` is expensive to create and cheap to use. A table with
* two currency columns was creating two instances per row, on every render —
* in a virtualized table that is on every scroll frame. The cache creates them
* once per combination of language and options.
*/
const numberFormatters = new Map<string, Intl.NumberFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function numberFormatter(tag: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = options ? `${tag}|${JSON.stringify(options)}` : tag
  const cached = numberFormatters.get(key)
  if (cached) return cached
  const created = new Intl.NumberFormat(tag, options)
  numberFormatters.set(key, created)
  return created
}

function dateFormatter(tag: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${tag}|${JSON.stringify(options)}`
  const cached = dateFormatters.get(key)
  if (cached) return cached
  const created = new Intl.DateTimeFormat(tag, options)
  dateFormatters.set(key, created)
  return created
}

/**
 * Fallback chain: requested language -> Serbian -> English -> first non-empty
 * value. The last step exists so that a missing translation never produces a
 * blank screen.
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
  return numberFormatter(LOCALE_TAGS[locale], options).format(num)
}

/**
 * Amount plus currency code as a suffix, because that is the format used on
 * Serbian bank statements and invoices — `1.234,56 RSD`, not `RSD 1.234,56`.
 */
export function formatCurrency(
  value: number | string | null | undefined,
  currencyCode: string,
  locale: Locale,
  decimals = 2,
): string {
  const formatted = formatDecimal(value, locale, decimals)
/*
* A non-breaking space (U+00A0), not a regular one.
*
* A regular space is a place where the browser may break the line, so a
* narrow column ends up with "1.240.000,00" on one line and "RSD" on the
* next. The amount and the currency are one unit and must not be split — not
* in a table, not in a sentence, not in a PDF.
*
* Export note: this is a DISPLAY function. Raw numbers go into CSV and Excel,
* not the result of this function — otherwise the non-breaking space would
* end up in the data.
*/
return formatted === '—' ? formatted : `${formatted}\u00A0${currencyCode}`
}

/**
 * A number with a dot as the thousands separator and a comma for decimals:
 * `1.234.567,89`.
 *
 * The number of decimals is configurable because bookkeeping does not use
 * one: amounts go to two, NBS exchange rates to four, coefficients sometimes
 * to six.
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

/** A number with no imposed decimals — as many as the value actually has. */
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
  return dateFormatter(LOCALE_TAGS[locale], options).format(date)
}

/** Default name of the cookie the language choice lives in. */
export const LOCALE_COOKIE = 'liro-locale'
/**
 * Pure formatting functions. Deliberately without `'use client'`.
 *
 * The directive marks the whole file, so its presence here would mean a
 * server component, API route, or PDF generator could not call
 * `formatCurrency`. The React layer (`i18n.tsx`) imports from here, not the
 * other way around.
 */

import { FIELD_ERROR_LABELS } from './errors'

/*
* `Locale` and `LOCALES` are GENERATED from `packages/i18n/locales/*.json`.
* 
* That is what makes "adding a language is adding a file" true. A hand-written
* union is a list somebody has to remember to update, and the day they forget, the
* catalog is on disk and the language is not selectable - with nothing failing to
* say so.
*/
export type { Locale } from './locales.generated'
export { LOCALES } from './locales.generated'

import type { Locale } from './locales.generated'
import { LOCALES } from './locales.generated'

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

/**
 * What a user gets with no choice of their own.
 *
 * Not the same as `SOURCE_LOCALE`, and the difference matters as soon as there is a
 * third language: if they were one value, a Brazilian hitting an untranslated key
 * would get Serbian - which is worse than untranslated, because it looks
 * deliberate.
 */
export const DEFAULT_LOCALE: Locale = 'sr'

/**
 * Where every fallback chain ends.
 *
 * English, because it is the language every catalog is translated FROM. A key with
 * no translation anywhere shows English, which a developer recognises as missing
 * work rather than as a wrong language.
 */
export const SOURCE_LOCALE: Locale = 'en'

/**
 * Tags that are accepted but are not `Locale` values.
 *
 * Two jobs.
 *
 * **Legacy.** Cookies and `jsonb` columns already hold `sr`. When `Locale` becomes
 * `sr-Latn`, that stored value stops matching and every existing user silently gets
 * the default. The table translates it instead.
 *
 * **Whatever the browser sends.** `Accept-Language` and `navigator.language` give
 * region tags - `sr-RS`, `en-GB`, `pt-BR` - and none of them is a `Locale`.
 *
 * `sr-RS` maps to LATIN, not Cyrillic. That is a decision, not an oversight: CLDR
 * reads a bare `sr` as Cyrillic, but in this system and in everyday Serbian use the
 * unmarked form is Latin. A user whose browser says `sr-RS` expects Latin.
 */
const ALIASES: Record<string, Locale> = {
  sr: 'sr',
  'sr-latn': 'sr',
  'sr-latn-rs': 'sr',
  'sr-rs': 'sr',
  'sr-cyrl': 'sr-Cyrl',
  'sr-cyrl-rs': 'sr-Cyrl',
  'sr-me': 'sr',
  'sr-ba': 'sr',
  hr: 'sr',
  bs: 'sr',
  en: 'en',
}

/**
 * Any tag turned into a `Locale`, or `null` when nothing matches.
 *
 * Case-insensitive, because `Accept-Language` casing is not guaranteed: a browser
 * may send `sr-latn-rs` where the spec writes `sr-Latn-RS`.
 *
 * Falls back by dropping subtags from the right - `pt-BR-x-private` tries
 * `pt-br-x-private`, then `pt-br`, then `pt`. That is how BCP 47 lookup is defined,
 * and it means a region we have never heard of still lands on its language.
 */
export function resolveLocaleTag(tag: string | undefined | null): Locale | null {
  if (!tag) return null

  const parts = tag.trim().toLowerCase().split('-')

  while (parts.length > 0) {
    const candidate = parts.join('-')
    const alias = ALIASES[candidate]
    if (alias) return alias
    if (isLocale(candidate)) return candidate
    parts.pop()
  }

  return null
}

/**
 * The order in which locales are tried for one key.
 *
 * `['sr-Cyrl', 'sr', 'en']` for Cyrillic: script first, then the other script of
 * the same language, then the source. The middle step is what makes a Cyrillic user
 * see Latin Serbian rather than English when a key is only half translated - closer
 * than English, and readable.
 *
 * With 43 locales this is where `pt-BR` -> `pt` -> `en` will live. Today the chain
 * is short; the shape is what matters.
 */
export function fallbackChain(locale: Locale): Locale[] {
  const chain: Locale[] = [locale]

  /* The other script of the same language, before leaving it. */
  if (locale === 'sr-Cyrl') chain.push('sr')
  else if (locale === 'sr') chain.push('sr-Cyrl')

  if (!chain.includes(SOURCE_LOCALE)) chain.push(SOURCE_LOCALE)

  return chain
}

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
const displayNames = new Map<string, Intl.DisplayNames>()

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
  if (label === undefined) return ''
  if (typeof label === 'string') return label

  /*
   * Goes through `fallbackChain`, not a hardcoded order.
   *
   * The last resort - the first non-empty value in the object - stays, and it is
   * the reason a missing translation shows SOMETHING rather than a blank screen.
   * With 43 catalogs that will be rare, and it is still better than nothing.
   */
  for (const candidate of fallbackChain(locale)) {
    const value = label[candidate]
    if (value) return value
  }

  return Object.values(label).find(Boolean) ?? ''
}

/**
 * A field error turned into text.
 *
 * The server sends a CODE, this turns it into a sentence. That is the only
 * arrangement that works in more than one language: a server returning prose would
 * have to know the user's locale and carry every translation, which is the wrong
 * place for both.
 *
 * Pure, so it works on the server as well as in the client - a Server Component
 * that saves a record needs it too.
 *
 * Fallback order: a known code, then the server's `message`, then the generic
 * `invalid`. Never an empty string: a field marked as wrong with no explanation is
 * worse than no marking at all.
 */
export function resolveFieldError(
  error: { code: string; params?: Record<string, string | number>; message?: string },
  locale: Locale,
): string {
  const label = FIELD_ERROR_LABELS[error.code]

  if (label) return interpolate(resolveLabel(label, locale), error.params)

  /* An unknown code means the server is ahead of this release. Its prose is the
     best available, and the absence of both is worth seeing in development. */
  if (process.env.NODE_ENV !== 'production' && !error.message) {
    console.warn(`[i18n] unknown field error code "${error.code}" and no message`)
  }

  return error.message ?? resolveLabel(FIELD_ERROR_LABELS.invalid, locale)
}

/**
 * `{name}` replaced from `params`.
 *
 * Deliberately not ICU: none of the field error messages needs a plural or a
 * gender, and ICU here would mean running a parser on a path that fires while the
 * user is looking at a failed form. A placeholder with no value is left as it is,
 * which is visible in testing rather than silently empty.
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  )
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

/**
 * The name of a language in that language itself.
 *
 * `sr` -> "Srpski", `en` -> "English", `ar` -> "العربية".
 *
 * Endonyms, not translations, and that is deliberate: a user who has landed on
 * the wrong language must be able to find their own in the list. If the names
 * were translated into the current language, someone stuck in Serbian would be
 * looking for "Arabic" written in Serbian.
 *
 * Derived from CLDR rather than a hand-written table, so adding a locale to
 * `LOCALES` puts it in the picker with no further edit. That is the requirement:
 * a new language is one file.
 *
 * Contains overrides for endonyms where CLDR is more verbose than useful.
 * For example, CLDR returns "srpski (latinica)" and "српски (ћирилица)". The
 * parenthetical is redundant in a picker: one entry is written in Latin script
 * and the other in Cyrillic, so the script is visible from the name itself.
 * This acts as an override table, not a full list of names, ensuring that only
 * deviations are listed and adding a new locale remains simple.
 */
const NAME_OVERRIDES: Partial<Record<Locale, string>> = {
  sr: 'Srpski',
  'sr-Cyrl': 'Српски',
}

export function localeName(locale: Locale): string {
  const override = NAME_OVERRIDES[locale]
  if (override) return override

  const tag = LOCALE_TAGS[locale]

  let names = displayNames.get(tag)
  if (!names) {
    names = new Intl.DisplayNames([tag], { type: 'language' })
    displayNames.set(tag, names)
  }

  /*
  * `of(locale)`, not `of(tag)`. The tag carries a region - `en` maps to
  * `en-US` - and CLDR then answers "American English". The locale key is what
  * the system means: generic English.
  *
  * CLDR returns most language names in lower case ("srpski"), which is correct
  * in running text and wrong in a menu. Capitalising only the first character
  * is safe: it never touches a script that has no case.
  */
  const name = names.of(locale) ?? locale
  return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1)
}

/**
 * Locales written right to left.
 *
 * Here rather than derived, because `Intl.Locale.textInfo` is not in every runtime
 * this code runs in - Node 20 has it behind a flag, and Safari got it late. The
 * list is short and does not change: Arabic, Hebrew, Persian, Urdu and a handful of
 * others.
 *
 * Matched on the LANGUAGE subtag, so `ar-EG` and `ar-SA` both work without being
 * listed.
 */
const RTL_LANGUAGES = new Set([
  'ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ku', 'ckb',
])

/**
 * Text direction for a locale.
 *
 * Needed before any right-to-left catalog exists, and that is the point: adding
 * `ar.json` later must not require touching the layout. A system that discovers RTL
 * after the fact has to review every `marginLeft` and every `left:` it ever wrote.
 */
export function localeDirection(locale: Locale): 'ltr' | 'rtl' {
  const language = LOCALE_TAGS[locale].split('-')[0] ?? locale
  return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
}
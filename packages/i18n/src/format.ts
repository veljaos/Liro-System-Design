/**
 * Pure formatting functions. Deliberately without `'use client'`.
 *
 * The directive marks the whole file, so its presence here would mean a
 * server component, API route, or PDF generator could not call
 * `formatCurrency`. The React layer (`i18n.tsx`) imports from here, not the
 * other way around.
 */

/*
* `Locale` and `LOCALES` are GENERATED from `packages/i18n/locales/*.json`.
*
* That is what makes "adding a language is adding a file" true. A hand-written
* union is a list somebody has to remember to update, and the day they forget, the
* catalog is on disk and the language is not selectable - with nothing failing to
* say so.
*
* `TranslationKey`, `TRANSLATION_KEYS` and `CATALOGS` are generated the same way,
* from the CONTENT of `en.json` - see `resolveLabel` for how a key is told apart
* from a plain string.
*/
export type { Locale, TranslationKey } from './locales.generated'
export { LOCALES, TRANSLATION_KEYS, CATALOGS } from './locales.generated'

import type { Locale } from './locales.generated'
import { LOCALES, CATALOGS, TRANSLATION_KEYS } from './locales.generated'

/**
 * The mark for an empty value.
 *
 * An em dash (U+2014), never a hyphen: in a column of amounts a hyphen reads as a
 * minus sign, which is a different number rather than a missing one.
 *
 * Named rather than written inline, because it appears in three functions and two
 * of them are easy to change without noticing the third.
 */
const EM_DASH = '\u2014'

/**
 * Either a plain string (when no translation is needed), a map by language
 * (the pre-Phase-3 shape, still valid input to `t()`), or a catalog key
 * (`TranslationKey`, itself a `string` - see `resolveLabel`).
 */
export type LocalizedLabel = string | Partial<Record<Locale, string>>

/**
 * What a user gets with no choice of their own.
 *
 * Not the same as `SOURCE_LOCALE`, and the difference matters as soon as there is a
 * third language: if they were one value, a Brazilian hitting an untranslated key
 * would get Serbian - which is worse than untranslated, because it looks
 * deliberate.
 */
export const DEFAULT_LOCALE: Locale = 'sr-Latn'

/**
 * Where every fallback chain ends.
 *
 * English, because it is the language every catalog is translated FROM. A key with
 * no translation anywhere shows English, which a developer recognises as missing
 * work rather than as a wrong language.
 */
export const SOURCE_LOCALE: Locale = 'en'

/**
 * The locale currently on screen, for code that cannot use a hook.
 *
 * `notice.saved()` is called from an `onClick`, from a mutation's `onError`, from
 * anywhere - none of which can call `useI18n()`. Without this it had a hardcoded
 * default, and every notification came out in Serbian whatever the user had chosen.
 *
 * A module variable, kept in step by `I18nProvider`. That is safe on the client,
 * where there is one user per module instance.
 *
 * NOT safe on the server, where one module is shared by every request - so a
 * server component must pass `locale` explicitly and never rely on this. It is why
 * the parameter stays on every function that takes it.
 */
let activeLocale: Locale = DEFAULT_LOCALE

/** Called by `I18nProvider`. Not part of the public API. */
export function setActiveLocale(locale: Locale): void {
  activeLocale = locale
}

export function getActiveLocale(): Locale {
  return activeLocale
}

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
  sr: 'sr-Latn',
  'sr-latn': 'sr-Latn',
  'sr-latn-rs': 'sr-Latn',
  'sr-rs': 'sr-Latn',
  'sr-cyrl': 'sr-Cyrl',
  'sr-cyrl-rs': 'sr-Cyrl',
  'sr-me': 'sr-Latn',
  'sr-ba': 'sr-Latn',
  hr: 'sr-Latn',
  bs: 'sr-Latn',
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
 * `['sr-Cyrl', 'sr-Latn', 'en']` for Cyrillic: script first, then the other script of
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
  if (locale === 'sr-Cyrl') chain.push('sr-Latn')
  else if (locale === 'sr-Latn') chain.push('sr-Cyrl')

  if (!chain.includes(SOURCE_LOCALE)) chain.push(SOURCE_LOCALE)

  return chain
}

/**
 * How numbers and dates LOOK, as opposed to what language they are written in.
 *
 * The most important decision in this file, and the one that is easy to get
 * backwards.
 *
 * CLDR for `en-US` gives `3/1/2026` and `1,234.56`. That correctly describes what
 * an average American expects, and incorrectly describes what a bookkeeper in
 * Belgrade running an English interface wants. They still need `1.234,56` and
 * `12.04.2026.`, because that is what their books say.
 *
 * **Language decides what is written. These decide how it looks.**
 *
 * There are TWO sets of them, and mixing them up is expensive:
 *
 * The INTERFACE format is per user - the screen adapts to whoever is reading.
 *
 * The DOCUMENT format is per organisation. If it were per user, two bookkeepers
 * would print the same invoice as `12.04.2026.` and `04/12/2026`, and for a
 * document that goes to a client or an authority that is not a preference, it is an
 * error. A PDF, a printout and an export use the organisation's set.
 */
export interface FormatPreferences {
  /** `1.234,56` · `1,234.56` · `1 234,56` · `1 234.56` · `1'234.56` · `12,34,567.89` */
  numberFormat: NumberFormatName
  dateFormat: DateFormatName
  timeFormat: '24h' | '12h'
  /** Sunday is 0. Serbian working weeks start on Monday. */
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** IANA name. When absent, the runtime's own zone. */
  timeZone?: string
}

export type NumberFormatName =
  | 'dot-comma'
  | 'comma-dot'
  | 'space-comma'
  | 'space-dot'
  | 'apostrophe-dot'
  | 'indian'

export type DateFormatName =
  | 'DD.MM.YYYY.'
  | 'DD.MM.YYYY'
  | 'DD/MM/YYYY'
  | 'MM/DD/YYYY'
  | 'DD-MM-YYYY'
  | 'YYYY-MM-DD'

/**
 * Group and decimal separators, by name.
 *
 * The implementation is NOT "pick a locale that happens to format the way you
 * want". `de-DE` gives `1.234,56` and also drags in German spacing rules for
 * currency and percentages - so a Serbian-looking number arrives with a German
 * percent sign. Here the base is always `en-US` and only these two characters are
 * replaced, so exactly what was chosen changes and nothing else.
 *
 * `indian` is the exception: its grouping is 2-2-3 rather than 3-3-3, which is a
 * different algorithm and not a separator swap. It delegates to `en-IN`.
 */
const SEPARATORS: Record<NumberFormatName, { group: string; decimal: string }> = {
  'dot-comma': { group: '.', decimal: ',' },
  'comma-dot': { group: ',', decimal: '.' },
  /* A narrow no-break space (U+202F), which is what CLDR uses for French and
     Scandinavian grouping - a normal space would let the number wrap. */
  'space-comma': { group: '\u202F', decimal: ',' },
  'space-dot': { group: '\u202F', decimal: '.' },
  'apostrophe-dot': { group: '\u2019', decimal: '.' },
  indian: { group: ',', decimal: '.' },
}

export const DEFAULT_FORMAT_PREFERENCES: FormatPreferences = {
  numberFormat: 'dot-comma',
  dateFormat: 'DD.MM.YYYY.',
  timeFormat: '24h',
  firstDayOfWeek: 1,
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
export function resolveLabel(
  label: LocalizedLabel | undefined,
  locale: Locale,
  params?: Record<string, string | number>,
): string {
  if (label === undefined) return ''

  if (typeof label === 'string') {
    /*
     * `t('data.table.clearSelection')` vs `t(company.name)`: both are plain
     * strings to the type system. `TRANSLATION_KEYS` (generated from `en.json`)
     * is what tells them apart at runtime - a recognized key is looked up in the
     * catalog, anything else is returned exactly as given. That symmetry is the
     * whole reason a company name can be passed through `t()` unchanged.
     */
    if (!TRANSLATION_KEYS.has(label)) return label
    return resolveCatalogEntry(label, locale, params)
  }

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
 * A `TranslationKey` resolved against `CATALOGS`, through the same
 * `fallbackChain` an inline label uses - script fallback and the source
 * language work identically whether the text lives in the JSON catalog or in
 * an object literal.
 */
function resolveCatalogEntry(
  key: string,
  locale: Locale,
  params: Record<string, string | number> | undefined,
): string {
  for (const candidate of fallbackChain(locale)) {
    const entry = CATALOGS[candidate]?.[key]
    if (entry !== undefined) return renderCatalogValue(entry, locale, params)
  }
  /* Present in `en.json` (or it would not be a `TranslationKey` at all) but
     absent from every catalog in the chain - a broken build, not a missing
     translation. The key itself is at least visible, same philosophy as an
     unresolved `{placeholder}`. */
  return key
}

/**
 * A catalog value is a plain string, or - for a key whose text depends on a
 * count, like `data.bulk.selectedCount` - an object keyed by CLDR plural
 * category. `Intl.PluralRules` picks the category for `params.count`; a
 * category the catalog does not carry falls back to `other`, then to whichever
 * one exists - the same resilience `resolveLabel` gives an inline label.
 */
function renderCatalogValue(
  value: string | Partial<Record<string, string>>,
  locale: Locale,
  params: Record<string, string | number> | undefined,
): string {
  if (typeof value === 'string') return interpolate(value, params)

  const count = params?.count
  const category = count === undefined ? 'other' : pluralRules(locale).select(Number(count))
  const text = value[category] ?? value.other ?? Object.values(value).find(Boolean) ?? ''
  return interpolate(text, params)
}

const pluralRuleInstances = new Map<Locale, Intl.PluralRules>()

function pluralRules(locale: Locale): Intl.PluralRules {
  let rules = pluralRuleInstances.get(locale)
  if (!rules) {
    /* Plural category selection is per LANGUAGE, not per script - `Intl`
       accepts the bare `Locale` value fine, `sr-Latn` and `sr-Cyrl` select
       the same Serbian categories (`one` / `few` / `many` / `other`). */
    rules = new Intl.PluralRules(locale)
    pluralRuleInstances.set(locale, rules)
  }
  return rules
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
  const key = `errors.${error.code}`

  if (TRANSLATION_KEYS.has(key)) return resolveLabel(key, locale, error.params)

  /* An unknown code means the server is ahead of this release. Its prose is the
     best available, and the absence of both is worth seeing in development. */
  if (process.env.NODE_ENV !== 'production' && !error.message) {
    console.warn(`[i18n] unknown field error code "${error.code}" and no message`)
  }

  return error.message ?? resolveLabel('errors.invalid', locale)
}

/**
 * `{name}` replaced from `params`.
 *
 * Deliberately not ICU: none of the catalog entries this serves needs gender,
 * and ICU here would mean running a parser on a path that fires while the user
 * is looking at a failed form or a live counter. A placeholder with no value is
 * left as it is, which is visible in testing rather than silently empty.
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  )
}

/**
 * A number, formatted to the chosen preference.
 *
 * `formatToParts` rather than a locale that happens to look right: the base is
 * `en-US` and only the group and decimal separators are replaced, so nothing else
 * about the number changes.
 *
 * Digits are always Latin - `numberingSystem: 'latn'`. Anyone who wants ١٢٣٤ asks
 * for it through the tag: `ar-EG-u-nu-arab`.
 */
export function formatNumber(
  value: number | string | null | undefined,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
  preferences: FormatPreferences = DEFAULT_FORMAT_PREFERENCES,
): string {
  const num = typeof value === 'string' ? Number(value) : value
  /* An em dash (U+2014), not a hyphen. In a column of amounts a hyphen reads as a
      minus sign - and that is a different number, not a missing one. */
  if (num === null || num === undefined || Number.isNaN(num)) return EM_DASH

  const separators = SEPARATORS[preferences.numberFormat]

  /* Indian grouping is 2-2-3, a different algorithm rather than different
     characters, so it is the one case that delegates. */
  const base = preferences.numberFormat === 'indian' ? 'en-IN' : 'en-US'

  const parts = numberFormatter(base, { ...options, numberingSystem: 'latn' }).formatToParts(num)

  return parts
    .map((part) => {
      if (part.type === 'group') return separators.group
      if (part.type === 'decimal') return separators.decimal
      return part.value
    })
    .join('')
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
  preferences: FormatPreferences = DEFAULT_FORMAT_PREFERENCES,
): string {
  const formatted = formatDecimal(value, locale, decimals, preferences)

/*
* An empty amount is a dash alone, without the currency.
*
* Otherwise the cell reads "— RSD", which says there is an amount of dinars and
* it is missing. There is no amount at all.
*/
if (formatted === EM_DASH) return EM_DASH

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
return `${formatted}\u00A0${currencyCode}`
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
  preferences: FormatPreferences = DEFAULT_FORMAT_PREFERENCES,
): string {
  return formatNumber(
    value,
    locale,
    { minimumFractionDigits: decimals, maximumFractionDigits: decimals },
    preferences,
  )
}

/** A number with no imposed decimals — as many as the value actually has. */
export function formatQuantity(
  value: number | string | null | undefined,
  locale: Locale,
  maxDecimals = 3,
  preferences: FormatPreferences = DEFAULT_FORMAT_PREFERENCES,
): string {
  return formatNumber(value, locale, { maximumFractionDigits: maxDecimals }, preferences)
}

/**
 * A date.
 *
 * Two paths, and the split is the whole design:
 *
 * **Without `options`** the date is NUMBERS, and the user's `dateFormat` decides -
 * `01.03.2026.` or `03/01/2026`. Assembled from `formatToParts` rather than taken
 * from `dateStyle`, because `dateStyle: 'short'` in `sr` gives `1. 3. 2026.` with no
 * leading zeros, and a column of dates without them does not line up.
 *
 * **With `options`** - `{ month: 'long' }`, `{ weekday: 'short' }` - the date
 * contains WORDS, and the language decides. `1. mart 2026.` against `March 1, 2026`
 * is not a format preference; it is a sentence in a language.
 *
 * That is the same rule as everywhere else here: language decides what is written,
 * preferences decide how it looks. A month name is written, not looked.
 */
export function formatDate(
  value: Date | string | number | null | undefined,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
  preferences: FormatPreferences = DEFAULT_FORMAT_PREFERENCES,
): string {
  const date = toDate(value)
  if (!date) return EM_DASH

  /*
  * Words: the language answers, through the bare `locale` value.
  *
  * `LOCALE_TAGS` used to add a region (`sr-Latn-RS`) because `sr` alone was
  * ambiguous to `Intl` - it read as Cyrillic. Once the key itself carries the
  * script (`sr-Latn`, `sr-Cyrl`), it IS the tag, and the indirection is gone.
  */
  if (options) {
    return dateFormatter(locale, {
      timeZone: preferences.timeZone,
      ...options,
    }).format(date)
  }

  const { day, month, year } = dateParts(date, preferences.timeZone)

  switch (preferences.dateFormat) {
    case 'DD.MM.YYYY.':
      return `${day}.${month}.${year}.`
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`
    case 'DD-MM-YYYY':
      return `${day}-${month}-${year}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
  }
}

/**
 * Time of day, `10:05` or `10:05 AM`.
 *
 * `hour12` is taken from the preference, not from the locale. An English interface
 * in Belgrade still shows a 24-hour clock, because that is what the office runs on.
 */
export function formatTime(
  value: Date | string | number | null | undefined,
  preferences: FormatPreferences = DEFAULT_FORMAT_PREFERENCES,
): string {
  const date = toDate(value)
  if (!date) return EM_DASH

  const twelve = preferences.timeFormat === '12h'

  return dateFormatter(twelve ? 'en-US' : 'en-GB', {
    hour: twelve ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12: twelve,
    timeZone: preferences.timeZone,
  }).format(date)
}

/** Date and time together, each following its own preference. */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  locale: Locale,
  preferences: FormatPreferences = DEFAULT_FORMAT_PREFERENCES,
): string {
  const date = toDate(value)
  if (!date) return EM_DASH
  return `${formatDate(date, locale, undefined, preferences)} ${formatTime(date, preferences)}`
}

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Day, month and year as padded strings.
 *
 * `en-GB` as the base because the parts are only ever numbers here - which locale
 * produces them makes no difference, and asking for `2-digit` is what guarantees the
 * leading zero regardless.
 */
function dateParts(date: Date, timeZone?: string) {
  const parts = dateFormatter('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).formatToParts(date)

  const found: Record<string, string> = {}
  for (const part of parts) {
    if (part.type !== 'literal') found[part.type] = part.value
  }

  return { day: found.day ?? '', month: found.month ?? '', year: found.year ?? '' }
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
  'sr-Latn': 'Srpski',
  'sr-Cyrl': 'Српски',
}

/**
 * dayjs locale codes, which are not our `Locale` values.
 *
 * dayjs uses its own short names - `sr`, `sr-cyrl`, `en` - and does not understand
 * `sr-Latn`. Handed a code it does not know, it falls back to English without a
 * word: that is why every calendar in this system showed `Mo, Tu, We` whatever the
 * language.
 *
 * And dayjs `sr` is LATIN, while to CLDR a bare `sr` is Cyrillic. Two libraries,
 * two meanings for the same string - which is why this is written out rather than
 * derived.
 *
 * Here rather than in `@liro/dates`, because `@liro/dates` depends on `@liro/ui`
 * and `@liro/schedule` needs the same table. Reaching it through that package
 * would pull 245 components in for three lines. It is a mapping of languages, not
 * of dates.
 *
 * When a locale is added in phase 4, its dayjs code goes here - the one place in
 * the system where a language needs more than a file.
 */
export const DAYJS_LOCALE: Record<Locale, string> = {
  'sr-Latn': 'sr',
  'sr-Cyrl': 'sr-cyrl',
  en: 'en',
}

export function localeName(locale: Locale): string {
  const override = NAME_OVERRIDES[locale]
  if (override) return override

  /*
  * The bare `Locale` value, not a region-qualified tag - `LOCALE_TAGS` was
  * deleted once the key itself became an unambiguous BCP 47 tag (`sr-Latn`,
  * `sr-Cyrl`). See the note on `formatDate`'s word path.
  */
  const tag = locale

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
  const language = locale.split('-')[0] ?? locale
  return RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
}
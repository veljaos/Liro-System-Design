import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * What makes 43 locales safe.
 *
 * For every catalog against `en.json`: missing keys, extra keys, mismatched
 * `{placeholder}` sets, and a report (not a failure) of which CLDR plural
 * categories the locale requires versus which its plural-shaped entries carry.
 *
 * Exits non-zero on missing keys or mismatched placeholders - both mean a
 * screen would render an empty string or an unresolved `{count}`. A missing
 * plural category is left non-fatal on purpose: it is information a
 * translator needs, not a build failure - see PHASE-3-KEYS.md.
 */

const LOCALES_DIR = join(process.cwd(), 'locales')
const SOURCE_LOCALE = 'en'

/**
 * The one namespace that must be complete in every locale.
 *
 * With thirty-three locales a partial catalog is the normal state, not an
 * exception: a translator does not finish everything at once, and the fallback
 * chain covers the gap with English. Failing the build for that would mean the
 * check is disabled within a week.
 *
 * `errors.*` is different. Those are the only strings that arrive from OUTSIDE the
 * system - the server sends a code and the client turns it into a sentence - so a
 * gap there shows the server's raw prose, which in another language means the user
 * reads English, or nothing at all.
 *
 * Guarded by a test as well, in `packages/data/src/fieldErrors.test.ts`.
 */
const CRITICAL_PREFIX = 'errors.'

type CatalogValue = string | Partial<Record<string, string>>
type Catalog = Record<string, CatalogValue>

const files = readdirSync(LOCALES_DIR)
  .filter((name) => name.endsWith('.json'))
  .map((name) => name.replace(/\.json$/, ''))
  .sort()

const catalogs: Record<string, Catalog> = {}
for (const locale of files) {
  catalogs[locale] = JSON.parse(readFileSync(join(LOCALES_DIR, `${locale}.json`), 'utf8'))
}

const source = catalogs[SOURCE_LOCALE]
if (!source) {
  throw new Error(`no ${SOURCE_LOCALE}.json - nothing to check against`)
}

function placeholders(value: CatalogValue): Set<string> {
  const texts = typeof value === 'string' ? [value] : Object.values(value).filter((v): v is string => Boolean(v))
  const found = new Set<string>()
  for (const text of texts) {
    for (const match of text.matchAll(/\{(\w+)\}/g)) {
      const name = match[1]
      if (name) found.add(name)
    }
  }
  return found
}

function sameSet(a: Set<string>, b: Set<string>): boolean {
  return a.size === b.size && [...a].every((item) => b.has(item))
}

let failed = false
const sourceKeys = Object.keys(source)

for (const locale of files) {
  if (locale === SOURCE_LOCALE) continue

  const catalog = catalogs[locale]
  if (!catalog) continue
  const keys = Object.keys(catalog)

  const missingAll = sourceKeys.filter((key) => !(key in catalog))
  const missing = missingAll.filter((key) => key.startsWith(CRITICAL_PREFIX))
  const untranslated = missingAll.filter((key) => !key.startsWith(CRITICAL_PREFIX))
  const extra = keys.filter((key) => !(key in source))

  const mismatchedPlaceholders = sourceKeys.filter((key) => {
    const sourceValue = source[key]
    const localeValue = catalog[key]
    if (sourceValue === undefined || localeValue === undefined) return false
    return !sameSet(placeholders(sourceValue), placeholders(localeValue))
  })

  if (missing.length > 0) {
    failed = true
    console.error(
      `[i18n:check] ${locale}: MISSING ERROR MESSAGES - these must be complete in every locale\n  ${missing.join('\n  ')}`,
    )
  }
  if (untranslated.length > 0) {
    const shown = untranslated.slice(0, 8)
    const rest = untranslated.length - shown.length
    console.log(
      `[i18n:check] ${locale}: ${untranslated.length} of ${sourceKeys.length} keys not translated yet` +
      `\n  ${shown.join('\n  ')}` +
      (rest > 0 ? `\n  ... and ${rest} more` : ''),
    )
  }
  if (extra.length > 0) {
    failed = true
    console.error(`[i18n:check] ${locale}: extra keys not in ${SOURCE_LOCALE}.json\n  ${extra.join('\n  ')}`)
  }
  if (mismatchedPlaceholders.length > 0) {
    failed = true
    console.error(`[i18n:check] ${locale}: mismatched placeholders\n  ${mismatchedPlaceholders.join('\n  ')}`)
  }

  /*
   * Informational only. A translator reads this to know which categories a
   * plural-shaped entry needs for THIS locale - Arabic six, Russian and Polish
   * four, Slovenian four different ones, Japanese one - and it is exactly what
   * cannot be guessed from the English source, which only ever has `one`/`other`.
   */
  const required = new Intl.PluralRules(locale).resolvedOptions().pluralCategories
  const pluralKeys = keys.filter((key) => typeof catalog[key] === 'object')
  for (const key of pluralKeys) {
    const value = catalog[key]
    const present = Object.keys(value as object)
    const missingCategories = required.filter((category) => !present.includes(category))
    if (missingCategories.length > 0) {
      console.log(`[i18n:check] ${locale} ${key}: missing plural categories ${missingCategories.join(', ')} (required: ${required.join(', ')})`)
    }
  }
}

if (failed) {
  console.error('[i18n:check] failed')
  process.exit(1)
}

console.log(
  `[i18n:check] ${files.length - 1} locale(s) checked against ${SOURCE_LOCALE}.json, ${sourceKeys.length} keys - ok`,
)

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
 * Keys deliberately left untranslated in `sr-Cyrl.json`.
 *
 * Per PHASE-3-KEYS.md: transliteration is mechanical for most words and wrong
 * for some, and a wrong word in a legal interface is worse than a missing
 * one. A key on this list is missing on purpose - the owner reads Cyrillic and
 * fills it in - so it must not fail the build. Same pattern as the `KNOWN`
 * allowlist in `e2e/a11y.spec.ts`: this list is only allowed to SHRINK, never
 * grow with something that could have been translated instead.
 */
const KNOWN_MISSING_CYRILLIC: Record<string, string[]> = {
  'sr-Cyrl': [
    'patterns.versionCompare.showUnchanged',
    'patterns.versionCompare.noDifferences',
    'feedback.conflictBanner.loadLatest',
    'feedback.conflictBanner.overwriteMine',
    'patterns.stepWizard.finish',
    'patterns.stepWizard.next',
    'patterns.capacityTimeline.day',
    'patterns.capacityTimeline.week',
    'patterns.capacityTimeline.month',
    'patterns.capacityTimeline.today',
    'patterns.capacityTimeline.overloadedResource',
    'patterns.capacityTimeline.utilization',
    'patterns.checklist.checksPassed',
    'patterns.stockMovement.currentBalance',
    'patterns.stockMovement.colType',
    'patterns.stockMovement.colDate',
    'patterns.stockMovement.colReference',
    'patterns.stockMovement.colFromTo',
    'patterns.stockMovement.colQuantity',
    'patterns.stockMovement.colBalance',
    'patterns.rate.amountsIn',
    'patterns.slotPicker.free',
    'patterns.slotPicker.confirmSlot',
    'patterns.processMap.start',
    'patterns.processMap.task',
    'patterns.processMap.decision',
    'patterns.processMap.end',
    'auth.profile.title',
    'auth.profile.description',
    'auth.profile.changePhoto',
    'auth.profile.remove',
    'auth.password.title',
    'auth.password.description',
    'auth.password.change',
    'auth.twoFactorCard.title',
    'auth.twoFactorCard.description',
    'auth.twoFactorCard.generateNew',
    'auth.twoFactorCard.turnOff',
    'auth.twoFactorCard.turnOn',
    'auth.sessions.title',
    'auth.sessions.signOutOthers',
    'auth.sessions.signOutDevice',
    'auth.preferences.title',
    'auth.dangerZone.title',
    'auth.dangerZone.description',
    'auth.dangerZone.deleteAccount',
    'patterns.approvalChain.requiresAll',
    'patterns.approvalChain.requiresOne',
    'patterns.approvalChain.missingReason',
    'patterns.checklist.blockingCheck',
    'patterns.stepWizard.close',
  ],
}

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

  const known = new Set(KNOWN_MISSING_CYRILLIC[locale] ?? [])
  const missingAll = sourceKeys.filter((key) => !(key in catalog))
  const missing = missingAll.filter((key) => !known.has(key))
  const knownMissing = missingAll.filter((key) => known.has(key))
  const extra = keys.filter((key) => !(key in source))

  const mismatchedPlaceholders = sourceKeys.filter((key) => {
    if (known.has(key)) return false
    const sourceValue = source[key]
    const localeValue = catalog[key]
    if (sourceValue === undefined || localeValue === undefined) return false
    return !sameSet(placeholders(sourceValue), placeholders(localeValue))
  })

  if (missing.length > 0) {
    failed = true
    console.error(`[i18n:check] ${locale}: missing keys\n  ${missing.join('\n  ')}`)
  }
  if (knownMissing.length > 0) {
    console.log(`[i18n:check] ${locale}: missing on purpose (no Cyrillic yet, owner to fill in)\n  ${knownMissing.join('\n  ')}`)
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

console.log(`[i18n:check] ${files.length - 1} locale(s) checked against ${SOURCE_LOCALE}.json, ${sourceKeys.length} keys - ok`)

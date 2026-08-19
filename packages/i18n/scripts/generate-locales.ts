import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The `Locale` union, generated from the catalogs on disk.
 *
 * This file exists so that adding a language is adding a FILE. A hand-written
 * union is a list somebody has to remember to update, and the day they forget, the
 * catalog is there and the language is not selectable.
 *
 * Generated and COMMITTED, like `tokens.css`. Generated at build time and
 * gitignored, a fresh clone would fail `typecheck` before anyone ran the build.
 *
 * Run through `predev` and `prebuild`, and checked in CI - see `i18n:check`.
 */

const LOCALES_DIR = join(process.cwd(), 'locales')
const OUTPUT = join(process.cwd(), 'src', 'locales.generated.ts')
const SOURCE_LOCALE = 'en'

type CatalogValue = string | Partial<Record<string, string>>
type Catalog = Record<string, CatalogValue>

const files = readdirSync(LOCALES_DIR)
  .filter((name: string) => name.endsWith('.json'))
  .map((name: string) => name.replace(/\.json$/, ''))
  .sort()

if (files.length === 0) {
  throw new Error('no catalogs in packages/i18n/locales - the union would be empty')
}

/*
 * Every catalog must parse. A broken JSON file would otherwise produce a valid
 * union and fail much later, at runtime, on one language only.
 */
const catalogs: Record<string, Catalog> = {}
for (const locale of files) {
  const path = join(LOCALES_DIR, `${locale}.json`)
  try {
    catalogs[locale] = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new Error(`${locale}.json is not valid JSON: ${(error as Error).message}`)
  }
}

if (!catalogs[SOURCE_LOCALE]) {
  throw new Error(`no ${SOURCE_LOCALE}.json - it is the source catalog the key union is generated from`)
}

/*
 * `TranslationKey` is generated from `en.json` alone, not from every catalog.
 *
 * `en` is `SOURCE_LOCALE` (see `format.ts`) - the catalog every other one is
 * translated FROM - so it is the one place a key is guaranteed to exist. A key
 * present only in `sr-Latn.json` would mean a translator invented a string with
 * no English original, which `i18n:check` reports as an "extra key" rather than
 * feeding it into the union here.
 */
const keys = Object.keys(catalogs[SOURCE_LOCALE]).sort()

const union = files.map((locale: string) => `  | '${locale}'`).join('\n')
const list = files.map((locale: string) => `  '${locale}',`).join('\n')

const keyUnion = keys.length > 0
  ? keys.map((key) => `  | '${key}'`).join('\n')
  : '  | never'
const keyList = keys.map((key) => `  '${key}',`).join('\n')

const catalogsLiteral = files
  .map((locale) => `  '${locale}': ${JSON.stringify(catalogs[locale], null, 2).split('\n').join('\n  ')},`)
  .join('\n')

const output = `/* GENERATED from packages/i18n/locales/*.json - do not edit by hand.
 *
 * Add a language by adding a file. Run \`pnpm i18n:locales\`, or just \`pnpm dev\`
 * or \`pnpm build\`, which run it first.
 */

export type Locale =
${union}

export const LOCALES: Locale[] = [
${list}
]

/*
 * The union of every key in \`en.json\`.
 *
 * This is what makes a typo in a translation key fail \`typecheck\` rather than
 * silently falling back to English at runtime: declare the constant as
 * \`const X: TranslationKey = 'data.table.clearSelection'\` and a misspelled key
 * is rejected at the declaration, before it ever reaches \`t()\`.
 */
export type TranslationKey =
${keyUnion}

/** Same set, for the \`O(1)\` runtime check in \`resolveLabel\` - is this string a
 *  catalog key, or a plain string that should be returned as-is? */
export const TRANSLATION_KEYS: ReadonlySet<string> = new Set([
${keyList}
])

/**
 * The catalog content itself, embedded at build time rather than read with a
 * JSON import - keeps \`format.ts\` free of a \`resolveJsonModule\` dependency and
 * matches how \`Locale\` itself is generated here.
 *
 * A value is either a plain string, or - for a key whose translation depends on
 * a count (\`data.bulk.selectedCount\`, ...) - an object keyed by CLDR plural
 * category (\`one\` / \`few\` / \`many\` / \`other\`, ...). See \`resolveLabel\`.
 */
export const CATALOGS: Record<Locale, Record<string, string | Partial<Record<string, string>>>> = {
${catalogsLiteral}
}
`

writeFileSync(OUTPUT, output, 'utf8')
console.log(`i18n: ${files.length} locales, ${keys.length} keys -> src/locales.generated.ts`)

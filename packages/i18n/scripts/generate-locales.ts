import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The `Locale` union and the catalog loaders, generated from the files on disk.
 *
 * Catalogs are NOT embedded any more. Two are imported statically - the source
 * locale and the default one - and the rest become dynamic imports the bundler
 * splits into separate chunks. With three locales that saves 12 KB gzip; with
 * thirty-three it is the difference between 36 KB and 600.
 *
 * dayjs locales load the same way and for the same reason: Mantine's date
 * components read from dayjs, which knows only what has been imported.
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
/* Must match `DEFAULT_LOCALE` in `format.ts`. Both catalogs ship statically. */
const DEFAULT_LOCALE = 'sr-Latn'

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


const keys = Object.keys(catalogs[SOURCE_LOCALE]).sort()

const union = files.map((locale: string) => `  | '${locale}'`).join('\n')
const list = files.map((locale: string) => `  '${locale}',`).join('\n')

const keyUnion = keys.length > 0 ? keys.map((key) => `  | '${key}'`).join('\n') : '  | never'
const keyList = keys.map((key) => `  '${key}',`).join('\n')

/*
 * Two catalogs are static, the rest are chunks.
 *
 * `SOURCE_LOCALE` because every fallback chain ends there - a user whose chunk has
 * not arrived yet reads English rather than raw keys. `DEFAULT_LOCALE` because it
 * is what a user gets with no choice, so it must be there on the first paint.
 *
 * Everything else is fetched when someone selects it, from the application's own
 * server, once - the same mechanism a lazily loaded route uses.
 */
const STATIC_LOCALES = [SOURCE_LOCALE, DEFAULT_LOCALE].filter(
  (locale, index, all) => all.indexOf(locale) === index && files.includes(locale),
)

const identifier = (locale: string) => 'catalog_' + locale.replace(/[^A-Za-z0-9]/g, '_')

const staticImports = STATIC_LOCALES.map(
  (locale) => `import ${identifier(locale)} from '../locales/${locale}.json'`,
).join('\n')

const staticEntries = STATIC_LOCALES.map(
  (locale) => `  '${locale}': ${identifier(locale)} as Catalog,`,
).join('\n')

const loaderEntries = files
  .filter((locale) => !STATIC_LOCALES.includes(locale))
  .map(
    (locale) =>
      `  '${locale}': () => import('../locales/${locale}.json').then((m) => m.default as Catalog),`,
  )
  .join('\n')

/*
 * dayjs locale codes are not BCP 47 tags: lower case, and its own shorthands -
 * `sr` for Latin Serbian, `zh-cn` for Simplified Chinese. Anything it does not
 * recognise falls back to English without a word.
 *
 * By convention with named exceptions, because a table of thirty-three would be
 * another list to keep in step.
 */
const DAYJS_EXCEPTIONS: Record<string, string> = {
  'sr-Latn': 'sr',
  'sr-Cyrl': 'sr-cyrl',
  'zh-Hans': 'zh-cn',
  'zh-Hant': 'zh-tw',
}

const dayjsEntries = files
  .map((locale) => {
    const code = DAYJS_EXCEPTIONS[locale] ?? locale.toLowerCase()
    return `  '${locale}': () => import('dayjs/locale/${code}.js').then(() => undefined),`
  })
  .join('\n')

const BT = String.fromCharCode(96)

const output = [
  '/* GENERATED from packages/i18n/locales/*.json - do not edit by hand.',
  ' *',
  ' * Add a language by adding a file, then run ' + BT + 'pnpm i18n:locales' + BT + ' - or',
  ' * just ' + BT + 'pnpm dev' + BT + ' or ' + BT + 'pnpm build' + BT + ', which run it first.',
  ' */',
  '',
  staticImports,
  '',
  'export type CatalogValue = string | Partial<Record<string, string>>',
  'export type Catalog = Record<string, CatalogValue>',
  '',
  '/**',
  ' * Locales this package ships.',
  ' *',
  ' * NOT the full set an application may use: ' + BT + 'registerCatalog' + BT + ' accepts any',
  ' * tag, so a customer can add their own without forking. That is why ' + BT + 'Locale' + BT + ' is',
  ' * open - see ' + BT + 'format.ts' + BT + '.',
  ' */',
  'export type BuiltInLocale =',
  union,
  '',
  'export const LOCALES: BuiltInLocale[] = [',
  list,
  ']',
  '',
  '/*',
  ' * The union of every key in ' + BT + 'en.json' + BT + '.',
  ' *',
  ' * This is what makes a typo fail ' + BT + 'typecheck' + BT + ' rather than silently falling',
  ' * back to English at runtime: a misspelled key is rejected at the declaration,',
  ' * before it ever reaches ' + BT + 't()' + BT + '.',
  ' */',
  'export type TranslationKey =',
  keyUnion,
  '',
  '/** Same set, for the O(1) runtime check in ' + BT + 'resolveLabel' + BT + ' - is this string',
  ' *  a catalog key, or a plain string to return as-is? */',
  'export const TRANSLATION_KEYS: ReadonlySet<string> = new Set([',
  keyList,
  '])',
  '',
  '/** Catalogs available without a fetch: the source locale and the default one. */',
  'export const STATIC_CATALOGS: Record<string, Catalog> = {',
  staticEntries,
  '}',
  '',
  '/**',
  ' * The rest, as chunks.',
  ' *',
  ' * The bundler splits each ' + BT + 'import()' + BT + ' into its own file, so a user',
  ' * downloads the one language they selected and nothing else.',
  ' */',
  'export const CATALOG_LOADERS: Record<string, () => Promise<Catalog>> = {',
  loaderEntries,
  '}',
  '',
  '/**',
  ' * dayjs locale registration, per locale.',
  ' *',
  " * Mantine's date components read day and month names from dayjs, and dayjs knows",
  ' * only what has been imported. Loaded alongside the catalog, because a calendar',
  ' * in the wrong language is as wrong as a button in the wrong language.',
  ' */',
  'export const DAYJS_LOADERS: Record<string, () => Promise<void>> = {',
  dayjsEntries,
  '}',
  '',
].join('\n')

writeFileSync(OUTPUT, output, 'utf8')
console.log(
  `i18n: ${files.length} locales (${STATIC_LOCALES.length} static, ${files.length - STATIC_LOCALES.length} lazy), ${keys.length} keys -> src/locales.generated.ts`,
)
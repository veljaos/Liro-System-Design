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
for (const locale of files) {
  const path = join(LOCALES_DIR, `${locale}.json`)
  try {
    JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new Error(`${locale}.json is not valid JSON: ${(error as Error).message}`)
  }
}

const union = files.map((locale: string) => `  | '${locale}'`).join('\n')
const list = files.map((locale: string) => `  '${locale}',`).join('\n')

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
`

writeFileSync(OUTPUT, output, 'utf8')
console.log(`i18n: ${files.length} locales -> src/locales.generated.ts`)
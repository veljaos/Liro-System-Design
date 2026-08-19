import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { FIELD_ERROR_CODES } from './types'

/*
 * The codes live here, the translations in the `errors.*` namespace of the
 * `@liro/i18n` catalogs, and the two cannot be tied together by the type system -
 * `@liro/i18n` has no dependencies, deliberately, because it is the lowest layer
 * after the tokens.
 *
 * So this test keeps them in step. Without it, a code added to the contract would
 * ship with no translation and silently fall back to the server's prose - which in
 * another language means the user reads English, or nothing at all.
 *
 * The test lives in `@liro/data` rather than in `@liro/i18n` because the dependency
 * only runs in one direction. Put here it needs nothing new; put there it made a
 * real cycle, and neither pnpm nor turbo cares that a dependency is dev-only when
 * building the task graph.
 *
 * It reads the JSON files rather than the loaded catalogs, so it covers every
 * locale on disk - including the ones that are lazy chunks at runtime and would
 * otherwise never be checked.
 */

const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'i18n', 'locales')

const catalogs = Object.fromEntries(
  readdirSync(LOCALES_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => [
      name.replace(/\.json$/, ''),
      JSON.parse(readFileSync(join(LOCALES_DIR, name), 'utf8')) as Record<string, unknown>,
    ]),
)

describe('field error translations', () => {
  const errorKeys = Object.keys(catalogs.en ?? {}).filter((key) => key.startsWith('errors.'))

  it('covers every code in the contract', () => {
    const missing = FIELD_ERROR_CODES.filter((code) => !errorKeys.includes(`errors.${code}`))
    expect(missing, `no translation for: ${missing.join(', ')}`).toEqual([])
  })

  it('has no translation for a code that is not in the contract', () => {
    const extra = errorKeys
      .map((key) => key.replace(/^errors\./, ''))
      .filter((code) => !(FIELD_ERROR_CODES as readonly string[]).includes(code))
    expect(extra, `translation for unknown code: ${extra.join(', ')}`).toEqual([])
  })

  it('has every locale for every code', () => {
    /*
     * Error messages are the one namespace that must be complete in every locale.
     *
     * They are the only strings that arrive from outside the system, and a missing
     * one shows the server's prose - which in another language means the user reads
     * English, or nothing. Elsewhere a gap falls back gracefully; here it is a
     * failure.
     */
    const incomplete: string[] = []

    for (const [locale, catalog] of Object.entries(catalogs)) {
      for (const code of FIELD_ERROR_CODES) {
        if (!catalog[`errors.${code}`]) incomplete.push(`${locale}: errors.${code}`)
      }
    }

    expect(incomplete, `incomplete:\n  ${incomplete.join('\n  ')}`).toEqual([])
  })
})
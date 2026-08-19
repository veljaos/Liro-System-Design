import { describe, expect, it } from 'vitest'
import { CATALOGS, LOCALES } from '@liro/i18n'
import { FIELD_ERROR_CODES } from './types'

/*
 * The codes live here, the translations in the `errors.*` namespace of
 * `@liro/i18n`'s catalogs, and the two cannot be tied together by the type
 * system - `@liro/i18n` has no dependencies, deliberately, because it is the
 * lowest layer after the tokens.
 *
 * So this test keeps them in step. Without it, a code added to the contract would
 * ship with no translation and silently fall back to the server's prose - which in
 * another language means the user reads English, or nothing at all.
 *
 * The test lives in `@liro/data` rather than in `@liro/i18n` because the dependency
 * only runs in one direction. Put here, it needs nothing new; put there, it made a
 * real cycle - and pnpm and turbo do not care that a dependency is dev-only when
 * they build the task graph.
 */
describe('field error translations', () => {
  const errorKeys = Object.keys(CATALOGS.en).filter((key) => key.startsWith('errors.'))

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
    const incomplete = FIELD_ERROR_CODES.filter((code) =>
      LOCALES.some((locale) => !CATALOGS[locale][`errors.${code}`]),
    )
    expect(incomplete, `incomplete locales for: ${incomplete.join(', ')}`).toEqual([])
  })
})
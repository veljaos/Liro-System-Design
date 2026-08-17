import { describe, expect, it } from 'vitest'
import { FIELD_ERROR_LABELS } from '@liro/i18n'
import { FIELD_ERROR_CODES } from './types'

/*
 * The codes live here, the translations in `@liro/i18n`, and the two cannot be tied
 * together by the type system - `@liro/i18n` has no dependencies, deliberately,
 * because it is the lowest layer after the tokens.
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
  it('covers every code in the contract', () => {
    const missing = FIELD_ERROR_CODES.filter((code) => !FIELD_ERROR_LABELS[code])
    expect(missing, `no translation for: ${missing.join(', ')}`).toEqual([])
  })

  it('has no translation for a code that is not in the contract', () => {
    const extra = Object.keys(FIELD_ERROR_LABELS).filter(
      (code) => !(FIELD_ERROR_CODES as readonly string[]).includes(code),
    )
    expect(extra, `translation for unknown code: ${extra.join(', ')}`).toEqual([])
  })

  it('has all three locales for every code', () => {
    const incomplete = Object.entries(FIELD_ERROR_LABELS)
      .filter(([, label]) => {
        if (typeof label === 'string') return false
        return !(label.sr && label['sr-Cyrl'] && label.en)
      })
      .map(([code]) => code)

    expect(incomplete, `incomplete locales for: ${incomplete.join(', ')}`).toEqual([])
  })
})
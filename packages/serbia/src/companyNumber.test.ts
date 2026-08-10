import { describe, expect, it } from 'vitest'
import { isValidSerbianCompanyNumber } from './companyNumber'

/*
 * Real company numbers. The test deliberately asserts only what we proved:
 * the length. If someone tomorrow adds a "check digit", these numbers will
 * fail and show that the assumption was wrong.
 */
const STVARNI = ['22026429', '06532926', '21603376', '21263036']

describe('isValidSerbianCompanyNumber', () => {
  it.each(STVARNI)('accepts a real company number %s', (mb) => {
    expect(isValidSerbianCompanyNumber(mb)).toBe(true)
  })

  it('preserves a leading zero', () => {
    /* `06532926` must stay a string; as a number it would become 6532926. */
    expect(isValidSerbianCompanyNumber('06532926')).toBe(true)
    expect(isValidSerbianCompanyNumber('6532926')).toBe(false)
  })

  it('rejects a wrong length', () => {
    expect(isValidSerbianCompanyNumber('220264290')).toBe(false)
    expect(isValidSerbianCompanyNumber('')).toBe(false)
  })
})
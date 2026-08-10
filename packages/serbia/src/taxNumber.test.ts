import { describe, expect, it } from 'vitest'
import { isValidSerbianTin, isValidTaxNumber } from './taxNumber'

/*
 * The PIBs are real and verified. When adding new ones, take them from APR or
 * an invoice — a made-up number that "looks like a PIB" proves nothing.
 */
const STVARNI = ['109897145', '114457216', '101880066']

describe('isValidSerbianTin', () => {
  it.each(STVARNI)('accepts a real PIB %s', (pib) => {
    expect(isValidSerbianTin(pib)).toBe(true)
  })

  it('rejects a number with a wrong check digit', () => {
    expect(isValidSerbianTin('123456789')).toBe(false)
    /* The same three PIBs with the last digit changed. */
    expect(isValidSerbianTin('109897146')).toBe(false)
    expect(isValidSerbianTin('114457210')).toBe(false)
  })

  it('rejects wrong length and disallowed characters', () => {
    expect(isValidSerbianTin('10989714')).toBe(false)
    expect(isValidSerbianTin('1098971455')).toBe(false)
    expect(isValidSerbianTin('10989714a')).toBe(false)
    expect(isValidSerbianTin('')).toBe(false)
  })

  it('ignores spaces around the number', () => {
    expect(isValidSerbianTin('  109897145  ')).toBe(true)
  })
})

describe('isValidTaxNumber', () => {
  it('applies the check only to nine-digit numbers', () => {
    expect(isValidTaxNumber('123456789')).toBe(false)
    expect(isValidTaxNumber('109897145')).toBe(true)
  })

  it('accepts a foreign tax number that does not have the Serbian shape', () => {
    expect(isValidTaxNumber('DE811907980')).toBe(true)
    expect(isValidTaxNumber('ATU12345678')).toBe(true)
  })

  it('rejects input that is too short', () => {
    expect(isValidTaxNumber('AB12')).toBe(false)
  })
})
import { describe, expect, it } from 'vitest'
import { isValidSerbianTin, isValidTaxNumber } from './taxNumber'

/*
 * PIB-ovi su stvarni i provereni. Kada dodajes nove, uzmi ih iz APR-a ili sa
 * fakture — izmisljen broj koji "izgleda kao PIB" ne dokazuje nista.
 */
const STVARNI = ['109897145', '114457216', '101880066']

describe('isValidPib', () => {
  it.each(STVARNI)('prihvata stvaran PIB %s', (pib) => {
    expect(isValidSerbianTin(pib)).toBe(true)
  })

  it('odbija broj sa pogresnom kontrolnom cifrom', () => {
    expect(isValidSerbianTin('123456789')).toBe(false)
    /* Ista tri PIB-a sa promenjenom poslednjom cifrom. */
    expect(isValidSerbianTin('109897146')).toBe(false)
    expect(isValidSerbianTin('114457210')).toBe(false)
  })

  it('odbija pogresnu duzinu i nedozvoljene znake', () => {
    expect(isValidSerbianTin('10989714')).toBe(false)
    expect(isValidSerbianTin('1098971455')).toBe(false)
    expect(isValidSerbianTin('10989714a')).toBe(false)
    expect(isValidSerbianTin('')).toBe(false)
  })

  it('zanemaruje razmake oko broja', () => {
    expect(isValidSerbianTin('  109897145  ')).toBe(true)
  })
})

describe('isValidPoreskiBroj', () => {
  it('primenjuje kontrolu samo na devetocifrene brojeve', () => {
    expect(isValidTaxNumber('123456789')).toBe(false)
    expect(isValidTaxNumber('109897145')).toBe(true)
  })

  it('prihvata strani poreski broj koji nema srpski oblik', () => {
    expect(isValidTaxNumber('DE811907980')).toBe(true)
    expect(isValidTaxNumber('ATU12345678')).toBe(true)
  })

  it('odbija prekratak unos', () => {
    expect(isValidTaxNumber('AB12')).toBe(false)
  })
})
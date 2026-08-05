import { describe, expect, it } from 'vitest'
import { isValidPib, isValidPoreskiBroj } from './pib'

/*
 * PIB-ovi su stvarni i provereni. Kada dodajes nove, uzmi ih iz APR-a ili sa
 * fakture — izmisljen broj koji "izgleda kao PIB" ne dokazuje nista.
 */
const STVARNI = ['109897145', '114457216', '101880066']

describe('isValidPib', () => {
  it.each(STVARNI)('prihvata stvaran PIB %s', (pib) => {
    expect(isValidPib(pib)).toBe(true)
  })

  it('odbija broj sa pogresnom kontrolnom cifrom', () => {
    expect(isValidPib('123456789')).toBe(false)
    /* Ista tri PIB-a sa promenjenom poslednjom cifrom. */
    expect(isValidPib('109897146')).toBe(false)
    expect(isValidPib('114457210')).toBe(false)
  })

  it('odbija pogresnu duzinu i nedozvoljene znake', () => {
    expect(isValidPib('10989714')).toBe(false)
    expect(isValidPib('1098971455')).toBe(false)
    expect(isValidPib('10989714a')).toBe(false)
    expect(isValidPib('')).toBe(false)
  })

  it('zanemaruje razmake oko broja', () => {
    expect(isValidPib('  109897145  ')).toBe(true)
  })
})

describe('isValidPoreskiBroj', () => {
  it('primenjuje kontrolu samo na devetocifrene brojeve', () => {
    expect(isValidPoreskiBroj('123456789')).toBe(false)
    expect(isValidPoreskiBroj('109897145')).toBe(true)
  })

  it('prihvata strani poreski broj koji nema srpski oblik', () => {
    expect(isValidPoreskiBroj('DE811907980')).toBe(true)
    expect(isValidPoreskiBroj('ATU12345678')).toBe(true)
  })

  it('odbija prekratak unos', () => {
    expect(isValidPoreskiBroj('AB12')).toBe(false)
  })
})
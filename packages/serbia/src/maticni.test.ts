import { describe, expect, it } from 'vitest'
import { isValidMaticniBroj } from './maticni'

/*
 * Stvarni maticni brojevi. Test namerno tvrdi samo ono sto smo dokazali:
 * duzinu. Ako neko sutra doda "kontrolnu cifru", ovi brojevi ce pasti i
 * pokazace da je pretpostavka bila pogresna.
 */
const STVARNI = ['22026429', '06532926', '21603376', '21263036']

describe('isValidMaticniBroj', () => {
  it.each(STVARNI)('prihvata stvaran maticni broj %s', (mb) => {
    expect(isValidMaticniBroj(mb)).toBe(true)
  })

  it('cuva vodecu nulu', () => {
    /* `06532926` mora ostati string; kao broj bi postao 6532926. */
    expect(isValidMaticniBroj('06532926')).toBe(true)
    expect(isValidMaticniBroj('6532926')).toBe(false)
  })

  it('odbija pogresnu duzinu', () => {
    expect(isValidMaticniBroj('220264290')).toBe(false)
    expect(isValidMaticniBroj('')).toBe(false)
  })
})
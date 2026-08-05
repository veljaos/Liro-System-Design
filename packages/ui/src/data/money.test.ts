import { describe, expect, it } from 'vitest'
import { fromMinor, toMinor } from './money'

describe('toMinor', () => {
  it('resava klasicnu gresku decimalnog zbira', () => {
    /* Bez pretvaranja u pare: 0.1 + 0.2 === 0.30000000000000004 */
    expect(toMinor(0.1) + toMinor(0.2)).toBe(toMinor(0.3))
  })

  it('drzi nalog u ravnotezi na sto redova', () => {
    let debit = 0
    let credit = 0
    for (let i = 0; i < 100; i += 1) {
      debit += toMinor(1234.56)
      credit += toMinor(1234.56)
    }
    expect(debit - credit).toBe(0)
  })

  it('prihvata tekst iz polja za unos', () => {
    expect(toMinor('1234.56')).toBe(123456)
  })

  it('prazno i neispravno tretira kao nulu', () => {
    expect(toMinor(null)).toBe(0)
    expect(toMinor(undefined)).toBe(0)
    expect(toMinor('')).toBe(0)
    expect(toMinor('abc')).toBe(0)
  })

  it('zaokruzuje na dve decimale', () => {
    expect(toMinor(1234.567)).toBe(123457)
    expect(toMinor(1234.564)).toBe(123456)
  })

  it('cuva znak', () => {
    expect(toMinor(-1234.56)).toBe(-123456)
  })

  it('vraca iznos nazad bez gubitka', () => {
    expect(fromMinor(toMinor(1234.56))).toBe(1234.56)
  })
})
import { describe, expect, it } from 'vitest'
import { parseSerbianDate } from './parse'

describe('parseSerbianDate', () => {
  it('prihvata oblik koji operater zaista kuca', () => {
    /* Sest cifara bez tacaka — najbrzi unos na numerickoj tastaturi. */
    expect(parseSerbianDate('010326')).toBe('2026-03-01')
    expect(parseSerbianDate('01032026')).toBe('2026-03-01')
  })

  it('prihvata razdvojene oblike', () => {
    expect(parseSerbianDate('1.3.2026')).toBe('2026-03-01')
    expect(parseSerbianDate('01.03.2026.')).toBe('2026-03-01')
    expect(parseSerbianDate('01-03-2026')).toBe('2026-03-01')
    expect(parseSerbianDate('01/03/2026')).toBe('2026-03-01')
  })

  it('propusta datum koji je vec u ciljnom obliku', () => {
    expect(parseSerbianDate('2026-03-01')).toBe('2026-03-01')
  })

  it('dvocifrena godina: do 69 je dvehiljadite, od 70 devetnaeste', () => {
    expect(parseSerbianDate('010369')).toBe('2069-03-01')
    expect(parseSerbianDate('010370')).toBe('1970-03-01')
  })

  it('odbija datum koji ne postoji', () => {
    /* Bez provere bi `Date` tiho pretvorio 31.02 u 3. mart. */
    expect(parseSerbianDate('310226')).toBeNull()
    expect(parseSerbianDate('320126')).toBeNull()
    expect(parseSerbianDate('011326')).toBeNull()
  })

  it('prazan i besmislen unos daju null', () => {
    expect(parseSerbianDate('')).toBeNull()
    expect(parseSerbianDate('   ')).toBeNull()
    expect(parseSerbianDate('sutra')).toBeNull()
  })
})
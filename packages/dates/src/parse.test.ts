import { describe, expect, it } from 'vitest'
import { parseSerbianDate } from './parse'

describe('parseSerbianDate', () => {
  it('accepts the form an operator actually types', () => {
    /* Six digits with no separators — the fastest entry on a numeric keypad. */
    expect(parseSerbianDate('010326')).toBe('2026-03-01')
    expect(parseSerbianDate('01032026')).toBe('2026-03-01')
  })

  it('accepts separated forms', () => {
    expect(parseSerbianDate('1.3.2026')).toBe('2026-03-01')
    expect(parseSerbianDate('01.03.2026.')).toBe('2026-03-01')
    expect(parseSerbianDate('01-03-2026')).toBe('2026-03-01')
    expect(parseSerbianDate('01/03/2026')).toBe('2026-03-01')
  })

  it('passes through a date already in the target form', () => {
    expect(parseSerbianDate('2026-03-01')).toBe('2026-03-01')
  })

  it('two-digit year: up to 69 is 2000s, from 70 is 1900s', () => {
    expect(parseSerbianDate('010369')).toBe('2069-03-01')
    expect(parseSerbianDate('010370')).toBe('1970-03-01')
  })

  it('rejects a date that does not exist', () => {
    /* Without this check, `Date` would silently roll 31.02 over to March 3rd. */
    expect(parseSerbianDate('310226')).toBeNull()
    expect(parseSerbianDate('320126')).toBeNull()
    expect(parseSerbianDate('011326')).toBeNull()
  })

  it('empty and nonsensical input give null', () => {
    expect(parseSerbianDate('')).toBeNull()
    expect(parseSerbianDate('   ')).toBeNull()
    expect(parseSerbianDate('sutra')).toBeNull()
  })
})
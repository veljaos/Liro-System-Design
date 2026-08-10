import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatDecimal, formatNumber, resolveLabel } from './format'

describe('resolveLabel', () => {
  it('returns a string as-is', () => {
    expect(resolveLabel('Zaposleni', 'en')).toBe('Zaposleni')
  })

  it('picks the requested language', () => {
    expect(resolveLabel({ sr: 'Sačuvaj', en: 'Save' }, 'en')).toBe('Save')
  })

  it('falls back to Serbian, then English, then the first non-empty value', () => {
    expect(resolveLabel({ sr: 'Sačuvaj' }, 'en')).toBe('Sačuvaj')
    expect(resolveLabel({ en: 'Save' }, 'sr')).toBe('Save')
    expect(resolveLabel({ 'sr-Cyrl': 'Сачувај' }, 'en')).toBe('Сачувај')
  })

  it('never returns undefined', () => {
    expect(resolveLabel(undefined, 'sr')).toBe('')
    expect(resolveLabel({}, 'sr')).toBe('')
  })
})

describe('formatDecimal', () => {
  it('uses a dot for thousands and a comma for decimals', () => {
    expect(formatDecimal(1234567.89, 'sr')).toBe('1.234.567,89')
  })

  it('supports four decimals for the NBS exchange rate', () => {
    expect(formatDecimal(117.2456, 'sr', 4)).toBe('117,2456')
  })

  it('shows empty as a dash, but not zero', () => {
    expect(formatDecimal(null, 'sr')).toBe('—')
    expect(formatDecimal(undefined, 'sr')).toBe('—')
    expect(formatDecimal(0, 'sr')).toBe('0,00')
  })
})

describe('formatCurrency', () => {
  it('joins the amount and currency with a non-breaking space', () => {
    /* A normal space would let "RSD" break onto a new line. */
    expect(formatCurrency(1240000, 'RSD', 'sr')).toBe('1.240.000,00\u00A0RSD')
  })

  it('empty stays a dash with no currency', () => {
    expect(formatCurrency(null, 'RSD', 'sr')).toBe('—')
  })
})

describe('formatNumber', () => {
  it('rejects text that is not a number', () => {
    expect(formatNumber('abc', 'sr')).toBe('—')
  })

  it('accepts a number given as text', () => {
    expect(formatNumber('1234', 'sr')).toBe('1.234')
  })
})

describe('formatDate', () => {
  it('displays the date in Serbian form', () => {
    expect(formatDate('2026-03-01', 'sr')).toBe('01.03.2026.')
  })

  it('an invalid date gives a dash', () => {
    expect(formatDate('nije-datum', 'sr')).toBe('—')
    expect(formatDate(null, 'sr')).toBe('—')
  })
})
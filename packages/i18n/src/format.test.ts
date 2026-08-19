import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatDecimal, formatNumber, resolveLabel } from './format'

describe('resolveLabel', () => {
  it('returns a string as-is', () => {
    expect(resolveLabel('Zaposleni', 'en')).toBe('Zaposleni')
  })

  /*
   * Uses real catalog keys (`errors.*`, `dates.*`) rather than a mock, so a
   * change to the actual JSON that breaks lookup fails here too.
   */
  it('looks up a known TranslationKey in the catalog', () => {
    expect(resolveLabel('errors.required', 'en')).toBe('This field is required.')
    expect(resolveLabel('errors.required', 'sr-Latn')).toBe('Obavezno polje.')
  })

  it('returns an unrecognized string as-is, not a catalog miss', () => {
    /* This is what keeps a plain string - a company name - working: only a
       string present in `TRANSLATION_KEYS` is looked up. */
    expect(resolveLabel('errors.requird', 'en')).toBe('errors.requird')
  })

  it('interpolates {param} placeholders in a catalog string', () => {
    expect(resolveLabel('errors.too_short', 'en', { min: 8 })).toBe('At least 8 characters.')
  })

  it('picks a CLDR plural category by params.count', () => {
    expect(resolveLabel('dates.dueDate.dueInDays', 'en', { days: 1, count: 1 })).toBe('In 1 day')
    expect(resolveLabel('dates.dueDate.dueInDays', 'en', { days: 3, count: 3 })).toBe('In 3 days')
    /* Serbian `few` (2-4) and `other` (5+, 0) share the same word for "dana". */
    expect(resolveLabel('dates.dueDate.dueInDays', 'sr-Latn', { days: 1, count: 1 })).toBe('Za 1 dan')
    expect(resolveLabel('dates.dueDate.dueInDays', 'sr-Latn', { days: 3, count: 3 })).toBe('Za 3 dana')
    expect(resolveLabel('dates.dueDate.dueInDays', 'sr-Latn', { days: 5, count: 5 })).toBe('Za 5 dana')
  })

  it('picks the requested language', () => {
    expect(resolveLabel({ 'sr-Latn': 'Sačuvaj', en: 'Save' }, 'en')).toBe('Save')
  })

  it('falls back to Serbian, then English, then the first non-empty value', () => {
    expect(resolveLabel({ 'sr-Latn': 'Sačuvaj' }, 'en')).toBe('Sačuvaj')
    expect(resolveLabel({ en: 'Save' }, 'sr-Latn')).toBe('Save')
    expect(resolveLabel({ 'sr-Cyrl': 'Сачувај' }, 'en')).toBe('Сачувај')
  })

  it('never returns undefined', () => {
    expect(resolveLabel(undefined, 'sr-Latn')).toBe('')
    expect(resolveLabel({}, 'sr-Latn')).toBe('')
  })
})

describe('formatDecimal', () => {
  it('uses a dot for thousands and a comma for decimals', () => {
    expect(formatDecimal(1234567.89, 'sr-Latn')).toBe('1.234.567,89')
  })

  it('supports four decimals for the NBS exchange rate', () => {
    expect(formatDecimal(117.2456, 'sr-Latn', 4)).toBe('117,2456')
  })

  it('shows empty as a dash, but not zero', () => {
    expect(formatDecimal(null, 'sr-Latn')).toBe('—')
    expect(formatDecimal(undefined, 'sr-Latn')).toBe('—')
    expect(formatDecimal(0, 'sr-Latn')).toBe('0,00')
  })
})

describe('formatCurrency', () => {
  it('joins the amount and currency with a non-breaking space', () => {
    /* A normal space would let "RSD" break onto a new line. */
    expect(formatCurrency(1240000, 'RSD', 'sr-Latn')).toBe('1.240.000,00 RSD')
  })

  it('empty stays a dash with no currency', () => {
    expect(formatCurrency(null, 'RSD', 'sr-Latn')).toBe('—')
  })
})

describe('formatNumber', () => {
  it('rejects text that is not a number', () => {
    expect(formatNumber('abc', 'sr-Latn')).toBe('—')
  })

  it('accepts a number given as text', () => {
    expect(formatNumber('1234', 'sr-Latn')).toBe('1.234')
  })
})

describe('formatDate', () => {
  it('displays the date in Serbian form', () => {
    expect(formatDate('2026-03-01', 'sr-Latn')).toBe('01.03.2026.')
  })

  it('an invalid date gives a dash', () => {
    expect(formatDate('nije-datum', 'sr-Latn')).toBe('—')
    expect(formatDate(null, 'sr-Latn')).toBe('—')
  })
})

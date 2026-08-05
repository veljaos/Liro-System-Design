import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatDecimal, formatNumber, resolveLabel } from './format'

describe('resolveLabel', () => {
  it('vraca string kakav jeste', () => {
    expect(resolveLabel('Zaposleni', 'en')).toBe('Zaposleni')
  })

  it('bira trazeni jezik', () => {
    expect(resolveLabel({ sr: 'Sačuvaj', en: 'Save' }, 'en')).toBe('Save')
  })

  it('pada na srpski pa na engleski pa na prvu nepraznu vrednost', () => {
    expect(resolveLabel({ sr: 'Sačuvaj' }, 'en')).toBe('Sačuvaj')
    expect(resolveLabel({ en: 'Save' }, 'sr')).toBe('Save')
    expect(resolveLabel({ 'sr-Cyrl': 'Сачувај' }, 'en')).toBe('Сачувај')
  })

  it('nikada ne vraca undefined', () => {
    expect(resolveLabel(undefined, 'sr')).toBe('')
    expect(resolveLabel({}, 'sr')).toBe('')
  })
})

describe('formatDecimal', () => {
  it('koristi tacku za hiljade i zarez za decimale', () => {
    expect(formatDecimal(1234567.89, 'sr')).toBe('1.234.567,89')
  })

  it('podrzava cetiri decimale za kurs NBS-a', () => {
    expect(formatDecimal(117.2456, 'sr', 4)).toBe('117,2456')
  })

  it('prazno prikazuje kao crticu, ali nulu ne', () => {
    expect(formatDecimal(null, 'sr')).toBe('—')
    expect(formatDecimal(undefined, 'sr')).toBe('—')
    expect(formatDecimal(0, 'sr')).toBe('0,00')
  })
})

describe('formatCurrency', () => {
  it('spaja iznos i valutu nedeljivim razmakom', () => {
    /* Obican razmak bi dozvolio da se "RSD" prelomi u novi red. */
    expect(formatCurrency(1240000, 'RSD', 'sr')).toBe('1.240.000,00\u00A0RSD')
  })

  it('prazno ostaje crtica bez valute', () => {
    expect(formatCurrency(null, 'RSD', 'sr')).toBe('—')
  })
})

describe('formatNumber', () => {
  it('odbija tekst koji nije broj', () => {
    expect(formatNumber('abc', 'sr')).toBe('—')
  })

  it('prihvata broj kao tekst', () => {
    expect(formatNumber('1234', 'sr')).toBe('1.234')
  })
})

describe('formatDate', () => {
  it('prikazuje datum u srpskom obliku', () => {
    expect(formatDate('2026-03-01', 'sr')).toBe('01.03.2026.')
  })

  it('neispravan datum daje crticu', () => {
    expect(formatDate('nije-datum', 'sr')).toBe('—')
    expect(formatDate(null, 'sr')).toBe('—')
  })
})
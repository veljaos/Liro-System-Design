import { describe, expect, it } from 'vitest'
import {
  formatPozivNaBroj,
  isValidPozivNaBroj,
  isValidPozivNaBroj11,
  isValidPozivNaBrojZaModel,
  pozivNaBrojControl,
  pozivNaBroj11Control,
  pozivNaBrojToDigits,
} from './pozivNaBroj'

describe('pozivNaBrojToDigits', () => {
  it('slova pretvara u dve cifre po kljucu A=10 ... Z=35', () => {
    expect(pozivNaBrojToDigits('12345a')).toBe('1234510')
    expect(pozivNaBrojToDigits('Z')).toBe('35')
    expect(pozivNaBrojToDigits('AZ')).toBe('1035')
  })

  it('velicina slova ne igra ulogu', () => {
    expect(pozivNaBrojToDigits('12345a')).toBe(pozivNaBrojToDigits('12345A'))
  })

  it('crtice i razmaci se zanemaruju', () => {
    expect(pozivNaBrojToDigits('123-45')).toBe('12345')
    expect(pozivNaBrojToDigits('123 45')).toBe('12345')
  })

  it('odbija nedozvoljene znake i prazan unos', () => {
    expect(pozivNaBrojToDigits('12/34')).toBeNull()
    expect(pozivNaBrojToDigits('')).toBeNull()
  })

  it('odbija poziv duzi od dvadeset cifara', () => {
    expect(pozivNaBrojToDigits('1'.repeat(20))).toBe('1'.repeat(20))
    expect(pozivNaBrojToDigits('1'.repeat(21))).toBeNull()
    /* Deset slova daju dvadeset cifara — jos uvek prolazi. */
    expect(pozivNaBrojToDigits('A'.repeat(10))).not.toBeNull()
    expect(pozivNaBrojToDigits('A'.repeat(11))).toBeNull()
  })
})

describe('pozivNaBrojControl', () => {
  it('racuna kontrolu iz zvanicnih primera', () => {
    expect(pozivNaBrojControl('12345')).toBe('20')
    expect(pozivNaBrojControl('12345a')).toBe('28')
  })

  it('crtice u ulazu ne menjaju rezultat', () => {
    expect(pozivNaBrojControl('123-45')).toBe('20')
  })
})

describe('formatPozivNaBroj', () => {
  it('stavlja kontrolu na pocetak', () => {
    expect(formatPozivNaBroj('12345')).toBe('20-12345')
    expect(formatPozivNaBroj('12345a')).toBe('28-12345A')
  })
})

describe('isValidPozivNaBroj', () => {
  it('prihvata stvarne pozive na broj', () => {
    expect(isValidPozivNaBroj('632001095785')).toBe(true)
    expect(isValidPozivNaBroj('48600276847331')).toBe(true)
  })

  it('prihvata i pisani oblik sa crticom', () => {
    expect(isValidPozivNaBroj('20-12345')).toBe(true)
    expect(isValidPozivNaBroj('28-12345a')).toBe(true)
  })

  it('odbija pogresnu kontrolu', () => {
    expect(isValidPozivNaBroj('21-12345')).toBe(false)
    expect(isValidPozivNaBroj('632001095786')).toBe(false)
  })

  it('hvata zamenu mesta dve cifre — zbog toga model i postoji', () => {
    /* `2001095785` -> `2001095875`; kontrola vise ne odgovara. */
    expect(isValidPozivNaBroj('632001095875')).toBe(false)
  })

  it('odbija prekratak i besmislen unos', () => {
    expect(isValidPozivNaBroj('63')).toBe(false)
    expect(isValidPozivNaBroj('ab12345')).toBe(false)
  })
})

describe('model 11', () => {
  /* Stvarni pozivi na broj. Kontrolne cifre se razlikuju — bez toga se
     algoritam ne bi mogao razlikovati od slucajnog poklapanja. */
  const STVARNI = [
    '801326789042-26042-1',
    '801326789042-26050-1',
    '801326789042-26069-1',
    '801326789042-26077-1',
    '801424441008-26077-1',
    '801340323004-26077-1',
  ]

  it.each(STVARNI)('prihvata stvaran poziv %s', (poziv) => {
    expect(isValidPozivNaBroj11(poziv)).toBe(true)
  })

  it('racuna kontrolu iz tela podatka', () => {
    expect(pozivNaBroj11Control('80132678904')).toBe('2')
    expect(pozivNaBroj11Control('80142444100')).toBe('8')
    expect(pozivNaBroj11Control('80134032300')).toBe('4')
    expect(pozivNaBroj11Control('2604')).toBe('2')
    /* Ostatak 0 daje kontrolu 0 — potvrdjeno stvarnim primerom. */
    expect(pozivNaBroj11Control('2605')).toBe('0')
    expect(pozivNaBroj11Control('2606')).toBe('9')
    expect(pozivNaBroj11Control('2607')).toBe('7')
  })

  it('odbija pogresnu kontrolu u prvom ili drugom delu', () => {
    expect(isValidPozivNaBroj11('801326789043-26042-1')).toBe(false)
    expect(isValidPozivNaBroj11('801326789042-26043-1')).toBe(false)
  })

  it('treci deo nema kontrolu, pa se ne proverava', () => {
    expect(isValidPozivNaBroj11('801326789042-26042-9')).toBe(true)
    expect(isValidPozivNaBroj11('801326789042-26042')).toBe(true)
  })

  it('odbija nenumericki i prazan unos', () => {
    expect(isValidPozivNaBroj11('80132678904A-26042-1')).toBe(false)
    expect(isValidPozivNaBroj11('')).toBe(false)
  })
})

describe('isValidPozivNaBrojZaModel', () => {
  it('model 97 se proverava', () => {
    expect(isValidPozivNaBrojZaModel('97', '20-12345')).toBe(true)
    expect(isValidPozivNaBrojZaModel('97', '21-12345')).toBe(false)
  })

  it('ostali modeli prolaze na osnovu duzine', () => {
    expect(isValidPozivNaBrojZaModel('05', '123456')).toBe(true)
    expect(isValidPozivNaBrojZaModel('05', '')).toBe(false)
  })
})

describe('isValidPozivNaBrojZaModel — model 11', () => {
  it('sada stvarno proverava model 11', () => {
    expect(isValidPozivNaBrojZaModel('11', '801326789042-26042-1')).toBe(true)
    expect(isValidPozivNaBrojZaModel('11', '801326789042-26043-1')).toBe(false)
  })
})
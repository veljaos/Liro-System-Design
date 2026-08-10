import { describe, expect, it } from 'vitest'
import {
  formatPaymentReference,
  isValidPaymentReference,
  isValidPaymentReferenceModel11,
  isValidPaymentReferenceForModel,
  paymentReferenceControl,
  paymentReferenceModel11Control,
  paymentReferenceToDigits,
} from './paymentReference'

describe('pozivNaBrojToDigits', () => {
  it('slova pretvara u dve cifre po kljucu A=10 ... Z=35', () => {
    expect(paymentReferenceToDigits('12345a')).toBe('1234510')
    expect(paymentReferenceToDigits('Z')).toBe('35')
    expect(paymentReferenceToDigits('AZ')).toBe('1035')
  })

  it('velicina slova ne igra ulogu', () => {
    expect(paymentReferenceToDigits('12345a')).toBe(paymentReferenceToDigits('12345A'))
  })

  it('crtice i razmaci se zanemaruju', () => {
    expect(paymentReferenceToDigits('123-45')).toBe('12345')
    expect(paymentReferenceToDigits('123 45')).toBe('12345')
  })

  it('odbija nedozvoljene znake i prazan unos', () => {
    expect(paymentReferenceToDigits('12/34')).toBeNull()
    expect(paymentReferenceToDigits('')).toBeNull()
  })

  it('odbija poziv duzi od dvadeset cifara', () => {
    expect(paymentReferenceToDigits('1'.repeat(20))).toBe('1'.repeat(20))
    expect(paymentReferenceToDigits('1'.repeat(21))).toBeNull()
    /* Deset slova daju dvadeset cifara — jos uvek prolazi. */
    expect(paymentReferenceToDigits('A'.repeat(10))).not.toBeNull()
    expect(paymentReferenceToDigits('A'.repeat(11))).toBeNull()
  })
})

describe('pozivNaBrojControl', () => {
  it('racuna kontrolu iz zvanicnih primera', () => {
    expect(paymentReferenceControl('12345')).toBe('20')
    expect(paymentReferenceControl('12345a')).toBe('28')
  })

  it('crtice u ulazu ne menjaju rezultat', () => {
    expect(paymentReferenceControl('123-45')).toBe('20')
  })
})

describe('formatPozivNaBroj', () => {
  it('stavlja kontrolu na pocetak', () => {
    expect(formatPaymentReference('12345')).toBe('20-12345')
    expect(formatPaymentReference('12345a')).toBe('28-12345A')
  })
})

describe('isValidPozivNaBroj', () => {
  it('prihvata stvarne pozive na broj', () => {
    expect(isValidPaymentReference('632001095785')).toBe(true)
    expect(isValidPaymentReference('48600276847331')).toBe(true)
  })

  it('prihvata i pisani oblik sa crticom', () => {
    expect(isValidPaymentReference('20-12345')).toBe(true)
    expect(isValidPaymentReference('28-12345a')).toBe(true)
  })

  it('odbija pogresnu kontrolu', () => {
    expect(isValidPaymentReference('21-12345')).toBe(false)
    expect(isValidPaymentReference('632001095786')).toBe(false)
  })

  it('hvata zamenu mesta dve cifre — zbog toga model i postoji', () => {
    /* `2001095785` -> `2001095875`; kontrola vise ne odgovara. */
    expect(isValidPaymentReference('632001095875')).toBe(false)
  })

  it('odbija prekratak i besmislen unos', () => {
    expect(isValidPaymentReference('63')).toBe(false)
    expect(isValidPaymentReference('ab12345')).toBe(false)
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
    expect(isValidPaymentReferenceModel11(poziv)).toBe(true)
  })

  it('racuna kontrolu iz tela podatka', () => {
    expect(paymentReferenceModel11Control('80132678904')).toBe('2')
    expect(paymentReferenceModel11Control('80142444100')).toBe('8')
    expect(paymentReferenceModel11Control('80134032300')).toBe('4')
    expect(paymentReferenceModel11Control('2604')).toBe('2')
    /* Ostatak 0 daje kontrolu 0 — potvrdjeno stvarnim primerom. */
    expect(paymentReferenceModel11Control('2605')).toBe('0')
    expect(paymentReferenceModel11Control('2606')).toBe('9')
    expect(paymentReferenceModel11Control('2607')).toBe('7')
  })

  it('odbija pogresnu kontrolu u prvom ili drugom delu', () => {
    expect(isValidPaymentReferenceModel11('801326789043-26042-1')).toBe(false)
    expect(isValidPaymentReferenceModel11('801326789042-26043-1')).toBe(false)
  })

  it('treci deo nema kontrolu, pa se ne proverava', () => {
    expect(isValidPaymentReferenceModel11('801326789042-26042-9')).toBe(true)
    expect(isValidPaymentReferenceModel11('801326789042-26042')).toBe(true)
  })

  it('odbija nenumericki i prazan unos', () => {
    expect(isValidPaymentReferenceModel11('80132678904A-26042-1')).toBe(false)
    expect(isValidPaymentReferenceModel11('')).toBe(false)
  })
})

describe('isValidPozivNaBrojZaModel', () => {
  it('model 97 se proverava', () => {
    expect(isValidPaymentReferenceForModel('97', '20-12345')).toBe(true)
    expect(isValidPaymentReferenceForModel('97', '21-12345')).toBe(false)
  })

  it('ostali modeli prolaze na osnovu duzine', () => {
    expect(isValidPaymentReferenceForModel('05', '123456')).toBe(true)
    expect(isValidPaymentReferenceForModel('05', '')).toBe(false)
  })
})

describe('isValidPozivNaBrojZaModel — model 11', () => {
  it('sada stvarno proverava model 11', () => {
    expect(isValidPaymentReferenceForModel('11', '801326789042-26042-1')).toBe(true)
    expect(isValidPaymentReferenceForModel('11', '801326789042-26043-1')).toBe(false)
  })
})
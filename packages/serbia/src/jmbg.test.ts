import { describe, expect, it } from 'vitest'
import {
  datumRodjenjaIzMaticnogBroja,
  isValidJmbg,
  isValidLicniIdentifikator,
  registrovaniPolIzMaticnogBroja,
} from './jmbg'

/* Stvarni brojevi. */
const MUSKI_2000 = '0208000710202' // 02.08.2000, Beograd
const ZENSKI_1981 = '2702981715502' // 27.02.1981
const EB_STRANAC = '1004986660315' // 10.04.1986, evidencioni broj

describe('isValidJmbg', () => {
  it('prihvata stvarne JMBG-ove', () => {
    expect(isValidJmbg(MUSKI_2000)).toBe(true)
    expect(isValidJmbg(ZENSKI_1981)).toBe(true)
  })

  it('NE prihvata evidencioni broj stranca', () => {
    /*
     * Kljucna cinjenica: EB ima trinaest cifara, ali ne prati JMBG kontrolu.
     * Ovaj test postoji da niko ne "popravi" `isValidLicniIdentifikator` tako
     * sto ce ponovo pogadjati vrstu po duzini.
     */
    expect(isValidJmbg(EB_STRANAC)).toBe(false)
  })

  it('odbija pogresnu kontrolnu cifru', () => {
    expect(isValidJmbg('1234567890123')).toBe(false)
    expect(isValidJmbg('0208000710203')).toBe(false)
    expect(isValidJmbg('2702981715503')).toBe(false)
  })

  it('odbija pogresnu duzinu i nedozvoljene znake', () => {
    expect(isValidJmbg('020800071020')).toBe(false)
    expect(isValidJmbg('02080007102020')).toBe(false)
    expect(isValidJmbg('020800071020a')).toBe(false)
  })
})

describe('isValidLicniIdentifikator', () => {
  it('vrsta jmbg proverava kontrolnu cifru', () => {
    expect(isValidLicniIdentifikator(MUSKI_2000, 'jmbg')).toBe(true)
    expect(isValidLicniIdentifikator(EB_STRANAC, 'jmbg')).toBe(false)
  })

  it('vrsta eb proverava samo trinaest cifara', () => {
    expect(isValidLicniIdentifikator(EB_STRANAC, 'eb')).toBe(true)
    expect(isValidLicniIdentifikator('100498666031', 'eb')).toBe(false)
  })

  it('vrsta strani proverava samo duzinu', () => {
    expect(isValidLicniIdentifikator('AB1234567', 'strani')).toBe(true)
    expect(isValidLicniIdentifikator('AB12', 'strani')).toBe(false)
  })

  it('podrazumevana vrsta je najblaza — bolje propustiti nego lazno odbiti', () => {
    expect(isValidLicniIdentifikator(EB_STRANAC)).toBe(true)
  })
})

describe('datumRodjenjaIzMaticnogBroja', () => {
  it('cita datum iz JMBG-a', () => {
    expect(datumRodjenjaIzMaticnogBroja(MUSKI_2000)).toBe('2000-08-02')
    expect(datumRodjenjaIzMaticnogBroja(ZENSKI_1981)).toBe('1981-02-27')
  })

  it('radi i za evidencioni broj stranca', () => {
    /* Prvih sedam cifara imaju isto znacenje i bez JMBG kontrole. */
    expect(datumRodjenjaIzMaticnogBroja(EB_STRANAC)).toBe('1986-04-10')
  })

  it('odbija datum koji ne postoji', () => {
    expect(datumRodjenjaIzMaticnogBroja('3102000710202')).toBeNull()
    expect(datumRodjenjaIzMaticnogBroja('nije-broj-13')).toBeNull()
  })
})

describe('registrovaniPolIzMaticnogBroja', () => {
  it('cita oznaku iz rednog broja BBB (mesta 10-12)', () => {
    expect(registrovaniPolIzMaticnogBroja(MUSKI_2000)).toBe('M') // BBB = 020
    expect(registrovaniPolIzMaticnogBroja(ZENSKI_1981)).toBe('Z') // BBB = 550
    expect(registrovaniPolIzMaticnogBroja(EB_STRANAC)).toBe('M') // BBB = 031
  })

  it('vraca null za pogresan oblik', () => {
    expect(registrovaniPolIzMaticnogBroja('123')).toBeNull()
  })
})
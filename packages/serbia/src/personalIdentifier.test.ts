import { describe, expect, it } from 'vitest'
import {
  birthDateFromPersonalNumber,
  isValidSerbianPersonalNumber,
  isValidPersonalIdentifier,
  registeredSexFromPersonalNumber,
} from './personalIdentifier'

/* Real numbers. */
const MUSKI_2000 = '0208000710202' // 02.08.2000, Belgrade
const ZENSKI_1981 = '2702981715502' // 27.02.1981
const EB_STRANAC = '1004986660315' // 10.04.1986, foreigner's registration number

describe('isValidSerbianPersonalNumber', () => {
  it('accepts real JMBGs', () => {
    expect(isValidSerbianPersonalNumber(MUSKI_2000)).toBe(true)
    expect(isValidSerbianPersonalNumber(ZENSKI_1981)).toBe(true)
  })

  it('does NOT accept a foreigner\'s registration number', () => {
    /*
     * Key fact: EB has thirteen digits but does not follow the JMBG check.
     * This test exists so that no one "fixes" `isValidPersonalIdentifier` by
     * going back to guessing the kind from the length.
     */
    expect(isValidSerbianPersonalNumber(EB_STRANAC)).toBe(false)
  })

  it('rejects a wrong check digit', () => {
    expect(isValidSerbianPersonalNumber('1234567890123')).toBe(false)
    expect(isValidSerbianPersonalNumber('0208000710203')).toBe(false)
    expect(isValidSerbianPersonalNumber('2702981715503')).toBe(false)
  })

  it('rejects wrong length and disallowed characters', () => {
    expect(isValidSerbianPersonalNumber('020800071020')).toBe(false)
    expect(isValidSerbianPersonalNumber('02080007102020')).toBe(false)
    expect(isValidSerbianPersonalNumber('020800071020a')).toBe(false)
  })
})

describe('isValidPersonalIdentifier', () => {
  it('kind jmbg checks the check digit', () => {
    expect(isValidPersonalIdentifier(MUSKI_2000, 'jmbg')).toBe(true)
    expect(isValidPersonalIdentifier(EB_STRANAC, 'jmbg')).toBe(false)
  })

  it('kind eb checks only thirteen digits', () => {
    expect(isValidPersonalIdentifier(EB_STRANAC, 'eb')).toBe(true)
    expect(isValidPersonalIdentifier('100498666031', 'eb')).toBe(false)
  })

  it('kind strani checks only the length', () => {
    expect(isValidPersonalIdentifier('AB1234567', 'strani')).toBe(true)
    expect(isValidPersonalIdentifier('AB12', 'strani')).toBe(false)
  })

  it('the default kind is the loosest — better to let through than falsely reject', () => {
    expect(isValidPersonalIdentifier(EB_STRANAC)).toBe(true)
  })
})

describe('birthDateFromPersonalNumber', () => {
  it('reads the date from a JMBG', () => {
    expect(birthDateFromPersonalNumber(MUSKI_2000)).toBe('2000-08-02')
    expect(birthDateFromPersonalNumber(ZENSKI_1981)).toBe('1981-02-27')
  })

  it('also works for a foreigner\'s registration number', () => {
    /* The first seven digits carry the same meaning even without the JMBG check. */
    expect(birthDateFromPersonalNumber(EB_STRANAC)).toBe('1986-04-10')
  })

  it('rejects a date that does not exist', () => {
    expect(birthDateFromPersonalNumber('3102000710202')).toBeNull()
    expect(birthDateFromPersonalNumber('nije-broj-13')).toBeNull()
  })
})

describe('registeredSexFromPersonalNumber', () => {
  it('reads the marker from the serial number BBB (positions 10-12)', () => {
    expect(registeredSexFromPersonalNumber(MUSKI_2000)).toBe('M') // BBB = 020
    expect(registeredSexFromPersonalNumber(ZENSKI_1981)).toBe('Z') // BBB = 550
    expect(registeredSexFromPersonalNumber(EB_STRANAC)).toBe('M') // BBB = 031
  })

  it('returns null for a wrong shape', () => {
    expect(registeredSexFromPersonalNumber('123')).toBeNull()
  })
})
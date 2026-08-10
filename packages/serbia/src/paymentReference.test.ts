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

describe('paymentReferenceToDigits', () => {
  it('converts letters to two digits using the key A=10 ... Z=35', () => {
    expect(paymentReferenceToDigits('12345a')).toBe('1234510')
    expect(paymentReferenceToDigits('Z')).toBe('35')
    expect(paymentReferenceToDigits('AZ')).toBe('1035')
  })

  it('letter case does not matter', () => {
    expect(paymentReferenceToDigits('12345a')).toBe(paymentReferenceToDigits('12345A'))
  })

  it('dashes and spaces are ignored', () => {
    expect(paymentReferenceToDigits('123-45')).toBe('12345')
    expect(paymentReferenceToDigits('123 45')).toBe('12345')
  })

  it('rejects disallowed characters and empty input', () => {
    expect(paymentReferenceToDigits('12/34')).toBeNull()
    expect(paymentReferenceToDigits('')).toBeNull()
  })

  it('rejects a reference longer than twenty digits', () => {
    expect(paymentReferenceToDigits('1'.repeat(20))).toBe('1'.repeat(20))
    expect(paymentReferenceToDigits('1'.repeat(21))).toBeNull()
    /* Ten letters give twenty digits — still passes. */
    expect(paymentReferenceToDigits('A'.repeat(10))).not.toBeNull()
    expect(paymentReferenceToDigits('A'.repeat(11))).toBeNull()
  })
})

describe('paymentReferenceControl', () => {
  it('computes the check from official examples', () => {
    expect(paymentReferenceControl('12345')).toBe('20')
    expect(paymentReferenceControl('12345a')).toBe('28')
  })

  it('dashes in the input do not change the result', () => {
    expect(paymentReferenceControl('123-45')).toBe('20')
  })
})

describe('formatPaymentReference', () => {
  it('puts the check at the start', () => {
    expect(formatPaymentReference('12345')).toBe('20-12345')
    expect(formatPaymentReference('12345a')).toBe('28-12345A')
  })
})

describe('isValidPaymentReference', () => {
  it('accepts real payment references', () => {
    expect(isValidPaymentReference('632001095785')).toBe(true)
    expect(isValidPaymentReference('48600276847331')).toBe(true)
  })

  it('accepts the written form with a dash too', () => {
    expect(isValidPaymentReference('20-12345')).toBe(true)
    expect(isValidPaymentReference('28-12345a')).toBe(true)
  })

  it('rejects a wrong check', () => {
    expect(isValidPaymentReference('21-12345')).toBe(false)
    expect(isValidPaymentReference('632001095786')).toBe(false)
  })

  it('catches a transposed pair of digits — this is exactly why the model exists', () => {
    /* `2001095785` -> `2001095875`; the check no longer matches. */
    expect(isValidPaymentReference('632001095875')).toBe(false)
  })

  it('rejects input that is too short or meaningless', () => {
    expect(isValidPaymentReference('63')).toBe(false)
    expect(isValidPaymentReference('ab12345')).toBe(false)
  })
})

describe('model 11', () => {
  /* Real payment references. The check digits differ — without that the
     algorithm could not be distinguished from a chance match. */
  const STVARNI = [
    '801326789042-26042-1',
    '801326789042-26050-1',
    '801326789042-26069-1',
    '801326789042-26077-1',
    '801424441008-26077-1',
    '801340323004-26077-1',
  ]

  it.each(STVARNI)('accepts a real reference %s', (poziv) => {
    expect(isValidPaymentReferenceModel11(poziv)).toBe(true)
  })

  it('computes the check from the segment body', () => {
    expect(paymentReferenceModel11Control('80132678904')).toBe('2')
    expect(paymentReferenceModel11Control('80142444100')).toBe('8')
    expect(paymentReferenceModel11Control('80134032300')).toBe('4')
    expect(paymentReferenceModel11Control('2604')).toBe('2')
    /* A remainder of 0 gives check 0 — confirmed by a real example. */
    expect(paymentReferenceModel11Control('2605')).toBe('0')
    expect(paymentReferenceModel11Control('2606')).toBe('9')
    expect(paymentReferenceModel11Control('2607')).toBe('7')
  })

  it('rejects a wrong check in the first or second segment', () => {
    expect(isValidPaymentReferenceModel11('801326789043-26042-1')).toBe(false)
    expect(isValidPaymentReferenceModel11('801326789042-26043-1')).toBe(false)
  })

  it('the third segment has no check, so it is not verified', () => {
    expect(isValidPaymentReferenceModel11('801326789042-26042-9')).toBe(true)
    expect(isValidPaymentReferenceModel11('801326789042-26042')).toBe(true)
  })

  it('rejects non-numeric and empty input', () => {
    expect(isValidPaymentReferenceModel11('80132678904A-26042-1')).toBe(false)
    expect(isValidPaymentReferenceModel11('')).toBe(false)
  })
})

describe('isValidPaymentReferenceForModel', () => {
  it('model 97 is actually checked', () => {
    expect(isValidPaymentReferenceForModel('97', '20-12345')).toBe(true)
    expect(isValidPaymentReferenceForModel('97', '21-12345')).toBe(false)
  })

  it('other models pass based on length', () => {
    expect(isValidPaymentReferenceForModel('05', '123456')).toBe(true)
    expect(isValidPaymentReferenceForModel('05', '')).toBe(false)
  })
})

describe('isValidPaymentReferenceForModel — model 11', () => {
  it('now actually checks model 11', () => {
    expect(isValidPaymentReferenceForModel('11', '801326789042-26042-1')).toBe(true)
    expect(isValidPaymentReferenceForModel('11', '801326789042-26043-1')).toBe(false)
  })
})
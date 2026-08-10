import { describe, expect, it } from 'vitest'
import {
  bankCodeFromAccount,
  formatBankAccount,
  isValidBankAccount,
  isValidBankAccountFormat,
  normalizeBankAccount,
  bankAccountControlDigit,
} from './bankAccount'

/*
 * Real accounts from five different banks. When adding new ones, take them
 * from an invoice or a statement — a made-up account that "looks right" proves
 * nothing.
 */
const REAL_ACCOUNTS = [
  '160-0000000921898-46',
  '155-0070100158173-04',
  '105-0000002158854-60',
  '340-0001000152520-11',
  '340-0001000152524-96',
]

describe('isValidBankAccount', () => {
  it.each(REAL_ACCOUNTS)('accepts a real account %s', (account) => {
    expect(isValidBankAccount(account)).toBe(true)
  })

  it('accepts the flat eighteen-digit form too', () => {
    expect(isValidBankAccount('160000000092189846')).toBe(true)
  })

  it('accepts a shortened middle part without leading zeros', () => {
    expect(isValidBankAccount('160-921898-46')).toBe(true)
  })

  it('rejects a wrong check number', () => {
    expect(isValidBankAccount('160-0000000921898-47')).toBe(false)
    expect(isValidBankAccount('340-0001000152520-96')).toBe(false)
  })

  it('catches a transposed pair of digits in the account number', () => {
    /* This is exactly why the check exists — a typo. */
    expect(isValidBankAccount('160-0000000921889-46')).toBe(false)
  })

  it('rejects a wrong shape', () => {
    expect(isValidBankAccount('16-0000000921898-46')).toBe(false)
    expect(isValidBankAccount('160-0000000921898-4')).toBe(false)
    expect(isValidBankAccount('nesto')).toBe(false)
    expect(isValidBankAccount('')).toBe(false)
  })
})

describe('normalizeBankAccount and formatBankAccount', () => {
  it('pads the middle part to thirteen digits', () => {
    expect(normalizeBankAccount('160-921898-46')).toBe('160000000092189846')
  })

  it('returns the written form from the flat one', () => {
    expect(formatBankAccount('160000000092189846')).toBe('160-0000000921898-46')
  })

  it('round-tripping through both forms does not change the account', () => {
    for (const account of REAL_ACCOUNTS) {
      expect(formatBankAccount(normalizeBankAccount(account)!)).toBe(account)
    }
  })
})

describe('bankAccountControlDigit', () => {
  it.each(REAL_ACCOUNTS)('computes the same check as in %s', (account) => {
    const [bank, number, control] = account.split('-')
    expect(bankAccountControlDigit(bank!, number!)).toBe(control)
  })

  it('gives the same result without leading zeros', () => {
    expect(bankAccountControlDigit('160', '921898')).toBe('46')
  })
})

describe('bankCodeFromAccount', () => {
  it('reads the fixed bank number', () => {
    expect(bankCodeFromAccount('160-0000000921898-46')).toBe('160')
    expect(bankCodeFromAccount('nesto')).toBeNull()
  })
})

describe('isValidBankAccountFormat', () => {
  it('checks the shape even when the check number is wrong', () => {
    expect(isValidBankAccountFormat('160-0000000921898-99')).toBe(true)
    expect(isValidBankAccount('160-0000000921898-99')).toBe(false)
  })
})
import { mod97, mod97Control } from './mod97'

/**
 * Current account in domestic payment transactions.
 *
 * Structure per the National Bank of Serbia's Decision on the unified structure
 * of the current account — eighteen digits in three parts:
 *
 *   BBB              fixed number of the payment service provider (bank), three digits
 *   PPPPPPPPPPPPP    account number assigned by the bank, thirteen digits
 *   KK               check number, two digits
 *
 * The check number is computed with ISO 7064 MODULO 97 over the first sixteen
 * digits: the string is multiplied by 100, divided by 97, and the remainder
 * subtracted from 98.
 *
 * In electronic form the account is exclusively an eighteen-digit string. On
 * printed documents it is written in three parts separated by dashes, and
 * leading zeros in the middle part may be omitted — that is why the middle
 * part is padded back to thirteen digits during normalization.
 *
 * VERIFIED against five real accounts from different banks (160, 155, 105, 340).
 */

const BANK_ACCOUNT_PARTS = /^(\d{3})-(\d{1,13})-(\d{2})$/
const BANK_ACCOUNT_FLAT = /^\d{18}$/

/**
 * Account in electronic form: exactly eighteen digits.
 *
 * Accepts both the written form with dashes and an already-flat eighteen-digit
 * string. Returns `null` when the shape does not match — that does not yet mean
 * the check number is wrong, only that the number was not recognized as an
 * account.
 */
export function normalizeBankAccount(value: string): string | null {
  const clean = value.trim().replace(/\s/g, '')

  if (BANK_ACCOUNT_FLAT.test(clean)) return clean

  const parts = BANK_ACCOUNT_PARTS.exec(clean)
  if (!parts) return null

  const [, bank, account, control] = parts
  return `${bank}${account!.padStart(13, '0')}${control}`
}

/** Account in written form `BBB-PPPPPPPPPPPPP-KK`. */
export function formatBankAccount(value: string): string | null {
  const normalized = normalizeBankAccount(value)
  if (!normalized) return null
  return `${normalized.slice(0, 3)}-${normalized.slice(3, 16)}-${normalized.slice(16)}`
}

/**
 * Check number for a given fixed bank number and account number.
 *
 * Used both for generation and for verification; the application can use it to
 * fill in the account itself when the bank sends only the first two parts.
 */
export function bankAccountControlDigit(bank: string, account: string): string | null {
  if (!/^\d{3}$/.test(bank) || !/^\d{1,13}$/.test(account)) return null
  return mod97Control(`${bank}${account.padStart(13, '0')}`)
}

/** Shape only, without checking the check number. */
export function isValidBankAccountFormat(value: string): boolean {
  return normalizeBankAccount(value) !== null
}

/**
 * Shape and check number.
 *
 * The check reduces to whether the full eighteen-digit string mod 97 gives 1 —
 * equivalent to the "98 minus remainder" rule from the Decision, and cheaper
 * to compute.
 */
export function isValidBankAccount(value: string): boolean {
  const normalized = normalizeBankAccount(value)
  if (!normalized) return false
  return mod97(normalized) === 1
}

/** Fixed bank number from the account, or `null` when the account is invalid. */
export function bankCodeFromAccount(value: string): string | null {
  const normalized = normalizeBankAccount(value)
  return normalized ? normalized.slice(0, 3) : null
}
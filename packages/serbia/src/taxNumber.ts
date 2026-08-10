import { mod1110, toDigits } from './mod11'

/**
 * PIB — tax identification number of a legal entity.
 *
 * Nine digits, the last one is a check digit per ISO 7064 MOD 11,10.
 *
 * A length check is not enough: `123456789` has nine digits and is not a valid
 * PIB. The check digit catches a typing mistake before the record goes into
 * the database.
 *
 * Does not apply to foreign companies — they do not have a Serbian PIB. See
 * `isValidTaxNumber`.
 */
export function isValidSerbianTin(value: string): boolean {
  const clean = value.trim()
  if (!/^\d{9}$/.test(clean)) return false
  const digits = toDigits(clean)
  return mod1110(digits.slice(0, 8)) === digits[8]
}

/**
 * Tax number that can also belong to a foreign company.
 *
 * When the shape matches a Serbian PIB (exactly nine digits), the check digit
 * is verified. Foreign tax numbers have no check we know of, so they pass
 * based on length.
 */
export function isValidTaxNumber(value: string): boolean {
  const clean = value.trim()
  if (clean.length < 5) return false
  if (/^\d{9}$/.test(clean)) return isValidSerbianTin(clean)
  return true
}
/**
 * ISO 7064, MODULO 97.
 *
 * The check number is obtained by multiplying the digit string by 100,
 * dividing by 97, and subtracting the remainder from 98. The result expressed
 * with two digits is the check number.
 *
 * Used for the current account (NBS Decision on the unified structure of the
 * current account) and for the payment reference under model 97 (Official
 * Gazette of RS 55/15, 78/15).
 */

/**
 * Remainder when dividing by 97, digit by digit.
 *
 * An eighteen-digit number exceeds `Number.MAX_SAFE_INTEGER`, so it must not be
 * converted to a number before dividing — it would silently lose precision.
 * Computing digit by digit works for arbitrary length.
 */
export function mod97(digits: string): number {
  let remainder = 0
  for (const char of digits) remainder = (remainder * 10 + Number(char)) % 97
  return remainder
}

/** Two-digit check number for a given digit string. */
export function mod97Control(digits: string): string {
  return String(98 - mod97(`${digits}00`)).padStart(2, '0')
}
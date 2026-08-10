import { toDigits } from './mod11'

/**
 * JMBG and related personal identifiers.
 *
 * JMBG has thirteen digits following the pattern DDMMGGGRRBBBK:
 *   DDMMGGG  date of birth (GGG are the last three digits of the year)
 *   RR       registration district
 *   BBB      serial number assigned at birth
 *   K        check digit
 *
 * Check: S = 7A1+6A2+5A3+4A4+3A5+2A6+7A7+6A8+5A9+4A10+3A11+2A12, m = S mod 11.
 *   m = 0  -> K = 0
 *   m = 1  -> the number DOES NOT EXIST; by regulation BBB is incremented and recalculated
 *   m > 1  -> K = 11 - m
 *
 * IMPORTANT: a foreigner's registration number also has thirteen digits, but does
 * NOT follow this check. Verified with a real number: `1004986660315` has check
 * digit 5, while the JMBG algorithm gives 2. That is why there is no automatic
 * detection by length here — the application must state which kind of identifier
 * it is. Guessing would reject a valid number for every foreigner.
 */

const WEIGHTS = [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2]

export function isValidSerbianPersonalNumber(value: string): boolean {
  const clean = value.trim()
  if (!/^\d{13}$/.test(clean)) return false

  const digits = toDigits(clean)
  let sum = 0
  for (let i = 0; i < 12; i += 1) sum += WEIGHTS[i]! * digits[i]!

  const m = sum % 11
  /* A thirteen-digit number with m = 1 was never issued. */
  if (m === 1) return false

  return (m === 0 ? 0 : 11 - m) === digits[12]
}

/**
 * Kind of personal identifier.
 *
 * `jmbg`    domestic JMBG; the check digit is verified
 * `eb`      foreigner's registration number; thirteen digits, check unknown to us
 * `strani`  ID card, passport, or foreign tax number; length only
 */
export type PersonalIdentifierKind = 'jmbg' | 'eb' | 'strani'

/**
 * Personal identifier check against a known kind.
 *
 * The kind is never guessed. When the application does not know which it is,
 * it passes `strani` — a looser check is always better than a false rejection
 * of a valid number.
 */
export function isValidPersonalIdentifier(
  value: string,
  vrsta: PersonalIdentifierKind = 'strani',
): boolean {
  const clean = value.trim()

  if (vrsta === 'jmbg') return isValidSerbianPersonalNumber(clean)
  if (vrsta === 'eb') return /^\d{13}$/.test(clean)
  return clean.length >= 5
}

/**
 * Date of birth from the first seven digits, as `YYYY-MM-DD`.
 *
 * Also works for a foreigner's registration number — the first seven digits
 * carry the same meaning even when the check digit does not follow the JMBG
 * rule. That is why validity is NOT a precondition here; only the shape is
 * checked, plus that the date actually exists.
 */
export function birthDateFromPersonalNumber(value: string): string | null {
  const clean = value.trim()
  if (!/^\d{13}$/.test(clean)) return null

  const day = Number(clean.slice(0, 2))
  const month = Number(clean.slice(2, 4))
  const short = Number(clean.slice(4, 7))

  /*
   * GGG are the last three digits of the year. The 800 boundary separates
   * 1800-1999 from 2000-2799 — the same one used in official interpretations.
   */
  const year = short >= 800 ? 1000 + short : 2000 + short

  const candidate = new Date(Date.UTC(year, month - 1, day))
  if (candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return null

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Sex marker recorded in the birth register.
 *
 * DO NOT USE THIS TO PREFILL A "sex" FIELD IN AN INTERFACE.
 *
 * This digit is an administrative value from the register, not a person's
 * statement about themselves. A person in transition, a person who changed
 * their marker but not their number, and a person whose gender does not match
 * the record — all three would get a wrong value they never entered.
 *
 * The only correct use: forms and statistical reports that explicitly require
 * the registry value (M-4, employment statistics). For everything else, ask
 * the person and offer them a choice.
 */
export function registeredSexFromPersonalNumber(value: string): 'M' | 'Z' | null {
  const clean = value.trim()
  if (!/^\d{13}$/.test(clean)) return null
  return Number(clean.slice(9, 12)) < 500 ? 'M' : 'Z'
}
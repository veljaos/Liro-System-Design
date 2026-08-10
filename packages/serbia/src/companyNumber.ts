/**
 * Company registration number from the APR register.
 *
 * Eight digits, WITHOUT a check digit.
 *
 * This has been verified: the two expected algorithms (MOD 11,10 and the
 * 7-6-5-4-3-2 weighting used for JMBG) do not match any real company number,
 * and a search through about two million weight schemes gives only chance
 * matches. The company number is a serial in the register, not an encoded
 * identifier.
 *
 * In other words: length is the only thing that can be checked without a
 * query to APR. Do not add a "check" that does not exist.
 */
export function isValidSerbianCompanyNumber(value: string): boolean {
  return /^\d{8}$/.test(value.trim())
}
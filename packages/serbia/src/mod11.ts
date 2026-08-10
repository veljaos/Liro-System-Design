/**
 * ISO 7064, MOD 11,10.
 *
 * The same procedure the Tax Administration uses for the PIB check digit.
 * Works over an arbitrary number of digits, so it can be used elsewhere too.
 */
export function mod1110(digits: number[]): number {
  let k = 10
  for (const digit of digits) {
    k = (k + digit) % 10
    if (k === 0) k = 10
    k = (k * 2) % 11
  }
  const control = 11 - k
  return control === 10 ? 0 : control
}

/** Digits of a string as numbers. Assumes the input was already checked by a regex. */
export function toDigits(value: string): number[] {
  return [...value].map(Number)
}
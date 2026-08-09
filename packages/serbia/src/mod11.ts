/**
 * ISO 7064, MOD 11,10.
 *
 * Isti postupak koji Poreska uprava koristi za kontrolnu cifru PIB-a. Radi nad
 * proizvoljnim brojem cifara, pa se moze upotrebiti i drugde.
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

/** Cifre stringa kao brojevi. Pretpostavlja da je ulaz vec proveren regexom. */
export function toDigits(value: string): number[] {
  return [...value].map(Number)
}
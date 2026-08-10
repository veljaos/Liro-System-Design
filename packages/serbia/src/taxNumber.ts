import { mod1110, toDigits } from './mod11'

/**
 * PIB — poreski identifikacioni broj pravnog lica.
 *
 * Devet cifara, poslednja je kontrolna po ISO 7064 MOD 11,10.
 *
 * Provera duzine nije dovoljna: `123456789` ima devet cifara i nije validan
 * PIB. Kontrolna cifra hvata gresku u kucanju pre nego sto zapis ode u bazu.
 *
 * Ne vazi za strane firme - one nemaju srpski PIB. Vidi `isValidTaxNumber`.
 */
export function isValidSerbianTin(value: string): boolean {
  const clean = value.trim()
  if (!/^\d{9}$/.test(clean)) return false
  const digits = toDigits(clean)
  return mod1110(digits.slice(0, 8)) === digits[8]
}

/**
 * Poreski broj koji moze pripadati i stranoj firmi.
 *
 * Kada oblik odgovara srpskom PIB-u (tacno devet cifara), kontrolna cifra se
 * proverava. Strani poreski brojevi nemaju kontrolu koju bismo znali, pa
 * prolaze na osnovu duzine.
 */
export function isValidTaxNumber(value: string): boolean {
  const clean = value.trim()
  if (clean.length < 5) return false
  if (/^\d{9}$/.test(clean)) return isValidSerbianTin(clean)
  return true
}
/**
 * Matični broj pravnog lica iz APR-a.
 *
 * Osam cifara, BEZ kontrolne cifre.
 *
 * Ovo je provereno: dva ocekivana algoritma (MOD 11,10 i tezinski 7-6-5-4-3-2
 * kao kod JMBG-a) ne pogadjaju nijedan stvaran maticni broj, a pretraga kroz
 * oko dva miliona tezinskih shema daje samo slucajna poklapanja. Maticni broj
 * je redni broj u registru, a ne kodirani identifikator.
 *
 * Znaci: duzina je jedino sto se moze proveriti bez upita ka APR-u. Ne
 * dodavati "kontrolu" koja ne postoji.
 */
export function isValidMaticniBroj(value: string): boolean {
  return /^\d{8}$/.test(value.trim())
}
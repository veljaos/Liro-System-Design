/**
 * Srpska pravila mnozine.
 *
 * `3 stavke` i `5 stavki` nisu isti oblik, a `Izabrano: 3` je izbegavanje
 * problema, a ne resenje.
 *
 * Pravilo: oblik za jedninu za brojeve koji se zavrsavaju na 1 osim 11; oblik
 * za dvojinu za 2-4 osim 12-14; mnozina za sve ostalo.
 */
export function srPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
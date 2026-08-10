/**
 * Serbian plural rules.
 *
 * `3 stavke` and `5 stavki` are not the same form, and `Selected: 3` is
 * dodging the problem, not solving it.
 *
 * Rule: singular form for numbers ending in 1 except 11; paucal form for
 * 2-4 except 12-14; plural for everything else.
 */
export function srPlural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}
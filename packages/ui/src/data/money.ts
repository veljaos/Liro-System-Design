/**
 * Pretvara iznos u pare pre poredjenja.
 *
 * `0.1 + 0.2 !== 0.3` u JavaScript-u. Nalog od sto redova bi se razbalansirao
 * za dinar iz cistog zaokruzivanja, a knjigovodja bi trazio gresku koje nema.
 * Celi brojevi to iskljucuju.
 *
 * Namerno u zasebnom modulu, bez `'use client'`: cista funkcija mora biti
 * testirana bez pokretanja Reacta.
 */
export function toMinor(value: unknown): number {
  const num = typeof value === 'string' ? Number(value) : value
  if (typeof num !== 'number' || Number.isNaN(num)) return 0
  return Math.round(num * 100)
}

/** Pare nazad u iznos. */
export function fromMinor(minor: number): number {
  return minor / 100
}
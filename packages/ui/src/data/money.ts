/**
 * Converts an amount to minor units before comparing.
 *
 * `0.1 + 0.2 !== 0.3` in JavaScript. A hundred-line journal entry would go
 * out of balance by one dinar from pure rounding, and a bookkeeper would go
 * looking for an error that doesn't exist. Integers rule that out.
 *
 * Deliberately in its own module, without `'use client'`: a pure function
 * must be testable without starting React.
 */
export function toMinor(value: unknown): number {
  const num = typeof value === 'string' ? Number(value) : value
  if (typeof num !== 'number' || Number.isNaN(num)) return 0
  return Math.round(num * 100)
}

/** Minor units back to an amount. */
export function fromMinor(minor: number): number {
  return minor / 100
}
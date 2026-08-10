/**
 * Date entry adapted to how dates are actually typed in bookkeeping.
 *
 * An operator entering a hundred entries does not type dots. They type
 * `010326` and expect March 1st, 2026. This function accepts that, as well
 * as `01032026`, `1.3.2026`, and `01-03-2026`.
 *
 * Mantine 9 holds dates as `YYYY-MM-DD` strings, so we work with them too —
 * no time zones, no off-by-one-day shifts.
 */

export type DateString = string

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateString(day: number, month: number, year: number): DateString | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const candidate = new Date(Date.UTC(year, month - 1, day))
  /* This check catches 31.02 — Date would silently turn it into March 3rd. */
  if (candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return null
  return `${year}-${pad(month)}-${pad(day)}`
}

/**
 * Two-digit year: 00-69 is 2000-2069, 70-99 is 1970-1999.
 * The boundary is set so that birth dates work correctly.
 */
function expandYear(short: number): number {
  return short <= 69 ? 2000 + short : 1900 + short
}

export function parseSerbianDate(input: string): DateString | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  /* Already in the target format. */
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (iso) return toDateString(Number(iso[3]), Number(iso[2]), Number(iso[1]))

  const separated = /^(\d{1,2})[.\-/\s]+(\d{1,2})[.\-/\s]*(\d{2,4})?\.?$/.exec(trimmed)
  if (separated) {
    const day = Number(separated[1])
    const month = Number(separated[2])
    const rawYear = separated[3]
    const year = rawYear
      ? rawYear.length === 2
        ? expandYear(Number(rawYear))
        : Number(rawYear)
      : new Date().getFullYear()
    return toDateString(day, month, year)
  }

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 6) {
    return toDateString(Number(digits.slice(0, 2)), Number(digits.slice(2, 4)), expandYear(Number(digits.slice(4, 6))))
  }
  if (digits.length === 8) {
    return toDateString(Number(digits.slice(0, 2)), Number(digits.slice(2, 4)), Number(digits.slice(4, 8)))
  }

  return null
}

/** `2026-03-01` -> `01.03.2026.` */
export function formatSerbianDate(value: DateString | null | undefined): string {
  if (!value) return ''
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!parts) return value
  return `${parts[3]}.${parts[2]}.${parts[1]}.`
}

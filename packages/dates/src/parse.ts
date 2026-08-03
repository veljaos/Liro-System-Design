/**
 * Unos datuma prilagodjen tome kako se datumi zaista kucaju u knjigovodstvu.
 *
 * Operater koji unosi stotinu naloga ne kuca tacke. Kuca `010326` i ocekuje
 * 1. mart 2026. Ova funkcija to prihvata, kao i `01032026`, `1.3.2026` i
 * `01-03-2026`.
 *
 * Mantine 9 drzi datume kao `YYYY-MM-DD` stringove, pa i mi radimo sa njima -
 * nema vremenskih zona, nema pomeranja za jedan dan.
 */

export type DateString = string

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toDateString(day: number, month: number, year: number): DateString | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const candidate = new Date(Date.UTC(year, month - 1, day))
  /* Provera hvata 31.02 - Date bi ga tiho pretvorio u 3. mart. */
  if (candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return null
  return `${year}-${pad(month)}-${pad(day)}`
}

/**
 * Dvocifrena godina: 00-69 je 2000-2069, 70-99 je 1970-1999.
 * Granica je postavljena tako da datumi rodjenja rade ispravno.
 */
function expandYear(short: number): number {
  return short <= 69 ? 2000 + short : 1900 + short
}

export function parseSerbianDate(input: string): DateString | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  /* Vec je u ciljnom formatu. */
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

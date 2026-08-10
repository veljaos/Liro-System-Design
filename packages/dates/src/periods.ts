import type { LocalizedLabel } from '@liro/i18n'
import type { DateString } from './parse'

/**
 * Accounting periods.
 *
 * All computation runs over `YYYY-MM-DD` strings and UTC dates, never over
 * local `Date` objects. The reason is concrete: `new Date('2026-03-01')` in
 * the GMT+1 zone gives March 1st at 01:00, while `new Date(2026, 2, 1)` gives
 * February 28th at 23:00 UTC. When such a date is sent to the database, the
 * March calculation starts in February — and that is only discovered when
 * the totals are reconciled.
 */

export interface DateRange {
  from: DateString
  to: DateString
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function toStr(year: number, month: number, day: number): DateString {
  return `${year}-${pad(month)}-${pad(day)}`
}

/** Number of days in the month; `month` is 1-12. */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function parseParts(value: DateString): { year: number; month: number; day: number } {
  const [year, month, day] = value.split('-').map(Number)
  return { year: year ?? 1970, month: month ?? 1, day: day ?? 1 }
}

export function today(): DateString {
  const now = new Date()
  return toStr(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

export function startOfMonth(value: DateString): DateString {
  const { year, month } = parseParts(value)
  return toStr(year, month, 1)
}

export function endOfMonth(value: DateString): DateString {
  const { year, month } = parseParts(value)
  return toStr(year, month, daysInMonth(year, month))
}

export function addMonths(value: DateString, count: number): DateString {
  const { year, month, day } = parseParts(value)
  const total = year * 12 + (month - 1) + count
  const nextYear = Math.floor(total / 12)
  const nextMonth = (total % 12) + 1
  /* January 31st minus one month is February 28th or 29th, not March 3rd. */
  const clampedDay = Math.min(day, daysInMonth(nextYear, nextMonth))
  return toStr(nextYear, nextMonth, clampedDay)
}

export function addDays(value: DateString, count: number): DateString {
  const { year, month, day } = parseParts(value)
  const date = new Date(Date.UTC(year, month - 1, day + count))
  return toStr(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

/** Quarter the date belongs to, 1-4. */
export function quarterOf(value: DateString): number {
  return Math.floor((parseParts(value).month - 1) / 3) + 1
}

export function startOfQuarter(value: DateString): DateString {
  const { year } = parseParts(value)
  return toStr(year, (quarterOf(value) - 1) * 3 + 1, 1)
}

export function endOfQuarter(value: DateString): DateString {
  const { year } = parseParts(value)
  const month = quarterOf(value) * 3
  return toStr(year, month, daysInMonth(year, month))
}

export function startOfYear(value: DateString): DateString {
  return toStr(parseParts(value).year, 1, 1)
}

export function endOfYear(value: DateString): DateString {
  return toStr(parseParts(value).year, 12, 31)
}

/** Monday as the first day of the week — that is how the work week is kept in Serbia. */
export function startOfWeek(value: DateString): DateString {
  const { year, month, day } = parseParts(value)
  const date = new Date(Date.UTC(year, month - 1, day))
  const weekday = (date.getUTCDay() + 6) % 7
  return addDays(value, -weekday)
}

export function endOfWeek(value: DateString): DateString {
  return addDays(startOfWeek(value), 6)
}

export function compareDates(a: DateString, b: DateString): number {
  return a < b ? -1 : a > b ? 1 : 0
}

export function isWithin(value: DateString, range: DateRange): boolean {
  return value >= range.from && value <= range.to
}

/** Difference in days; positive when `b` is after `a`. */
export function diffInDays(a: DateString, b: DateString): number {
  const pa = parseParts(a)
  const pb = parseParts(b)
  const ms = Date.UTC(pb.year, pb.month - 1, pb.day) - Date.UTC(pa.year, pa.month - 1, pa.day)
  return Math.round(ms / 86_400_000)
}

/**
 * Presets that cover nearly every filter in bookkeeping.
 *
 * `lastMonth` and `lastQuarter` exist because reports are most often run for
 * the period that just closed, not the current one.
 */
export type PeriodPreset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear'
  | 'last30'
  | 'last90'
  | 'yearToDate'

export const PERIOD_PRESET_LABEL: Record<PeriodPreset, LocalizedLabel> = {
  today: { sr: 'Danas', 'sr-Cyrl': 'Данас', en: 'Today' },
  yesterday: { sr: 'Juče', 'sr-Cyrl': 'Јуче', en: 'Yesterday' },
  thisWeek: { sr: 'Ova nedelja', 'sr-Cyrl': 'Ова недеља', en: 'This week' },
  thisMonth: { sr: 'Ovaj mesec', 'sr-Cyrl': 'Овај месец', en: 'This month' },
  lastMonth: { sr: 'Prošli mesec', 'sr-Cyrl': 'Прошли месец', en: 'Last month' },
  thisQuarter: { sr: 'Ovaj kvartal', 'sr-Cyrl': 'Овај квартал', en: 'This quarter' },
  lastQuarter: { sr: 'Prošli kvartal', 'sr-Cyrl': 'Прошли квартал', en: 'Last quarter' },
  thisYear: { sr: 'Ova godina', 'sr-Cyrl': 'Ова година', en: 'This year' },
  lastYear: { sr: 'Prošla godina', 'sr-Cyrl': 'Прошла година', en: 'Last year' },
  last30: { sr: 'Poslednjih 30 dana', 'sr-Cyrl': 'Последњих 30 дана', en: 'Last 30 days' },
  last90: { sr: 'Poslednjih 90 dana', 'sr-Cyrl': 'Последњих 90 дана', en: 'Last 90 days' },
  yearToDate: { sr: 'Od početka godine', 'sr-Cyrl': 'Од почетка године', en: 'Year to date' },
}

export function resolvePreset(preset: PeriodPreset, reference: DateString = today()): DateRange {
  switch (preset) {
    case 'today':
      return { from: reference, to: reference }
    case 'yesterday': {
      const day = addDays(reference, -1)
      return { from: day, to: day }
    }
    case 'thisWeek':
      return { from: startOfWeek(reference), to: endOfWeek(reference) }
    case 'thisMonth':
      return { from: startOfMonth(reference), to: endOfMonth(reference) }
    case 'lastMonth': {
      const previous = addMonths(startOfMonth(reference), -1)
      return { from: previous, to: endOfMonth(previous) }
    }
    case 'thisQuarter':
      return { from: startOfQuarter(reference), to: endOfQuarter(reference) }
    case 'lastQuarter': {
      const previous = addMonths(startOfQuarter(reference), -3)
      return { from: startOfQuarter(previous), to: endOfQuarter(previous) }
    }
    case 'thisYear':
      return { from: startOfYear(reference), to: endOfYear(reference) }
    case 'lastYear': {
      const previous = addMonths(startOfYear(reference), -12)
      return { from: startOfYear(previous), to: endOfYear(previous) }
    }
    case 'last30':
      return { from: addDays(reference, -29), to: reference }
    case 'last90':
      return { from: addDays(reference, -89), to: reference }
    case 'yearToDate':
      return { from: startOfYear(reference), to: reference }
  }
}

/** If the range exactly matches a preset, returns it — so the button stays active. */
export function matchPreset(range: DateRange, reference: DateString = today()): PeriodPreset | null {
  const presets = Object.keys(PERIOD_PRESET_LABEL) as PeriodPreset[]
  return (
    presets.find((preset) => {
      const resolved = resolvePreset(preset, reference)
      return resolved.from === range.from && resolved.to === range.to
    }) ?? null
  )
}

export const MONTH_NAMES: Record<'sr' | 'sr-Cyrl' | 'en', string[]> = {
  sr: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
  'sr-Cyrl': ['Јануар', 'Фебруар', 'Март', 'Април', 'Мај', 'Јун', 'Јул', 'Август', 'Септембар', 'Октобар', 'Новембар', 'Децембар'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}

import type { Locale } from '@liro/i18n'
import { formatDecimal, formatQuantity } from '@liro/i18n'

/**
 * Series colors.
 *
 * Recharts assigns its own colors by default, which have nothing to do with
 * our palette — the chart then looks pasted in from another page. Here the
 * order is fixed, so the first series in every chart in every application
 * has the same color.
 *
 * The order follows readability, not the palette: blue and teal are
 * distinguishable even with color blindness, so they come first. Red is
 * deliberately only sixth — in a chart it carries the meaning "bad", and is
 * not spent on an ordinary third series.
 */
export const SERIES_COLORS = [
  'liro-blue.6',
  'liro-teal.6',
  'liro-violet.6',
  'liro-orange.6',
  'liro-green.7',
  'liro-red.7',
  'liro-blue.3',
  'liro-teal.3',
  'liro-violet.3',
  'liro-gray.5',
] as const

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length] as string
}

/**
 * Bar colors in `LiroBarsList`.
 *
 * Kept separate from `SERIES_COLORS` for one reason: in a chart the color
 * sits NEXT TO the label, while on a bar the label sits ON it. That is why
 * only shades that carry white letters with a ratio of at least 4.5 are
 * allowed here.
 *
 * Measured (white on background):
 *   blue[6]   4.53    orange[8] 6.04    blue[8]   7.08
 *   teal[6]   4.56    green[7]  5.37    teal[8]   7.24
 *   violet[6] 4.95    red[7]    7.26    violet[8] 6.30    gray[7] 6.46
 *
 * Replaced relative to SERIES_COLORS: orange[6] (3.18) -> orange[8], and the
 * four light shades at the end (blue[3] 2.29, teal[3] 2.15, violet[3] 1.72,
 * gray[5] 2.64) -> their dark counterparts.
 *
 * blue[6] and teal[6] sit at 4.53 and 4.56 — the margin to the threshold is
 * small. If the ramp is ever changed, RE-MEASURE, do not estimate.
 */
export const BAR_COLORS = [
  'liro-blue.6',
  'liro-teal.6',
  'liro-violet.6',
  'liro-orange.8',
  'liro-green.7',
  'liro-red.7',
  'liro-blue.8',
  'liro-teal.8',
  'liro-violet.8',
  'liro-gray.7',
] as const

export function barColor(index: number): string {
  return BAR_COLORS[index % BAR_COLORS.length] as string
}

export interface LiroSeries {
  /** Key in the data. */
  name: string
  /** Label in the legend; defaults to the same as `name`. */
  label?: string
  /** Overrides the color from the sequence — use only when the color carries meaning. */
  color?: string
  yAxisId?: string
}

/** Assigns colors to series that do not have one, in a fixed order. */
export function withSeriesColors<T extends LiroSeries>(series: T[]): (T & { color: string })[] {
  return series.map((item, index) => ({ ...item, color: item.color ?? seriesColor(index) }))
}

export interface ValueFormatOptions {
  /** Currency code appended after the number, e.g. `RSD`. */
  currency?: string
  /** Number of decimals; defaults to 0 on the axis, 2 with a currency. */
  decimals?: number
  /** Suffix for non-monetary values — `%`, `pcs`, `h`. */
  unit?: string
  /** Abbreviates large amounts on the axis: 1.2 M instead of 1,200,000. */
  compact?: boolean
}

/*
 * Not a `LocalizedLabel` - a triple of abbreviations, not one string - so it
 * stays a table rather than three catalog keys.
 */
/* eslint-disable no-restricted-syntax -- not a LocalizedLabel map, see comment above */
const COMPACT_SUFFIX: Record<'sr-Latn' | 'sr-Cyrl' | 'en', [string, string, string]> = {
  'sr-Latn': ['hilj.', 'mil.', 'mlrd.'],
  'sr-Cyrl': ['хиљ.', 'мил.', 'млрд.'],
  en: ['k', 'M', 'B'],
}
/* eslint-enable no-restricted-syntax */

/**
 * Formats a value on the chart.
 *
 * The axis and the tooltip do not need the same thing: on the axis what
 * matters is that the number fits, in the tooltip that it is exact. That is
 * why `compact` exists as an option, not as the default behavior.
 */
export function createValueFormatter(
  locale: Locale,
  options: ValueFormatOptions = {},
): (value: number) => string {
  const decimals = options.decimals ?? (options.currency ? 2 : 0)

  return (value: number) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—'

    let text: string

    if (options.compact && Math.abs(value) >= 1000) {
      const suffixes = COMPACT_SUFFIX[locale]
      const tier = Math.min(Math.floor(Math.log10(Math.abs(value)) / 3), 3)
      const scaled = value / 10 ** (tier * 3)
      text = `${formatQuantity(scaled, locale, 1)} ${suffixes[tier - 1] ?? ''}`.trim()
    } else {
      text = formatDecimal(value, locale, decimals)
    }

    if (options.currency) return `${text} ${options.currency}`
    if (options.unit) return `${text} ${options.unit}`
    return text
  }
}

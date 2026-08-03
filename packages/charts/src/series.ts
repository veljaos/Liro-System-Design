import type { Locale } from '@liro/i18n'
import { formatDecimal, formatQuantity } from '@liro/i18n'

/**
 * Boje serija.
 *
 * Recharts podrazumevano dodeljuje svoje boje, koje nemaju veze sa nasom
 * paletom - grafikon onda izgleda kao da je zalepljen sa druge stranice.
 * Ovde je redosled fiksiran, pa prva serija u svakom grafikonu u svakoj
 * aplikaciji ima istu boju.
 *
 * Redosled prati citljivost, ne paletu: plava i tirkizna se razlikuju i pri
 * daltonizmu, pa idu prve. Crvena je namerno tek sesta - u grafikonu ona nosi
 * znacenje „lose", i ne troši se na obicnu trecu seriju.
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

export interface LiroSeries {
  /** Kljuc u podacima. */
  name: string
  /** Natpis u legendi; podrazumevano isti kao `name`. */
  label?: string
  /** Nadjacava boju iz redosleda - koristi samo kada boja nosi znacenje. */
  color?: string
  yAxisId?: string
}

/** Dodeljuje boje serijama koje ih nemaju, u fiksiranom redosledu. */
export function withSeriesColors<T extends LiroSeries>(series: T[]): (T & { color: string })[] {
  return series.map((item, index) => ({ ...item, color: item.color ?? seriesColor(index) }))
}

export interface ValueFormatOptions {
  /** Oznaka valute koja se dodaje iza broja, npr. `RSD`. */
  currency?: string
  /** Broj decimala; podrazumevano 0 na osi, 2 uz valutu. */
  decimals?: number
  /** Sufiks za neneovcane vrednosti - `%`, `kom`, `h`. */
  unit?: string
  /** Skracuje krupne iznose na osi: 1.2 mil umesto 1.200.000. */
  compact?: boolean
}

const COMPACT_SUFFIX: Record<'sr' | 'sr-Cyrl' | 'en', [string, string, string]> = {
  sr: ['hilj.', 'mil.', 'mlrd.'],
  'sr-Cyrl': ['хиљ.', 'мил.', 'млрд.'],
  en: ['k', 'M', 'B'],
}

/**
 * Formatira vrednost na grafikonu.
 *
 * Osa i oblacic ne traze isto: na osi je bitno da broj stane, u oblacicu da
 * bude tacan. Zato `compact` postoji kao opcija, a ne kao podrazumevano
 * ponasanje.
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

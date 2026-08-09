'use client'

import {
  BubbleChart,
  CompositeChart,
  FunnelChart,
  Heatmap,
  PieChart,
  RadarChart,
  RadialBarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  Treemap,
  type CompositeChartProps,
} from '@mantine/charts'
import { useMemo } from 'react'
import { LOCALE_TAGS, useI18n } from '@liro/i18n'
import { createValueFormatter, seriesColor, withSeriesColors, type LiroSeries, type ValueFormatOptions } from './series'

/**
 * Ostali tipovi grafikona.
 *
 * Isti princip kao kod osnovnih: boje iz Liro palete u fiksiranom redosledu,
 * iznosi kroz `formatDecimal`. Ovi se koriste redje, pa su omotaci tanji - ako
 * nekom zatreba nesto specificno, prosledjuje se direktno kroz `...rest`.
 */

interface Common extends ValueFormatOptions {
  height?: number
}

function useFormatter(options: ValueFormatOptions) {
  const { locale } = useI18n()
  const { currency, decimals, unit, compact } = options
  return useMemo(
    () => createValueFormatter(locale, { currency, decimals, unit, compact }),
    [locale, currency, decimals, unit, compact],
  )
}

// --- Kombinovani: stubići + linija u istom prikazu -------------------------

export interface LiroCompositeChartProps extends Common {
  data: Record<string, unknown>[]
  dataKey: string
  series: (LiroSeries & { type: 'bar' | 'line' | 'area' })[]
  withLegend?: boolean
}

/** Za poređenje veličine i trenda odjednom — promet u stubićima, marža linijom. */
export function LiroCompositeChart({ data, dataKey, series, withLegend = true, height, ...format }: LiroCompositeChartProps) {
  const formatter = useFormatter(format)
  return (
    <CompositeChart
      h={height ?? '100%'}
      data={data}
      dataKey={dataKey}
      series={withSeriesColors(series) as CompositeChartProps['series']}
      withLegend={withLegend}
      valueFormatter={formatter}
      yAxisProps={{ width: 64 }}
      gridProps={{ strokeDasharray: '3 3' }}
      curveType="monotone"
      strokeWidth={2}
      tickLine="none"
    />
  )
}

// --- Udeli ----------------------------------------------------------------

export interface LiroPieChartProps extends Common {
  data: { name: string; value: number; color?: string }[]
  withLabels?: boolean
  size?: number
}

/* `height` se izdvaja samo da ne zavrsi u `...format` — kruzni grafikon
  velicinu uzima iz `size`. */
export function LiroPieChart({ data, withLabels = false, size = 200, height: _height, ...format }: LiroPieChartProps) {
  const formatter = useFormatter(format)
  const cells = useMemo(() => data.map((slice, index) => ({ ...slice, color: slice.color ?? seriesColor(index) })), [data])
  return <PieChart data={cells} size={size} withLabels={withLabels} withLabelsLine={withLabels} valueFormatter={formatter} mx="auto" />
}

export interface LiroFunnelChartProps extends Common {
  data: { name: string; value: number; color?: string }[]
  withLabels?: boolean
}

/** Levak — koliko od ponuda stigne do naplate. */
export function LiroFunnelChart({ data, withLabels = true, height, ...format }: LiroFunnelChartProps) {
  const formatter = useFormatter(format)
  const cells = useMemo(() => data.map((slice, index) => ({ ...slice, color: slice.color ?? seriesColor(index) })), [data])
  return <FunnelChart data={cells} withLabels={withLabels} valueFormatter={formatter} size={height ?? 220} mx="auto" />
}

export interface LiroRadialBarChartProps extends Common {
  data: { name: string; value: number; color?: string }[]
  withLabels?: boolean
}

export function LiroRadialBarChart({ data, withLabels = true, height }: LiroRadialBarChartProps) {
  const cells = useMemo(() => data.map((slice, index) => ({ ...slice, color: slice.color ?? seriesColor(index) })), [data])
  /* `RadialBarChart` nema `valueFormatter` - vrednosti se formatiraju pre ulaza. */
  return <RadialBarChart h={height ?? '100%'} data={cells} dataKey="value" withLabels={withLabels} withLegend />
}

// --- Poređenje po više osa ------------------------------------------------

export interface LiroRadarChartProps extends Common {
  data: Record<string, unknown>[]
  dataKey: string
  series: LiroSeries[]
  withPolarRadiusAxis?: boolean
}

/** Radar — ocena klijenta po više kriterijuma odjednom. */
export function LiroRadarChart({ data, dataKey, series, withPolarRadiusAxis = true, height }: LiroRadarChartProps) {
  return (
    <RadarChart
      h={height ?? '100%'}
      data={data}
      dataKey={dataKey}
      series={withSeriesColors(series)}
      withPolarRadiusAxis={withPolarRadiusAxis}
    />
  )
}

// --- Raspršenost ----------------------------------------------------------

export interface LiroScatterChartProps extends Common {
  data: { name: string; color?: string; data: Record<string, number>[] }[]
  dataKey: { x: string; y: string }
  xAxisLabel?: string
  yAxisLabel?: string
}

/** Odnos dve veličine — iznos fakture naspram dana docnje. */
export function LiroScatterChart({ data, dataKey, xAxisLabel, yAxisLabel, height, ...format }: LiroScatterChartProps) {
  const formatter = useFormatter(format)
  const series = useMemo(() => data.map((item, index) => ({ ...item, color: item.color ?? seriesColor(index) })), [data])
  return (
    <ScatterChart
      h={height ?? '100%'}
      data={series}
      dataKey={dataKey}
      xAxisLabel={xAxisLabel}
      yAxisLabel={yAxisLabel}
      valueFormatter={formatter}
      gridProps={{ strokeDasharray: '3 3' }}
      withLegend
    />
  )
}

export interface LiroBubbleChartProps extends Common {
  data: Record<string, unknown>[]
  dataKey: { x: string; y: string; z: string }
  range?: [number, number]
  color?: string
  label?: string
}

export function LiroBubbleChart({ data, dataKey, range = [16, 220], color, label, height, ...format }: LiroBubbleChartProps) {
  const formatter = useFormatter(format)
  return (
    <BubbleChart
      h={height ?? 60}
      data={data}
      dataKey={dataKey}
      range={range}
      color={color ?? seriesColor(0)}
      label={label}
      valueFormatter={formatter}
    />
  )
}

// --- Gustina i hijerarhija ------------------------------------------------

export interface LiroHeatmapProps {
  /** Mapa `YYYY-MM-DD` → broj. */
  data: Record<string, number>
  startDate?: string
  endDate?: string
  withTooltip?: boolean
  withWeekdayLabels?: boolean
  withMonthLabels?: boolean
  /** Sta se meri: "dokumenata", "obracuna". Ulazi u opis i u sazetak. */
  unit?: string
}

/** Toplotna mapa po danima — broj unetih dokumenata kroz godinu. */
export function LiroHeatmap({
  data,
  startDate,
  endDate,
  withTooltip = true,
  withWeekdayLabels = true,
  withMonthLabels = true,
  unit,
}: LiroHeatmapProps) {
  const { locale, formatNumber, formatDate } = useI18n()

  // Nazivi meseci i dana iz `Intl`, ne Mantine podrazumevani - bez ovoga pise
  // `Jan`, `Sun`, engleski u sistemu gde je sve ostalo srpsko.
  // `useMemo` po jeziku je obavezan: pravljenje `Intl` formattera je skupo.
  const labels = useMemo(() => {
    const tag = LOCALE_TAGS[locale]
    const monthFormat = new Intl.DateTimeFormat(tag, { month: 'short', timeZone: 'UTC' })
    const dayFormat = new Intl.DateTimeFormat(tag, { weekday: 'short', timeZone: 'UTC' })

    const months: string[] = []
    for (let index = 0; index < 12; index += 1) {
      months.push(monthFormat.format(Date.UTC(2023, index, 1)))
    }

    // 01.01.2023. je bila nedelja - Mantine ocekuje niz koji pocinje nedeljom i
    // sam ga rotira po `firstDayOfWeek`.
    // Samo svaki drugi dan ima natpis: sedam imena jedno pod drugim se ne mogu
    // procitati na visini kvadratica.
    const days: string[] = []
    for (let index = 0; index < 7; index += 1) {
      days.push(index % 2 === 1 ? dayFormat.format(Date.UTC(2023, 0, 1 + index)) : '')
    }

    return { months, days }
  }, [locale])

  const values = Object.values(data)
  const total = values.reduce((sum, value) => sum + value, 0)
  const peak = values.length > 0 ? Math.max(...values) : 0
  const unitText = unit ? ` ${unit}` : ''

  // `role="img"` sa sazetkom, umesto `tabIndex` na svakom danu.
  //
  // Mantine daje `getRectProps`, pa bi svaki kvadratic mogao dobiti mesto u
  // obilasku tastaturom - i korisnik bi dobio 365 zaustavljanja kroz JEDAN
  // prikaz. To je gore od nedostupnog. Deca elementa sa `role="img"` su
  // prezentaciona, pa citac ekrana procita jednu korisnu recenicu.
  return (
    <div
      role="img"
      aria-label={`${formatNumber(total)}${unitText}, najviše ${formatNumber(peak)} u jednom danu`}
    >
      <Heatmap
        data={data}
        startDate={startDate}
        endDate={endDate}
        withTooltip={withTooltip}
        withWeekdayLabels={withWeekdayLabels}
        withMonthLabels={withMonthLabels}
        monthLabels={labels.months}
        weekdayLabels={labels.days}
        withOutsideDates={false}
        firstDayOfWeek={1}
        getTooltipLabel={({ date, value }) =>
          `${formatDate(date, { dateStyle: 'medium' })} — ${formatNumber(value ?? 0)}${unitText}`
        }
        colors={[
          'var(--mantine-color-liro-blue-2)',
          'var(--mantine-color-liro-blue-4)',
          'var(--mantine-color-liro-blue-6)',
          'var(--mantine-color-liro-blue-8)',
        ]}
      />
    </div>
  )
}

export interface LiroTreemapProps extends Common {
  data: { name: string; value?: number; color?: string; children?: { name: string; value: number }[] }[]
  dataKey?: string
}

/** Struktura troškova gde je površina udeo. */
export function LiroTreemap({ data, dataKey = 'value', height }: LiroTreemapProps) {
  const cells = useMemo(() => data.map((item, index) => ({ ...item, color: item.color ?? seriesColor(index) })), [data])
  return <Treemap h={height ?? 260} data={cells} dataKey={dataKey} withTooltip />
}

export interface LiroSunburstChartProps extends Common {
  data: { name: string; value?: number; color?: string; children?: unknown[] }[]
  size?: number
}

/** Hijerarhija u prstenovima — konta po klasama i grupama. */
export function LiroSunburstChart({ data, size = 260 }: LiroSunburstChartProps) {
  const cells = useMemo(() => data.map((item, index) => ({ ...item, color: item.color ?? seriesColor(index) })), [data])
  return <SunburstChart data={cells as never} size={size} withTooltip mx="auto" />
}

export interface LiroSankeyChartProps extends Common {
  data: {
    nodes: { name: string; color?: string }[]
    /** `source` i `target` su indeksi u nizu čvorova, ne nazivi. */
    links: { source: number; target: number; value: number }[]
  }
}

/** Tok vrednosti — od priliva do rasporeda po troškovima. */
export function LiroSankeyChart({ data, height }: LiroSankeyChartProps) {
  const nodes = useMemo(
    () => data.nodes.map((node, index) => ({ ...node, color: node.color ?? seriesColor(index) })),
    [data.nodes],
  )
  return <SankeyChart h={height ?? 320} data={{ nodes, links: data.links } as never} />
}

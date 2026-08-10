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
 * Other chart types.
 *
 * Same principle as the basic ones: colors from the Liro palette in a fixed
 * order, amounts through `formatDecimal`. These are used less often, so the
 * wrappers are thinner — if someone needs something specific, it is passed
 * through directly via `...rest`.
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

// --- Composite: bars + line in the same view -------------------------

export interface LiroCompositeChartProps extends Common {
  data: Record<string, unknown>[]
  dataKey: string
  series: (LiroSeries & { type: 'bar' | 'line' | 'area' })[]
  withLegend?: boolean
}

/** For comparing size and trend at once — revenue as bars, margin as a line. */
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

// --- Shares ----------------------------------------------------------------

export interface LiroPieChartProps extends Common {
  data: { name: string; value: number; color?: string }[]
  withLabels?: boolean
  size?: number
}

/* `height` is pulled out only so it does not end up in `...format` — the
  donut chart takes its size from `size`. */
export function LiroPieChart({ data, withLabels = false, size = 200, height: _height, ...format }: LiroPieChartProps) {
  const formatter = useFormatter(format)
  const cells = useMemo(() => data.map((slice, index) => ({ ...slice, color: slice.color ?? seriesColor(index) })), [data])
  return <PieChart data={cells} size={size} withLabels={withLabels} withLabelsLine={withLabels} valueFormatter={formatter} mx="auto" />
}

export interface LiroFunnelChartProps extends Common {
  data: { name: string; value: number; color?: string }[]
  withLabels?: boolean
}

/** Funnel — how many quotes make it to payment. */
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
  /* `RadialBarChart` has no `valueFormatter` — values are formatted before input. */
  return <RadialBarChart h={height ?? '100%'} data={cells} dataKey="value" withLabels={withLabels} withLegend />
}

// --- Comparison across multiple axes ------------------------------------------------

export interface LiroRadarChartProps extends Common {
  data: Record<string, unknown>[]
  dataKey: string
  series: LiroSeries[]
  withPolarRadiusAxis?: boolean
}

/** Radar — client rating across several criteria at once. */
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

// --- Scatter ----------------------------------------------------------

export interface LiroScatterChartProps extends Common {
  data: { name: string; color?: string; data: Record<string, number>[] }[]
  dataKey: { x: string; y: string }
  xAxisLabel?: string
  yAxisLabel?: string
}

/** Relationship between two quantities — invoice amount versus days overdue. */
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

// --- Density and hierarchy ------------------------------------------------

export interface LiroHeatmapProps {
  /** Map of `YYYY-MM-DD` → number. */
  data: Record<string, number>
  startDate?: string
  endDate?: string
  withTooltip?: boolean
  withWeekdayLabels?: boolean
  withMonthLabels?: boolean
  /** What is being measured: "documents", "calculations". Goes into the description and the summary. */
  unit?: string
}

/** Heatmap by day — number of documents entered over a year. */
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

  // Month and day names from `Intl`, not the Mantine defaults — without this
  // it shows `Jan`, `Sun`, English in a system where everything else is
  // Serbian.
  // `useMemo` keyed on the language is required: creating an `Intl` formatter
  // is expensive.
  const labels = useMemo(() => {
    const tag = LOCALE_TAGS[locale]
    const monthFormat = new Intl.DateTimeFormat(tag, { month: 'short', timeZone: 'UTC' })
    const dayFormat = new Intl.DateTimeFormat(tag, { weekday: 'short', timeZone: 'UTC' })

    const months: string[] = []
    for (let index = 0; index < 12; index += 1) {
      months.push(monthFormat.format(Date.UTC(2023, index, 1)))
    }

    // 01.01.2023 was a Sunday — Mantine expects an array that starts on
    // Sunday and rotates it itself according to `firstDayOfWeek`.
    // Only every other day has a label: seven names stacked on top of each
    // other cannot be read at the height of a cell.
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

  // `role="img"` with a summary, instead of `tabIndex` on every day.
  //
  // Mantine provides `getRectProps`, so every cell could get a stop in the
  // keyboard tab order — and the user would get 365 stops through ONE
  // display. That is worse than inaccessible. Children of an element with
  // `role="img"` are presentational, so a screen reader reads one useful
  // sentence.
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

/** Cost structure where area represents share. */
export function LiroTreemap({ data, dataKey = 'value', height }: LiroTreemapProps) {
  const cells = useMemo(() => data.map((item, index) => ({ ...item, color: item.color ?? seriesColor(index) })), [data])
  return <Treemap h={height ?? 260} data={cells} dataKey={dataKey} withTooltip />
}

export interface LiroSunburstChartProps extends Common {
  data: { name: string; value?: number; color?: string; children?: unknown[] }[]
  size?: number
}

/** Hierarchy in rings — accounts by class and group. */
export function LiroSunburstChart({ data, size = 260 }: LiroSunburstChartProps) {
  const cells = useMemo(() => data.map((item, index) => ({ ...item, color: item.color ?? seriesColor(index) })), [data])
  return <SunburstChart data={cells as never} size={size} withTooltip mx="auto" />
}

export interface LiroSankeyChartProps extends Common {
  data: {
    nodes: { name: string; color?: string }[]
    /** `source` and `target` are indices into the node array, not names. */
    links: { source: number; target: number; value: number }[]
  }
}

/** Value flow — from inflow to allocation across expenses. */
export function LiroSankeyChart({ data, height }: LiroSankeyChartProps) {
  const nodes = useMemo(
    () => data.nodes.map((node, index) => ({ ...node, color: node.color ?? seriesColor(index) })),
    [data.nodes],
  )
  return <SankeyChart h={height ?? 320} data={{ nodes, links: data.links } as never} />
}

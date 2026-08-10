'use client'

import {
  AreaChart,
  BarChart,
  BarsList,
  DonutChart,
  LineChart,
  Sparkline,
  type AreaChartProps,
  type BarChartProps,
  type DonutChartProps,
  type LineChartProps,
  type SparklineProps,
} from '@mantine/charts'
import { useMemo } from 'react'
import { useI18n } from '@liro/i18n'
import { barColor, createValueFormatter, seriesColor, withSeriesColors, type LiroSeries, type ValueFormatOptions } from './series'

/**
 * Wrappers around Mantine charts.
 *
 * Three things are solved in one place instead of at every call site: series
 * colors come from our palette in a fixed order, numbers go through
 * `formatDecimal` (so `1.234.567,89`, not `1234567.89`), and the grid and
 * axes are tuned so they do not outshout the data.
 *
 * If a chart needs something these wrappers do not cover, use the Mantine
 * component directly — but then colors and formatting become your concern.
 */

interface CommonProps extends ValueFormatOptions {
  data: Record<string, unknown>[]
  /** Key on the x-axis — usually a month or a date. */
  dataKey: string
  series: LiroSeries[]
  withLegend?: boolean
  /** Abbreviates numbers on the y-axis; the tooltip stays precise. */
  compactAxis?: boolean
}

function useFormatters(options: ValueFormatOptions, compactAxis: boolean) {
  const { locale } = useI18n()
  /* Destructured before `useMemo`: `options` is a new object on every render. */
  const { currency, decimals, unit, compact } = options

  return useMemo(
    () => ({
      /* The tooltip must be exact — that is where the user reads the real value. */
      tooltip: createValueFormatter(locale, { currency, decimals, unit, compact }),
      /* The axis may abbreviate, since only the order of magnitude is read there. */
      axis: createValueFormatter(locale, { unit, compact: compactAxis, decimals: 0 }),
    }),
    [locale, currency, decimals, unit, compact, compactAxis],
  )
}

/** A single formatter — for displays without an axis (donut, bars list). */
function useValueFormatter(options: ValueFormatOptions) {
  const { locale } = useI18n()
  const { currency, decimals, unit, compact } = options
  return useMemo(
    () => createValueFormatter(locale, { currency, decimals, unit, compact }),
    [locale, currency, decimals, unit, compact],
  )
}

const GRID_PROPS = { strokeDasharray: '3 3' }

export interface LiroBarChartProps extends CommonProps {
  /** `stacked` for composition, `default` for comparison. */
  type?: BarChartProps['type']
  orientation?: BarChartProps['orientation']
  height?: number
}

export function LiroBarChart({
  data,
  dataKey,
  series,
  type = 'default',
  orientation = 'vertical',
  withLegend = true,
  compactAxis = true,
  height,
  ...format
}: LiroBarChartProps) {
  const formatters = useFormatters(format, compactAxis)

  return (
    <BarChart
      h={height ?? '100%'}
      data={data}
      dataKey={dataKey}
      type={type}
      orientation={orientation}
      series={withSeriesColors(series)}
      withLegend={withLegend}
      valueFormatter={formatters.tooltip}
      yAxisProps={{ tickFormatter: formatters.axis, width: 64 }}
      gridProps={GRID_PROPS}
      barProps={{ radius: [4, 4, 0, 0] }}
      withBarValueLabel={false}
      tickLine="none"
      strokeDasharray="3 3"
    />
  )
}

export interface LiroLineChartProps extends CommonProps {
  curveType?: LineChartProps['curveType']
  withDots?: boolean
  height?: number
}

export function LiroLineChart({
  data,
  dataKey,
  series,
  curveType = 'linear',
  withDots = false,
  withLegend = true,
  compactAxis = true,
  height,
  ...format
}: LiroLineChartProps) {
  const formatters = useFormatters(format, compactAxis)

  return (
    <LineChart
      h={height ?? '100%'}
      data={data}
      dataKey={dataKey}
      series={withSeriesColors(series)}
      curveType={curveType}
      withDots={withDots}
      withLegend={withLegend}
      valueFormatter={formatters.tooltip}
      yAxisProps={{ tickFormatter: formatters.axis, width: 64 }}
      gridProps={GRID_PROPS}
      strokeWidth={2}
      tickLine="none"
      strokeDasharray="3 3"
    />
  )
}

export interface LiroAreaChartProps extends CommonProps {
  type?: AreaChartProps['type']
  curveType?: AreaChartProps['curveType']
  height?: number
}

export function LiroAreaChart({
  data,
  dataKey,
  series,
  type = 'default',
  curveType = 'linear',
  withLegend = true,
  compactAxis = true,
  height,
  ...format
}: LiroAreaChartProps) {
  const formatters = useFormatters(format, compactAxis)

  return (
    <AreaChart
      h={height ?? '100%'}
      data={data}
      dataKey={dataKey}
      series={withSeriesColors(series)}
      type={type}
      curveType={curveType}
      withLegend={withLegend}
      withDots={false}
      valueFormatter={formatters.tooltip}
      yAxisProps={{ tickFormatter: formatters.axis, width: 64 }}
      gridProps={GRID_PROPS}
      fillOpacity={0.18}
      strokeWidth={2}
      tickLine="none"
      strokeDasharray="3 3"
    />
  )
}

export interface DonutSlice {
  name: string
  value: number
  color?: string
}

export interface LiroDonutChartProps extends ValueFormatOptions {
  data: DonutSlice[]
  /** Text in the center — usually the total. */
  centerLabel?: string
  withLabels?: boolean
  size?: DonutChartProps['size']
  thickness?: number
}

export function LiroDonutChart({
  data,
  centerLabel,
  withLabels = false,
  size = 200,
  thickness = 22,
  ...format
}: LiroDonutChartProps) {
  const formatter = useValueFormatter(format)

  const cells = useMemo(
    () => data.map((slice, index) => ({ ...slice, color: slice.color ?? seriesColor(index) })),
    [data],
  )

  return (
    <DonutChart
      data={cells}
      size={size}
      thickness={thickness}
      withLabels={withLabels}
      withLabelsLine={withLabels}
      chartLabel={centerLabel}
      valueFormatter={formatter}
      paddingAngle={2}
      mx="auto"
    />
  )
}

export interface LiroSparklineProps extends ValueFormatOptions {
  data: (number | null)[];
  /**
   * When `true`, color follows direction: up is green, down is red.
   * For expenses, set `invert` — a rising expense is not good news.
   */
  trend?: boolean
  invert?: boolean
  color?: string
  height?: number
  width?: number | string
  curveType?: SparklineProps['curveType']
}

/** A miniature chart next to a number — in a card, in a table row. */
export function LiroSparkline({
  data,
  trend = false,
  invert = false,
  color,
  height = 40,
  width = '100%',
  curveType = 'linear',
}: LiroSparklineProps) {
  return (
    <Sparkline
      w={width}
      h={height}
      data={data}
      curveType={curveType}
      fillOpacity={0.2}
      strokeWidth={1.75}
      color={trend ? undefined : (color ?? seriesColor(0))}
      trendColors={
        trend
          ? invert
            ? { positive: 'liro-red.7', negative: 'liro-green.7', neutral: 'liro-gray.5' }
            : { positive: 'liro-green.7', negative: 'liro-red.7', neutral: 'liro-gray.5' }
          : undefined
      }
    />
  )
}

export interface LiroBarsListProps extends ValueFormatOptions {
  data: { label: string; value: number; color?: string }[]
  valueLabel?: string
  /** Label above the names column. */
  labelLabel?: string
}

/**
 * Horizontal list with bars.
 *
 * Better than a pie chart when comparing more than five items — the eye
 * compares lengths more easily than angles, and labels fit without
 * truncation.
 */
export function LiroBarsList({ data, valueLabel, labelLabel, ...format }: LiroBarsListProps) {
  const formatter = useValueFormatter(format)

  const bars = useMemo(
    () =>
      data.map((item, index) => ({
        /* Mantine expects `name`; our API uses `label` to stay consistent
           with the rest of the system's components. */
        name: item.label,
        value: item.value,
        color: item.color ?? barColor(index),
      })),
    [data],
  )

  return (
    <BarsList
      data={bars}
      /*
      * `variant="filled"` is NOT cosmetic.
      *
      * The default `"light"` with a specific shade (`liro-blue.6`) in the
      * Mantine resolver gives a FULL background but the text color intended
      * for a translucent tint — light blue on full blue. In the dark theme
      * that tanks contrast. `"filled"` gives a proper pair: a color from the
      * ramp + white letters.
      */
      variant="filled"
      valueFormatter={formatter}
      valueLabel={valueLabel}
      barsLabel={labelLabel}
      /*
       * Label on a single line.
       *
       * Wrapping a name onto two lines stretches the bar and ruins the length
       * comparison — and length is the only reason this display is used.
       */
      styles={{
        barLabel: {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
      }}
    />
  )
}

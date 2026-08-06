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
 * Omotaci nad Mantine grafikonima.
 *
 * Tri stvari se resavaju na jednom mestu umesto na svakom pozivu: boje serija
 * dolaze iz nase palete u fiksiranom redosledu, brojevi idu kroz `formatDecimal`
 * (dakle `1.234.567,89`, ne `1234567.89`), a mreza i ose su podeseni tako da
 * ne nadglasavaju podatke.
 *
 * Ako grafikonu treba nesto sto ovi omotaci ne pokrivaju, koristi se Mantine
 * komponenta direktno - ali tada boje i formatiranje postaju tvoja briga.
 */

interface CommonProps extends ValueFormatOptions {
  data: Record<string, unknown>[]
  /** Kljuc na x-osi - obicno mesec ili datum. */
  dataKey: string
  series: LiroSeries[]
  withLegend?: boolean
  /** Skracuje brojeve na y-osi; oblacic ostaje precizan. */
  compactAxis?: boolean
}

function useFormatters(options: ValueFormatOptions, compactAxis: boolean) {
  const { locale } = useI18n()
  /* Razlaganje pre `useMemo`-a: `options` je novi objekat pri svakom renderu. */
  const { currency, decimals, unit, compact } = options

  return useMemo(
    () => ({
      /* Oblacic mora biti tacan - tamo korisnik cita stvarnu vrednost. */
      tooltip: createValueFormatter(locale, { currency, decimals, unit, compact }),
      /* Osa sme da skracuje, jer se tamo cita red velicine. */
      axis: createValueFormatter(locale, { unit, compact: compactAxis, decimals: 0 }),
    }),
    [locale, currency, decimals, unit, compact, compactAxis],
  )
}

/** Jedan formatter - za prikaze bez ose (prsten, lista traka). */
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
  /** `stacked` za strukturu, `default` za poredjenje. */
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
  /** Tekst u sredini - obicno ukupno. */
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
   * Kada je `true`, boja prati smer: rast zelen, pad crven.
   * Za troskove postavi `invert` - rast troska nije dobra vest.
   */
  trend?: boolean
  invert?: boolean
  color?: string
  height?: number
  width?: number | string
  curveType?: SparklineProps['curveType']
}

/** Minijaturni grafikon uz brojku - u kartici, u redu tabele. */
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
  /** Natpis iznad kolone sa nazivima. */
  labelLabel?: string
}

/**
 * Vodoravna lista sa trakama.
 *
 * Bolja od pite kada se poredi vise od pet stavki - oko lakse poredi duzine
 * nego uglove, a natpisi staju bez skracivanja.
 */
export function LiroBarsList({ data, valueLabel, labelLabel, ...format }: LiroBarsListProps) {
  const formatter = useValueFormatter(format)

  const bars = useMemo(
    () =>
      data.map((item, index) => ({
        /* Mantine ocekuje `name`; nas API koristi `label` da bi bio dosledan
           sa ostalim komponentama sistema. */
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
      * `variant="filled"` NIJE kozmetika.
      * 
      * Podrazumevani `"light"` sa zadatom nijansom (`liro-blue.6`) u Mantine
      * resolveru daje PUNU pozadinu ali boju teksta predvidjenu za providnu
      * tintu - svetloplavo na punom plavom. U tamnoj temi to pada kontrast.
      * `"filled"` daje pun par: boja iz rampe + bela slova.
      */
      variant="filled"
      valueFormatter={formatter}
      valueLabel={valueLabel}
      barsLabel={labelLabel}
      /*
       * Natpis u jednom redu.
       *
       * Prelom naziva u dva reda razvlaci traku i kvari poredjenje duzina -
       * a duzina je jedini razlog zbog kojeg se ovaj prikaz koristi.
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

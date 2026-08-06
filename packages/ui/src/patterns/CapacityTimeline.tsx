'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Box, Group, ScrollArea, SegmentedControl, Stack, Text, Tooltip } from '@mantine/core'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n } from '@liro/i18n'

/*
 * Racunica sa datumima je namerno LOKALNA, a ne uvezena iz `@liro/dates`.
 *
 * `@liro/dates` vec uvozi `@liro/ui` (zbog `StatusBadge` u `DueDate`), pa bi
 * obrnuti uvoz napravio kruznu zavisnost izmedju paketa. Funkcije su ionako
 * ciste i sitne; ako ih zatreba jos komponenti, sele se u zaseban paket
 * `@liro/datemath` koji ne zavisi ni od cega.
 */
type DateString = string

function parts(value: DateString): [number, number, number] {
  const [year, month, day] = value.split('-').map(Number)
  return [year ?? 1970, month ?? 1, day ?? 1]
}

function toStr(year: number, month: number, day: number): DateString {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function addDays(value: DateString, count: number): DateString {
  const [year, month, day] = parts(value)
  const date = new Date(Date.UTC(year, month - 1, day + count))
  return toStr(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}

function diffInDays(a: DateString, b: DateString): number {
  const [ay, am, ad] = parts(a)
  const [by, bm, bd] = parts(b)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86_400_000)
}

function startOfWeek(value: DateString): DateString {
  const [year, month, day] = parts(value)
  const weekday = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7
  return addDays(value, -weekday)
}

function startOfMonth(value: DateString): DateString {
  const [year, month] = parts(value)
  return toStr(year, month, 1)
}

function today(): DateString {
  const now = new Date()
  return toStr(now.getFullYear(), now.getMonth() + 1, now.getDate())
}


/**
 * Raspodela kapaciteta kroz vreme.
 *
 * Prethodna verzija je primala udele od 0 do 1 i nije imala osu sa datumima.
 * To je delovalo fleksibilno, ali je aplikaciju teralo da sama racuna pozicije,
 * a korisnika ostavljalo bez odgovora na najvaznije pitanje - „kada tacno".
 *
 * Sada komponenta prima STVARNE datume i sama racuna raspored. Zauzvrat je
 * dobila ono sto je nedostajalo: osu sa podeocima, oznaku danasnjeg dana,
 * promenu razmere, vodoravni skrol nezavisan od kolone sa nazivima, i prikaz
 * preklapanja u vise redova umesto jedne trake preko druge.
 */

export type TimeScale = 'day' | 'week' | 'month'

export interface CapacityBar {
  id: string
  label: string
  /** `YYYY-MM-DD`, uključivo. */
  start: DateString
  /** `YYYY-MM-DD`, uključivo. */
  end: DateString
  tone?: StatusToneName
  /** Napredak zadatka u procentima — nije isto što i protekло vreme. */
  progress?: number
  detail?: string
}

export interface CapacityRow {
  id: string
  /** Resurs: čovek, mašina, sala, vozilo. */
  label: string
  caption?: string
  bars: CapacityBar[]
  /** Iskorišćenost u procentima; preko 100 znači preopterećenje. */
  utilisation?: number
  avatar?: ReactNode
}

export interface CapacityTimelineProps {
  rows: CapacityRow[]
  /** Početak prikazanog raspona. */
  from: DateString
  /** Kraj prikazanog raspona, uključivo. */
  to: DateString
  scale?: TimeScale
  onScaleChange?: (scale: TimeScale) => void
  /** Prikazuje prekidač razmere iznad ose. */
  withScaleControl?: boolean
  onBarClick?: (row: CapacityRow, bar: CapacityBar) => void
  /** Širina kolone sa nazivima resursa. */
  labelWidth?: number
}

const MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']
const WEEKDAYS_SHORT = ['pon', 'uto', 'sre', 'čet', 'pet', 'sub', 'ned']

/** Minimalna širina jednog podeoka po razmeri — ispod ovoga natpisi se slepe. */
const TICK_WIDTH: Record<TimeScale, number> = { day: 38, week: 62, month: 96 }

interface Tick {
  date: DateString
  label: string
  /** Vikend i prvi dan meseca se blago naglašavaju. */
  emphasis?: 'weekend' | 'period'
}

function buildTicks(from: DateString, to: DateString, scale: TimeScale): Tick[] {
  const ticks: Tick[] = []
  let cursor = scale === 'week' ? startOfWeek(from) : scale === 'month' ? startOfMonth(from) : from
  let guard = 0

  while (cursor <= to && guard < 800) {
    const [year, month, day] = parts(cursor)
    const weekday = (new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1)).getUTCDay() + 6) % 7

    if (scale === 'day') {
      ticks.push({
        date: cursor,
        label: `${WEEKDAYS_SHORT[weekday]} ${String(day).padStart(2, '0')}`,
        emphasis: weekday >= 5 ? 'weekend' : day === 1 ? 'period' : undefined,
      })
      cursor = addDays(cursor, 1)
    } else if (scale === 'week') {
      ticks.push({ date: cursor, label: `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.` })
      cursor = addDays(cursor, 7)
    } else {
      ticks.push({ date: cursor, label: `${MONTHS_SHORT[month - 1]} ${year}`, emphasis: 'period' })
      const nextMonth = month === 12 ? 1 : month + 1
      const nextYear = month === 12 ? year + 1 : year
      cursor = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    }
    guard += 1
  }

  return ticks
}

/**
 * Raspoređuje trake u redove tako da se ne preklapaju.
 *
 * Ranije su se preklopljene trake crtale jedna preko druge, pa se donja nije
 * videla. Sada svaka dobija svoj podred - visina reda raste, ali se ne gubi
 * podatak, a preopterećenje se vidi na prvi pogled.
 */
function packLanes(bars: CapacityBar[]): CapacityBar[][] {
  const lanes: CapacityBar[][] = []
  const sorted = [...bars].sort((a, b) => (a.start < b.start ? -1 : 1))

  for (const bar of sorted) {
    const lane = lanes.find((items) => {
      const last = items[items.length - 1]
      return !last || last.end < bar.start
    })
    if (lane) lane.push(bar)
    else lanes.push([bar])
  }

  return lanes
}

const BAR_HEIGHT = 24
const LANE_GAP = 4

export function CapacityTimeline({
  rows,
  from,
  to,
  scale: controlledScale,
  onScaleChange,
  withScaleControl = true,
  onBarClick,
  labelWidth = 200,
}: CapacityTimelineProps) {
  const { t } = useI18n()
  const [internalScale, setInternalScale] = useState<TimeScale>(controlledScale ?? 'week')

  /*
   * Kontrolisano SAMO kada aplikacija prosledi i `onScaleChange`.
   *
   * Bez ove provere je `scale="week"` bez rukovaoca cinio komponentu
   * kontrolisanom, pa se prekidac razmere pomerao a prikaz ostajao isti.
   */
  const scale = controlledScale && onScaleChange ? controlledScale : internalScale
  const viewportRef = useRef<HTMLDivElement>(null)

  const setScale = (next: TimeScale) => {
    setInternalScale(next)
    onScaleChange?.(next)
  }

  const ticks = useMemo(() => buildTicks(from, to, scale), [from, to, scale])
  const totalDays = Math.max(diffInDays(from, to) + 1, 1)
  const trackWidth = ticks.length * TICK_WIDTH[scale]
  const pxPerDay = trackWidth / totalDays

  const now = today()
  const todayOffset = now >= from && now <= to ? diffInDays(from, now) * pxPerDay : null

  const packed = useMemo(
    () => rows.map((row) => ({ row, lanes: packLanes(row.bars) })),
    [rows],
  )

  return (
    <Stack gap="xs">
      {withScaleControl && (
        <Group justify="space-between">
          <SegmentedControl
            value={scale}
            onChange={(next) => setScale(next as TimeScale)}
            size="xs"
            data={[
              { value: 'day', label: t({ sr: 'Dan', en: 'Day' }) },
              { value: 'week', label: t({ sr: 'Nedelja', en: 'Week' }) },
              { value: 'month', label: t({ sr: 'Mesec', en: 'Month' }) },
            ]}
          />
          {todayOffset !== null && (
            <Group gap={6}>
              <Box w={2} h={12} style={{ backgroundColor: liroVar.status.danger.solid }} />
              <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                {t({ sr: 'danas', en: 'today' })}
              </Text>
            </Group>
          )}
        </Group>
      )}

      <Group gap={0} align="flex-start" wrap="nowrap" w="100%" style={{ overflow: 'hidden' }}>
        {/* Kolona sa nazivima ostaje na mestu dok se osa skroluje. */}
        <Box w={labelWidth} style={{ flexShrink: 0, borderRight: `1px solid ${liroVar.border.default}` }}>
          <Box h={30} style={{ borderBottom: `1px solid ${liroVar.border.default}` }} />
          {packed.map(({ row, lanes }) => {
            const height = Math.max(lanes.length, 1) * (BAR_HEIGHT + LANE_GAP) + LANE_GAP + 8
            const overloaded = (row.utilisation ?? 0) > 100

            return (
              <Group
                key={row.id}
                gap="xs"
                wrap="nowrap"
                px="xs"
                h={height}
                align="center"
                style={{ borderBottom: `1px solid ${liroVar.border.subtle}` }}
              >
                {row.avatar}
                <Stack gap={0} style={{ minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={500} truncate>{row.label}</Text>
                    {row.utilisation !== undefined && (
                      <Tooltip
                        label={t({
                          sr: overloaded ? 'Preopterećen resurs' : 'Iskorišćenost',
                          en: overloaded ? 'Overloaded' : 'Utilisation',
                        })}
                        withArrow
                      >
                        <Text
                          size="xs"
                          fw={700}
                          data-numeric
                          style={{ color: overloaded ? liroVar.status.danger.fg : liroVar.text.tertiary, flexShrink: 0 }}
                        >
                          {row.utilisation}%
                        </Text>
                      </Tooltip>
                    )}
                  </Group>
                  {row.caption && (
                    <Text size="xs" truncate style={{ color: liroVar.text.tertiary }}>{row.caption}</Text>
                  )}
                </Stack>
              </Group>
            )
          })}
        </Box>

        <ScrollArea
          viewportRef={viewportRef}
          type="always"
          scrollbarSize={8}
          offsetScrollbars
          style={{ flex: 1, minWidth: 0, width: '100%' }}
        >
          <Box w={trackWidth} pos="relative">
            <Group gap={0} wrap="nowrap" h={30} style={{ borderBottom: `1px solid ${liroVar.border.default}` }}>
              {ticks.map((tick) => (
                <Box
                  key={tick.date}
                  w={TICK_WIDTH[scale]}
                  h="100%"
                  style={{
                    flexShrink: 0,
                    borderLeft: `1px solid ${tick.emphasis === 'period' ? liroVar.border.strong : liroVar.border.subtle}`,
                    backgroundColor: tick.emphasis === 'weekend' ? liroVar.surface.sunken : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="xs" style={{ color: liroVar.text.tertiary, whiteSpace: 'nowrap' }}>
                    {tick.label}
                  </Text>
                </Box>
              ))}
            </Group>

            {/* Oznaka današnjeg dana ide preko svih redova — najvažnija linija na ekranu. */}
            {todayOffset !== null && (
              <Box
                pos="absolute"
                top={30}
                bottom={0}
                style={{
                  left: todayOffset,
                  width: 2,
                  backgroundColor: liroVar.status.danger.solid,
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            )}

            {packed.map(({ row, lanes }) => {
              const height = Math.max(lanes.length, 1) * (BAR_HEIGHT + LANE_GAP) + LANE_GAP + 8

              return (
                <Box
                  key={row.id}
                  pos="relative"
                  h={height}
                  style={{ borderBottom: `1px solid ${liroVar.border.subtle}` }}
                >
                  <Group gap={0} wrap="nowrap" style={{ position: 'absolute', inset: 0 }}>
                    {ticks.map((tick) => (
                      <Box
                        key={tick.date}
                        w={TICK_WIDTH[scale]}
                        h="100%"
                        style={{
                          flexShrink: 0,
                          borderLeft: `1px solid ${tick.emphasis === 'period' ? liroVar.border.default : liroVar.border.subtle}`,
                          backgroundColor: tick.emphasis === 'weekend' ? liroVar.surface.sunken : undefined,
                        }}
                      />
                    ))}
                  </Group>

                  {lanes.map((lane, laneIndex) =>
                    lane.map((bar) => {
                      const tone = liroVar.status[bar.tone ?? 'info']
                      const left = diffInDays(from, bar.start) * pxPerDay
                      const width = Math.max((diffInDays(bar.start, bar.end) + 1) * pxPerDay, 8)

                      return (
                        <Tooltip
                          key={bar.id}
                          withArrow
                          multiline
                          w={240}
                          label={
                            <Stack gap={2}>
                              <Text size="xs" fw={700}>{bar.label}</Text>
                              <Text size="xs">
                                {bar.start.split('-').reverse().join('.')} – {bar.end.split('-').reverse().join('.')}
                              </Text>
                              {bar.progress !== undefined && (
                                <Text size="xs">{t({ sr: 'Napredak' })}: {bar.progress}%</Text>
                              )}
                              {bar.detail && <Text size="xs">{bar.detail}</Text>}
                            </Stack>
                          }
                        >
                          <Box
                            onClick={onBarClick ? () => onBarClick(row, bar) : undefined}
                            pos="absolute"
                            style={{
                              left,
                              width,
                              top: LANE_GAP + 4 + laneIndex * (BAR_HEIGHT + LANE_GAP),
                              height: BAR_HEIGHT,
                              backgroundColor: tone.bg,
                              border: `1px solid ${tone.border}`,
                              borderRadius: 'var(--liro-radius-sm)',
                              overflow: 'hidden',
                              cursor: onBarClick ? 'pointer' : 'default',
                              zIndex: 1,
                            }}
                          >
                            {bar.progress !== undefined && (
                              <Box
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  width: `${bar.progress}%`,
                                  backgroundColor: tone.solid,
                                  opacity: 0.25,
                                }}
                              />
                            )}
                            <Text
                              size="xs"
                              fw={600}
                              px={6}
                              lh={`${BAR_HEIGHT - 2}px`}
                              style={{
                                color: tone.fg,
                                position: 'relative',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {bar.label}
                            </Text>
                          </Box>
                        </Tooltip>
                      )
                    }),
                  )}
                </Box>
              )
            })}
          </Box>
        </ScrollArea>
      </Group>
    </Stack>
  )
}

export type { DateString }

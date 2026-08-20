'use client'

import { Schedule, type ScheduleEventData, type ScheduleViewLevel } from '@mantine/schedule'
import { useMemo } from 'react'
import { INTENT_FAMILY_COLOR } from '@liro/tokens'
import { useI18n, type TranslationKey } from '@liro/i18n'
import { DAYJS_LOCALE } from '@liro/i18n'

/**
 * Calendar of deadlines and payroll runs.
 *
 * Mantine's `Schedule` requires a color for every event. If that decision is
 * left to the caller, the calendar gets two different color schemes in two
 * modules and stops being readable. That is why `kind` — the event type —
 * exists here, and the color is a consequence, same as with buttons.
 */

export type ScheduleEventKind =
  /** Statutory deadline: filing a return, paying tax. Red — missing it costs money. */
  | 'deadline'
  /** Payroll run in progress or scheduled. Blue. */
  | 'payroll'
  /** Verification, signature, submission to SEF. Teal. */
  | 'filing'
  /** Done and posted. Green. */
  | 'completed'
  /** Non-working day, vacation, holiday. Gray. */
  | 'absence'
  /** Reminder with no legal consequence. Orange. */
  | 'reminder'

const KIND_COLOR: Record<ScheduleEventKind, string> = {
  deadline: INTENT_FAMILY_COLOR.destructive,
  payroll: INTENT_FAMILY_COLOR.primary,
  filing: INTENT_FAMILY_COLOR.verify,
  completed: INTENT_FAMILY_COLOR.positive,
  absence: INTENT_FAMILY_COLOR.neutral,
  reminder: INTENT_FAMILY_COLOR.caution,
}

export const SCHEDULE_KIND_LABEL: Record<ScheduleEventKind, TranslationKey> = {
  deadline: 'schedule.kind.deadline',
  payroll: 'schedule.kind.payroll',
  filing: 'schedule.kind.filing',
  completed: 'schedule.kind.completed',
  absence: 'schedule.kind.absence',
  reminder: 'schedule.kind.reminder',
}

export interface LiroScheduleEvent {
  id: string | number
  title: string
  /** `YYYY-MM-DD HH:mm:ss` or `Date`. */
  start: string | Date
  end: string | Date
  kind: ScheduleEventKind
  allDay?: boolean
  /**
   * RFC 5545 recurrence rule, e.g. `FREQ=MONTHLY;BYMONTHDAY=5` for a PPP-PD
   * filing deadline on the 5th of the month.
   */
  rrule?: string
  payload?: Record<PropertyKey, unknown>
}

export interface LiroScheduleProps {
  events: LiroScheduleEvent[]
  /** Displayed date; controlled. */
  date?: string | Date
  onDateChange?: (date: string) => void
  view?: ScheduleViewLevel
  onViewChange?: (view: ScheduleViewLevel) => void
  defaultView?: ScheduleViewLevel
  onEventClick?: (event: LiroScheduleEvent) => void
  onDayClick?: (date: string) => void
  /**
   * View-only calendar: disables clicking a day and an event.
   *
   * Dragging is currently disabled in every case anyway — see the comment
   * next to `<Schedule>` below. When the Mantine bug is fixed, that will also
   * be driven from here.
   */
  readOnly?: boolean
  height?: number | string
}

/*
 * Mantine's `Schedule` carries twenty-six English labels of its own and falls back
 * to them silently when `labels` is not given.
 *
 * The same shape of problem as dayjs: a third-party component with its own text,
 * which no check can catch - the buttons said "Today, Day, Week, Month, Year" in
 * every language while everything around them was translated.
 *
 * `moreLabel` is a function rather than a string, so it is built here from the key.
 */
function scheduleLabels(t: (key: string) => string) {
  return {
    today: t('schedule.labels.today'),
    next: t('schedule.labels.next'),
    previous: t('schedule.labels.previous'),
    more: t('schedule.labels.more'),
    day: t('schedule.labels.day'),
    week: t('schedule.labels.week'),
    month: t('schedule.labels.month'),
    year: t('schedule.labels.year'),
    allDay: t('schedule.labels.allDay'),
    weekday: t('schedule.labels.weekday'),
    timeSlot: t('schedule.labels.timeSlot'),
    selectMonth: t('schedule.labels.selectMonth'),
    selectYear: t('schedule.labels.selectYear'),
    switchToDayView: t('schedule.labels.switchToDayView'),
    switchToWeekView: t('schedule.labels.switchToWeekView'),
    switchToMonthView: t('schedule.labels.switchToMonthView'),
    switchToYearView: t('schedule.labels.switchToYearView'),
    viewSelectLabel: t('schedule.labels.viewSelectLabel'),
    noEvents: t('schedule.labels.noEvents'),
    resource: t('schedule.labels.resource'),
    resources: t('schedule.labels.resources'),
    resourceSlot: t('schedule.labels.resourceSlot'),
    agenda: t('schedule.labels.agenda'),
    moreLabel: (count: number) =>
      t('schedule.labels.moreLabel').replace('{count}', String(count)),
  }
}

/**
 * Translates Liro events into the shape Mantine expects.
 *
 * `variant: 'light'` is the default because a full block of color on a
 * monthly view with twenty events turns the calendar into a colorful grid.
 * Deadlines are the exception — they are allowed to shout.
 */
function toMantineEvents(events: LiroScheduleEvent[]): ScheduleEventData[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    color: KIND_COLOR[event.kind],
    variant: event.kind === 'deadline' ? 'filled' : 'light',
    allDay: event.allDay,
    recurrence: event.rrule ? { rrule: event.rrule } : undefined,
    payload: { ...event.payload, kind: event.kind },
  })) as ScheduleEventData[]
}

export function LiroSchedule({
  events,
  date,
  onDateChange,
  view,
  onViewChange,
  defaultView = 'month',
  onEventClick,
  onDayClick,
  readOnly = false,
  height = 640,
}: LiroScheduleProps) {
  const { locale, t } = useI18n()
  const labels = useMemo(() => scheduleLabels(t), [t])
  const mantineEvents = useMemo(() => toMantineEvents(events), [events])
  const byId = useMemo(() => new Map(events.map((event) => [event.id, event])), [events])

  return (
    <Schedule
      h={height}
      events={mantineEvents}
      date={date}
      onDateChange={onDateChange}
      view={view}
      onViewChange={onViewChange}
      defaultView={defaultView}
      /*
       * The following props are DELIBERATELY not passed:
       * `withEventsDragAndDrop`, `withEventResize`, `withAgenda`, `mode`.
       *
       * In Mantine 9.5.1, `Schedule` passes them down to its inner views
       * (`MonthView`, `YearView`), and they do not destructure them — they
       * end up in `...others` and land on a DOM element, so React reports a
       * warning. Until that is fixed upstream, we leave them undefined:
       * React does not warn on `undefined`, and the behavior is disabled by
       * default anyway.
       *
       * `onEventClick` has the same problem, so it is passed only when the
       * application genuinely asks for it.
       */
      /* The first day of the week is not set here but through
         `LiroDatesProvider` from `@liro/dates`, which sets it to Monday for
         the whole document. */
      /* dayjs's own locale code, not our `Locale` value - dayjs knows `sr`
         (Latin), `sr-cyrl` and `en`, not `sr-Latn`. Same table as
         `DAYJS_LOCALE` in `LiroDatesProvider.tsx`; a ternary here collapsed the
         two scripts into one and a Cyrillic user got Latin. */
      locale={DAYJS_LOCALE[locale] ?? 'en'}
      labels={labels}
      radius="md"
      {...(onEventClick && !readOnly
        ? {
            onEventClick: (event: { id: string | number }) => {
              const original = byId.get(event.id)
              if (original) onEventClick(original)
            },
          }
        : {})}
      {...(onDayClick && !readOnly ? { onDayClick } : {})}
    />
  )
}

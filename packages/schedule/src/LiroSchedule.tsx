'use client'

import { Schedule, type ScheduleEventData, type ScheduleViewLevel } from '@mantine/schedule'
import { useMemo } from 'react'
import { INTENT_FAMILY_COLOR } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Kalendar rokova i obračuna.
 *
 * Mantine `Schedule` trazi boju za svaki dogadjaj. Ako se ta odluka prepusti
 * pozivaocu, kalendar u dva modula dobije dve razlicite semu boja i prestane da
 * se cita. Zato ovde postoji `kind` - vrsta dogadjaja - a boja je posledica,
 * isto kao kod dugmadi.
 */

export type ScheduleEventKind =
  /** Zakonski rok: predaja prijave, uplata poreza. Crveno - promasaj se placa. */
  | 'deadline'
  /** Obracun u toku ili zakazan. Plavo. */
  | 'payroll'
  /** Overa, potpis, slanje u SEF. Tirkizno. */
  | 'filing'
  /** Zavrseno i proknjizeno. Zeleno. */
  | 'completed'
  /** Neradni dan, godisnji odmor, praznik. Sivo. */
  | 'absence'
  /** Podsetnik bez pravne posledice. Narandzasto. */
  | 'reminder'

const KIND_COLOR: Record<ScheduleEventKind, string> = {
  deadline: INTENT_FAMILY_COLOR.destructive,
  payroll: INTENT_FAMILY_COLOR.primary,
  filing: INTENT_FAMILY_COLOR.verify,
  completed: INTENT_FAMILY_COLOR.positive,
  absence: INTENT_FAMILY_COLOR.neutral,
  reminder: INTENT_FAMILY_COLOR.caution,
}

export const SCHEDULE_KIND_LABEL: Record<ScheduleEventKind, LocalizedLabel> = {
  deadline: { sr: 'Zakonski rok', 'sr-Cyrl': 'Законски рок', en: 'Statutory deadline' },
  payroll: { sr: 'Obračun', 'sr-Cyrl': 'Обрачун', en: 'Payroll run' },
  filing: { sr: 'Predaja i overa', 'sr-Cyrl': 'Предаја и овера', en: 'Filing' },
  completed: { sr: 'Završeno', 'sr-Cyrl': 'Завршено', en: 'Completed' },
  absence: { sr: 'Odsustvo i praznici', 'sr-Cyrl': 'Одсуства и празници', en: 'Absence' },
  reminder: { sr: 'Podsetnik', 'sr-Cyrl': 'Подсетник', en: 'Reminder' },
}

export interface LiroScheduleEvent {
  id: string | number
  title: string
  /** `YYYY-MM-DD HH:mm:ss` ili `Date`. */
  start: string | Date
  end: string | Date
  kind: ScheduleEventKind
  allDay?: boolean
  /**
   * RFC 5545 pravilo ponavljanja, npr. `FREQ=MONTHLY;BYMONTHDAY=5` za rok
   * predaje PPP-PD do 5. u mesecu.
   */
  rrule?: string
  payload?: Record<PropertyKey, unknown>
}

export interface LiroScheduleProps {
  events: LiroScheduleEvent[]
  /** Prikazani datum; kontrolisano. */
  date?: string | Date
  onDateChange?: (date: string) => void
  view?: ScheduleViewLevel
  onViewChange?: (view: ScheduleViewLevel) => void
  defaultView?: ScheduleViewLevel
  onEventClick?: (event: LiroScheduleEvent) => void
  onDayClick?: (date: string) => void
  /** `static` iskljucuje prevlacenje - za kalendare koje korisnik samo gleda. */
  readOnly?: boolean
  height?: number | string
}

/**
 * Prevodi Liro dogadjaje u oblik koji Mantine ocekuje.
 *
 * `variant: 'light'` je podrazumevano jer pun blok boje na mesecnom prikazu
 * sa dvadeset dogadjaja pretvara kalendar u sarenu mrezu. Rokovi su izuzetak -
 * oni smeju da vicu.
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
  const { locale } = useI18n()
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
       * Sledeci propovi se NAMERNO ne prosledjuju: `withEventsDragAndDrop`,
       * `withEventResize`, `withAgenda`, `mode`.
       *
       * U Mantine 9.5.1 `Schedule` ih prosledjuje unutrasnjim prikazima
       * (`MonthView`, `YearView`), a oni ih ne destrukturiraju - zavrse u
       * `...others` i odu na DOM element, pa React prijavi upozorenje. Dok se
       * to ne popravi uzvodno, ostavljamo ih neodredjenim: React ne upozorava
       * na `undefined`, a ponasanje je ionako podrazumevano iskljuceno.
       *
       * `onEventClick` ima isti problem, pa se prosledjuje samo kada ga
       * aplikacija stvarno trazi.
       */
      /* Prvi dan nedelje se ne podesava ovde nego kroz `LiroDatesProvider` iz
         `@liro/dates`, koji ga postavlja na ponedeljak za ceo dokument. */
      locale={locale === 'en' ? 'en' : 'sr'}
      radius="md"
      {...(onEventClick
        ? {
            onEventClick: (event: { id: string | number }) => {
              const original = byId.get(event.id)
              if (original) onEventClick(original)
            },
          }
        : {})}
      {...(onDayClick ? { onDayClick } : {})}
    />
  )
}

'use client'

import { Text, Tooltip } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { StatusBadge } from '@liro/ui'
import { diffInDays, today, type DateRange } from './periods'
import { formatSerbianDate, type DateString } from './parse'

export interface DateTextProps {
  value: DateString | null | undefined
  /** Prikazuje i dan u nedelji u opisu pri prelasku misem. */
  withWeekday?: boolean
  size?: 'xs' | 'sm' | 'md'
  dimmed?: boolean
}

/**
 * Datum u tekstu.
 *
 * Uvek `DD.MM.YYYY.` sa tackom na kraju - tako se datum pise u srpskim
 * dokumentima. Prazna vrednost je crtica, nikad prazan prostor, da bi se
 * videla razlika izmedju „nema datuma" i „nije se ucitalo".
 */
export function DateText({ value, withWeekday = false, size = 'sm', dimmed = false }: DateTextProps) {
  const { formatDate } = useI18n()

  if (!value) {
    return <Text component="span" size={size} c="dimmed">—</Text>
  }

  const formatted = formatSerbianDate(value)
  const long = formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  /* `component="span"` jer datum gotovo uvek stoji unutar druge tekstualne
     komponente - u celiji tabele, u paru oznaka/vrednost, u recenici. */
  const text = (
    <Text
      component="span"
      size={size}
      data-numeric
      style={dimmed ? { color: liroVar.text.secondary } : undefined}
    >
      {formatted}
    </Text>
  )

  return withWeekday ? <Tooltip label={long} withArrow openDelay={300}>{text}</Tooltip> : text
}

export interface DateRangeTextProps {
  value: DateRange | null | undefined
  size?: 'xs' | 'sm' | 'md'
}

export function DateRangeText({ value, size = 'sm' }: DateRangeTextProps) {
  if (!value) return <Text component="span" size={size} c="dimmed">—</Text>
  return (
    <Text component="span" size={size} data-numeric>
      {formatSerbianDate(value.from)} – {formatSerbianDate(value.to)}
    </Text>
  )
}

export interface DueDateProps {
  value: DateString | null | undefined
  /** Kada je izmireno, rok se prikazuje neutralno bez obzira na datum. */
  settled?: boolean
  /** Prag u danima za upozorenje pred istek; podrazumevano 5. */
  warningDays?: number
}

const OVERDUE: LocalizedLabel = { sr: 'U docnji', 'sr-Cyrl': 'У доцњи', en: 'Overdue' }
const DUE_TODAY: LocalizedLabel = { sr: 'Dospeva danas', 'sr-Cyrl': 'Доспева данас', en: 'Due today' }
const SETTLED: LocalizedLabel = { sr: 'Izmireno', 'sr-Cyrl': 'Измирено', en: 'Settled' }

/**
 * Rok dospeca sa stanjem.
 *
 * Postoji zato sto je „15.03.2026." sam po sebi beskoristan podatak na spisku
 * od dvesta faktura - operateru treba da vidi sta je probijeno, a ne da racuna
 * u glavi. Broj dana docnje je u opisu, da ne pravi buku u koloni.
 */
export function DueDate({ value, settled = false, warningDays = 5 }: DueDateProps) {
  const { t } = useI18n()

  if (!value) return <Text component="span" size="sm" c="dimmed">—</Text>
  if (settled) {
    return <StatusBadge tone="success" label={t(SETTLED)} />
  }

  const days = diffInDays(today(), value)

  if (days < 0) {
    const overdue = Math.abs(days)
    return (
      <Tooltip
        label={t({
          sr: `${overdue} ${overdue === 1 ? 'dan' : 'dana'} docnje · rok ${formatSerbianDate(value)}`,
          'sr-Cyrl': `${overdue} дана доцње · рок ${formatSerbianDate(value)}`,
          en: `${overdue} days overdue · due ${formatSerbianDate(value)}`,
        })}
        withArrow
      >
        <span><StatusBadge tone="danger" label={t(OVERDUE)} /></span>
      </Tooltip>
    )
  }

  if (days === 0) return <StatusBadge tone="warning" label={t(DUE_TODAY)} />

  if (days <= warningDays) {
    return (
      <Tooltip label={formatSerbianDate(value)} withArrow>
        <span>
          <StatusBadge
            tone="warning"
            label={t({
              sr: `Za ${days} ${days === 1 ? 'dan' : 'dana'}`,
              'sr-Cyrl': `За ${days} дана`,
              en: `In ${days} days`,
            })}
          />
        </span>
      </Tooltip>
    )
  }

  return <DateText value={value} />
}

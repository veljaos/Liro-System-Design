'use client'

import { Text, Tooltip } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { StatusBadge } from '@liro/ui'
import { diffInDays, today, type DateRange } from './periods'
import { formatSerbianDate, type DateString } from './parse'

export interface DateTextProps {
  value: DateString | null | undefined
  /** Also shows the weekday in the hover tooltip. */
  withWeekday?: boolean
  size?: 'xs' | 'sm' | 'md'
  dimmed?: boolean
}

/**
 * Date as text.
 *
 * Always `DD.MM.YYYY.` with a trailing dot — that is how dates are written
 * in Serbian documents. An empty value is a dash, never blank space, so
 * there is a visible difference between "no date" and "did not load".
 */
export function DateText({ value, withWeekday = false, size = 'sm', dimmed = false }: DateTextProps) {
  const { formatDate } = useI18n()

  if (!value) {
    return <Text component="span" size={size} c="dimmed">—</Text>
  }

  const formatted = formatSerbianDate(value)
  const long = formatDate(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  /* `component="span"` because a date almost always sits inside another text
     component — in a table cell, in a label/value pair, in a sentence. */
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
  /** When settled, the deadline is shown neutrally regardless of the date. */
  settled?: boolean
  /** Threshold in days for a warning before expiry; defaults to 5. */
  warningDays?: number
}

const OVERDUE: LocalizedLabel = { sr: 'U docnji', 'sr-Cyrl': 'У доцњи', en: 'Overdue' }
const DUE_TODAY: LocalizedLabel = { sr: 'Dospeva danas', 'sr-Cyrl': 'Доспева данас', en: 'Due today' }
const SETTLED: LocalizedLabel = { sr: 'Izmireno', 'sr-Cyrl': 'Измирено', en: 'Settled' }

/**
 * Due date with status.
 *
 * Exists because "15.03.2026." on its own is a useless piece of data in a
 * list of two hundred invoices — the operator needs to see what has been
 * breached, not do the math in their head. The number of overdue days is in
 * the tooltip, so it does not create noise in the column.
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

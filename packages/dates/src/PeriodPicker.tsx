'use client'

import { useState } from 'react'
import { Button, Divider, Group, Popover, Stack, Text } from '@mantine/core'
import { DatePicker, MonthPicker } from '@mantine/dates'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type Locale, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import {
  PERIOD_PRESET_LABEL,
  matchPreset,
  resolvePreset,
  today,
  type DateRange,
  type PeriodPreset,
} from './periods'
import { formatSerbianDate } from './parse'

export interface PeriodPickerProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  /** Presets offered; defaults to the eight most common. */
  presets?: PeriodPreset[]
  label?: LocalizedLabel
  /** Allows an empty selection — "all periods". */
  clearable?: boolean
  disabled?: boolean
  width?: number | string
}

const DEFAULT_PRESETS: PeriodPreset[] = [
  'today',
  'thisWeek',
  'thisMonth',
  'lastMonth',
  'thisQuarter',
  'lastQuarter',
  'yearToDate',
  'lastYear',
]

const ALL_PERIODS: TranslationKey = 'dates.periodPicker.allPeriods'
const CUSTOM: TranslationKey = 'dates.periodPicker.customRange'
const CLEAR: TranslationKey = 'dates.periodPicker.clear'

/**
 * Accounting period picker.
 *
 * Presets are on the left, the calendar on the right. The order is
 * deliberate: nine times out of ten the user wants "last month", not to click
 * two dates. The calendar exists for that tenth time, not as the main path.
 *
 * When the selected range exactly matches a preset, that preset stays
 * highlighted — so the label shows whether the period is standard or set
 * manually.
 */
export function PeriodPicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  label,
  clearable = true,
  disabled = false,
  width = 260,
}: PeriodPickerProps) {
  const { t } = useI18n()
  const [opened, setOpened] = useState(false)
  /*
   * The calendar must hold its own state while the user is picking.
   *
   * After the first click, Mantine reports `[start, null]`. If we do not
   * remember that and instead wait for both ends, the controlled `value`
   * reverts to the old value and the first click is lost — the range could
   * never be selected.
   */
  const [draft, setDraft] = useState<[string | null, string | null]>([null, null])
  const reference = today()
  const activePreset = value ? matchPreset(value, reference) : null

  const buttonLabel = !value
    ? t(ALL_PERIODS)
    : activePreset
      ? t(PERIOD_PRESET_LABEL[activePreset])
      : `${formatSerbianDate(value.from)} – ${formatSerbianDate(value.to)}`

  const handlePreset = (preset: PeriodPreset) => {
    setDraft([null, null])
    onChange(resolvePreset(preset, reference))
    setOpened(false)
  }

  return (
    <Stack gap={4}>
      {label && (
        <Text size="sm" fw={500}>{t(label)}</Text>
      )}

      <Popover opened={opened} onChange={setOpened} position="bottom-start" shadow="md" radius="md" withinPortal>
        <Popover.Target>
          <Button
            variant="default"
            size="sm"
            w={width}
            disabled={disabled}
            onClick={() => setOpened((state) => !state)}
            leftSection={<CalendarDays size={15} />}
            rightSection={<ChevronDown size={14} />}
            styles={{ inner: { justifyContent: 'space-between' }, label: { fontWeight: 400 } }}
          >
            {buttonLabel}
          </Button>
        </Popover.Target>

        <Popover.Dropdown p={0}>
          <Group align="stretch" gap={0} wrap="nowrap">
            <Stack gap={2} p="xs" w={190} style={{ borderInlineEnd: `1px solid ${liroVar.border.subtle}` }}>
              {presets.map((preset) => (
                <Button
                  key={preset}
                  size="xs"
                  variant={activePreset === preset ? 'light' : 'subtle'}
                  color={activePreset === preset ? undefined : 'gray'}
                  justify="flex-start"
                  onClick={() => handlePreset(preset)}
                  styles={{ label: { fontWeight: activePreset === preset ? 600 : 400 } }}
                >
                  {t(PERIOD_PRESET_LABEL[preset])}
                </Button>
              ))}

              {clearable && (
                <>
                  <Divider my={4} />
                  <Button
                    size="xs"
                    variant="subtle"
                    color="gray"
                    justify="flex-start"
                    onClick={() => {
                      setDraft([null, null])
                      onChange(null)
                      setOpened(false)
                    }}
                  >
                    {t(CLEAR)}
                  </Button>
                </>
              )}
            </Stack>

            <Stack gap="xs" p="xs">
              <Text size="xs" fw={600} c="dimmed">{t(CUSTOM)}</Text>
              <DatePicker
                type="range"
                value={draft[0] || draft[1] ? draft : value ? [value.from, value.to] : [null, null]}
                onChange={(next) => {
                  const [from, to] = next
                  if (from && to) {
                    /* Both ends selected — report upward and clear the draft. */
                    setDraft([null, null])
                    onChange({ from, to })
                    setOpened(false)
                  } else {
                    setDraft(next as [string | null, string | null])
                  }
                }}
                allowSingleDateInRange={false}
                size="sm"
              />
            </Stack>
          </Group>
        </Popover.Dropdown>
      </Popover>
    </Stack>
  )
}

export interface AccountingPeriodValue {
  year: number
  /** 1-12; omitted when the period is a whole year. */
  month?: number
}

export interface AccountingPeriodSelectProps {
  value: AccountingPeriodValue
  onChange: (value: AccountingPeriodValue) => void
  label?: LocalizedLabel
  /** Earliest month offered — usually the date the ledger was opened. */
  minDate?: string
  maxDate?: string
  disabled?: boolean
}

const PERIOD_LABEL: TranslationKey = 'dates.accountingPeriod.label'

/**
 * Accounting month picker.
 *
 * Kept separate from `PeriodPicker` because it solves a different problem:
 * payroll is not calculated "from the 3rd to the 17th", but for a month. The
 * value is therefore `{ year, month }`, not a date range — and code that uses
 * it cannot accidentally end up with half a month.
 */
export function AccountingPeriodSelect({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  disabled = false,
}: AccountingPeriodSelectProps) {
  const { t, locale } = useI18n()
  const [opened, setOpened] = useState(false)
  const current = `${value.year}-${String(value.month ?? 1).padStart(2, '0')}-01`

  return (
    <Stack gap={4}>
      <Text size="sm" fw={500}>{t(label ?? PERIOD_LABEL)}</Text>

      <Popover opened={opened} onChange={setOpened} position="bottom-start" shadow="md" radius="md" withinPortal>
        <Popover.Target>
          <Button
            variant="default"
            size="sm"
            w={220}
            disabled={disabled}
            onClick={() => setOpened((state) => !state)}
            leftSection={<CalendarDays size={15} />}
            rightSection={<ChevronDown size={14} />}
            styles={{ inner: { justifyContent: 'space-between' }, label: { fontWeight: 400 } }}
          >
            {formatAccountingPeriod(value, locale)}
          </Button>
        </Popover.Target>

        <Popover.Dropdown p="xs">
          {/*
            `MonthPicker`, not `DatePicker` with `level="year"`.
            With `DatePicker`, clicking a month only changes the display level
            and does not trigger `onChange`, so the button looked broken.
          */}
          <MonthPicker
            value={current}
            minDate={minDate}
            maxDate={maxDate}
            onChange={(next) => {
              if (!next) return
              const [year, month] = next.split('-').map(Number)
              onChange({ year: year ?? value.year, month: month ?? 1 })
              setOpened(false)
            }}
            size="sm"
          />
        </Popover.Dropdown>
      </Popover>
    </Stack>
  )
}

function formatAccountingPeriod(
  value: AccountingPeriodValue,
  locale: Locale,
): string {
  if (!value.month) return String(value.year)

  /*
   * The month name comes from `Intl`, not from a table.
   *
   * The table had one entry - `sr` - and `en` pointed at the same Serbian array, so
   * an English user read "Maj 2026" and a Cyrillic one read Latin. A month name is a
   * WORD, so the language decides, and CLDR already knows every one of them for
   * every locale that will ever be added.
   *
   * Through the bare `Locale` value, which is itself the tag now that the
   * key carries the script (`sr-Latn`, `sr-Cyrl`) - a bare `sr` would still be
   * Cyrillic to CLDR.
   */
  const monthName = new Intl.DateTimeFormat(locale, {
    month: 'long',
    timeZone: 'UTC',
  }).format(Date.UTC(value.year, value.month - 1, 1))

  /* Capitalised: CLDR gives "maj" in running text, and this is a heading. */
  return `${monthName.charAt(0).toLocaleUpperCase(locale)}${monthName.slice(1)} ${value.year}`
}
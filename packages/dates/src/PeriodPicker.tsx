'use client'

import { useState } from 'react'
import { Button, Divider, Group, Popover, Stack, Text } from '@mantine/core'
import { DatePicker, MonthPicker } from '@mantine/dates'
import { CalendarDays, ChevronDown } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
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
  /** Prečice koje se nude; podrazumevano osam najčešćih. */
  presets?: PeriodPreset[]
  label?: LocalizedLabel
  /** Dozvoljava prazan izbor - „svi periodi". */
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

const ALL_PERIODS: LocalizedLabel = { sr: 'Svi periodi', 'sr-Cyrl': 'Сви периоди', en: 'All periods' }
const CUSTOM: LocalizedLabel = { sr: 'Proizvoljan opseg', 'sr-Cyrl': 'Произвољан опсег', en: 'Custom range' }
const CLEAR: LocalizedLabel = { sr: 'Poništi', 'sr-Cyrl': 'Поништи', en: 'Clear' }

/**
 * Izbor obračunskog perioda.
 *
 * Prečice su levo, kalendar desno. Redosled je namerno takav: u devet od deset
 * slučajeva korisnik hoće „prošli mesec", a ne da klikne dva datuma. Kalendar
 * postoji za onaj deseti put, ne kao glavni put.
 *
 * Kada izabrani opseg tačno odgovara nekoj prečici, ona ostaje istaknuta - pa
 * se iz naslova vidi da li je period standardan ili ručno postavljen.
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
   * Kalendar mora da drzi sopstveno stanje dok korisnik bira.
   *
   * Mantine posle prvog klika javi `[pocetak, null]`. Ako to ne zapamtimo nego
   * cekamo oba kraja, kontrolisani `value` se vrati na staru vrednost i prvi
   * klik se izgubi - opseg se nikada ne moze izabrati.
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
            <Stack gap={2} p="xs" w={190} style={{ borderRight: `1px solid ${liroVar.border.subtle}` }}>
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
                    /* Oba kraja izabrana - javljamo naviše i praznimo nacrt. */
                    setDraft([null, null])
                    onChange({ from, to })
                    setOpened(false)
                  } else {
                    setDraft(next as [string | null, string | null])
                  }
                }}
                allowSingleDateInRange={false}
                firstDayOfWeek={1}
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
  /** 1-12; izostavljen kada je period cela godina. */
  month?: number
}

export interface AccountingPeriodSelectProps {
  value: AccountingPeriodValue
  onChange: (value: AccountingPeriodValue) => void
  label?: LocalizedLabel
  /** Najraniji ponuđeni mesec - obično datum otvaranja poslovne knjige. */
  minDate?: string
  maxDate?: string
  disabled?: boolean
}

const PERIOD_LABEL: LocalizedLabel = { sr: 'Obračunski period', 'sr-Cyrl': 'Обрачунски период', en: 'Accounting period' }

/**
 * Izbor obracunskog meseca.
 *
 * Odvojen od `PeriodPicker`-a jer resava drugo pitanje: obracun zarada se ne
 * radi „od 3. do 17.", nego za mesec. Vrednost je zato `{ year, month }`, a ne
 * opseg datuma - i sifra koja je koristi ne moze slucajno da dobije pola meseca.
 */
export function AccountingPeriodSelect({
  value,
  onChange,
  label,
  minDate,
  maxDate,
  disabled = false,
}: AccountingPeriodSelectProps) {
  const { t } = useI18n()
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
            {formatAccountingPeriod(value, t)}
          </Button>
        </Popover.Target>

        <Popover.Dropdown p="xs">
          {/*
            `MonthPicker`, ne `DatePicker` sa `level="year"`.
            Kod `DatePicker`-a klik na mesec samo menja nivo prikaza i ne
            okida `onChange`, pa je dugme delovalo kao da ne radi.
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
  t: (label: LocalizedLabel | undefined, fallback?: string) => string,
): string {
  if (!value.month) return String(value.year)
  const names = {
    sr: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
  }
  const monthName = t({ sr: names.sr[value.month - 1] ?? '', en: names.sr[value.month - 1] ?? '' })
  return `${monthName} ${value.year}`
}

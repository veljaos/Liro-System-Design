'use client'

import { useState } from 'react'
import { Group, Select, Stack, Switch, Text } from '@mantine/core'
import { FileBarChart } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  DataTable,
  JobProgress,
  ActionButton,
  ActionGroup,
  type DataTableColumn,
  type JobState,
} from '@liro/ui'
import { PeriodPicker, type DateRange } from '@liro/dates'

interface Red extends Record<string, unknown> {
  konto: string
  naziv: string
  pocetno: number
  duguje: number
  potrazuje: number
  krajnje: number
}

const REZULTAT: Red[] = [
  { konto: '2020', naziv: 'Kupci u zemlji', pocetno: 1_240_000, duguje: 5_640_000, potrazuje: 4_980_000, krajnje: 1_900_000 },
  { konto: '2410', naziv: 'Tekući računi', pocetno: 860_000, duguje: 4_980_000, potrazuje: 4_310_000, krajnje: 1_530_000 },
  { konto: '2700', naziv: 'PDV u primljenim fakturama', pocetno: 0, duguje: 668_300, potrazuje: 668_300, krajnje: 0 },
  { konto: '4330', naziv: 'Dobavljači u zemlji', pocetno: -940_000, duguje: 3_120_000, potrazuje: 4_010_000, krajnje: -1_830_000 },
  { konto: '4700', naziv: 'Obaveze za PDV', pocetno: -210_000, duguje: 668_300, potrazuje: 939_800, krajnje: -481_500 },
  { konto: '6140', naziv: 'Prihodi od prodaje usluga', pocetno: 0, duguje: 0, potrazuje: 5_640_000, krajnje: -5_640_000 },
]

const columns: DataTableColumn<Red>[] = [
  { name: 'konto', label: { en: 'Account' }, width: 100, sortable: true },
  { name: 'naziv', label: { en: 'Name' } },
  { name: 'pocetno', label: { en: 'Opening' }, type: 'currency', width: 140 },
  { name: 'duguje', label: { en: 'Debit' }, type: 'currency', width: 140 },
  { name: 'potrazuje', label: { en: 'Credit' }, type: 'currency', width: 140 },
  { name: 'krajnje', label: { en: 'Closing' }, type: 'currency', width: 140 },
]

const ZBIR = REZULTAT.reduce(
  (acc, row) => ({ duguje: acc.duguje + row.duguje, potrazuje: acc.potrazuje + row.potrazuje }),
  { duguje: 0, potrazuje: 0 },
)

export default function ReportRunPage() {
  const [period, setPeriod] = useState<DateRange | null>(null)
  const [nivo, setNivo] = useState<string | null>('analitika')
  const [saNulama, setSaNulama] = useState(false)

  const [jobState, setJobState] = useState<JobState | null>(null)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [gotovo, setGotovo] = useState(false)

  /*
   * The flow is always the same: parameters -> run -> result.
   *
   * Parameters stay visible after running too. A report that hides its
   * parameters forces the user to remember what they picked, and as a rule
   * they change one and run it again.
   */
  const pokreni = () => {
    setGotovo(false)
    setStartedAt(new Date())
    setJobState('running')
    setTimeout(() => {
      setJobState('succeeded')
      setGotovo(true)
    }, 1800)
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        icon={FileBarChart}
        title={{ en: 'Trial balance' }}
        description={{ en: 'Parameters, run, result' }}
        withDivider
      />

      <Stack gap="md">
        <SectionCard title={{ en: 'Parameters' }}>
          <Stack gap="md">
            <Group grow align="flex-end" wrap="wrap">
              <PeriodPicker
                value={period}
                onChange={setPeriod}
                label={{ en: 'Period' }}
              />
              <Select
                label="Display level"
                value={nivo}
                onChange={setNivo}
                data={[
                  { value: 'sinteticki', label: 'Summary (3 digits)' },
                  { value: 'analitika', label: 'Analytical (6 digits)' },
                ]}
              />
            </Group>

            <Switch
              checked={saNulama}
              onChange={(event) => setSaNulama(event.currentTarget.checked)}
              label="Also show accounts with no activity"
            />

            <ActionGroup>
              <ActionButton
                intent="refresh"
                label={{ en: 'Reset' }}
                onClick={() => {
                  setPeriod(null)
                  setNivo('analitika')
                  setSaNulama(false)
                  setJobState(null)
                  setGotovo(false)
                }}
              />
              <ActionButton
                intent="submit"
                primary
                label={{ en: 'Run report' }}
                disabled={jobState === 'running'}
                onClick={pokreni}
              />
            </ActionGroup>
          </Stack>
        </SectionCard>

        {jobState && (
          <JobProgress
            state={jobState}
            title={{ en: 'Running report' }}
            startedAt={startedAt}
            onDownload={() => {}}
            downloadLabel={{ en: 'Download PDF' }}
          />
        )}

        {gotovo && (
          <SectionCard
            title={{ en: 'Result' }}
            description={{ en: '6 accounts · analytical' }}
            actions={
              <Group gap="xs">
                <ActionButton intent="excel" size="xs" onClick={() => {}} />
                <ActionButton intent="pdf" size="xs" onClick={() => {}} />
                <ActionButton intent="print" size="xs" iconOnly onClick={() => {}} />
              </Group>
            }
            flush
          >
            <DataTable<Red>
              columns={columns}
              rows={REZULTAT}
              getRowId={(row) => row.konto}
              stickyFirstColumn
              /* The total comes from outside — on a real report the server
                 would return it along with the page of data. */
              footer={{
                label: { en: 'Total' },
                values: { duguje: ZBIR.duguje, potrazuje: ZBIR.potrazuje },
              }}
              mobile={{ titleField: 'naziv', subtitleField: 'konto' }}
            />
          </SectionCard>
        )}

        {!jobState && (
          <Text size="xs" c="dimmed">
            Set the parameters, then click „Run report". Parameters stay visible after running too.
          </Text>
        )}
      </Stack>
    </PageContainer>
  )
}

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
  { name: 'konto', label: { sr: 'Konto', en: 'Account' }, width: 100, sortable: true },
  { name: 'naziv', label: { sr: 'Naziv', en: 'Name' } },
  { name: 'pocetno', label: { sr: 'Početno', en: 'Opening' }, type: 'currency', width: 140 },
  { name: 'duguje', label: { sr: 'Duguje', en: 'Debit' }, type: 'currency', width: 140 },
  { name: 'potrazuje', label: { sr: 'Potražuje', en: 'Credit' }, type: 'currency', width: 140 },
  { name: 'krajnje', label: { sr: 'Krajnje', en: 'Closing' }, type: 'currency', width: 140 },
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
   * Tok je uvek isti: parametri -> izvrsavanje -> rezultat.
   *
   * Parametri ostaju vidljivi i posle izvrsavanja. Izvestaj koji sakrije
   * parametre tera korisnika da pamti sta je izabrao, a on po pravilu menja
   * jedan i pokrece ponovo.
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
        title={{ sr: 'Bruto bilans', 'sr-Cyrl': 'Бруто биланс', en: 'Trial balance' }}
        description={{ sr: 'Parametri, pa izvršavanje, pa rezultat', en: 'Parameters, run, result' }}
        withDivider
      />

      <Stack gap="md">
        <SectionCard title={{ sr: 'Parametri', 'sr-Cyrl': 'Параметри', en: 'Parameters' }}>
          <Stack gap="md">
            <Group grow align="flex-end" wrap="wrap">
              <PeriodPicker
                value={period}
                onChange={setPeriod}
                label={{ sr: 'Period', 'sr-Cyrl': 'Период', en: 'Period' }}
              />
              <Select
                label="Nivo prikaza"
                value={nivo}
                onChange={setNivo}
                data={[
                  { value: 'sinteticki', label: 'Sintetički (3 cifre)' },
                  { value: 'analitika', label: 'Analitika (6 cifara)' },
                ]}
              />
            </Group>

            <Switch
              checked={saNulama}
              onChange={(event) => setSaNulama(event.currentTarget.checked)}
              label="Prikaži i konta bez prometa"
            />

            <ActionGroup>
              <ActionButton
                intent="refresh"
                label={{ sr: 'Poništi', en: 'Reset' }}
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
                label={{ sr: 'Izvrši izveštaj', 'sr-Cyrl': 'Изврши извештај', en: 'Run report' }}
                disabled={jobState === 'running'}
                onClick={pokreni}
              />
            </ActionGroup>
          </Stack>
        </SectionCard>

        {jobState && (
          <JobProgress
            state={jobState}
            title={{ sr: 'Izvršavanje izveštaja', 'sr-Cyrl': 'Извршавање извештаја', en: 'Running report' }}
            startedAt={startedAt}
            onDownload={() => {}}
            downloadLabel={{ sr: 'Preuzmi PDF', en: 'Download PDF' }}
          />
        )}

        {gotovo && (
          <SectionCard
            title={{ sr: 'Rezultat', 'sr-Cyrl': 'Резултат', en: 'Result' }}
            description={{ sr: '6 konta · analitika', en: '6 accounts · analytical' }}
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
              /* Zbir dolazi spolja — na pravom izvestaju bi ga vratio server
                 zajedno sa stranom podataka. */
              footer={{
                label: { sr: 'Ukupno', 'sr-Cyrl': 'Укупно', en: 'Total' },
                values: { duguje: ZBIR.duguje, potrazuje: ZBIR.potrazuje },
              }}
              mobile={{ titleField: 'naziv', subtitleField: 'konto' }}
            />
          </SectionCard>
        )}

        {!jobState && (
          <Text size="xs" c="dimmed">
            Podesi parametre pa klikni „Izvrši izveštaj". Parametri ostaju vidljivi i posle izvršavanja.
          </Text>
        )}
      </Stack>
    </PageContainer>
  )
}
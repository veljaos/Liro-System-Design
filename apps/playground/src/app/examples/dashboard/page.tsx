'use client'

import { useState } from 'react'
import { SimpleGrid, Stack } from '@mantine/core'
import { AlertTriangle, CalendarClock, FileText, LayoutDashboard, Receipt, Wallet } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  StatGrid,
  DataTable,
  StatusBadge,
  ActionButton,
  Callout,
  type DataTableColumn,
} from '@liro/ui'
import { ChartCard, LiroBarChart, LiroDonutChart } from '@liro/charts'
import { PeriodPicker, type DateRange } from '@liro/dates'

/*
 * All data is constants, not `Math.random()`.
 *
 * Random data during render gives one set of values on the server and
 * another in the browser, and React reports a hydration mismatch. The same
 * applies to `new Date()` — that's why dates are written as text too.
 */
const PROMET = [
  { mesec: 'Sep', ulaz: 4_120_000, izlaz: 5_380_000 },
  { mesec: 'Okt', ulaz: 3_890_000, izlaz: 6_010_000 },
  { mesec: 'Nov', ulaz: 5_240_000, izlaz: 5_920_000 },
  { mesec: 'Dec', ulaz: 6_780_000, izlaz: 8_150_000 },
  { mesec: 'Jan', ulaz: 3_450_000, izlaz: 4_220_000 },
  { mesec: 'Feb', ulaz: 4_010_000, izlaz: 5_640_000 },
]

const STRUKTURA = [
  { name: 'Izlazne fakture', value: 5_640_000 },
  { name: 'Fiskalni računi', value: 1_180_000 },
  { name: 'Ostali prihodi', value: 420_000 },
]

interface Rok extends Record<string, unknown> {
  id: string
  obaveza: string
  klijent: string
  rok: string
  status: 'na-vreme' | 'uskoro' | 'kasni'
}

const ROKOVI: Rok[] = [
  { id: '1', obaveza: 'PPPDV — februar 2026', klijent: 'Officedirect d.o.o.', rok: '2026-03-15', status: 'uskoro' },
  { id: '2', obaveza: 'PPP-PD — februar 2026', klijent: 'Metalprom d.o.o.', rok: '2026-03-05', status: 'kasni' },
  { id: '3', obaveza: 'Završni račun 2025', klijent: 'Vinarija Kovač', rok: '2026-06-30', status: 'na-vreme' },
  { id: '4', obaveza: 'Obrazac M-4', klijent: 'Studio Nova', rok: '2026-04-30', status: 'na-vreme' },
  { id: '5', obaveza: 'PPPDV — februar 2026', klijent: 'Auto Delta', rok: '2026-03-15', status: 'uskoro' },
]

const STATUS_TONE = { 'na-vreme': 'success', uskoro: 'warning', kasni: 'danger' } as const
const STATUS_LABEL = {
  'na-vreme': { sr: 'Na vreme', 'sr-Cyrl': 'На време', en: 'On time' },
  uskoro: { sr: 'Uskoro ističe', 'sr-Cyrl': 'Ускоро истиче', en: 'Due soon' },
  kasni: { sr: 'Kasni', 'sr-Cyrl': 'Касни', en: 'Overdue' },
} as const

const columns: DataTableColumn<Rok>[] = [
  { name: 'obaveza', label: { sr: 'Obaveza', en: 'Obligation' } },
  { name: 'klijent', label: { sr: 'Klijent', en: 'Client' } },
  { name: 'rok', label: { sr: 'Rok', en: 'Due' }, type: 'date', width: 120 },
  {
    name: 'status',
    label: { sr: 'Status', en: 'Status' },
    width: 140,
    render: (_value, row) => (
      <StatusBadge tone={STATUS_TONE[row.status]} label={STATUS_LABEL[row.status]} />
    ),
  },
]

export default function DashboardPage() {
  const [period, setPeriod] = useState<DateRange | null>(null)

  return (
    <PageContainer width="wide">
      <PageHeader
        icon={LayoutDashboard}
        title={{ sr: 'Kontrolna tabla', 'sr-Cyrl': 'Контролна табла', en: 'Dashboard' }}
        description={{ sr: 'Februar 2026.', 'sr-Cyrl': 'Фебруар 2026.', en: 'February 2026' }}
        actions={<PeriodPicker value={period} onChange={setPeriod} clearable width={230} />}
        withDivider
      />

      <Stack gap="md">
        {/*
          The bar at the top answers one question: what needs my attention
          today. A dashboard that opens with a chart makes the user hunt for
          the problem themselves.
        */}
        <Callout
          tone="warning"
          icon={AlertTriangle}
          title={{ sr: 'Jedna obaveza kasni', 'sr-Cyrl': 'Једна обавеза касни', en: 'One obligation is overdue' }}
          actions={<ActionButton intent="view" size="xs" label={{ sr: 'Otvori', en: 'Open' }} onClick={() => {}} />}
        >
          PPP-PD za Metalprom d.o.o. je trebalo predati 5. marta.  
        </Callout>

        <StatGrid
          maxColumns={4}
          data={[
            {
              title: { sr: 'Izlazne fakture', 'sr-Cyrl': 'Излазне фактуре', en: 'Sales invoices' },
              value: '5.640.000 RSD',
              diff: 12.4,
              icon: FileText,
              description: { sr: 'u odnosu na januar', en: 'vs January' },
            },
            {
              title: { sr: 'Ulazne fakture', 'sr-Cyrl': 'Улазне фактуре', en: 'Purchase invoices' },
              value: '4.010.000 RSD',
              diff: 16.2,
              /* A rise in costs isn't good news — hence the inverted coloring. */
              invertDiff: true,
              icon: Receipt,
            },
            {
              title: { sr: 'PDV za uplatu', 'sr-Cyrl': 'ПДВ за уплату', en: 'VAT payable' },
              value: '271.500 RSD',
              icon: Wallet,
              description: { sr: 'rok 15.03.2026.', en: 'due 15 Mar 2026' },
            },
            {
              title: { sr: 'Obaveze u roku', 'sr-Cyrl': 'Обавезе у року', en: 'Upcoming deadlines' },
              value: 5,
              icon: CalendarClock,
              description: { sr: 'narednih 30 dana', en: 'next 30 days' },
            },
          ]}
        />

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <ChartCard
            title={{ sr: 'Promet po mesecima', 'sr-Cyrl': 'Промет по месецима', en: 'Turnover by month' }}
            period="Sep 2025 — Feb 2026"
            total="9.650.000 RSD"
            footnote={{ sr: 'Bez PDV-a, po datumu prometa.', en: 'Excluding VAT, by supply date.' }}
          >
            <LiroBarChart
              data={PROMET}
              dataKey="mesec"
              currency="RSD"
              height={220}
              series={[
                { name: 'izlaz', label: 'Izlazne' },
                { name: 'ulaz', label: 'Ulazne' },
              ]}
            />
          </ChartCard>

          <ChartCard
            title={{ sr: 'Struktura prihoda', 'sr-Cyrl': 'Структура прихода', en: 'Revenue mix' }}
            period={{ sr: 'Februar 2026.', en: 'February 2026' }}
          >
            <LiroDonutChart
              data={STRUKTURA}
              currency="RSD"
              size={240}
              centerLabel="7.240.000"
            />
          </ChartCard>
        </SimpleGrid>

        <SectionCard
          title={{ sr: 'Rokovi koji dolaze', 'sr-Cyrl': 'Рокови који долазе', en: 'Upcoming deadlines' }}
          actions={<ActionButton intent="view" size="xs" label={{ sr: 'Svi rokovi', en: 'All deadlines' }} onClick={() => {}} />}
          flush
        >
          <DataTable<Rok>
            columns={columns}
            rows={ROKOVI}
            getRowId={(row) => row.id}
            onRowClick={() => {}}
            mobile={{ titleField: 'obaveza', subtitleField: 'klijent' }}
          />
        </SectionCard>
      </Stack>
    </PageContainer>
  )
}
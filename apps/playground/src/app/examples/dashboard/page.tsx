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
  { mesec: 'Oct', ulaz: 3_890_000, izlaz: 6_010_000 },
  { mesec: 'Nov', ulaz: 5_240_000, izlaz: 5_920_000 },
  { mesec: 'Dec', ulaz: 6_780_000, izlaz: 8_150_000 },
  { mesec: 'Jan', ulaz: 3_450_000, izlaz: 4_220_000 },
  { mesec: 'Feb', ulaz: 4_010_000, izlaz: 5_640_000 },
]

const STRUKTURA = [
  { name: 'Sales invoices', value: 5_640_000 },
  { name: 'Fiscal receipts', value: 1_180_000 },
  { name: 'Other income', value: 420_000 },
]

interface Rok extends Record<string, unknown> {
  id: string
  obaveza: string
  klijent: string
  rok: string
  status: 'na-vreme' | 'uskoro' | 'kasni'
}

const ROKOVI: Rok[] = [
  { id: '1', obaveza: 'PPPDV — February 2026', klijent: 'Officedirect d.o.o.', rok: '2026-03-15', status: 'uskoro' },
  { id: '2', obaveza: 'PPP-PD — February 2026', klijent: 'Metalprom d.o.o.', rok: '2026-03-05', status: 'kasni' },
  { id: '3', obaveza: 'Year-end financial statements 2025', klijent: 'Vinarija Kovač', rok: '2026-06-30', status: 'na-vreme' },
  { id: '4', obaveza: 'Form M-4', klijent: 'Studio Nova', rok: '2026-04-30', status: 'na-vreme' },
  { id: '5', obaveza: 'PPPDV — February 2026', klijent: 'Auto Delta', rok: '2026-03-15', status: 'uskoro' },
]

const STATUS_TONE = { 'na-vreme': 'success', uskoro: 'warning', kasni: 'danger' } as const
const STATUS_LABEL = {
  'na-vreme': { en: 'On time' },
  uskoro: { en: 'Due soon' },
  kasni: { en: 'Overdue' },
} as const

const columns: DataTableColumn<Rok>[] = [
  { name: 'obaveza', label: { en: 'Obligation' } },
  { name: 'klijent', label: { en: 'Client' } },
  { name: 'rok', label: { en: 'Due' }, type: 'date', width: 120 },
  {
    name: 'status',
    label: { en: 'Status' },
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
        title={{ en: 'Dashboard' }}
        description={{ en: 'February 2026' }}
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
          title={{ en: 'One obligation is overdue' }}
          actions={<ActionButton intent="view" size="xs" label={{ en: 'Open' }} onClick={() => {}} />}
        >
          The PPP-PD for Metalprom d.o.o. was due on March 5th.
        </Callout>

        <StatGrid
          maxColumns={4}
          data={[
            {
              title: { en: 'Sales invoices' },
              value: '5.640.000 RSD',
              diff: 12.4,
              icon: FileText,
              description: { en: 'vs January' },
            },
            {
              title: { en: 'Purchase invoices' },
              value: '4.010.000 RSD',
              diff: 16.2,
              /* A rise in costs isn't good news — hence the inverted coloring. */
              invertDiff: true,
              icon: Receipt,
            },
            {
              title: { en: 'VAT payable' },
              value: '271.500 RSD',
              icon: Wallet,
              description: { en: 'due 15 Mar 2026' },
            },
            {
              title: { en: 'Upcoming deadlines' },
              value: 5,
              icon: CalendarClock,
              description: { en: 'next 30 days' },
            },
          ]}
        />

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <ChartCard
            title={{ en: 'Turnover by month' }}
            period="Sep 2025 — Feb 2026"
            total="9.650.000 RSD"
            footnote={{ en: 'Excluding VAT, by supply date.' }}
          >
            <LiroBarChart
              data={PROMET}
              dataKey="mesec"
              currency="RSD"
              height={220}
              series={[
                { name: 'izlaz', label: 'Sales' },
                { name: 'ulaz', label: 'Purchases' },
              ]}
            />
          </ChartCard>

          <ChartCard
            title={{ en: 'Revenue mix' }}
            period={{ en: 'February 2026' }}
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
          title={{ en: 'Upcoming deadlines' }}
          actions={<ActionButton intent="view" size="xs" label={{ en: 'All deadlines' }} onClick={() => {}} />}
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

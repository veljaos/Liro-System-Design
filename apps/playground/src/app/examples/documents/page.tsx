'use client'

import { useState } from 'react'
import { Select, Text } from '@mantine/core'
import { ResourceTable } from '@liro/data'
import {
  ActionButton,
  ActionGroup,
  RecordStatusBadge,
  SectionCard,
  type DataTableColumn,
} from '@liro/ui'
import type { RecordStatus } from '@liro/tokens'
import { DueDate, PeriodPicker, type DateRange } from '@liro/dates'
import { ListPageTemplate } from '@liro/templates'
import { DemoAppShell } from '@/components/DemoAppShell'

/**
 * List of outgoing documents.
 *
 * The difference from the employee list is only in the columns and filters -
 * the screen structure is identical. That's the point: a user who knows one
 * list knows them all.
 */

interface Document extends Record<string, unknown> {
  id: string
  number: string
  type: string
  client_name: string
  issue_date: string
  due_date: string
  total: number
  status: RecordStatus
}

const columns: DataTableColumn<Document>[] = [
  {
    name: 'number',
    label: { sr: 'Broj', en: 'Number' },
    sortable: true,
    width: 150,
    render: (value) => <Text size="sm" fw={600} data-numeric>{String(value)}</Text>,
  },
  { name: 'type', label: { sr: 'Vrsta', en: 'Type' }, width: 150 },
  { name: 'client_name', label: { sr: 'Klijent', en: 'Client' }, sortable: true },
  { name: 'issue_date', label: { sr: 'Datum', en: 'Issued' }, type: 'date', sortable: true, width: 120 },
  {
    name: 'due_date',
    label: { sr: 'Dospeće', en: 'Due' },
    width: 130,
    render: (value, row) => <DueDate value={String(value)} settled={row.status === 'paid'} />,
  },
  {
    name: 'total',
    label: { sr: 'Za uplatu', en: 'Total' },
    type: 'currency',
    currencyCode: 'RSD',
    sortable: true,
  },
  {
    name: 'status',
    label: { sr: 'Status', en: 'Status' },
    width: 130,
    render: (value) => <RecordStatusBadge status={value as RecordStatus} />,
  },
]

export default function DocumentsScreen() {
  const [status, setStatus] = useState<string | null>(null)
  const [period, setPeriod] = useState<DateRange | null>(null)

  return (
    <DemoAppShell breadcrumbs={[{ label: { sr: 'Dokumenti', en: 'Documents' } }]}>
      <ListPageTemplate
        title={{ sr: 'Izlazna dokumenta', en: 'Outgoing documents' }}
        actions={
          <ActionGroup>
            <ActionButton intent="excel" />
            <ActionButton intent="print" />
            <ActionButton intent="create" label={{ sr: 'Nova faktura', en: 'New invoice' }} />
          </ActionGroup>
        }
        flush
      >
        <SectionCard flush>
          <ResourceTable<Document>
            resource="documents"
            columns={columns}
            mobile={{ titleField: 'number', subtitleField: 'client_name', fields: ['total', 'due_date'] }}
            searchFields={['number', 'client_name']}
            filters={{ status: status ?? undefined }}
            filterControls={
              <>
                <PeriodPicker value={period} onChange={setPeriod} width={230} />
                <Select
                  placeholder="Status"
                  value={status}
                  onChange={setStatus}
                  data={[
                    { value: 'draft', label: 'Nacrt' },
                    { value: 'pending', label: 'Čeka' },
                    { value: 'signed', label: 'Potpisano' },
                    { value: 'posted', label: 'Proknjiženo' },
                    { value: 'overdue', label: 'U docnji' },
                    { value: 'paid', label: 'Plaćeno' },
                  ]}
                  clearable
                  w={160}
                />
              </>
            }
            searchPlaceholder={{ sr: 'Broj dokumenta ili klijent…', en: 'Number or client…' }}
            extraActions={[
              { label: { sr: 'Preuzmi PDF' }, onClick: () => {} },
              { label: { sr: 'Pošalji u SEF' }, onClick: () => {} },
            ]}
            onEdit={() => {}}
            allowDelete
            defaultSort={{ field: 'issue_date', order: 'desc' }}
          />
        </SectionCard>
      </ListPageTemplate>
    </DemoAppShell>
  )
}

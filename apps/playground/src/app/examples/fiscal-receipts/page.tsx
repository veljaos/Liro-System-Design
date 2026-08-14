'use client'

import { useState } from 'react'
import { Select, Text } from '@mantine/core'
import { ResourceTable } from '@liro/data'
import {
  ActionButton,
  ActionGroup,
  SectionCard,
  StatusBadge,
  type DataTableColumn,
} from '@liro/ui'
import { PeriodPicker, type DateRange } from '@liro/dates'
import { ListPageTemplate } from '@liro/templates'
import { DemoAppShell } from '@/components/DemoAppShell'

/**
 * Fiscal receipts.
 *
 * The list that's read most often and changed least - hence no button for a
 * new entry or for deletion. Receipts arrive from the fiscal device; here
 * they're only viewed and exported.
 */

interface Receipt extends Record<string, unknown> {
  id: string
  pfr_number: string
  cashier: string
  location: string
  issued_at: string
  payment: string
  total: number
  vat: number
  fiscalized: boolean
}

const columns: DataTableColumn<Receipt>[] = [
  {
    name: 'pfr_number',
    label: { en: 'PFR number' },
    width: 170,
    render: (value) => <Text size="sm" fw={600} data-numeric>{String(value)}</Text>,
  },
  { name: 'issued_at', label: { en: 'Date' }, type: 'date', sortable: true, width: 120 },
  { name: 'location', label: { en: 'Location' }, sortable: true },
  { name: 'cashier', label: { en: 'Cashier' }, width: 130 },
  { name: 'payment', label: { en: 'Payment' }, width: 120 },
  { name: 'vat', label: { en: 'VAT' }, type: 'currency', currencyCode: 'RSD' },
  { name: 'total', label: { en: 'Total' }, type: 'currency', currencyCode: 'RSD', sortable: true },
  {
    name: 'fiscalized',
    label: { en: 'Fiscalised' },
    width: 130,
    render: (value) =>
      value ? (
        <StatusBadge tone="success" label={{ en: 'Yes' }} />
      ) : (
        <StatusBadge tone="danger" label={{ en: 'Not sent' }} />
      ),
  },
]

export default function FiscalReceiptsScreen() {
  const [period, setPeriod] = useState<DateRange | null>(null)
  const [location, setLocation] = useState<string | null>(null)

  return (
    <DemoAppShell breadcrumbs={[{ label: { en: 'Fiscal receipts' } }]}>
      <ListPageTemplate
        title={{ en: 'Fiscal receipts' }}
        actions={
          <ActionGroup>
            <ActionButton intent="excel" />
            <ActionButton intent="print" />
            <ActionButton intent="sync" label={{ en: 'Sync devices' }} />
          </ActionGroup>
        }
        flush
      >
        <SectionCard flush>
          <ResourceTable<Receipt>
            resource="fiscal_receipts"
            columns={columns}
            mobile={{ titleField: 'pfr_number', subtitleField: 'location', fields: ['total', 'issued_at'] }}
            searchFields={['pfr_number', 'cashier', 'location']}
            filters={{ location: location ?? undefined }}
            filterControls={
              <>
                <PeriodPicker value={period} onChange={setPeriod} width={230} />
                <Select
                  placeholder="Location"
                  value={location}
                  onChange={setLocation}
                  data={['Centar store', 'Zemun warehouse', 'Liman branch']}
                  clearable
                  w={200}
                />
              </>
            }
            searchPlaceholder={{ en: 'PFR number or cashier…' }}
            extraActions={[{ label: { en: 'Download receipt' }, onClick: () => {} }]}
            defaultSort={{ field: 'issued_at', order: 'desc' }}
          />
        </SectionCard>
      </ListPageTemplate>
    </DemoAppShell>
  )
}

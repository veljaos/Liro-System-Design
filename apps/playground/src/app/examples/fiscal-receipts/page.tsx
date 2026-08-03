'use client'

import { useState } from 'react'
import { Select, Text } from '@mantine/core'
import { ScrollText } from 'lucide-react'
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
 * Fiskalni računi.
 *
 * Spisak koji se najcesce cita, a najredje menja - zato nema dugmeta za nov
 * unos ni brisanja. Racuni stizu sa fiskalnog uredjaja; ovde se samo pregledaju
 * i izvoze.
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
    label: { sr: 'PFR broj', en: 'PFR number' },
    width: 170,
    render: (value) => <Text size="sm" fw={600} data-numeric>{String(value)}</Text>,
  },
  { name: 'issued_at', label: { sr: 'Datum', en: 'Date' }, type: 'date', sortable: true, width: 120 },
  { name: 'location', label: { sr: 'Prodajno mesto', en: 'Location' }, sortable: true },
  { name: 'cashier', label: { sr: 'Kasir', en: 'Cashier' }, width: 130 },
  { name: 'payment', label: { sr: 'Plaćanje', en: 'Payment' }, width: 120 },
  { name: 'vat', label: { sr: 'PDV', en: 'VAT' }, type: 'currency', currencyCode: 'RSD' },
  { name: 'total', label: { sr: 'Ukupno', en: 'Total' }, type: 'currency', currencyCode: 'RSD', sortable: true },
  {
    name: 'fiscalized',
    label: { sr: 'Fiskalizovan', en: 'Fiscalised' },
    width: 130,
    render: (value) =>
      value ? (
        <StatusBadge tone="success" label={{ sr: 'Da', en: 'Yes' }} />
      ) : (
        <StatusBadge tone="danger" label={{ sr: 'Nije poslat', en: 'Not sent' }} />
      ),
  },
]

export default function FiscalReceiptsScreen() {
  const [period, setPeriod] = useState<DateRange | null>(null)
  const [location, setLocation] = useState<string | null>(null)

  return (
    <DemoAppShell breadcrumbs={[{ label: { sr: 'Fiskalni računi', en: 'Fiscal receipts' } }]}>
      <ListPageTemplate
        title={{ sr: 'Fiskalni računi', en: 'Fiscal receipts' }}
        actions={
          <ActionGroup>
            <ActionButton intent="excel" />
            <ActionButton intent="print" />
            <ActionButton intent="sync" label={{ sr: 'Povuci sa uređaja', en: 'Sync devices' }} />
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
                  placeholder="Prodajno mesto"
                  value={location}
                  onChange={setLocation}
                  data={['Prodavnica Centar', 'Magacin Zemun', 'Poslovnica Liman']}
                  clearable
                  w={200}
                />
              </>
            }
            searchPlaceholder={{ sr: 'PFR broj ili kasir…', en: 'PFR number or cashier…' }}
            extraActions={[{ label: { sr: 'Preuzmi isečak' }, onClick: () => {} }]}
            defaultSort={{ field: 'issued_at', order: 'desc' }}
          />
        </SectionCard>
      </ListPageTemplate>
    </DemoAppShell>
  )
}

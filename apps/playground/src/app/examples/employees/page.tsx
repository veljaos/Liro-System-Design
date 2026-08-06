'use client'

import { useState } from 'react'
import { Select } from '@mantine/core'
import { ResourceTable } from '@liro/data'
import {
  ActionButton,
  ActionGroup,
  ActiveStatusBadge,
  SectionCard,
  type DataTableColumn,
} from '@liro/ui'
import { useFormErrors } from '@liro/forms'
import { ListPageTemplate } from '@liro/templates'
import { useRouter } from 'next/navigation'
import { DemoAppShell } from '@/components/DemoAppShell'


/**
 * Spisak zaposlenih.
 *
 * Ceo ekran je jedan `ListPageTemplate` i jedan `ResourceTable`. Nema CSS-a,
 * nema odluka o razmaku, nema rucnog upravljanja stranicama ni sortiranjem -
 * to radi adapter sloj.
 */

interface Employee extends Record<string, unknown> {
  id: string
  full_name: string
  position: string
  gross_salary: number
  start_date: string
  active: boolean
}

const columns: DataTableColumn<Employee>[] = [
  { name: 'full_name', label: { sr: 'Ime i prezime', en: 'Name' }, sortable: true },
  { name: 'position', label: { sr: 'Radno mesto', en: 'Position' }, sortable: true },
  {
    name: 'gross_salary',
    label: { sr: 'Bruto zarada', en: 'Gross salary' },
    type: 'currency',
    currencyCode: 'RSD',
    sortable: true,
  },
  { name: 'start_date', label: { sr: 'Zasnovan', en: 'Started' }, type: 'date', sortable: true },
  {
    name: 'active',
    label: { sr: 'Status', en: 'Status' },
    width: 110,
    render: (value) => <ActiveStatusBadge active={Boolean(value)} />,
  },
]

export default function EmployeesScreen() {
  const [status, setStatus] = useState<string | null>(null)
  const errors = useFormErrors()
  const router = useRouter()

  /*
   * Izmena vodi na punu stranicu, ne u fioku.
   *
   * Isti obrazac koji Liro Business App vec koristi: `employees/new` i
   * `employees/[id]`. Razlog je u „Obrasci navigacije" - modal nema adresu,
   * pa se dug unos ne moze nastaviti ni podeliti.
   */
  const openRecord = (id: string) => router.push(`/examples/employees/${id}`)

  return (
    <DemoAppShell breadcrumbs={[{ label: { sr: 'Zaposlena lica', en: 'Employees' } }]}>
      <ListPageTemplate
        title={{ sr: 'Zaposlena lica', en: 'Employees' }}
        actions={
          <ActionGroup>
            <ActionButton intent="import" />
            <ActionButton intent="excel" />
            <ActionButton intent="create" label={{ sr: 'Novo lice', en: 'New employee' }} onClick={() => router.push('/examples/employees/new')} />
          </ActionGroup>
        }
        flush
      >
        <SectionCard flush>
          <ResourceTable<Employee>
            resource="employees"
            columns={columns}
            mobile={{ titleField: 'full_name', subtitleField: 'position', fields: ['gross_salary', 'start_date'] }}
            searchFields={['full_name', 'position']}
            filters={{ active: status === null ? undefined : status === 'true' }}
            filterControls={
              <Select
                placeholder="Status"
                value={status}
                onChange={setStatus}
                data={[
                  { value: 'true', label: 'Aktivni' },
                  { value: 'false', label: 'Neaktivni' },
                ]}
                clearable
                w={160}
              />
            }
            searchPlaceholder={{ sr: 'Pretraga po imenu ili radnom mestu…', en: 'Search…' }}
            onEdit={(row) => openRecord(row.id)}
            onRowClick={(row) => openRecord(row.id)}
            allowDelete
            defaultSort={{ field: 'full_name', order: 'asc' }}
            onError={errors.capture}
          />
        </SectionCard>
      </ListPageTemplate>

    </DemoAppShell>
  )
}

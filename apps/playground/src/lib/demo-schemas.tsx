import { ActiveStatusBadge, type DataTableColumn } from '@liro/ui'
import type { FieldSchema } from '@liro/forms'

export interface Employee extends Record<string, unknown> {
  id: string
  full_name: string
  position: string
  gross_salary: number
  start_date: string
  active: boolean
}

/**
 * Kolone se opisuju jednom i koriste svuda.
 *
 * `mobileCard` je razlog zbog kojeg tabela na telefonu prestaje da bude tabela:
 * pet kolona u horizontalnom skrolu je nečitljivo, pa se isti podaci prikazuju
 * kao kartica sa naslovom, podnaslovom i iznosom.
 */
export const employeeColumns: DataTableColumn<Employee>[] = [
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

export const employeeMobileCard = {
  titleField: 'full_name',
  subtitleField: 'position',
  fields: ['gross_salary', 'start_date'],
}

export const formSchema: FieldSchema[] = [
  {
    name: 'osnovno',
    type: 'section',
    title: { sr: 'Osnovni podaci', en: 'Basic details' },
    fields: [
      {
        name: 'row-ime',
        type: 'row',
        fields: [
          { name: 'first_name', type: 'text', label: { sr: 'Ime', en: 'First name' }, required: true },
          { name: 'last_name', type: 'text', label: { sr: 'Prezime', en: 'Last name' }, required: true },
        ],
      },
      { name: 'email', type: 'email', label: { sr: 'Elektronska pošta', en: 'Email' } },
      {
        name: 'start_date',
        type: 'date',
        label: { sr: 'Datum zasnivanja', en: 'Start date' },
        description: { sr: 'Otkucajte 010326 i pritisnite Tab', en: 'Type 010326 then Tab' },
      },
      {
        name: 'client_id',
        type: 'relation',
        label: { sr: 'Klijent', en: 'Client' },
        required: true,
        relation: {
          resource: 'clients',
          labelField: 'name',
          searchFields: ['name', 'pib'],
          format: (row) => `${String(row.pib)} — ${String(row.name)}`,
        },
      },
      {
        name: 'branch_id',
        type: 'relation',
        label: { sr: 'Poslovnica', en: 'Branch' },
        description: {
          sr: 'Zaključana dok se ne izabere klijent',
          en: 'Locked until a client is chosen',
        },
        relation: {
          resource: 'branches',
          labelField: 'name',
          dependsOn: { field: 'client_id', column: 'client_id' },
        },
      },
    ],
  },
  {
    name: 'uslovi',
    type: 'section',
    title: { sr: 'Uslovna polja', en: 'Conditional fields' },
    fields: [
      { name: 'has_benefit', type: 'switch', label: { sr: 'Ostvaruje pravo na olakšicu', en: 'Eligible for incentive' } },
      {
        name: 'benefit_code',
        type: 'text',
        label: { sr: 'Šifra olakšice', en: 'Incentive code' },
        required: true,
        condition: (values) => Boolean(values.has_benefit),
        conditionFields: ['has_benefit'],
      },
      {
        name: 'gross_salary',
        type: 'currency',
        label: { sr: 'Bruto zarada', en: 'Gross salary' },
        number: { suffix: ' RSD' },
      },
      { name: 'note', type: 'textarea', label: { sr: 'Napomena', en: 'Note' }, rows: 3 },
    ],
  },
]

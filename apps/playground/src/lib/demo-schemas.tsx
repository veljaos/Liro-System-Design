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
 * Columns are described once and used everywhere.
 *
 * `mobileCard` is the reason a table on a phone stops being a table: five
 * columns in a horizontal scroll are unreadable, so the same data is shown
 * as a card with a title, subtitle, and amount.
 */
export const employeeColumns: DataTableColumn<Employee>[] = [
  { name: 'full_name', label: { en: 'Name' }, sortable: true },
  { name: 'position', label: { en: 'Position' }, sortable: true },
  {
    name: 'gross_salary',
    label: { en: 'Gross salary' },
    type: 'currency',
    currencyCode: 'RSD',
    sortable: true,
  },
  { name: 'start_date', label: { en: 'Started' }, type: 'date', sortable: true },
  {
    name: 'active',
    label: { en: 'Status' },
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
    title: { en: 'Basic details' },
    fields: [
      {
        name: 'row-ime',
        type: 'row',
        fields: [
          { name: 'first_name', type: 'text', label: { en: 'First name' }, required: true },
          { name: 'last_name', type: 'text', label: { en: 'Last name' }, required: true },
        ],
      },
      { name: 'email', type: 'email', label: { en: 'Email' } },
      {
        name: 'start_date',
        type: 'date',
        label: { en: 'Start date' },
        description: { en: 'Type 010326 then Tab' },
      },
      {
        name: 'client_id',
        type: 'relation',
        label: { en: 'Client' },
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
        label: { en: 'Branch' },
        description: {
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
    title: { en: 'Conditional fields' },
    fields: [
      { name: 'has_benefit', type: 'switch', label: { en: 'Eligible for incentive' } },
      {
        name: 'benefit_code',
        type: 'text',
        label: { en: 'Incentive code' },
        required: true,
        condition: (values) => Boolean(values.has_benefit),
        conditionFields: ['has_benefit'],
      },
      {
        name: 'gross_salary',
        type: 'currency',
        label: { en: 'Gross salary' },
        number: { suffix: ' RSD' },
      },
      { name: 'note', type: 'textarea', label: { en: 'Note' }, rows: 3 },
    ],
  },
]

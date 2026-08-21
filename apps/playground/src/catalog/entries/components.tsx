'use client'

import { useState } from 'react'
import {
  Anchor,
  Badge,
  Box,
  Breadcrumbs,
  Burger,
  Chip,
  Dialog,
  Divider,
  Drawer,
  Group,
  HoverCard,
  Kbd,
  Select,
  Slider,
  Stack,
  Switch,
  Table,
  Tabs,
  Text,
  TextInput,
  Timeline,
  Tree,
} from '@mantine/core'
import {
  Bell,
  Building2,
  Component,
  Layers,
  MousePointerClick,
  Navigation,
  Square,
  Tags,
  Type,
  Users,
} from 'lucide-react'
import {
  AchievementGrid,
  ActionButton,
  ActionGroup,
  ActiveStatusBadge,
  Callout,
  DataTable,
  DetailDrawer,
  EmptyState,
  KeyValueList,
  PageHeader,
  RecordStatusBadge,
  StatGrid,
  StatusBadge,
  TablePagination,
  Toolbar,
  commonNotice,
  notice,
  SplitPanel,
  TableOfContents,
  type Achievement,
  type DataTableColumn,
} from '@liro/ui'
import { AutoForm } from '@liro/forms'
import { DateText, DueDate, PeriodPicker, AccountingPeriodSelect, type DateRange, type AccountingPeriodValue, addDays, today } from '@liro/dates'
import { liroVar } from '@liro/tokens'
import type { CatalogCategory } from '../types'
import { formSchema } from '@/lib/demo-schemas'

interface Row extends Record<string, unknown> {
  id: string
  name: string
  position: string
  salary: number
  active: boolean
}

const ROWS: Row[] = [
  { id: '1', name: 'Ana Jovanović', position: 'Bookkeeper', salary: 125_450, active: true },
  { id: '2', name: 'Marko Petrović', position: 'Sales rep', salary: 98_300, active: true },
  { id: '3', name: 'Jelena Nikolić', position: 'Warehouse operator', salary: 87_900, active: false },
]

const COLUMNS: DataTableColumn<Row>[] = [
  { name: 'name', label: { en: 'Full name' }, sortable: true },
  { name: 'position', label: { en: 'Position' } },
  { name: 'salary', label: { en: 'Gross salary' }, type: 'currency', currencyCode: 'RSD', sortable: true },
  { name: 'active', label: { en: 'Status' }, width: 110, render: (value) => <ActiveStatusBadge active={Boolean(value)} /> },
]

function ActionsDemo() {
  return (
    <Stack gap="md">
      <ActionGroup>
        <ActionButton intent="create" />
        <ActionButton intent="save" />
        <ActionButton intent="submit" />
      </ActionGroup>
      <ActionGroup>
        <ActionButton intent="verify" />
        <ActionButton intent="sign" />
        <ActionButton intent="post" />
      </ActionGroup>
      <ActionGroup>
        <ActionButton intent="pdf" />
        <ActionButton intent="print" />
        <ActionButton intent="excel" />
        <ActionButton intent="preview" />
      </ActionGroup>
      <ActionGroup>
        <ActionButton intent="edit" />
        <ActionButton intent="duplicate" />
        <ActionButton intent="archive" />
        <ActionButton intent="delete" />
      </ActionGroup>
    </Stack>
  )
}

function OverlaysDemo() {
  const [drawer, setDrawer] = useState(false)
  const [dialog, setDialog] = useState(false)

  return (
    <>
      <ActionGroup>
        <ActionButton intent="edit" label={{ en: 'Open drawer' }} onClick={() => setDrawer(true)} />
        <ActionButton intent="view" label={{ en: 'Small dialog' }} onClick={() => setDialog(true)} />
      </ActionGroup>

      <Drawer opened={drawer} onClose={() => setDrawer(false)} title="Drawer" position="right">
        <Text size="sm">
          A drawer is used when there are many fields or when the user needs to see the list
          behind them while entering data.
        </Text>
      </Drawer>

      <Dialog opened={dialog} onClose={() => setDialog(false)} withCloseButton size="lg" radius="lg">
        <Text size="sm" mb="xs">A dialog sits in the corner and does not block the screen.</Text>
        {/* Wrapped the button in Group to push it right */}
        <Group justify="flex-end">
          <ActionButton intent="save" onClick={() => setDialog(false)} />
        </Group>
      </Dialog>
    </>
  )
}

function NavigationDemo() {
  const [opened, setOpened] = useState(false)

  return (
    <Stack gap="lg">
      <Group gap="lg">
        <Burger opened={opened} onClick={() => setOpened((state) => !state)} size="sm" aria-label="Menu" />
        <Breadcrumbs separator="›" separatorMargin="xs">
          <Anchor href="#" size="sm">Home</Anchor>
          <Anchor href="#" size="sm">Employees</Anchor>
          <Text size="sm" fw={600}>Ana Jovanović</Text>
        </Breadcrumbs>
      </Group>

      <Divider />

      <Tabs defaultValue="pregled">
        <Tabs.List>
          <Tabs.Tab value="pregled">Overview</Tabs.Tab>
          <Tabs.Tab value="ugovori">Contracts</Tabs.Tab>
          <Tabs.Tab value="obracuni">Payroll runs</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Group gap="xs">
        <Text size="sm">Command palette:</Text>
        <Kbd>Ctrl</Kbd>
        <Text size="sm">+</Text>
        <Kbd>K</Kbd>
      </Group>
    </Stack>
  )
}

function TreeDemo() {
  return (
    <Tree
      data={[
        {
          value: '2',
          label: '2 — Zalihe',
          children: [
            { value: '20', label: '20 — Materijal' },
            { value: '21', label: '21 — Nedovršena proizvodnja' },
          ],
        },
        {
          value: '4',
          label: '4 — Obaveze',
          children: [
            { value: '43', label: '43 — Obaveze prema dobavljačima' },
            { value: '45', label: '45 — Obaveze po zaradama' },
          ],
        },
      ]}
      levelOffset={22}
    />
  )
}

function DatesDemo() {
  const [period, setPeriod] = useState<DateRange | null>(null)
  const [accounting, setAccounting] = useState<AccountingPeriodValue>({ year: 2026, month: 3 })

  return (
    <Stack gap="lg">
      <Group align="flex-end" gap="md" wrap="wrap">
        <PeriodPicker label={{ en: 'Report period' }} value={period} onChange={setPeriod} />
        <AccountingPeriodSelect value={accounting} onChange={setAccounting} />
      </Group>

      <KeyValueList
        items={[
          { label: { en: 'Date' }, value: <DateText value="2026-03-17" withWeekday /> },
          { label: { en: 'Overdue' }, value: <DueDate value="2026-01-15" /> },
          { label: { en: 'Due soon' }, value: <DueDate value={addDays(today(), 3)} /> },
          { label: { en: 'Settled' }, value: <DueDate value="2026-01-15" settled /> },
        ]}
      />
    </Stack>
  )
}

function TableDemo() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  return (
    <Stack gap={0}>
      <Toolbar search="" onSearchChange={() => {}} actions={<ActionButton intent="create" />} />
      <DataTable<Row>
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(row) => row.id}
        mobile={{ titleField: 'name', subtitleField: 'position', fields: ['salary'] }}
        actions={[
          { label: { en: 'Edit' }, onClick: () => {} },
          { label: { en: 'Delete' }, tone: 'danger', onClick: () => {} },
        ]}
      />
      <TablePagination
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        totalCount={47}
        onPageSizeChange={(next) => {
          /* Back to page one: on page two of 25 there is no page two of 50, and
             the user would land on an empty list. */
          setPageSize(next)
          setPage(1)
        }}
      />
    </Stack>
  )
}

/* Defined outside the component: written inline it is a new function on every
   render and breaks every `useMemo` that depends on it. */
const getInvoiceRowId = (row: { id: string }) => row.id

const RESIZABLE_COLUMNS: DataTableColumn<Record<string, unknown>>[] = [
  /* A code column has a fixed shape and gains nothing from being wider. */
  { name: 'konto', label: { en: 'Account' }, width: 90, resizable: false },
  { name: 'naziv', label: { en: 'Account name' }, width: 260, minWidth: 120, maxWidth: 520 },
  { name: 'duguje', label: { en: 'Debit' }, type: 'currency', currencyCode: 'RSD', width: 140 },
  { name: 'potrazuje', label: { en: 'Credit' }, type: 'currency', currencyCode: 'RSD', width: 140 },
]

const RESIZABLE_ROWS = [
  { id: '1', konto: '4350', naziv: 'Obaveze za kancelarijski materijal i sitan inventar', duguje: 0, potrazuje: 61_080 },
  { id: '2', konto: '2700', naziv: 'PDV u primljenim fakturama po opštoj stopi', duguje: 10_180, potrazuje: 0 },
  { id: '3', konto: '5130', naziv: 'Troškovi kancelarijskog materijala', duguje: 50_900, potrazuje: 0 },
]

/*
 * The left side is deliberately a document rather than a placeholder: the point
 * of the component is two things read together, and a grey box does not show it.
 */
function SplitPanelDemo() {
  return (
    <Box
      h={320}
      style={{
        border: `1px solid ${liroVar.border.default}`,
        borderRadius: 'var(--liro-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <SplitPanel
        defaultRatio={0.45}
        left={
          <Stack gap="xs" p="md">
            <Text size="xs" fw={700} tt="uppercase" style={{ color: liroVar.text.tertiary }}>
              Invoice 2026-0417
            </Text>
            <Text size="sm">Officedirect d.o.o., Beograd</Text>
            <Text size="sm">PIB 100002315 · MB 21603376</Text>
            <Divider my="xs" />
            <Text size="sm">Kancelarijski materijal — 42.180,00 RSD</Text>
            <Text size="sm">Toner HP 26A — 18.900,00 RSD</Text>
            <Divider my="xs" />
            <Text size="sm" fw={600}>Total 61.080,00 RSD</Text>
          </Stack>
        }
        right={
          <Stack gap="sm" p="md">
            <TextInput label="Account" defaultValue="4350" size="sm" />
            <TextInput label="Base amount" defaultValue="50.900,00" size="sm" />
            <TextInput label="VAT 20%" defaultValue="10.180,00" size="sm" />
            <Select
              label="VAT category"
              data={['S — standard rate', 'AE — reverse charge', 'O — out of scope']}
              defaultValue="S — standard rate"
              size="sm"
            />
          </Stack>
        }
      />
    </Box>
  )
}

const DRAWER_INVOICES = [
  { id: '1', number: '2026-0417', client: 'Officedirect d.o.o.', amount: '61.080,00 RSD', status: 'Pending approval' },
  { id: '2', number: '2026-0418', client: 'Nimbus Tech d.o.o.', amount: '124.500,00 RSD', status: 'Pending approval' },
  { id: '3', number: '2026-0419', client: 'Delta Gradnja d.o.o.', amount: '9.400,00 RSD', status: 'Pending approval' },
]

function DetailDrawerDemo() {
  const [index, setIndex] = useState<number | null>(null)
  const current = index === null ? null : DRAWER_INVOICES[index]

  return (
    <>
      <Table>
        <Table.Tbody>
          {DRAWER_INVOICES.map((invoice, position) => (
            <Table.Tr key={invoice.id} onClick={() => setIndex(position)} style={{ cursor: 'pointer' }}>
              <Table.Td><Text size="sm" data-numeric>{invoice.number}</Text></Table.Td>
              <Table.Td><Text size="sm">{invoice.client}</Text></Table.Td>
              <Table.Td ta="right"><Text size="sm" data-numeric>{invoice.amount}</Text></Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <DetailDrawer
        opened={current !== null}
        onClose={() => setIndex(null)}
        title={current?.number ?? ''}
        subtitle={current?.client}
        onPrevious={index !== null && index > 0 ? () => setIndex(index - 1) : undefined}
        onNext={index !== null && index < DRAWER_INVOICES.length - 1 ? () => setIndex(index + 1) : undefined}
        actions={
          <>
            <ActionButton intent="reject" />
            <ActionButton intent="approve" />
          </>
        }
      >
        <KeyValueList
          items={[
            { label: { en: 'Client' }, value: current?.client ?? '' },
            { label: { en: 'Amount' }, value: current?.amount ?? '' },
            { label: { en: 'Status' }, value: current?.status ?? '' },
            { label: { en: 'Date' }, value: '02.04.2026.' },
          ]}
        />
      </DetailDrawer>
    </>
  )
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'fast',
    label: { en: 'Quick fingers' },
    description: { en: 'Enter 50 invoices in one day' },
    image: '/achievements/quick-hands.svg',
    earned: true,
    earnedAt: '02.04.2026.',
    level: 3,
    tone: 'premium',
  },
  {
    id: 'inbox',
    label: { en: 'Clean desk' },
    description: { en: 'Clear the task list by the end of the day' },
    image: '/achievements/clear-desk.svg',
    earned: true,
    earnedAt: '28.03.2026.',
    level: 2,
    tone: 'success',
  },
  {
    id: 'streak',
    label: { en: 'Flawless streak' },
    description: { en: 'Ten payroll runs in a row without a correction' },
    image: '/achievements/flawless-streak.svg',
    progress: { done: 6, total: 10 },
    tone: 'warning',
  },
  {
    id: 'closer',
    label: { en: 'Closer of the year' },
    description: { en: 'Close twelve periods without a delay' },
    image: '/achievements/year-closer.svg',
    progress: { done: 3, total: 12 },
    tone: 'info',
  },
]

export const componentCategories: CatalogCategory[] = [
  {
    slug: 'actions',
    title: 'Buttons and actions',
    description: 'Intents instead of colors. The developer chooses what the button does, the system chooses how it looks.',
    group: 'components',
    icon: MousePointerClick,
    entries: [
      {
        id: 'action-button',
        title: 'Buttons by intent',
        description: 'Four families: main flow, verification, documents, secondary and destructive.',
        from: '@liro/ui',
        demo: <ActionsDemo />,
        code: `<ActionGroup>
  <ActionButton intent="pdf" />
  <ActionButton intent="sign" />
  <ActionButton intent="create" label={{ en: 'New order' }} />
</ActionGroup>`,
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Success disappears on its own, an error waits for the user to close it.',
        from: '@liro/ui',
        demo: (
          <ActionGroup>
            <ActionButton intent="save" label={{ en: 'Success' }} onClick={() => commonNotice.saved()} />
            <ActionButton
              intent="delete"
              label={{ en: 'Error' }}
              onClick={() => commonNotice.failed(new Error('Connection to SEF could not be established.'))}
            />
            <ActionButton
              intent="preview"
              label={{ en: 'Warning' }}
              onClick={() => notice.warning({ message: { en: 'The NBS exchange rate has not been refreshed for today.' } })}
            />
          </ActionGroup>
        ),
        code: `commonNotice.saved()
commonNotice.failed(error)
notice.warning({ message: { en: 'Exchange rate not refreshed.' } })`,
      },
    ],
  },

  {
    slug: 'badges',
    title: 'Status badges',
    description: 'A closed vocabulary of states, so the same status does not get three colors in three modules.',
    group: 'components',
    icon: Tags,
    entries: [
      {
        id: 'record-status',
        title: 'Record status',
        from: '@liro/ui',
        demo: (
          <Group gap="xs">
            {(['draft', 'pending', 'approved', 'signed', 'posted', 'overdue', 'rejected', 'archived'] as const).map(
              (status) => (
                <RecordStatusBadge key={status} status={status} />
              ),
            )}
          </Group>
        ),
        code: `<RecordStatusBadge status="overdue" />`,
      },
      {
        id: 'status-badge',
        title: 'General badges',
        from: '@liro/ui',
        demo: (
          <Group gap="xs">
            {(['success', 'warning', 'danger', 'info', 'neutral', 'premium'] as const).map((tone) => (
              <StatusBadge key={tone} tone={tone} label={tone} />
            ))}
            <ActiveStatusBadge active />
            <ActiveStatusBadge active={false} />
          </Group>
        ),
        code: `<StatusBadge tone="warning" label={{ en: 'Awaiting verification' }} />
<ActiveStatusBadge active={employee.active} />`,
      },
      {
        id: 'mantine-badges',
        title: 'Mantine badges and chips',
        description: 'For cases the status vocabulary does not cover.',
        demo: (
          <Group gap="xs">
            <Badge>Default</Badge>
            <Badge variant="light" color="liro-teal">Light</Badge>
            <Badge variant="outline" color="liro-violet">Outline</Badge>
            <Badge variant="dot">Dot</Badge>
            <Chip defaultChecked>Chip</Chip>
          </Group>
        ),
      },
    ],
  },

  {
    slug: 'navigation',
    title: 'Navigation',
    description: 'Burger, breadcrumbs, tabs, tree and shortcuts.',
    group: 'components',
    icon: Navigation,
    entries: [
      {
        id: 'nav-basics',
        title: 'Burger, breadcrumbs and tabs',
        demo: <NavigationDemo />,
        code: `<Breadcrumbs separator="›">
  <Anchor href="/">Home</Anchor>
  <Text fw={600}>Ana Jovanović</Text>
</Breadcrumbs>`,
      },
      {
        id: 'tree',
        title: 'Tree — chart of accounts',
        description: 'Hierarchies with many levels: accounts, organizational units, categories.',
        demo: <TreeDemo />,
        code: `<Tree data={accountTree} levelOffset={22} />`,
      },
      {
        id: 'table-of-contents',
        title: 'List of headings on the page',
        description:
          'Tracks scroll position through IntersectionObserver — a list that shows only the last clicked heading does not answer the question „where am I now".',
        from: '@liro/ui',
        demo: (
          <TableOfContents
            trackScroll={false}
            items={[
              { id: 'primer-osnovno', title: 'Basic information' },
              { id: 'primer-pib', title: 'PIB and company number', level: 2 },
              { id: 'primer-adresa', title: 'Address', level: 2 },
              { id: 'primer-pdv', title: 'VAT' },
              { id: 'primer-racuni', title: 'Bank accounts' },
            ]}
          />
        ),
        code: `<TableOfContents
    items={[
      { id: 'osnovno', title: 'Basic information' },
      { id: 'pib', title: 'PIB and company number', level: 2 },
      { id: 'pdv', title: 'VAT' },
    ]}
  />`,
      },
    ],
  },

  {
    slug: 'overlays',
    title: 'Modals and drawers',
    description: 'A modal for short, a drawer for long, a dialog for unobtrusive.',
    group: 'components',
    icon: Layers,
    entries: [
      {
        id: 'drawer-dialog',
        title: 'Drawer and dialog',
        demo: <OverlaysDemo />,
        code: `<Drawer opened={opened} onClose={close} position="right" title="Edit">
  <AutoForm schema={schema} onSubmit={save} />
</Drawer>`,
      },
      {
        id: 'hover-card',
        title: 'Hover card',
        description: 'Details without opening a page — a client preview from a table row.',
        demo: (
          <HoverCard width={280} shadow="md" withArrow>
            <HoverCard.Target>
              <Anchor size="sm">Konfirs d.o.o.</Anchor>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <KeyValueList
                columns={1}
                items={[
                  { label: { en: 'Tax number' }, value: '100234567', numeric: true },
                  { label: { en: 'City' }, value: 'Beograd' },
                  { label: { en: 'Status' }, value: <ActiveStatusBadge active /> },
                ]}
              />
            </HoverCard.Dropdown>
          </HoverCard>
        ),
      },
      {
        id: 'confirmations',
        title: 'Confirmations',
        description: 'Modals mount at the page level, outside cards.',
        from: '@liro/ui',
        demo: (
          <Text size="sm">
            <code>ConfirmModal</code> and <code>DeleteConfirmModal</code> — see the example in the
            Examples category, since they need page-level state.
          </Text>
        ),
        code: `<DeleteConfirmModal
  opened={pending !== null}
  onClose={() => setPending(null)}
  onConfirm={remove}
  loading={isPending}
/>`,
      },
    ],
  },

  {
    slug: 'inputs',
    title: 'Fields and forms',
    description: 'A form described by a schema: sixteen field types, conditions, relations.',
    group: 'components',
    icon: Type,
    entries: [
      {
        id: 'auto-form',
        title: 'Form from a schema',
        description: 'Type 010326 into the date. Select a client and watch the branch unlock.',
        from: '@liro/forms',
        demo: <AutoForm schema={formSchema} onSubmit={() => commonNotice.saved()} />,
        code: `const schema: FieldSchema[] = [
  { name: 'first_name', type: 'text', label: { en: 'First name' }, required: true },
  {
    name: 'client_id',
    type: 'relation',
    label: { en: 'Client' },
    relation: { resource: 'clients', labelField: 'name', searchFields: ['name', 'pib'] },
  },
]

<AutoForm schema={schema} onSubmit={save} />`,
      },
      {
        id: 'controls',
        title: 'Switches and sliders',
        demo: (
          <Stack gap="lg" maw={420}>
            <Switch label="Eligible for a tax relief" defaultChecked />
            <Switch label="Off" />
            <Slider
              defaultValue={40}
              thumbLabel="Share percentage"
              marks={[{ value: 0, label: '0%' }, { value: 50, label: '50%' }, { value: 100, label: '100%' }]}
            />
          </Stack>
        ),
      },
    ],
  },

  {
    slug: 'dates',
    title: 'Dates and periods',
    description: 'Accounting periods, due dates, and date entry without dots.',
    group: 'components',
    icon: Component,
    entries: [
      {
        id: 'period-picker',
        title: 'Period selection and due dates',
        from: '@liro/dates',
        demo: <DatesDemo />,
        code: `<PeriodPicker value={period} onChange={setPeriod} />
<AccountingPeriodSelect value={{ year: 2026, month: 3 }} onChange={setPeriod} />
<DueDate value={invoice.dueDate} settled={invoice.paid} />`,
      },
    ],
  },

  {
    slug: 'tables',
    title: 'Tables',
    description: 'The same table on screen and on the phone — it just stops being a table.',
    group: 'components',
    icon: Square,
    entries: [
      {
        id: 'data-table',
        title: 'Table with toolbar and pagination',
        description: 'Narrow the window below 768px — rows become cards.',
        from: '@liro/ui',
        wide: true,
        demo: <TableDemo />,
        code: `<DataTable
  columns={columns}
  rows={rows}
  getRowId={(row) => row.id}
  mobile={{ titleField: 'name', subtitleField: 'position', fields: ['salary'] }}
  actions={rowActions}
/>`,
      },
      {
        id: 'resource-table',
        title: 'Table connected to the database',
        description: 'Search, sorting and pagination go through DataProvider.',
        from: '@liro/data',
        demo: (
          <Text size="sm">
            A live example is in <code>Examples → List with filters</code>, since it needs a data provider.
          </Text>
        ),
        code: `<ResourceTable
  resource="employees_with_details"
  deleteFrom="employees"
  columns={columns}
  searchFields={['first_name', 'last_name', 'jmbg']}
  onEdit={openEdit}
  allowDelete
/>`,
      },
      {
        id: 'data-table-resizable',
        title: 'Dragging column width',
        description:
          'resizableColumns adds a handle on every column. It also works with the keyboard — Tab to the handle, arrows change the width, Shift speeds it up.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <DataTable
            columns={RESIZABLE_COLUMNS}
            rows={RESIZABLE_ROWS}
            getRowId={getInvoiceRowId}
            resizableColumns
            stickyFirstColumn
          />
        ),
        code: `<DataTable columns={columns} rows={rows} getRowId={getRowId} resizableColumns />`,
      },
      {
        id: 'detail-drawer',
        title: 'Drawer with detail',
        description:
          'Click a row. The table stays visible — there is no dimming and focus is not trapped, so you can tab back into it. Up/down arrows move through rows without closing.',
        from: '@liro/ui',
        wide: true,
        demo: <DetailDrawerDemo />,
        code: `<DetailDrawer
  opened={selected !== null}
  onClose={() => setSelected(null)}
  title={record.number}
  subtitle={record.client}
  onNext={next}
  onPrevious={previous}
  actions={<ActionButton intent="approve" />}
>
  <KeyValueList items={items} />
</DetailDrawer>`,
      },
    ],
  },

  {
    slug: 'feedback',
    title: 'States and feedback',
    description: 'Empty, no results, error, warning — each looks different.',
    group: 'components',
    icon: Bell,
    entries: [
      {
        id: 'empty-states',
        title: 'Empty states',
        from: '@liro/ui',
        demo: (
          <Group grow align="flex-start">
            <EmptyState variant="empty" actionLabel={{ en: 'Add the first entry' }} onAction={() => {}} />
            <EmptyState variant="no-results" />
            <EmptyState variant="error" />
          </Group>
        ),
        code: `<EmptyState variant="no-results" />`,
      },
      {
        id: 'callouts',
        title: 'Callout messages',
        from: '@liro/ui',
        demo: (
          <Stack gap="sm">
            <Callout tone="info" title={{ en: 'Note' }}>The NBS exchange rate is pulled every business day at 08:00.</Callout>
            <Callout tone="warning" title={{ en: 'Attention' }}>The payroll run is not locked — amounts can still change.</Callout>
            <Callout tone="danger" title={{ en: 'Error' }} actions={<ActionButton intent="refresh" />}>
              Sending to SEF failed.
            </Callout>
            <Callout tone="success">The payroll run is posted and locked.</Callout>
          </Stack>
        ),
        code: `<Callout tone="warning" title={{ en: 'Attention' }}>
  The payroll run is not locked.
</Callout>`,
      },
      {
        id: 'timeline',
        title: 'Document flow',
        demo: (
          <Timeline active={1} bulletSize={18} lineWidth={2}>
            <Timeline.Item title="Drafted">
              <Text size="xs" c="dimmed">01.03.2026. · Ana Jovanović</Text>
            </Timeline.Item>
            <Timeline.Item title="Signed">
              <Text size="xs" c="dimmed">02.03.2026. · electronic signature</Text>
            </Timeline.Item>
            <Timeline.Item title="Posted">
              <Text size="xs" c="dimmed">Not posted</Text>
            </Timeline.Item>
          </Timeline>
        ),
      },
      {
        id: 'achievements',
        title: 'Achievements',
        description:
          'The image comes from the application — the system frames it, dims it, and marks it with a level. Locked is gray and muted, never hidden: a goal you cannot see is not a goal.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Box p="md">
            <AchievementGrid achievements={ACHIEVEMENTS} />
          </Box>
        ),
        code: `<AchievementGrid achievements={achievements} />`,
      },
    ],
  },

  {
    slug: 'data-display',
    title: 'Data display',
    description: 'Headers, label/value pairs, summary cards.',
    group: 'components',
    icon: Users,
    entries: [
      {
        id: 'page-header',
        title: 'Page header',
        from: '@liro/ui',
        demo: (
          <PageHeader
            title={{ en: 'Employees' }}
            description={{ en: 'Record of employed persons' }}
            icon={Users}
            badge={<StatusBadge tone="info" label="47 active" />}
            actions={
              <ActionGroup>
                <ActionButton intent="excel" />
                <ActionButton intent="create" label={{ en: 'New person' }} />
              </ActionGroup>
            }
          />
        ),
        code: `<PageHeader
  title={{ en: 'Employees' }}
  icon={Users}
  actions={<ActionButton intent="create" />}
/>`,
      },
      {
        id: 'stat-grid',
        title: 'Summary cards',
        description: 'The third card is growing but red — cost growth is not good news.',
        from: '@liro/ui',
        demo: (
          <StatGrid
            data={[
              { title: { en: 'Employees' }, value: 47, icon: Users, diff: 8 },
              { title: { en: 'Clients' }, value: 12, icon: Building2 },
              { title: { en: 'Payroll total' }, value: '4.128.500', diff: 12, invertDiff: true },
              { title: { en: 'Documents' }, value: 318, diff: -4 },
            ]}
          />
        ),
        code: `<StatGrid data={[
  { title: { en: 'Payroll total' }, value: total, diff: 12, invertDiff: true },
]} />`,
      },
      {
        id: 'key-value',
        title: 'Label and value',
        from: '@liro/ui',
        demo: (
          <KeyValueList
            items={[
              { label: { en: 'Name' }, value: 'Konfirs d.o.o.' },
              { label: { en: 'Tax number' }, value: '100234567', numeric: true },
              { label: { en: 'Status' }, value: <ActiveStatusBadge active /> },
              { label: { en: 'Note' }, value: null },
              { label: { en: 'Address' }, value: 'Bulevar Mihajla Pupina 10ž, Beograd', fullWidth: true },
            ]}
          />
        ),
        code: `<KeyValueList items={[
  { label: { en: 'Tax number' }, value: client.pib, numeric: true },
]} />`,
      },
      {
        id: 'split-panel',
        title: 'Split panels',
        description:
          'Drag the edge with the mouse, or Tab to it and use arrows. Home and End go to the edges, Enter resets to half.',
        from: '@liro/ui',
        wide: true,
        demo: <SplitPanelDemo />,
        code: `<SplitPanel
  defaultRatio={0.45}
  left={<PdfPreview source={file} />}
  right={<AutoForm fields={schema} onSubmit={save} />}
/>`,
      },
    ],
  },
]

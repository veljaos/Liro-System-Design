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
  { id: '1', name: 'Ana Jovanović', position: 'Knjigovođa', salary: 125_450, active: true },
  { id: '2', name: 'Marko Petrović', position: 'Komercijalista', salary: 98_300, active: true },
  { id: '3', name: 'Jelena Nikolić', position: 'Magacioner', salary: 87_900, active: false },
]

const COLUMNS: DataTableColumn<Row>[] = [
  { name: 'name', label: { sr: 'Ime i prezime' }, sortable: true },
  { name: 'position', label: { sr: 'Radno mesto' } },
  { name: 'salary', label: { sr: 'Bruto zarada' }, type: 'currency', currencyCode: 'RSD', sortable: true },
  { name: 'active', label: { sr: 'Status' }, width: 110, render: (value) => <ActiveStatusBadge active={Boolean(value)} /> },
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
        <ActionButton intent="edit" label={{ sr: 'Otvori fioku' }} onClick={() => setDrawer(true)} />
        <ActionButton intent="view" label={{ sr: 'Mali dijalog' }} onClick={() => setDialog(true)} />
      </ActionGroup>

      <Drawer opened={drawer} onClose={() => setDrawer(false)} title="Fioka" position="right">
        <Text size="sm">
          Fioka se koristi kada polja ima mnogo ili kada korisnik treba da vidi spisak iza sebe dok
          unosi.
        </Text>
      </Drawer>

      <Dialog opened={dialog} onClose={() => setDialog(false)} withCloseButton size="lg" radius="lg">
        <Text size="sm" mb="xs">Dijalog stoji u uglu i ne blokira ekran.</Text>
        {/* Omotali smo dugme u Group da bismo ga gurnuli desno */}
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
        <Burger opened={opened} onClick={() => setOpened((state) => !state)} size="sm" aria-label="Meni" />
        <Breadcrumbs separator="›" separatorMargin="xs">
          <Anchor href="#" size="sm">Početna</Anchor>
          <Anchor href="#" size="sm">Zaposlena lica</Anchor>
          <Text size="sm" fw={600}>Ana Jovanović</Text>
        </Breadcrumbs>
      </Group>

      <Divider />

      <Tabs defaultValue="pregled">
        <Tabs.List>
          <Tabs.Tab value="pregled">Pregled</Tabs.Tab>
          <Tabs.Tab value="ugovori">Ugovori</Tabs.Tab>
          <Tabs.Tab value="obracuni">Obračuni</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Group gap="xs">
        <Text size="sm">Komandna paleta:</Text>
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
        <PeriodPicker label={{ sr: 'Period izveštaja' }} value={period} onChange={setPeriod} />
        <AccountingPeriodSelect value={accounting} onChange={setAccounting} />
      </Group>

      <KeyValueList
        items={[
          { label: { sr: 'Datum' }, value: <DateText value="2026-03-17" withWeekday /> },
          { label: { sr: 'U docnji' }, value: <DueDate value="2026-01-15" /> },
          { label: { sr: 'Uskoro' }, value: <DueDate value={addDays(today(), 3)} /> },
          { label: { sr: 'Izmireno' }, value: <DueDate value="2026-01-15" settled /> },
        ]}
      />
    </Stack>
  )
}

function TableDemo() {
  const [page, setPage] = useState(1)

  return (
    <Stack gap={0}>
      <Toolbar search="" onSearchChange={() => {}} actions={<ActionButton intent="create" />} />
      <DataTable<Row>
        columns={COLUMNS}
        rows={ROWS}
        getRowId={(row) => row.id}
        mobile={{ titleField: 'name', subtitleField: 'position', fields: ['salary'] }}
        actions={[
          { label: { sr: 'Izmeni' }, onClick: () => {} },
          { label: { sr: 'Obriši' }, tone: 'danger', onClick: () => {} },
        ]}
      />
      <TablePagination page={page} onPageChange={setPage} pageSize={25} totalCount={47} onPageSizeChange={() => {}} />
    </Stack>
  )
}

/* Defined outside the component: written inline it is a new function on every
   render and breaks every `useMemo` that depends on it. */
const getInvoiceRowId = (row: { id: string }) => row.id

const RESIZABLE_COLUMNS: DataTableColumn<Record<string, unknown>>[] = [
  /* A code column has a fixed shape and gains nothing from being wider. */
  { name: 'konto', label: { sr: 'Konto' }, width: 90, resizable: false },
  { name: 'naziv', label: { sr: 'Naziv konta' }, width: 260, minWidth: 120, maxWidth: 520 },
  { name: 'duguje', label: { sr: 'Duguje' }, type: 'currency', currencyCode: 'RSD', width: 140 },
  { name: 'potrazuje', label: { sr: 'Potražuje' }, type: 'currency', currencyCode: 'RSD', width: 140 },
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
              Faktura 2026-0417
            </Text>
            <Text size="sm">Officedirect d.o.o., Beograd</Text>
            <Text size="sm">PIB 100002315 · MB 21603376</Text>
            <Divider my="xs" />
            <Text size="sm">Kancelarijski materijal — 42.180,00 RSD</Text>
            <Text size="sm">Toner HP 26A — 18.900,00 RSD</Text>
            <Divider my="xs" />
            <Text size="sm" fw={600}>Ukupno 61.080,00 RSD</Text>
          </Stack>
        }
        right={
          <Stack gap="sm" p="md">
            <TextInput label="Konto" defaultValue="4350" size="sm" />
            <TextInput label="Osnovica" defaultValue="50.900,00" size="sm" />
            <TextInput label="PDV 20%" defaultValue="10.180,00" size="sm" />
            <Select
              label="PDV kategorija"
              data={['S — standardna stopa', 'AE — obrnuto obračunavanje', 'O — nije predmet']}
              defaultValue="S — standardna stopa"
              size="sm"
            />
          </Stack>
        }
      />
    </Box>
  )
}

const DRAWER_INVOICES = [
  { id: '1', number: '2026-0417', client: 'Officedirect d.o.o.', amount: '61.080,00 RSD', status: 'Za odobrenje' },
  { id: '2', number: '2026-0418', client: 'Nimbus Tech d.o.o.', amount: '124.500,00 RSD', status: 'Za odobrenje' },
  { id: '3', number: '2026-0419', client: 'Delta Gradnja d.o.o.', amount: '9.400,00 RSD', status: 'Za odobrenje' },
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
            { label: { sr: 'Klijent' }, value: current?.client ?? '' },
            { label: { sr: 'Iznos' }, value: current?.amount ?? '' },
            { label: { sr: 'Status' }, value: current?.status ?? '' },
            { label: { sr: 'Datum' }, value: '02.04.2026.' },
          ]}
        />
      </DetailDrawer>
    </>
  )
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'fast',
    label: { sr: 'Brzi prsti' },
    description: { sr: 'Unesi 50 faktura u jednom danu' },
    image: '/achievements/quick-hands.svg',
    earned: true,
    earnedAt: '02.04.2026.',
    level: 3,
    tone: 'premium',
  },
  {
    id: 'inbox',
    label: { sr: 'Čist sto' },
    description: { sr: 'Isprazni listu zadataka do kraja dana' },
    image: '/achievements/clear-desk.svg',
    earned: true,
    earnedAt: '28.03.2026.',
    level: 2,
    tone: 'success',
  },
  {
    id: 'streak',
    label: { sr: 'Niz bez greške' },
    description: { sr: 'Deset obračuna zaredom bez ispravke' },
    image: '/achievements/flawless-streak.svg',
    progress: { done: 6, total: 10 },
    tone: 'warning',
  },
  {
    id: 'closer',
    label: { sr: 'Zatvarač godine' },
    description: { sr: 'Zatvori dvanaest perioda bez zakašnjenja' },
    image: '/achievements/year-closer.svg',
    progress: { done: 3, total: 12 },
    tone: 'info',
  },
]

export const componentCategories: CatalogCategory[] = [
  {
    slug: 'actions',
    title: 'Dugmad i radnje',
    description: 'Namere umesto boja. Programer bira šta dugme radi, sistem bira kako izgleda.',
    group: 'components',
    icon: MousePointerClick,
    entries: [
      {
        id: 'action-button',
        title: 'Dugmad po nameri',
        description: 'Četiri porodice: glavni tok, overa, dokumenti, sporedno i destruktivno.',
        from: '@liro/ui',
        demo: <ActionsDemo />,
        code: `<ActionGroup>
  <ActionButton intent="pdf" />
  <ActionButton intent="sign" />
  <ActionButton intent="create" label={{ sr: 'Novi nalog' }} />
</ActionGroup>`,
      },
      {
        id: 'notifications',
        title: 'Obaveštenja',
        description: 'Uspeh nestaje sam, greška čeka da je korisnik zatvori.',
        from: '@liro/ui',
        demo: (
          <ActionGroup>
            <ActionButton intent="save" label={{ sr: 'Uspeh' }} onClick={() => commonNotice.saved()} />
            <ActionButton
              intent="delete"
              label={{ sr: 'Greška' }}
              onClick={() => commonNotice.failed(new Error('Veza sa SEF-om nije uspostavljena.'))}
            />
            <ActionButton
              intent="preview"
              label={{ sr: 'Upozorenje' }}
              onClick={() => notice.warning({ message: { sr: 'Kurs NBS-a nije osvežen za današnji dan.' } })}
            />
          </ActionGroup>
        ),
        code: `commonNotice.saved()
commonNotice.failed(error)
notice.warning({ message: { sr: 'Kurs nije osvežen.' } })`,
      },
    ],
  },

  {
    slug: 'badges',
    title: 'Oznake stanja',
    description: 'Zatvoren rečnik stanja, da isti status ne dobije tri boje u tri modula.',
    group: 'components',
    icon: Tags,
    entries: [
      {
        id: 'record-status',
        title: 'Stanje zapisa',
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
        title: 'Opšte oznake',
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
        code: `<StatusBadge tone="warning" label={{ sr: 'Čeka overu' }} />
<ActiveStatusBadge active={employee.active} />`,
      },
      {
        id: 'mantine-badges',
        title: 'Mantine oznake i čipovi',
        description: 'Za slučajeve koje rečnik stanja ne pokriva.',
        demo: (
          <Group gap="xs">
            <Badge>Podrazumevano</Badge>
            <Badge variant="light" color="liro-teal">Light</Badge>
            <Badge variant="outline" color="liro-violet">Outline</Badge>
            <Badge variant="dot">Dot</Badge>
            <Chip defaultChecked>Čip</Chip>
          </Group>
        ),
      },
    ],
  },

  {
    slug: 'navigation',
    title: 'Navigacija',
    description: 'Burger, putanja, kartice, stablo i prečice.',
    group: 'components',
    icon: Navigation,
    entries: [
      {
        id: 'nav-basics',
        title: 'Burger, putanja i kartice',
        demo: <NavigationDemo />,
        code: `<Breadcrumbs separator="›">
  <Anchor href="/">Početna</Anchor>
  <Text fw={600}>Ana Jovanović</Text>
</Breadcrumbs>`,
      },
      {
        id: 'tree',
        title: 'Stablo — kontni plan',
        description: 'Hijerarhije sa mnogo nivoa: konta, organizacione jedinice, kategorije.',
        demo: <TreeDemo />,
        code: `<Tree data={accountTree} levelOffset={22} />`,
      },
      {
        id: 'table-of-contents',
        title: 'Spisak naslova na stranici',
        description:
          'Prati položaj skrola kroz IntersectionObserver — spisak koji pokazuje samo zadnji kliknuti naslov ne odgovara na pitanje „gde sam sada".',
        from: '@liro/ui',
        demo: (
          <TableOfContents
            trackScroll={false}
            items={[
              { id: 'primer-osnovno', title: 'Osnovni podaci' },
              { id: 'primer-pib', title: 'PIB i matični broj', level: 2 },
              { id: 'primer-adresa', title: 'Adresa', level: 2 },
              { id: 'primer-pdv', title: 'PDV' },
              { id: 'primer-racuni', title: 'Tekući računi' },
            ]}
          />
        ),
        code: `<TableOfContents
    items={[
      { id: 'osnovno', title: 'Osnovni podaci' },
      { id: 'pib', title: 'PIB i matični broj', level: 2 },
      { id: 'pdv', title: 'PDV' },
    ]}
  />`,
      },
    ],
  },

  {
    slug: 'overlays',
    title: 'Modali i fioke',
    description: 'Modal za kratko, fioka za dugačko, dijalog za nenametljivo.',
    group: 'components',
    icon: Layers,
    entries: [
      {
        id: 'drawer-dialog',
        title: 'Fioka i dijalog',
        demo: <OverlaysDemo />,
        code: `<Drawer opened={opened} onClose={close} position="right" title="Izmena">
  <AutoForm schema={schema} onSubmit={save} />
</Drawer>`,
      },
      {
        id: 'hover-card',
        title: 'Kartica na prelaz mišem',
        description: 'Detalji bez otvaranja stranice — pregled klijenta iz reda tabele.',
        demo: (
          <HoverCard width={280} shadow="md" withArrow>
            <HoverCard.Target>
              <Anchor size="sm">Konfirs d.o.o.</Anchor>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <KeyValueList
                columns={1}
                items={[
                  { label: { sr: 'PIB' }, value: '100234567', numeric: true },
                  { label: { sr: 'Grad' }, value: 'Beograd' },
                  { label: { sr: 'Status' }, value: <ActiveStatusBadge active /> },
                ]}
              />
            </HoverCard.Dropdown>
          </HoverCard>
        ),
      },
      {
        id: 'confirmations',
        title: 'Potvrde',
        description: 'Modali se montiraju na nivou stranice, izvan kartica.',
        from: '@liro/ui',
        demo: (
          <Text size="sm">
            <code>ConfirmModal</code> i <code>DeleteConfirmModal</code> — vidi primer u kategoriji
            Primeri, jer traže stanje na nivou stranice.
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
    title: 'Polja i forme',
    description: 'Forma opisana šemom: šesnaest tipova polja, uslovi, relacije.',
    group: 'components',
    icon: Type,
    entries: [
      {
        id: 'auto-form',
        title: 'Forma iz šeme',
        description: 'Otkucajte 010326 u datum. Izaberite klijenta pa gledajte kako se poslovnica otključa.',
        from: '@liro/forms',
        demo: <AutoForm schema={formSchema} onSubmit={() => commonNotice.saved()} />,
        code: `const schema: FieldSchema[] = [
  { name: 'first_name', type: 'text', label: { sr: 'Ime' }, required: true },
  {
    name: 'client_id',
    type: 'relation',
    label: { sr: 'Klijent' },
    relation: { resource: 'clients', labelField: 'name', searchFields: ['name', 'pib'] },
  },
]

<AutoForm schema={schema} onSubmit={save} />`,
      },
      {
        id: 'controls',
        title: 'Prekidači i klizači',
        demo: (
          <Stack gap="lg" maw={420}>
            <Switch label="Ostvaruje pravo na olakšicu" defaultChecked />
            <Switch label="Isključeno" />
            <Slider
              defaultValue={40}
              thumbLabel="Procenat učešća"
              marks={[{ value: 0, label: '0%' }, { value: 50, label: '50%' }, { value: 100, label: '100%' }]}
            />
          </Stack>
        ),
      },
    ],
  },

  {
    slug: 'dates',
    title: 'Datumi i periodi',
    description: 'Obračunski periodi, rokovi dospeća i unos datuma bez tačaka.',
    group: 'components',
    icon: Component,
    entries: [
      {
        id: 'period-picker',
        title: 'Izbor perioda i rokovi',
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
    title: 'Tabele',
    description: 'Ista tabela na ekranu i na telefonu — samo prestaje da bude tabela.',
    group: 'components',
    icon: Square,
    entries: [
      {
        id: 'data-table',
        title: 'Tabela sa trakom i paginacijom',
        description: 'Suzite prozor ispod 768px — redovi postaju kartice.',
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
        title: 'Tabela povezana sa bazom',
        description: 'Pretraga, sortiranje i paginacija idu kroz DataProvider.',
        from: '@liro/data',
        demo: (
          <Text size="sm">
            Živi primer je u <code>Primeri → Spisak sa filterima</code>, jer traži provajder podataka.
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
        title: 'Prevlačenje širine kolona',
        description:
          'resizableColumns uključuje hvataljku na svakoj koloni. Radi i tastaturom — Tab do hvataljke, strelice menjaju širinu, Shift ubrzava.',
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
        title: 'Fioka sa detaljem',
        description:
          'Klikni red. Tabela ostaje vidljiva — nema zamračenja i fokus nije zatvoren, pa se možeš tabom vratiti u nju. Strelice gore-dole idu kroz redove bez zatvaranja.',
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
    title: 'Stanja i povratne informacije',
    description: 'Prazno, bez rezultata, greška, upozorenje — svako izgleda drugačije.',
    group: 'components',
    icon: Bell,
    entries: [
      {
        id: 'empty-states',
        title: 'Prazna stanja',
        from: '@liro/ui',
        demo: (
          <Group grow align="flex-start">
            <EmptyState variant="empty" actionLabel={{ sr: 'Dodaj prvi unos' }} onAction={() => {}} />
            <EmptyState variant="no-results" />
            <EmptyState variant="error" />
          </Group>
        ),
        code: `<EmptyState variant="no-results" />`,
      },
      {
        id: 'callouts',
        title: 'Istaknute poruke',
        from: '@liro/ui',
        demo: (
          <Stack gap="sm">
            <Callout tone="info" title={{ sr: 'Napomena' }}>Kurs NBS-a se povlači svakog radnog dana u 08:00.</Callout>
            <Callout tone="warning" title={{ sr: 'Pažnja' }}>Obračun nije zaključan — iznosi se mogu promeniti.</Callout>
            <Callout tone="danger" title={{ sr: 'Greška' }} actions={<ActionButton intent="refresh" />}>
              Slanje u SEF nije uspelo.
            </Callout>
            <Callout tone="success">Obračun je proknjižen i zaključan.</Callout>
          </Stack>
        ),
        code: `<Callout tone="warning" title={{ sr: 'Pažnja' }}>
  Obračun nije zaključan.
</Callout>`,
      },
      {
        id: 'timeline',
        title: 'Tok dokumenta',
        demo: (
          <Timeline active={1} bulletSize={18} lineWidth={2}>
            <Timeline.Item title="Sastavljen">
              <Text size="xs" c="dimmed">01.03.2026. · Ana Jovanović</Text>
            </Timeline.Item>
            <Timeline.Item title="Potpisan">
              <Text size="xs" c="dimmed">02.03.2026. · elektronski potpis</Text>
            </Timeline.Item>
            <Timeline.Item title="Proknjižen">
              <Text size="xs" c="dimmed">Nije proknjižen</Text>
            </Timeline.Item>
          </Timeline>
        ),
      },
      {
        id: 'achievements',
        title: 'Dostignuća',
        description:
          'Slika dolazi iz aplikacije — sistem je uokviruje, zatamnjuje i označava nivoom. Zaključano je sivo i prigušeno, nikad skriveno: cilj koji se ne vidi nije cilj.',
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
    title: 'Prikaz podataka',
    description: 'Zaglavlja, parovi oznaka/vrednost, zbirne kartice.',
    group: 'components',
    icon: Users,
    entries: [
      {
        id: 'page-header',
        title: 'Zaglavlje stranice',
        from: '@liro/ui',
        demo: (
          <PageHeader
            title={{ sr: 'Zaposlena lica' }}
            description={{ sr: 'Evidencija radno angažovanih lica' }}
            icon={Users}
            badge={<StatusBadge tone="info" label="47 aktivnih" />}
            actions={
              <ActionGroup>
                <ActionButton intent="excel" />
                <ActionButton intent="create" label={{ sr: 'Novo lice' }} />
              </ActionGroup>
            }
          />
        ),
        code: `<PageHeader
  title={{ sr: 'Zaposlena lica' }}
  icon={Users}
  actions={<ActionButton intent="create" />}
/>`,
      },
      {
        id: 'stat-grid',
        title: 'Zbirne kartice',
        description: 'Treća kartica raste ali je crvena — rast troška nije dobra vest.',
        from: '@liro/ui',
        demo: (
          <StatGrid
            data={[
              { title: { sr: 'Zaposlenih' }, value: 47, icon: Users, diff: 8 },
              { title: { sr: 'Klijenata' }, value: 12, icon: Building2 },
              { title: { sr: 'Masa zarada' }, value: '4.128.500', diff: 12, invertDiff: true },
              { title: { sr: 'Dokumenata' }, value: 318, diff: -4 },
            ]}
          />
        ),
        code: `<StatGrid data={[
  { title: { sr: 'Masa zarada' }, value: total, diff: 12, invertDiff: true },
]} />`,
      },
      {
        id: 'key-value',
        title: 'Oznaka i vrednost',
        from: '@liro/ui',
        demo: (
          <KeyValueList
            items={[
              { label: { sr: 'Naziv' }, value: 'Konfirs d.o.o.' },
              { label: { sr: 'PIB' }, value: '100234567', numeric: true },
              { label: { sr: 'Status' }, value: <ActiveStatusBadge active /> },
              { label: { sr: 'Napomena' }, value: null },
              { label: { sr: 'Adresa' }, value: 'Bulevar Mihajla Pupina 10ž, Beograd', fullWidth: true },
            ]}
          />
        ),
        code: `<KeyValueList items={[
  { label: { sr: 'PIB' }, value: client.pib, numeric: true },
]} />`,
      },
      {
        id: 'split-panel',
        title: 'Podeljeni paneli',
        description:
          'Prevuci ivicu mišem, ili Tab do nje i strelice. Home i End idu na granice, Enter vraća na pola.',
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
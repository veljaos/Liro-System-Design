'use client'

import { useState } from 'react'
import {
  Anchor,
  Badge,
  Breadcrumbs,
  Burger,
  Chip,
  Dialog,
  Divider,
  Drawer,
  Group,
  HoverCard,
  Kbd,
  Slider,
  Stack,
  Switch,
  Tabs,
  Text,
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
  ActionButton,
  ActionGroup,
  ActiveStatusBadge,
  Callout,
  DataTable,
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
  type DataTableColumn,
} from '@liro/ui'
import { AutoForm } from '@liro/forms'
import { DateText, DueDate, PeriodPicker, AccountingPeriodSelect, type DateRange, type AccountingPeriodValue, addDays, today } from '@liro/dates'
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
            <Slider defaultValue={40} marks={[{ value: 0, label: '0%' }, { value: 50, label: '50%' }, { value: 100, label: '100%' }]} />
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
    ],
  },
]

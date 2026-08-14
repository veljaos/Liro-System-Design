'use client'

import { useState } from 'react'
import { SimpleGrid, Stack, Text } from '@mantine/core'
import {
  ItemGallery,
  KanbanBoard,
  RateTable,
  SlotPicker,
  StatusBadge,
  StockLedger,
  type KanbanColumn,
} from '@liro/ui'
import { ProcessDiagram, buildProcess, type SimpleStep } from '@liro/process'
import { Boxes, CalendarCheck, Tags, Workflow } from 'lucide-react'
import type { CatalogCategory } from '../types'

const ORDER_PROCESS: SimpleStep[] = [
  { id: 'start', label: 'Request received', kind: 'start', lane: 'Sales', done: true, next: 'check' },
  { id: 'check', label: 'Stock check', kind: 'task', lane: 'Sales', done: true, next: 'decision' },
  {
    id: 'decision',
    label: 'In stock?',
    kind: 'decision',
    lane: 'Sales',
    active: true,
    branches: [
      { label: 'yes', to: 'pick' },
      { label: 'no', to: 'order' },
    ],
  },
  { id: 'pick', label: 'Prepare goods', kind: 'task', lane: 'Warehouse', next: 'ship' },
  { id: 'order', label: 'Ordering', kind: 'task', lane: 'Procurement', meta: 'lead time 5 days', next: 'ship' },
  { id: 'ship', label: 'Shipping', kind: 'task', lane: 'Warehouse', next: 'invoice' },
  { id: 'invoice', label: 'Invoicing', kind: 'system', lane: 'Accounting', next: 'end' },
  { id: 'end', label: 'Closed', kind: 'end', lane: 'Accounting' },
]

const APPROVAL_PROCESS: SimpleStep[] = [
  { id: 'a', label: 'Order created', kind: 'start', next: 'b' },
  { id: 'b', label: 'Review', kind: 'task', lane: 'Accounting', next: 'c' },
  {
    id: 'c',
    label: 'Amount > 100.000?',
    kind: 'decision',
    branches: [
      { label: 'yes', to: 'd' },
      { label: 'no', to: 'e' },
    ],
  },
  { id: 'd', label: 'Director approval', kind: 'task', lane: 'Management', next: 'e' },
  { id: 'e', label: 'Payment', kind: 'end', lane: 'Finance' },
]

/**
 * Second-layer pattern showcase.
 *
 * Examples are deliberately drawn from different industries - warehouse,
 * hotel, facility management, quality control - to show that it is the same
 * component with a different configuration.
 */

const MOVEMENTS = [
  { id: '1', kind: 'in' as const, date: '01.03.2026.', reference: 'PRM-0142', from: 'Officedirect d.o.o.', to: 'Zemun warehouse', quantity: 240, balance: 240 },
  { id: '2', kind: 'out' as const, date: '04.03.2026.', reference: 'OTP-0318', from: 'Zemun warehouse', to: 'Konfirs d.o.o.', quantity: 60, balance: 180 },
  { id: '3', kind: 'transfer' as const, date: '09.03.2026.', reference: 'PRN-0021', from: 'Zemun warehouse', to: 'Centar store', quantity: 40, balance: 180, note: 'Does not change the total balance' },
  { id: '4', kind: 'out' as const, date: '14.03.2026.', reference: 'OTP-0322', from: 'Centar store', to: 'Pekara Sunce', quantity: 25, balance: 155 },
  { id: '5', kind: 'adjustment' as const, date: '20.03.2026.', reference: 'ISP-0004', quantity: 3, balance: 152, note: 'Damaged in transit' },
  { id: '6', kind: 'count' as const, date: '31.03.2026.', reference: 'POP-2026-Q1', quantity: 152, balance: 152, note: 'Balance established by stocktake' },
]

const BOOKING_DAYS = [
  {
    date: '2026-04-06',
    label: 'Mon 06.04.',
    slots: [
      { time: '08:00', available: false, takenBy: 'Client meeting' },
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false, takenBy: 'Training' },
      { time: '13:00', available: true },
      { time: '14:00', available: true },
    ],
  },
  {
    date: '2026-04-07',
    label: 'Tue 07.04.',
    slots: [
      { time: '08:00', available: true },
      { time: '09:00', available: true },
      { time: '10:00', available: false, takenBy: 'Staff meeting' },
      { time: '11:00', available: true },
      { time: '13:00', available: true },
      { time: '14:00', available: false },
    ],
  },
  {
    date: '2026-04-08',
    label: 'Wed 08.04.',
    slots: [
      { time: '08:00', available: false },
      { time: '09:00', available: false },
      { time: '10:00', available: false },
      { time: '11:00', available: false },
      { time: '13:00', available: false },
      { time: '14:00', available: false },
    ],
  },
  {
    date: '2026-04-09',
    label: 'Thu 09.04.',
    slots: [
      { time: '08:00', available: true },
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '13:00', available: true },
      { time: '14:00', available: true },
    ],
  },
]

/* Photos are drawn as an SVG data URI so the catalog doesn't depend on the network. */
function placeholder(label: string, hue: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="hsl(${hue} 32% 88%)"/><text x="320" y="215" font-family="sans-serif" font-size="26" fill="hsl(${hue} 40% 35%)" text-anchor="middle">${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const IMAGES = [
  { src: placeholder('Item — front side', 205), alt: 'Front side', caption: 'Toner HP 26A — front of packaging' },
  { src: placeholder('Label with code', 180), alt: 'Label', caption: 'Label with code and serial number' },
  { src: placeholder('Damaged in transit', 10), alt: 'Damage', caption: 'Evidence for the stock correction report' },
  { src: placeholder('Location in the warehouse', 145), alt: 'Location', caption: 'Rack C, shelf 3' },
]

function BookingDemo() {
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null)

  return (
    <SlotPicker
      days={BOOKING_DAYS}
      value={slot}
      onChange={setSlot}
      resourceLabel="Meeting room — floor 2"
      duration="60 min"
      onConfirm={() => {}}
    />
  )
}

/*
 * The board holds no state, so the demo does: it performs the move and hands the
 * new columns back. That is exactly what an application does, which is why the
 * demo is written this way rather than with fixed data.
 */
const INITIAL_KANBAN: KanbanColumn[] = [
  {
    id: 'nacrt',
    label: { en: 'Draft' },
    tone: 'neutral',
    cards: [
      { id: '1', title: 'Invoice 2026-0421', subtitle: 'Officedirect d.o.o.', meta: '61.080,00 RSD' },
      { id: '2', title: 'Invoice 2026-0422', subtitle: 'Nimbus Tech d.o.o.', meta: '124.500,00 RSD' },
    ],
  },
  {
    id: 'overa',
    label: { en: 'Under verification' },
    tone: 'info',
    /* Three at a time. A column of forty "in progress" means nothing is. */
    limit: 3,
    cards: [
      { id: '3', title: 'Invoice 2026-0418', subtitle: 'Delta Gradnja d.o.o.', meta: '9.400,00 RSD', tone: 'info' },
      { id: '4', title: 'Invoice 2026-0419', subtitle: 'Kopernikus d.o.o.', meta: '340.900,00 RSD', tone: 'info' },
    ],
  },
  {
    id: 'potpis',
    label: { en: 'For signature' },
    tone: 'warning',
    limit: 2,
    cards: [
      { id: '5', title: 'Invoice 2026-0415', subtitle: 'Vega Logistika d.o.o.', meta: '78.200,00 RSD', tone: 'warning' },
    ],
  },
  {
    id: 'proknjizeno',
    label: { en: 'Posted' },
    tone: 'success',
    cards: [
      { id: '6', title: 'Invoice 2026-0410', subtitle: 'Officedirect d.o.o.', meta: '42.180,00 RSD', tone: 'success' },
      { id: '7', title: 'Invoice 2026-0411', subtitle: 'Nimbus Tech d.o.o.', meta: '18.900,00 RSD', tone: 'success' },
    ],
  },
]

function KanbanDemo() {
  const [columns, setColumns] = useState(INITIAL_KANBAN)

  const move = (cardId: string, toColumnId: string) => {
    setColumns((current) => {
      const card = current.flatMap((column) => column.cards).find((item) => item.id === cardId)
      if (!card) return current

      return current.map((column) => {
        if (column.id === toColumnId) return { ...column, cards: [...column.cards, card] }
        return { ...column, cards: column.cards.filter((item) => item.id !== cardId) }
      })
    })
  }

  return <KanbanBoard columns={columns} onMove={move} height={440} />
}

export const operationsCategories: CatalogCategory[] = [
  {
    slug: 'stock',
    title: 'Stock movements',
    description: 'Receipts, issues, transfers and stocktakes with a balance — warehouse, equipment, raw materials, archive.',
    group: 'blocks',
    icon: Boxes,
    entries: [
      {
        id: 'stock-ledger',
        title: 'Stock ledger card',
        description: 'The balance comes from the server — the only correct balance is the one the database computed.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Stack gap={0} p="md">
            <StockLedger movements={MOVEMENTS} itemLabel="Toner HP 26A crni" unit="pcs" />
          </Stack>
        ),
        code: `<StockLedger
  movements={movements}
  itemLabel={item.name}
  unit={item.unit}
/>`,
      },
      {
        id: 'stock-gallery',
        title: 'Photos attached to an item',
        description: 'Item, room, equipment, a sample in quality control — the same view.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <ItemGallery images={IMAGES} />
            <Stack gap="sm">
              <Text size="sm">
                Thumbnails sit below the main image, not beside it. On a narrow screen a side strip
                cuts the main image in half — and that image is the whole reason the gallery gets
                opened.
              </Text>
              <Text size="sm">
                An empty state does not leave a hole in the layout — it says there is no photo.
              </Text>
              <ItemGallery images={[]} height={120} />
            </Stack>
          </SimpleGrid>
        ),
        code: `<ItemGallery images={item.photos} height={280} />`,
      },
    ],
  },

  {
    slug: 'pricing',
    title: 'Price list and rates',
    description: 'A matrix where the row carries the item and the column carries the condition — quantity, period, category, channel.',
    group: 'blocks',
    icon: Tags,
    entries: [
      {
        id: 'rate-quantity',
        title: 'Prices by quantity',
        description: 'An empty cell is a dash, not a zero. Zero is a price, a dash is the absence of a price.',
        from: '@liro/ui',
        demo: (
          <RateTable
            columns={[
              { id: 't1', label: '1–9', caption: 'pcs' },
              { id: 't2', label: '10–49', caption: 'pcs' },
              { id: 't3', label: '50+', caption: 'pcs' },
            ]}
            rows={[
              { id: '1', label: 'Toner HP 26A', detail: 'Code 10042', prices: { t1: 8450, t2: 7890, t3: 7240 } },
              { id: '2', label: 'Papir A4 80g', detail: 'Ream of 500 sheets', prices: { t1: 489.9, t2: 449.5, t3: 412 } },
              { id: '3', label: 'Water dispenser', detail: 'Monthly rental', prices: { t1: 2200, t2: 2000, t3: null } },
            ]}
            footnote={{ en: 'Prices exclude VAT, valid from 01.04.2026.' }}
          />
        ),
        code: `<RateTable columns={tiers} rows={items} footnote={{ en: 'Prices exclude VAT.' }} />`,
      },
      {
        id: 'rate-season',
        title: 'Prices by period and category',
        description: 'The same component, a different configuration — accommodation by season and room type.',
        from: '@liro/ui',
        demo: (
          <RateTable
            columns={[
              { id: 'low', label: 'Off-season', caption: '01.11 – 31.03' },
              { id: 'mid', label: 'Shoulder season', caption: '01.04 – 14.06' },
              { id: 'high', label: 'Peak season', caption: '15.06 – 31.08' },
            ]}
            rows={[
              { id: '1', label: 'Single room', detail: 'Overnight with breakfast', prices: { low: 5400, mid: 6800, high: 9200 } },
              { id: '2', label: 'Double room', detail: 'Overnight with breakfast', prices: { low: 7900, mid: 9600, high: 13400 }, highlighted: true },
              { id: '3', label: 'Apartment', detail: 'Up to four people', prices: { low: 12800, mid: 15900, high: 21500 } },
              { id: '4', label: 'Extra bed', prices: { low: 1800, mid: 1800, high: 2400 } },
            ]}
            footnote={{ en: 'Tourist tax is charged separately.' }}
          />
        ),
      },
    ],
  },

  {
    slug: 'booking',
    title: 'Resource booking',
    description: 'A room, a machine, an advisor, a workstation — picking a free interval on a resource.',
    group: 'blocks',
    icon: CalendarCheck,
    entries: [
      {
        id: 'slot-picker',
        title: 'Slot selection',
        description: 'Availability comes from the server — computing it on the client would allow double booking.',
        from: '@liro/ui',
        demo: <BookingDemo />,
        code: `<SlotPicker
  days={availability}
  value={slot}
  onChange={setSlot}
  resourceLabel={resource.name}
  duration="60 min"
  onConfirm={book}
/>`,
      },
      {
        id: 'booking-calendar',
        title: 'Occupancy overview',
        description: 'For a full-month overview, the calendar from @liro/schedule is used.',
        from: '@liro/schedule',
        demo: (
          <Stack gap="xs">
            <Text size="sm">
              <code>SlotPicker</code> is for picking a single slot; <code>LiroSchedule</code> is for
              an overview of resource occupancy across a week or month. See the <code>Calendar</code> category.
            </Text>
            <StatusBadge tone="info" label="Two components, two questions" />
          </Stack>
        ),
      },
    ],
  },

  {
    slug: 'process',
    title: 'Process diagram',
    description: 'Steps, branches and paths on top of React Flow — panning, zooming, a minimap.',
    group: 'blocks',
    icon: Workflow,
    entries: [
      {
        id: 'process-diagram',
        title: 'Process with a decision',
        description: 'Coordinates are not written by hand — buildProcess derives them from the step descriptions.',
        from: '@liro/process',
        wide: true,
        demo: (
          <ProcessDiagram
            {...buildProcess(ORDER_PROCESS)}
            height={420}
            withMiniMap
          />
        ),
        code: `const { nodes, edges } = buildProcess([
  { id: 'start', label: 'Request received', kind: 'start', next: 'check' },
  { id: 'check', label: 'Stock check', kind: 'task', lane: 'Sales', next: 'decision' },
  {
    id: 'decision', label: 'In stock?', kind: 'decision', active: true,
    branches: [{ label: 'yes', to: 'pick' }, { label: 'no', to: 'order' }],
  },
])

<ProcessDiagram nodes={nodes} edges={edges} withMiniMap />`,
      },
      {
        id: 'process-editable',
        title: 'Process editor',
        description: 'With editable, nodes can be dragged and connections drawn — for tuning the flow.',
        from: '@liro/process',
        wide: true,
        demo: <ProcessDiagram {...buildProcess(APPROVAL_PROCESS)} height={320} editable />,
      },
      {
        id: 'process-scope',
        title: 'What this deliberately is not',
        demo: (
          <Stack gap="sm">
            <Text size="sm">
              This <strong>is not</strong> full BPMN with pools, events and messages. What is covered
              is the reason a diagram gets drawn in a business application at all: who does what,
              where the branches are, and where a record currently stands.
            </Text>
            <Text size="sm">
              A node takes <code>kind</code>, not <code>style</code> — the same rule as a button that
              takes <code>intent</code>. Color and shape are a consequence of meaning.
            </Text>
          </Stack>
        ),
      },
      {
        id: 'kanban-board',
        title: 'Kanban board',
        description:
          'Drag the handle on the left, or open the menu on the right. The menu is not a fallback — dragging does not exist for the keyboard or a screen reader, and the menu is visible. The „Under verification" and „For signature" columns have a limit.',
        from: '@liro/ui',
        wide: true,
        demo: <KanbanDemo />,
        code: `<KanbanBoard
      columns={columns}
      onMove={(cardId, toColumnId) => updateStatus(cardId, toColumnId)}
    />`,
      },
    ],
  },
]

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
  { id: 'start', label: 'Zahtev primljen', kind: 'start', lane: 'Komercijala', done: true, next: 'check' },
  { id: 'check', label: 'Provera zaliha', kind: 'task', lane: 'Komercijala', done: true, next: 'decision' },
  {
    id: 'decision',
    label: 'Ima na stanju?',
    kind: 'decision',
    lane: 'Komercijala',
    active: true,
    branches: [
      { label: 'da', to: 'pick' },
      { label: 'ne', to: 'order' },
    ],
  },
  { id: 'pick', label: 'Priprema robe', kind: 'task', lane: 'Magacin', next: 'ship' },
  { id: 'order', label: 'Poručivanje', kind: 'task', lane: 'Nabavka', meta: 'rok 5 dana', next: 'ship' },
  { id: 'ship', label: 'Otprema', kind: 'task', lane: 'Magacin', next: 'invoice' },
  { id: 'invoice', label: 'Fakturisanje', kind: 'system', lane: 'Knjigovodstvo', next: 'end' },
  { id: 'end', label: 'Zatvoreno', kind: 'end', lane: 'Knjigovodstvo' },
]

const APPROVAL_PROCESS: SimpleStep[] = [
  { id: 'a', label: 'Nalog kreiran', kind: 'start', next: 'b' },
  { id: 'b', label: 'Kontrola', kind: 'task', lane: 'Knjigovodstvo', next: 'c' },
  {
    id: 'c',
    label: 'Iznos > 100.000?',
    kind: 'decision',
    branches: [
      { label: 'da', to: 'd' },
      { label: 'ne', to: 'e' },
    ],
  },
  { id: 'd', label: 'Odobrenje direktora', kind: 'task', lane: 'Uprava', next: 'e' },
  { id: 'e', label: 'Isplata', kind: 'end', lane: 'Finansije' },
]

/**
 * Second-layer pattern showcase.
 *
 * Examples are deliberately drawn from different industries - warehouse,
 * hotel, facility management, quality control - to show that it is the same
 * component with a different configuration.
 */

const MOVEMENTS = [
  { id: '1', kind: 'in' as const, date: '01.03.2026.', reference: 'PRM-0142', from: 'Officedirect d.o.o.', to: 'Magacin Zemun', quantity: 240, balance: 240 },
  { id: '2', kind: 'out' as const, date: '04.03.2026.', reference: 'OTP-0318', from: 'Magacin Zemun', to: 'Konfirs d.o.o.', quantity: 60, balance: 180 },
  { id: '3', kind: 'transfer' as const, date: '09.03.2026.', reference: 'PRN-0021', from: 'Magacin Zemun', to: 'Prodavnica Centar', quantity: 40, balance: 180, note: 'Ne menja ukupno stanje' },
  { id: '4', kind: 'out' as const, date: '14.03.2026.', reference: 'OTP-0322', from: 'Prodavnica Centar', to: 'Pekara Sunce', quantity: 25, balance: 155 },
  { id: '5', kind: 'adjustment' as const, date: '20.03.2026.', reference: 'ISP-0004', quantity: 3, balance: 152, note: 'Oštećenje pri transportu' },
  { id: '6', kind: 'count' as const, date: '31.03.2026.', reference: 'POP-2026-Q1', quantity: 152, balance: 152, note: 'Popisom utvrđeno stanje' },
]

const BOOKING_DAYS = [
  {
    date: '2026-04-06',
    label: 'pon 06.04.',
    slots: [
      { time: '08:00', available: false, takenBy: 'Sastanak sa klijentom' },
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false, takenBy: 'Obuka' },
      { time: '13:00', available: true },
      { time: '14:00', available: true },
    ],
  },
  {
    date: '2026-04-07',
    label: 'uto 07.04.',
    slots: [
      { time: '08:00', available: true },
      { time: '09:00', available: true },
      { time: '10:00', available: false, takenBy: 'Kolegijum' },
      { time: '11:00', available: true },
      { time: '13:00', available: true },
      { time: '14:00', available: false },
    ],
  },
  {
    date: '2026-04-08',
    label: 'sre 08.04.',
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
    label: 'čet 09.04.',
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
  { src: placeholder('Artikal — prednja strana', 205), alt: 'Prednja strana', caption: 'Toner HP 26A — prednja strana pakovanja' },
  { src: placeholder('Nalepnica sa šifrom', 180), alt: 'Nalepnica', caption: 'Nalepnica sa šifrom i serijskim brojem' },
  { src: placeholder('Oštećenje pri transportu', 10), alt: 'Oštećenje', caption: 'Dokaz uz zapisnik o ispravci stanja' },
  { src: placeholder('Mesto u magacinu', 145), alt: 'Lokacija', caption: 'Regal C, polica 3' },
]

function BookingDemo() {
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null)

  return (
    <SlotPicker
      days={BOOKING_DAYS}
      value={slot}
      onChange={setSlot}
      resourceLabel="Sala za sastanke — sprat 2"
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
    label: { sr: 'Nacrt' },
    tone: 'neutral',
    cards: [
      { id: '1', title: 'Faktura 2026-0421', subtitle: 'Officedirect d.o.o.', meta: '61.080,00 RSD' },
      { id: '2', title: 'Faktura 2026-0422', subtitle: 'Nimbus Tech d.o.o.', meta: '124.500,00 RSD' },
    ],
  },
  {
    id: 'overa',
    label: { sr: 'Na overi' },
    tone: 'info',
    /* Three at a time. A column of forty "in progress" means nothing is. */
    limit: 3,
    cards: [
      { id: '3', title: 'Faktura 2026-0418', subtitle: 'Delta Gradnja d.o.o.', meta: '9.400,00 RSD', tone: 'info' },
      { id: '4', title: 'Faktura 2026-0419', subtitle: 'Kopernikus d.o.o.', meta: '340.900,00 RSD', tone: 'info' },
    ],
  },
  {
    id: 'potpis',
    label: { sr: 'Za potpis' },
    tone: 'warning',
    limit: 2,
    cards: [
      { id: '5', title: 'Faktura 2026-0415', subtitle: 'Vega Logistika d.o.o.', meta: '78.200,00 RSD', tone: 'warning' },
    ],
  },
  {
    id: 'proknjizeno',
    label: { sr: 'Proknjiženo' },
    tone: 'success',
    cards: [
      { id: '6', title: 'Faktura 2026-0410', subtitle: 'Officedirect d.o.o.', meta: '42.180,00 RSD', tone: 'success' },
      { id: '7', title: 'Faktura 2026-0411', subtitle: 'Nimbus Tech d.o.o.', meta: '18.900,00 RSD', tone: 'success' },
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
    title: 'Kretanje stanja',
    description: 'Ulazi, izlazi, prenosi i popis sa saldom — magacin, oprema, sirovine, arhiva.',
    group: 'blocks',
    icon: Boxes,
    entries: [
      {
        id: 'stock-ledger',
        title: 'Kartica kretanja',
        description: 'Saldo dolazi sa servera — jedini tačan saldo je onaj koji je baza izračunala.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Stack gap={0} p="md">
            <StockLedger movements={MOVEMENTS} itemLabel="Toner HP 26A crni" unit="kom" />
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
        title: 'Fotografije uz stavku',
        description: 'Artikal, prostorija, oprema, uzorak u kontroli kvaliteta — isti prikaz.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <ItemGallery images={IMAGES} />
            <Stack gap="sm">
              <Text size="sm">
                Sličice su ispod glavne slike, ne sa strane. Na uskom ekranu bočni niz odseca glavnu
                sliku na polovinu — a upravo je ona razlog zbog kojeg se galerija otvara.
              </Text>
              <Text size="sm">
                Prazno stanje ne ostavlja rupu u rasporedu nego kaže da fotografija nema.
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
    title: 'Cenovnik i tarife',
    description: 'Matrica gde red nosi stavku a kolona uslov — količina, period, kategorija, kanal.',
    group: 'blocks',
    icon: Tags,
    entries: [
      {
        id: 'rate-quantity',
        title: 'Cene po količini',
        description: 'Prazna ćelija je crtica, ne nula. Nula je cena, crtica je odsustvo cene.',
        from: '@liro/ui',
        demo: (
          <RateTable
            columns={[
              { id: 't1', label: '1–9', caption: 'komada' },
              { id: 't2', label: '10–49', caption: 'komada' },
              { id: 't3', label: '50+', caption: 'komada' },
            ]}
            rows={[
              { id: '1', label: 'Toner HP 26A', detail: 'Šifra 10042', prices: { t1: 8450, t2: 7890, t3: 7240 } },
              { id: '2', label: 'Papir A4 80g', detail: 'Ris od 500 listova', prices: { t1: 489.9, t2: 449.5, t3: 412 } },
              { id: '3', label: 'Dispenzer za vodu', detail: 'Mesečni zakup', prices: { t1: 2200, t2: 2000, t3: null } },
            ]}
            footnote={{ sr: 'Cene bez PDV-a, važe od 01.04.2026.' }}
          />
        ),
        code: `<RateTable columns={tiers} rows={items} footnote={{ sr: 'Cene bez PDV-a.' }} />`,
      },
      {
        id: 'rate-season',
        title: 'Cene po periodu i kategoriji',
        description: 'Ista komponenta, druga konfiguracija — smeštaj po sezoni i tipu sobe.',
        from: '@liro/ui',
        demo: (
          <RateTable
            columns={[
              { id: 'low', label: 'Van sezone', caption: '01.11 – 31.03' },
              { id: 'mid', label: 'Prelazna', caption: '01.04 – 14.06' },
              { id: 'high', label: 'Sezona', caption: '15.06 – 31.08' },
            ]}
            rows={[
              { id: '1', label: 'Jednokrevetna', detail: 'Noćenje sa doručkom', prices: { low: 5400, mid: 6800, high: 9200 } },
              { id: '2', label: 'Dvokrevetna', detail: 'Noćenje sa doručkom', prices: { low: 7900, mid: 9600, high: 13400 }, highlighted: true },
              { id: '3', label: 'Apartman', detail: 'Do četiri osobe', prices: { low: 12800, mid: 15900, high: 21500 } },
              { id: '4', label: 'Dodatni ležaj', prices: { low: 1800, mid: 1800, high: 2400 } },
            ]}
            footnote={{ sr: 'Boravišna taksa se naplaćuje posebno.' }}
          />
        ),
      },
    ],
  },

  {
    slug: 'booking',
    title: 'Rezervacija resursa',
    description: 'Sala, mašina, savetnik, radno mesto — izbor slobodnog intervala nad resursom.',
    group: 'blocks',
    icon: CalendarCheck,
    entries: [
      {
        id: 'slot-picker',
        title: 'Izbor termina',
        description: 'Dostupnost stiže sa servera — računanje na klijentu bi dozvolilo dvostruko zakazivanje.',
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
        title: 'Pregled zauzeća',
        description: 'Za pregled celog meseca koristi se kalendar iz @liro/schedule.',
        from: '@liro/schedule',
        demo: (
          <Stack gap="xs">
            <Text size="sm">
              <code>SlotPicker</code> je za izbor jednog termina; <code>LiroSchedule</code> je za
              pregled zauzeća resursa kroz nedelju ili mesec. Vidi kategoriju <code>Kalendar</code>.
            </Text>
            <StatusBadge tone="info" label="Dve komponente, dva pitanja" />
          </Stack>
        ),
      },
    ],
  },

  {
    slug: 'process',
    title: 'Dijagram procesa',
    description: 'Koraci, grananja i staze nad React Flow-om — pomeranje, zumiranje, mapa.',
    group: 'blocks',
    icon: Workflow,
    entries: [
      {
        id: 'process-diagram',
        title: 'Proces sa odlukom',
        description: 'Koordinate se ne pišu — buildProcess ih izvodi iz opisa koraka.',
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
  { id: 'start', label: 'Zahtev primljen', kind: 'start', next: 'check' },
  { id: 'check', label: 'Provera zaliha', kind: 'task', lane: 'Komercijala', next: 'decision' },
  {
    id: 'decision', label: 'Ima na stanju?', kind: 'decision', active: true,
    branches: [{ label: 'da', to: 'pick' }, { label: 'ne', to: 'order' }],
  },
])

<ProcessDiagram nodes={nodes} edges={edges} withMiniMap />`,
      },
      {
        id: 'process-editable',
        title: 'Urednik procesa',
        description: 'Sa editable čvorovi se pomeraju i veze se povlače — za podešavanje toka.',
        from: '@liro/process',
        wide: true,
        demo: <ProcessDiagram {...buildProcess(APPROVAL_PROCESS)} height={320} editable />,
      },
      {
        id: 'process-scope',
        title: 'Šta ovo namerno nije',
        demo: (
          <Stack gap="sm">
            <Text size="sm">
              Ovo <strong>nije</strong> pun BPMN sa bazenima, događajima i porukama. Pokriveno je ono
              zbog čega se dijagram u poslovnoj aplikaciji crta: ko šta radi, gde su grananja i gde
              je zapis trenutno.
            </Text>
            <Text size="sm">
              Čvor prima <code>kind</code>, ne <code>style</code> — isto pravilo kao dugme koje prima
              <code>intent</code>. Boja i oblik su posledica značenja.
            </Text>
          </Stack>
        ),
      },
      {
        id: 'kanban-board',
        title: 'Kanban tabla',
        description:
          'Prevuci hvataljku levo, ili otvori meni desno. Meni nije rezerva — prevlačenje ne postoji za tastaturu ni za čitač ekrana, a meni se vidi. Kolone „Na overi" i „Za potpis" imaju ograničenje.',
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

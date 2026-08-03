'use client'

import { useState } from 'react'
import {
  Accordion,
  SegmentedControl,
  Anchor,
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core'
import {
  Ban,
  Banknote,
  CalendarClock,
  Construction,
  FileQuestion,
  FileStack,
  HelpCircle,
  Layers,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogIn,
  Megaphone,
  MessageSquare,
  Newspaper,
  Palette,
  PenLine,
  Receipt,
  ServerCrash,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react'
import { liroVar, palette, radius, shadow, spacing, INTENT_FAMILY_COLOR } from '@liro/tokens'
import {
  ActionButton,
  ActionGroup,
  Callout,
  LiroCarousel,
  LiroCarouselSlide,
  SectionCard,
  StatCard,
  StatusBadge,
} from '@liro/ui'
import {
  ChartCard,
  LiroAreaChart,
  TargetBar,
  LiroCompositeChart,
  LiroFunnelChart,
  LiroHeatmap,
  LiroPieChart,
  LiroRadarChart,
  LiroRadialBarChart,
  LiroSankeyChart,
  LiroScatterChart,
  LiroSunburstChart,
  LiroTreemap,
  LiroBarChart,
  LiroBarsList,
  LiroDonutChart,
  LiroLineChart,
  LiroSparkline,
} from '@liro/charts'
import { LiroSchedule } from '@liro/schedule'
import { MessageBubble, MessageThread, type Message } from '@liro/ui'
import { RichTextField, RichTextView, CodeBlock } from '@liro/editor'
import { AttachmentList, FileDropzone } from '@liro/files'
import type { CatalogCategory } from '../types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']

const PAYROLL = MONTHS.map((month, index) => ({
  month,
  neto: 2_640_000 + index * 48_000,
  porezi: 1_120_000 + index * 21_000,
  doprinosi: 980_000 + index * 18_500,
}))

const CASHFLOW = MONTHS.map((month, index) => ({
  month,
  prilivi: 5_800_000 + index * 120_000,
  odlivi: 4_950_000 + index * 108_000,
}))

const STRUCTURE = [
  { name: 'Neto zarade', value: 2_640_000 },
  { name: 'Porez na zarade', value: 1_120_000 },
  { name: 'Doprinosi PIO', value: 780_000 },
  { name: 'Doprinosi zdravstvo', value: 340_000 },
]

const TOP_CLIENTS = [
  { label: 'Officedirect d.o.o.', value: 4_128_500 },
  { label: 'Konfirs d.o.o.', value: 3_310_000 },
  { label: 'Pekara Sunce', value: 1_842_300 },
  { label: 'Termo inženjering', value: 1_204_000 },
]

const EVENTS = [
  { id: '1', title: 'PPP-PD za mart', start: '2026-04-05 09:00:00', end: '2026-04-05 17:00:00', kind: 'deadline' as const, allDay: true },
  { id: '2', title: 'Obračun zarada', start: '2026-04-02 09:00:00', end: '2026-04-03 17:00:00', kind: 'payroll' as const },
  { id: '3', title: 'Slanje u SEF', start: '2026-04-08 10:00:00', end: '2026-04-08 12:00:00', kind: 'filing' as const },
  { id: '4', title: 'PDV — I kvartal', start: '2026-04-15 09:00:00', end: '2026-04-15 17:00:00', kind: 'deadline' as const, allDay: true },
]

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<PodaciPoreskePrijave>
  <PodaciOPrijavi>
    <VrstaPrijave>1</VrstaPrijave>
    <ObracunskiPeriod>2026-03</ObracunskiPeriod>
  </PodaciOPrijavi>
</PodaciPoreskePrijave>`

function EditorDemo() {
  const [value, setValue] = useState(
    '<p>Ugovor se produžava <strong>automatski</strong> ako nijedna strana ne dostavi obaveštenje o raskidu.</p><ul><li>Rok plaćanja: 30 dana</li></ul>',
  )
  return (
    <Stack gap="md">
      <RichTextField value={value} onChange={setValue} label={{ sr: 'Napomena uz ugovor' }} />
      <SectionCard title={{ sr: 'Prikaz sačuvanog teksta' }}>
        <RichTextView value={value} />
      </SectionCard>
    </Stack>
  )
}

function FilesDemo() {
  const [files, setFiles] = useState<{ path: string; size?: number }[]>([
    { path: 'izvodi/2026-03-izvod-042.pdf', size: 184_320 },
    { path: 'prijave/ppp-pd-2026-03.xml', size: 21_504 },
  ])

  return (
    <Stack gap="md">
      <FileDropzone
        onUploaded={(uploaded) => setFiles((current) => [...current, ...uploaded])}
        maxSize={10 * 1024 * 1024}
        description={{ sr: 'PDF, XML i Excel — izvodi, prijave i prilozi' }}
      />
      <AttachmentList files={files} onRemove={(path) => setFiles((c) => c.filter((f) => f.path !== path))} />
    </Stack>
  )
}

const INITIAL_MESSAGES: Message[] = [
  { id: '1', author: { id: 'ana', name: 'Ana Jovanović' }, text: 'Poslala sam izvod za mart, nedostaje jedna uplata.', time: '09:12' },
  { id: '2', author: { id: 'ana', name: 'Ana Jovanović' }, text: 'Iznos je 42.180,00 RSD.', time: '09:12' },
  { id: '3', author: { id: 'me', name: 'Ja' }, text: 'Proverio sam — uplata je knjižena 02.04.', time: '09:20', own: true, status: 'read' },
  { id: '4', author: { id: 'ana', name: 'Ana Jovanović' }, text: 'Odlično, hvala. Zatvaram nalog.', time: '09:21' },
]

function MessagesDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)

  return (
    <MessageThread
      messages={messages}
      height={340}
      onSend={(text) =>
        setMessages((current) => [
          ...current,
          {
            id: String(current.length + 1),
            author: { id: 'me', name: 'Ja' },
            text,
            time: new Date().toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' }),
            own: true,
            status: 'sent',
          },
        ])
      }
    />
  )
}

function ScheduleDemo() {
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('month')

  return (
    /* Bez sopstvenog prekidaca pogleda - `Schedule` vec ima svoj u zaglavlju,
       pa su se dva reda dugmadi preklapala. */
    <Stack gap="md" p="md">
      <LiroSchedule events={EVENTS} date="2026-04-10" view={view} onViewChange={(next) => setView(next as typeof view)} readOnly height={560} />
    </Stack>
  )
}

/*
 * Zbir ide ispod tabele, ne pored nje.
 *
 * Oko cita stavke odozgo nadole i zaustavlja se na ukupnom iznosu; kada zbir
 * stoji desno, pogled mora da skoci u stranu pa da se vrati.
 */
function TotalsBlock() {
  return (
    <Stack gap="md">
      <Box>
        <Table fz="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Opis</Table.Th>
              <Table.Th ta="right">Količina</Table.Th>
              <Table.Th ta="right">Vrednost</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td>Toner HP 26A</Table.Td>
              <Table.Td ta="right" data-numeric>12</Table.Td>
              <Table.Td ta="right" data-numeric>101.400,00</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td>Papir A4 80g</Table.Td>
              <Table.Td ta="right" data-numeric>200</Table.Td>
              <Table.Td ta="right" data-numeric>97.980,00</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Box>
      <Group justify="flex-end">
        <Stack gap={6} w={{ base: '100%', sm: 300 }}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Osnovica</Text>
            <Text size="sm" data-numeric>199.380,00 RSD</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">PDV 20%</Text>
            <Text size="sm" data-numeric>39.876,00 RSD</Text>
          </Group>
          <Box style={{ borderTop: `1px solid ${liroVar.border.default}`, paddingTop: 6 }}>
            <Group justify="space-between">
              <Text fw={700}>Za uplatu</Text>
              <Text fw={700} data-numeric>239.256,00 RSD</Text>
            </Group>
          </Box>
        </Stack>
      </Group>
    </Stack>
  )
}

export const otherCategories: CatalogCategory[] = [
  // ---------- BLOKOVI ----------
  {
    slug: 'content-blocks',
    title: 'Tekst i prilozi',
    description: 'Bogati tekst, prikaz koda i prevlačenje fajlova.',
    group: 'blocks',
    icon: PenLine,
    entries: [
      {
        id: 'rich-text',
        title: 'Bogati tekst',
        description: 'Kratka traka alata: bez boja, veličina i pisama.',
        from: '@liro/editor',
        demo: <EditorDemo />,
        code: `<RichTextField value={note} onChange={setNote} label={{ sr: 'Napomena' }} />
<RichTextView value={note} />`,
      },
      {
        id: 'code-block',
        title: 'Prikaz koda i XML-a',
        description: 'Poreske prijave, odgovori SEF-a, dnevnik integracija.',
        from: '@liro/editor',
        demo: <CodeBlock code={SAMPLE_XML} language="xml" maxHeight={220} />,
        code: `<CodeBlock code={filingXml} language="xml" />`,
      },
      {
        id: 'attachments',
        title: 'Prilozi',
        description: 'Otpremanje ide redom, ne paralelno.',
        from: '@liro/files',
        demo: <FilesDemo />,
        code: `<FileDropzone onUploaded={add} maxSize={10 * 1024 * 1024} />
<AttachmentList files={files} onRemove={remove} />`,
      },
    ],
  },
  {
    slug: 'summary-blocks',
    title: 'Zbirni blokovi',
    description: 'Delovi koji se ponavljaju na dnu i na vrhu dokumenata.',
    group: 'blocks',
    icon: Layers,
    entries: [
      {
        id: 'totals',
        title: 'Stavke i obračun',
        description: 'Tabularne cifre poravnavaju decimale po koloni.',
        demo: <TotalsBlock />,
      },
      {
        id: 'metric-carousel',
        title: 'Kartice u vodoravnoj listi',
        description: 'Da na uskom ekranu stane red brojki bez skrola cele stranice.',
        from: '@liro/ui',
        demo: (
          <LiroCarousel slideSize={{ base: '80%', sm: '45%', md: '30%' }}>
            {[
              { title: { sr: 'Zaposlenih' }, value: 47 },
              { title: { sr: 'Klijenata' }, value: 12 },
              { title: { sr: 'Dokumenata' }, value: 318 },
              { title: { sr: 'Obračuna' }, value: 24 },
              { title: { sr: 'Priloga' }, value: 1204 },
            ].map((stat, index) => (
              <LiroCarouselSlide key={index}>
                <StatCard {...stat} />
              </LiroCarouselSlide>
            ))}
          </LiroCarousel>
        ),
        code: `<LiroCarousel slideSize={{ base: '80%', md: '30%' }}>
  {stats.map((stat) => (
    <LiroCarouselSlide key={stat.id}><StatCard {...stat} /></LiroCarouselSlide>
  ))}
</LiroCarousel>`,
      },
    ],
  },

  // ---------- GRAFIKONI ----------
  {
    slug: 'charts',
    title: 'Grafikoni',
    description: 'Boje serija iz Liro palete, iznosi kroz formatDecimal.',
    group: 'charts',
    icon: TrendingUp,
    entries: [
      {
        id: 'bar-chart',
        title: 'Stubičasti — struktura po mesecima',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ sr: 'Masa zarada' }} period="2026." icon={Banknote} height={280}>
            <LiroBarChart
              data={PAYROLL}
              dataKey="month"
              type="stacked"
              currency="RSD"
              series={[
                { name: 'neto', label: 'Neto zarade' },
                { name: 'porezi', label: 'Porezi' },
                { name: 'doprinosi', label: 'Doprinosi' },
              ]}
            />
          </ChartCard>
        ),
        code: `<ChartCard title={{ sr: 'Masa zarada' }} period="2026.">
  <LiroBarChart
    data={data}
    dataKey="month"
    type="stacked"
    currency="RSD"
    series={[{ name: 'neto', label: 'Neto zarade' }]}
  />
</ChartCard>`,
      },
      {
        id: 'area-line',
        title: 'Površinski i linijski',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ sr: 'Prilivi i odlivi' }} icon={TrendingUp}>
              <LiroAreaChart
                data={CASHFLOW}
                dataKey="month"
                currency="RSD"
                curveType="monotone"
                series={[{ name: 'prilivi', label: 'Prilivi' }, { name: 'odlivi', label: 'Odlivi' }]}
              />
            </ChartCard>
            <ChartCard title={{ sr: 'Kretanje neto zarada' }}>
              <LiroLineChart
                data={PAYROLL}
                dataKey="month"
                currency="RSD"
                curveType="monotone"
                withDots
                series={[{ name: 'neto', label: 'Neto zarade' }]}
              />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'donut-bars',
        title: 'Prstenasti i vodoravne trake',
        description: 'Trake su čitljivije od pite kada ima više od pet stavki.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ sr: 'Struktura troška rada' }} icon={Wallet}>
              <LiroDonutChart data={STRUCTURE} currency="RSD" centerLabel="Mart" size={200} />
            </ChartCard>
            <ChartCard title={{ sr: 'Najveći klijenti' }} height={240}>
              <LiroBarsList data={TOP_CLIENTS} currency="RSD" labelLabel="Klijent" valueLabel="Promet" />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'sparkline',
        title: 'Sparkline uz brojku',
        description: 'Isti podaci, različita boja — invert kaže da rast troška nije dobra vest.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Stack gap={4}>
              <Text size="xs" fw={600} c="dimmed">PRIHOD</Text>
              <Text size="lg" fw={700} data-numeric>3.612.400 RSD</Text>
              <LiroSparkline data={[12, 15, 14, 19, 22, 26, 31, 36]} trend />
            </Stack>
            <Stack gap={4}>
              <Text size="xs" fw={600} c="dimmed">TROŠAK</Text>
              <Text size="lg" fw={700} data-numeric>2.180.900 RSD</Text>
              <LiroSparkline data={[12, 15, 14, 19, 22, 26, 31, 36]} trend invert />
            </Stack>
            <Stack gap={4}>
              <Text size="xs" fw={600} c="dimmed">DOCNJA</Text>
              <Text size="lg" fw={700} data-numeric>412.300 RSD</Text>
              <LiroSparkline data={[36, 33, 29, 27, 22, 19, 17, 14]} trend invert />
            </Stack>
          </SimpleGrid>
        ),
        code: `<LiroSparkline data={monthlyCost} trend invert />`,
      },
    ],
  },
  {
    slug: 'charts-advanced',
    title: 'Ostali grafikoni',
    description: 'Dvanaest tipova koji se koriste ređe, ali kad zatrebaju nema zamene.',
    group: 'charts',
    icon: Layers,
    entries: [
      {
        id: 'composite',
        title: 'Kombinovani — veličina i trend',
        description: 'Promet u stubićima, marža linijom, na istom prikazu.',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ sr: 'Promet i marža' }} period="2026." height={280}>
            <LiroCompositeChart
              data={CASHFLOW.map((row, index) => ({ ...row, marza: 12 + (index % 5) }))}
              dataKey="month"
              series={[
                { name: 'prilivi', label: 'Prilivi', type: 'bar' },
                { name: 'marza', label: 'Marža %', type: 'line' },
              ]}
            />
          </ChartCard>
        ),
      },
      {
        id: 'pie-funnel',
        title: 'Pita i levak',
        description: 'Levak pokazuje koliko od ponuda stigne do naplate.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ sr: 'Udeo po vrsti dokumenta' }} height={260}>
              <LiroPieChart data={STRUCTURE} currency="RSD" size={190} />
            </ChartCard>
            <ChartCard title={{ sr: 'Od ponude do naplate' }} height={260}>
              <LiroFunnelChart
                data={[
                  { name: 'Ponude', value: 240 },
                  { name: 'Predračuni', value: 168 },
                  { name: 'Fakture', value: 121 },
                  { name: 'Naplaćeno', value: 94 },
                ]}
                height={200}
              />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'radar-radial',
        title: 'Radar i prstenaste trake',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ sr: 'Ocena klijenta' }} height={280}>
              <LiroRadarChart
                data={[
                  { kriterijum: 'Rok plaćanja', ocena: 82 },
                  { kriterijum: 'Obim', ocena: 64 },
                  { kriterijum: 'Marža', ocena: 71 },
                  { kriterijum: 'Uredna dokumentacija', ocena: 90 },
                  { kriterijum: 'Komunikacija', ocena: 77 },
                ]}
                dataKey="kriterijum"
                series={[{ name: 'ocena', label: 'Ocena' }]}
              />
            </ChartCard>
            <ChartCard title={{ sr: 'Ispunjenje plana po timovima' }} height={280}>
              <LiroRadialBarChart
                data={[
                  { name: 'Prodaja', value: 92 },
                  { name: 'Knjigovodstvo', value: 78 },
                  { name: 'Podrška', value: 64 },
                ]}
              />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'scatter-bubble',
        title: 'Raspršenost i mehurići',
        description: 'Odnos dve veličine — iznos fakture naspram dana docnje.',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ sr: 'Iznos naspram docnje' }} height={300}>
            <LiroScatterChart
              data={[
                {
                  name: 'Fakture',
                  data: Array.from({ length: 28 }, (_, index) => ({
                    iznos: 20_000 + (index % 13) * 18_400,
                    docnja: (index % 9) * 7,
                  })),
                },
              ]}
              dataKey={{ x: 'iznos', y: 'docnja' }}
              xAxisLabel="Iznos"
              yAxisLabel="Dana docnje"
            />
          </ChartCard>
        ),
      },
      {
        id: 'target-bar',
        title: 'Plan naspram ostvarenja',
        description: 'Boju nosi odstupanje od cilja — zone su tihe jer su kontekst, ne podatak.',
        from: '@liro/charts',
        demo: (
          <Stack gap="lg">
            <TargetBar label="Promet" value={4_128_500} target={4_500_000} currency="RSD" />
            <TargetBar label="Naplata" value={3_612_400} target={3_400_000} currency="RSD" />
            <TargetBar
              label="Troškovi"
              value={2_180_900}
              target={1_950_000}
              currency="RSD"
              invert
              caption="Budžet"
            />
            <TargetBar label="Novi klijenti" value={7} target={10} unit="kom" size="sm" />
          </Stack>
        ),
        code: `<TargetBar label="Promet" value={actual} target={plan} currency="RSD" />
<TargetBar label="Troškovi" value={cost} target={budget} currency="RSD" invert />`,
      },
      {
        id: 'heatmap',
        title: 'Toplotna mapa po danima',
        description: 'Broj unetih dokumenata kroz godinu — vidi se ritam rada.',
        from: '@liro/charts',
        demo: (
          <LiroHeatmap
            startDate="2025-06-01"
            endDate="2026-04-30"
            data={Object.fromEntries(
              Array.from({ length: 220 }, (_, index) => {
                const date = new Date(Date.UTC(2025, 5, 1 + index))
                return [date.toISOString().slice(0, 10), (index * 7) % 13]
              }),
            )}
          />
        ),
      },
      {
        id: 'treemap-sunburst',
        title: 'Treemap i prstenasta hijerarhija',
        description: 'Struktura troškova gde je površina udeo; konta po klasama i grupama.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ sr: 'Struktura troškova' }} height={300}>
              <LiroTreemap
                data={[
                  { name: 'Zarade', value: 4_128_500 },
                  { name: 'Materijal', value: 1_842_300 },
                  { name: 'Usluge', value: 1_204_000 },
                  { name: 'Zakup', value: 918_700 },
                  { name: 'Ostalo', value: 412_300 },
                ]}
                height={240}
              />
            </ChartCard>
            <ChartCard title={{ sr: 'Konta po klasama' }} height={300}>
              <LiroSunburstChart
                data={[
                  { name: '4 — Obaveze', children: [{ name: '43', value: 1_200_000 }, { name: '45', value: 860_000 }] },
                  { name: '2 — Zalihe', children: [{ name: '20', value: 740_000 }, { name: '21', value: 310_000 }] },
                ]}
                size={230}
              />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'sankey',
        title: 'Tok vrednosti',
        description: 'Od priliva do rasporeda po troškovima.',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ sr: 'Raspored priliva' }} height={340}>
            <LiroSankeyChart
              data={{
                nodes: [
                  { name: 'Prilivi' },
                  { name: 'Zarade' },
                  { name: 'Dobavljači' },
                  { name: 'Porezi' },
                  { name: 'Dobit' },
                ],
                links: [
                  { source: 0, target: 1, value: 4_128_500 },
                  { source: 0, target: 2, value: 2_460_000 },
                  { source: 0, target: 3, value: 1_180_000 },
                  { source: 0, target: 4, value: 940_000 },
                ],
              }}
              height={280}
            />
          </ChartCard>
        ),
      },
    ],
  },
  {
    slug: 'schedule',
    title: 'Kalendar',
    description: 'Vrsta događaja bira boju — zakonski rok je jedini pun blok.',
    group: 'charts',
    icon: CalendarClock,
    entries: [
      {
        id: 'liro-schedule',
        title: 'Kalendar obračuna i rokova',
        description: 'Četiri pogleda: dan, nedelja, mesec, godina. Na telefonu se mesečni prikaz sam prilagodi.',
        from: '@liro/schedule',
        wide: true,
        demo: <ScheduleDemo />,
        code: `<LiroSchedule
  events={[{ id: '1', title: 'PPP-PD', start, end, kind: 'deadline', rrule: 'FREQ=MONTHLY;BYMONTHDAY=5' }]}
  defaultView="month"
/>`,
      },
    ],
  },

  // ---------- PRIMERI ----------
  {
    slug: 'app-screens',
    title: 'Radni ekrani',
    description: 'Cele stranice. Izaberete jednu, uvezete je i radi.',
    group: 'examples',
    icon: LayoutDashboard,
    entries: [
      {
        id: 'launchpad',
        title: 'Ulazna tabla — pločice',
        description: 'Početna strana nije meni nego mreža pločica sa brojkom koja govori ima li tamo posla.',
        from: '@liro/ui',
        fullScreenHref: '/examples/launchpad',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><LayoutDashboard size={18} /><Text fw={600}>Launchpad</Text></Group>
            <Text size="sm" c="dimmed">
              Sve pločice rade tastaturom: brojevi 1–9 otvaraju, strelice pomeraju izbor, Enter
              potvrđuje.
            </Text>
          </Stack>
        ),
        code: `<Launchpad
  tiles={[
    { id: 'documents', title: { sr: 'Dokumenti' }, icon: Receipt, href: '/documents',
      value: 11, valueLabel: { sr: 'u docnji' }, tone: 'danger' },
  ]}
  columns={4}
/>`,
      },
      {
        id: 'employees',
        title: 'Zaposlena lica',
        description: 'Spisak sa zbirnim karticama, filterom, pretragom i formom u fioci.',
        from: '@liro/templates',
        fullScreenHref: '/examples/employees',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><Users size={18} /><Text fw={600}>ListPageTemplate + ResourceTable + FormDrawer</Text></Group>
            <Text size="sm" c="dimmed">Otvorite u punoj visini strelicom gore desno.</Text>
          </Stack>
        ),
        code: `<ListPageTemplate title={{ sr: 'Zaposlena lica' }} icon={Users} stats={stats} actions={actions} flush>
  <SectionCard flush>
    <ResourceTable resource="employees" columns={columns} onEdit={setEditing} allowDelete />
  </SectionCard>
</ListPageTemplate>`,
      },
      {
        id: 'documents',
        title: 'Izlazna dokumenta',
        description: 'Isti raspored kao zaposleni — razlikuju se samo kolone i filteri.',
        from: '@liro/templates',
        fullScreenHref: '/examples/documents',
        demo: <Group gap="xs"><Receipt size={18} /><Text fw={600}>ResourceTable + RecordStatusBadge + DueDate</Text></Group>,
      },
      {
        id: 'fiscal-receipts',
        title: 'Fiskalni računi',
        description: 'Spisak koji se čita a ne menja — nema dugmeta za nov unos ni brisanja.',
        from: '@liro/templates',
        fullScreenHref: '/examples/fiscal-receipts',
        demo: <Group gap="xs"><ListChecks size={18} /><Text fw={600}>ResourceTable + PeriodPicker</Text></Group>,
      },
      {
        id: 'notifications',
        title: 'Obaveštenja',
        description: 'Spisak rečenica, ne tabela. Nepročitano se razlikuje težinom teksta i tačkom.',
        from: '@liro/ui',
        fullScreenHref: '/examples/notifications',
        demo: <Group gap="xs"><LayoutDashboard size={18} /><Text fw={600}>ListPageTemplate + SectionCard</Text></Group>,
      },
      {
        id: 'list-page',
        title: 'Spisak — osnovni raspored',
        description: 'Zaglavlje, zbirne kartice, pretraga, tabela, paginacija.',
        from: '@liro/templates',
        fullScreenHref: '/application',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><ListChecks size={18} /><Text fw={600}>ListPageTemplate + ResourceTable</Text></Group>
            <Text size="sm" c="dimmed">Otvorite u punoj visini strelicom gore desno.</Text>
          </Stack>
        ),
        code: `<ListPageTemplate title={{ sr: 'Zaposlena lica' }} icon={Users} stats={stats}>
  <ResourceTable resource="employees" columns={columns} allowDelete />
</ListPageTemplate>`,
      },
      {
        id: 'document-page',
        title: 'Dokument sa stavkama',
        description: 'Stanje, traka radnji koje se otključavaju redom, stavke, obračun, tok.',
        from: '@liro/templates',
        fullScreenHref: '/application/invoice',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><Receipt size={18} /><Text fw={600}>DetailPageTemplate + SectionCard</Text></Group>
            <Text size="sm" c="dimmed">Najkompletniji primer u katalogu.</Text>
          </Stack>
        ),
      },
      {
        id: 'account-page',
        title: 'Nalog i sigurnost',
        description: 'Profil, lozinka, dvofaktorna potvrda, uređaji, greške sa servera, sukob izmena.',
        from: '@liro/ui',
        fullScreenHref: '/account',
        demo: (
          <Group gap="xs"><UserCog size={18} /><Text fw={600}>ProfileCard + TwoFactorCard + SessionsCard</Text></Group>
        ),
      },
      {
        id: 'login-page',
        title: 'Prijava i dvofaktorna potvrda',
        from: '@liro/ui',
        fullScreenHref: '/examples/login',
        demo: <Group gap="xs"><LogIn size={18} /><Text fw={600}>AuthShell + LoginForm + TwoFactorForm</Text></Group>,
      },
    ],
  },
  {
    slug: 'status-screens',
    title: 'Prekinuti ekrani',
    description: 'Da korisnik koji naleti na grešku i dalje vidi proizvod.',
    group: 'examples',
    icon: FileQuestion,
    entries: [
      { id: 'not-found', title: '404 — stranica ne postoji', from: '@liro/templates', fullScreenHref: '/examples/status?screen=notFound', demo: <Group gap="xs"><FileQuestion size={18} /><Text fw={600}>NotFoundTemplate</Text></Group> },
      { id: 'server-error', title: '500 — greška servera', from: '@liro/templates', fullScreenHref: '/examples/status?screen=serverError', demo: <Group gap="xs"><ServerCrash size={18} /><Text fw={600}>ServerErrorTemplate</Text></Group> },
      { id: 'forbidden', title: '403 — nema pristupa', from: '@liro/templates', fullScreenHref: '/examples/status?screen=forbidden', demo: <Group gap="xs"><Lock size={18} /><Text fw={600}>ForbiddenTemplate</Text></Group> },
      { id: 'maintenance', title: '503 — održavanje', from: '@liro/templates', fullScreenHref: '/examples/status?screen=maintenance', demo: <Group gap="xs"><Construction size={18} /><Text fw={600}>MaintenanceTemplate</Text></Group> },
      { id: 'suspended', title: 'Zaključan nalog', from: '@liro/templates', fullScreenHref: '/examples/status?screen=suspended', demo: <Group gap="xs"><Ban size={18} /><Text fw={600}>SuspendedTemplate</Text></Group> },
    ],
  },

  // ---------- MARKETING ----------
  {
    slug: 'messages',
    title: 'Poruke',
    description: 'Prepiska uz zapis: pitanje klijentu, odgovor podrške, dnevnik komunikacije.',
    group: 'marketing',
    icon: MessageSquare,
    entries: [
      {
        id: 'message-thread',
        title: 'Prepiska',
        description: 'Enter šalje, Shift+Enter prelazi u novi red.',
        from: '@liro/ui',
        wide: true,
        demo: <MessagesDemo />,
        code: `<MessageThread
  messages={messages}
  onSend={send}
  dayLabelOf={(m) => m.dayLabel}
  height={380}
/>`,
      },
      {
        id: 'message-bubble',
        title: 'Pojedinačni oblačići',
        description: 'Stanje isporuke je vidljivo — u prepisci o dokumentu je bitno da li je poruka primljena.',
        from: '@liro/ui',
        demo: (
          <Stack gap={0}>
            <MessageBubble message={{ id: '1', author: { id: 'a', name: 'Ana Jovanović' }, text: 'Poslala sam izvod za mart.', time: '09:12' }} />
            <MessageBubble message={{ id: '2', author: { id: 'me', name: 'Ja' }, text: 'Primljeno, hvala.', time: '09:14', own: true, status: 'read' }} />
            <MessageBubble message={{ id: '3', author: { id: 'me', name: 'Ja' }, text: 'Poslato u obradu.', time: '09:15', own: true, status: 'sent' }} />
            <MessageBubble message={{ id: '4', author: { id: 'me', name: 'Ja' }, text: 'Nije uspelo slanje.', time: '09:16', own: true, status: 'failed' }} />
          </Stack>
        ),
      },
    ],
  },
  {
    slug: 'help',
    title: 'Pomoć i dokumentacija',
    description: 'Česta pitanja, članci i komentari — za stranicu pomoći unutar aplikacije.',
    group: 'marketing',
    icon: HelpCircle,
    entries: [
      {
        id: 'faq',
        title: 'Česta pitanja',
        demo: (
          <Accordion variant="separated" radius="md">
            <Accordion.Item value="1">
              <Accordion.Control>Kada se predaje PPP-PD prijava?</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">Najkasnije na dan isplate zarade, a pre same isplate.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="2">
              <Accordion.Control>Kako se ispravlja proknjižen obračun?</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">Kroz izmenu obračuna — original ostaje netaknut zbog revizije.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="3">
              <Accordion.Control>Odakle se povlači kurs NBS-a?</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">Srednji kurs se povlači svakog radnog dana u 08:00.</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ),
        code: `<Accordion variant="separated" radius="md">
  <Accordion.Item value="1">
    <Accordion.Control>Pitanje</Accordion.Control>
    <Accordion.Panel>Odgovor</Accordion.Panel>
  </Accordion.Item>
</Accordion>`,
      },
      {
        id: 'article-card',
        title: 'Kartica članka',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {[
              { title: 'Nove olakšice za zapošljavanje u 2026.', date: '12.03.2026.', tag: 'Propisi' },
              { title: 'Kako se popunjava obrazac IOSI', date: '04.03.2026.', tag: 'Uputstvo' },
            ].map((article, index) => (
              <Paper key={index} withBorder radius="lg" p="md" style={{ borderColor: liroVar.border.default }}>
                <Group justify="space-between" mb="xs">
                  <StatusBadge tone="neutral" label={article.tag} />
                  <Text size="xs" c="dimmed">{article.date}</Text>
                </Group>
                <Text fw={600} size="sm">{article.title}</Text>
                <Group gap="xs" mt="md">
                  <Avatar size={24} radius="xl" color="liro-blue">AJ</Avatar>
                  <Text size="xs" c="dimmed">Ana Jovanović</Text>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        ),
      },
      {
        id: 'toc',
        title: 'Sadržaj stranice',
        description: 'Za duge pravne tekstove i uputstva.',
        demo: (
          <Stack gap={6}>
            {['Predmet ugovora', 'Cena i uslovi plaćanja', 'Rok važenja', 'Raskid ugovora'].map((item, index) => (
              <Anchor
                key={index}
                href="#"
                size="sm"
                style={{
                  paddingLeft: 10,
                  borderLeft: `2px solid ${index === 1 ? liroVar.brand.solid : liroVar.border.default}`,
                  color: index === 1 ? liroVar.text.brand : liroVar.text.secondary,
                  fontWeight: index === 1 ? 600 : 400,
                }}
              >
                {item}
              </Anchor>
            ))}
          </Stack>
        ),
      },
    ],
  },

  // ---------- DIZAJN SISTEM ----------
  {
    slug: 'colors',
    title: 'Boje',
    description: 'Semantički tokeni, porodice namera i sirove palete.',
    group: 'design',
    icon: Palette,
    entries: [
      {
        id: 'intent-families',
        title: 'Porodice namera',
        description: 'Boja opisuje svrhu radnje, ne raspoloženje ekrana.',
        demo: (
          <Table fz="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={130}>Porodica</Table.Th>
                <Table.Th w={130}>Mantine boja</Table.Th>
                <Table.Th>Značenje</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[
                ['primary', 'Stvaranje i potvrda'],
                ['verify', 'Overa, potpis, slanje nadležnom organu'],
                ['document', 'Dokumenti i izlaz — PDF, štampa'],
                ['positive', 'Pozitivan završetak — odobreno, knjiženo'],
                ['destructive', 'Razaranje i odbijanje'],
                ['caution', 'Radnje koje se teško vraćaju'],
                ['neutral', 'Izmena, filter, odustajanje'],
              ].map(([family, meaning]) => (
                <Table.Tr key={family}>
                  <Table.Td><code>{family}</code></Table.Td>
                  <Table.Td><code>{INTENT_FAMILY_COLOR[family as keyof typeof INTENT_FAMILY_COLOR]}</code></Table.Td>
                  <Table.Td>{meaning}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ),
      },
      {
        id: 'semantic-tokens',
        title: 'Semantički tokeni',
        description: 'Promenite temu u zaglavlju — sve vrednosti se menjaju same.',
        demo: (
          <Stack gap="lg">
            {[
              { title: 'Površine', prefix: 'surface', tokens: liroVar.surface },
              { title: 'Tekst', prefix: 'text', tokens: liroVar.text },
              { title: 'Ivice', prefix: 'border', tokens: liroVar.border },
              { title: 'Brend', prefix: 'brand', tokens: liroVar.brand },
            ].map((group) => (
              <Stack key={group.prefix} gap="xs">
                <Text size="sm" fw={600}>{group.title}</Text>
                <SimpleGrid cols={{ base: 2, sm: 4, lg: 6 }} spacing="sm">
                  {Object.entries(group.tokens).map(([key, value]) => (
                    <Stack key={key} gap={4}>
                      <Box h={40} style={{ backgroundColor: value as string, borderRadius: 'var(--liro-radius-md)', border: `1px solid ${liroVar.border.default}` }} />
                      <Text size="xs" fw={600}>{group.prefix}.{key}</Text>
                    </Stack>
                  ))}
                </SimpleGrid>
              </Stack>
            ))}
          </Stack>
        ),
      },
      {
        id: 'palettes',
        title: 'Sirove palete',
        description: 'Komponenta koja ih koristi direktno prekršila je pravilo.',
        demo: (
          <Stack gap="md">
            {Object.entries(palette).map(([name, ramp]) => (
              <Stack key={name} gap={4}>
                <Text size="xs" fw={600}>{name}</Text>
                <Group gap={4} wrap="nowrap">
                  {ramp.map((color, index) => (
                    <Box key={index} style={{ flex: 1, height: 26, backgroundColor: color, borderRadius: 2 }} title={`${name}[${index}] ${color}`} />
                  ))}
                </Group>
              </Stack>
            ))}
          </Stack>
        ),
      },
    ],
  },
  {
    slug: 'scales',
    title: 'Skale i pravila',
    description: 'Tipografija, razmaci, radijusi, senke i pravila sistema.',
    group: 'design',
    icon: Sparkles,
    entries: [
      {
        id: 'typography',
        title: 'Tipografija',
        demo: (
          <Stack gap="md">
            <Title order={1}>Naslov prvog reda</Title>
            <Title order={2}>Naslov drugog reda</Title>
            <Title order={3}>Naslov trećeg reda</Title>
            <Text size="lg">Uvodni tekst na 16 piksela</Text>
            <Text>Osnovni tekst na 14 piksela — mera cele aplikacije</Text>
            <Text size="sm">Sitniji tekst na 13 piksela</Text>
            <Text size="xs" c="dimmed">Pomoćni tekst na 12 piksela</Text>
            <Text data-numeric>Tabularne cifre: 1.234.567,89 — 1.111.111,11</Text>
            <Text className="liro-brand-type" size="xl">Brend pismo (samo wordmark)</Text>
          </Stack>
        ),
      },
      {
        id: 'spacing-radius',
        title: 'Razmaci, radijusi i senke',
        demo: (
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
            <Stack gap="xs">
              {Object.entries(spacing).map(([key, value]) => (
                <Group key={key} gap="sm" wrap="nowrap">
                  <Text size="xs" w={40} ff="monospace">{key}</Text>
                  <Box h={12} w={value} style={{ backgroundColor: liroVar.brand.solid, borderRadius: 2, flexShrink: 0 }} />
                  <Text size="xs" c="dimmed">{value}</Text>
                </Group>
              ))}
            </Stack>
            <Stack gap="xs">
              {Object.entries(radius).map(([key, value]) => (
                <Group key={key} gap="sm" wrap="nowrap">
                  <Text size="xs" w={40} ff="monospace">{key}</Text>
                  <Box h={26} w={50} style={{ backgroundColor: liroVar.brand.subtle, border: `1px solid ${liroVar.border.brand}`, borderRadius: value, flexShrink: 0 }} />
                </Group>
              ))}
            </Stack>
            <Stack gap="md">
              {Object.entries(shadow).map(([key, value]) => (
                <Box key={key} p="sm" style={{ boxShadow: value, backgroundColor: liroVar.surface.raised, borderRadius: 'var(--liro-radius-md)', fontSize: 'var(--liro-font-size-xs)', textAlign: 'center' }}>
                  {key}
                </Box>
              ))}
            </Stack>
          </SimpleGrid>
        ),
      },
      {
        id: 'rules',
        title: 'Pravila sistema',
        demo: (
          <Stack gap="sm">
            <Callout tone="warning" title={{ sr: 'Sistem je namerno krut' }}>
              Ograničenja nisu propust nego proizvod. Programer ne treba da donosi vizuelne odluke
              pod rokom — treba da opiše šta ekran radi.
            </Callout>
            <Table fz="sm">
              <Table.Tbody>
                {[
                  ['ActionButton ne prima color ni variant', 'Ta dva propa su razlog zbog kojeg dva ekrana izgledaju kao dva proizvoda.'],
                  ['Komponente ne sadrže heks vrednosti', 'Sve ide kroz liroVar, pa tamna tema radi bez dodatnih pravila.'],
                  ['Natpis se menja, boja ne', '„Novo lice" umesto „Novo" je korisno. Zeleno „Novo" nije.'],
                  ['Tabela na telefonu nije tabela', 'Horizontalni skrol kroz pet kolona niko ne čita.'],
                  ['Prazna vrednost je crtica', 'Inače se ne vidi razlika između „nema podatka" i „nije se učitalo".'],
                  ['Modali stoje izvan Tabs', 'keepMounted je false, pa modal u neaktivnom panelu ne postoji.'],
                ].map(([rule, why]) => (
                  <Table.Tr key={rule}>
                    <Table.Td w="40%" fw={600}>{rule}</Table.Td>
                    <Table.Td c="dimmed">{why}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        ),
      },
    ],
  },
]

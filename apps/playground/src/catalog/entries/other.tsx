'use client'

import { useState } from 'react'
import {
  Accordion,
  Anchor,
  Avatar,
  Box,
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
  HelpCircle,
  Layers,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogIn,
  MessageSquare,
  Palette,
  PenLine,
  Receipt,
  ServerCrash,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  ThumbsUp,
  TriangleAlert,
  CircleQuestionMark,
} from 'lucide-react'
import { liroVar, palette, radius, shadow, spacing, INTENT_FAMILY_COLOR } from '@liro/tokens'
import {
  Callout,
  LiroCarousel,
  LiroCarouselSlide,
  SectionCard,
  StatCard,
  StatusBadge,
  ArticleCard,
  CommentThread,
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
  { name: 'Net salaries', value: 2_640_000 },
  { name: 'Payroll tax', value: 1_120_000 },
  { name: 'Pension contributions (PIO)', value: 780_000 },
  { name: 'Health insurance contributions', value: 340_000 },
]

const TOP_CLIENTS = [
  { label: 'Officedirect d.o.o.', value: 4_128_500 },
  { label: 'Konfirs d.o.o.', value: 3_310_000 },
  { label: 'Pekara Sunce', value: 1_842_300 },
  { label: 'Termo inženjering', value: 1_204_000 },
]

const EVENTS = [
  { id: '1', title: 'PPP-PD for March', start: '2026-04-05 09:00:00', end: '2026-04-05 17:00:00', kind: 'deadline' as const, allDay: true },
  { id: '2', title: 'Payroll run', start: '2026-04-02 09:00:00', end: '2026-04-03 17:00:00', kind: 'payroll' as const },
  { id: '3', title: 'Sending to SEF', start: '2026-04-08 10:00:00', end: '2026-04-08 12:00:00', kind: 'filing' as const },
  { id: '4', title: 'VAT — Q1', start: '2026-04-15 09:00:00', end: '2026-04-15 17:00:00', kind: 'deadline' as const, allDay: true },
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
    '<p>The contract renews <strong>automatically</strong> unless either party gives notice of termination.</p><ul><li>Payment term: 30 days</li></ul>',
  )
  return (
    <Stack gap="md">
      <RichTextField value={value} onChange={setValue} label={{ en: 'Note on the contract' }} />
      <SectionCard title={{ en: 'Preview of the saved text' }}>
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
        description={{ en: 'PDF, XML and Excel — statements, filings and attachments' }}
      />
      <AttachmentList files={files} onRemove={(path) => setFiles((c) => c.filter((f) => f.path !== path))} />
    </Stack>
  )
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    author: { id: 'ana', name: 'Ana Jovanović' },
    text: 'I sent the statement for March, one payment is missing.',
    time: '09:12'
  },
  {
    id: '2',
    author: { id: 'ana', name: 'Ana Jovanović' },
    text: 'The amount is 42.180,00 RSD.',
    time: '09:12',
    reactions: [
      { id: 'ok', icon: ThumbsUp, label: 'Confirmed', tone: 'success', count: 1, mine: true },
      { id: 'urgent', icon: TriangleAlert, label: 'Urgent', tone: 'warning', count: 1 },
    ],
  },
  {
    id: '3',
    author: { id: 'me', name: 'Me' },
    text: 'I checked — the payment was posted on 02.04.',
    time: '09:20',
    own: true,
    status: 'read',
    reactions: [
      { id: 'ok', icon: ThumbsUp, label: 'Confirmed', tone: 'success', count: 2 },
      { id: 'q', icon: CircleQuestionMark, label: 'Question', tone: 'info', count: 1 },
    ],
  },
  {
    id: '4',
    author: { id: 'ana', name: 'Ana Jovanović' },
    text: 'Great, thanks. Closing the task.',
    time: '09:21'
  },
]

const REACTIONS = [
  { id: 'ok', icon: ThumbsUp, label: 'Confirmed', tone: 'success' as const },
  { id: 'q', icon: CircleQuestionMark, label: 'Question', tone: 'info' as const },
  { id: 'urgent', icon: TriangleAlert, label: 'Urgent', tone: 'warning' as const },
  { id: 'blocked', icon: Ban, label: 'Disputed', tone: 'danger' as const },
]

function MessagesDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)

  const react = (messageId: string, reactionId: string) =>
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message

        const existing = message.reactions ?? []
        const found = existing.find((reaction) => reaction.id === reactionId)

        if (!found) {
          const option = REACTIONS.find((item) => item.id === reactionId)
          if (!option) return message
          return { ...message, reactions: [...existing, { ...option, count: 1, mine: true }] }
        }

        // Your own reaction that drops to zero is removed, not left at "0".
        const next = found.mine ? found.count - 1 : found.count + 1
        if (found.mine && next === 0) {
          return { ...message, reactions: existing.filter((r) => r.id !== reactionId) }
        }

        return {
          ...message,
          reactions: existing.map((r) =>
            r.id === reactionId ? { ...r, mine: !r.mine, count: next } : r,
          ),
        }
      }),
    )

  return (
    <MessageThread
      messages={messages}
      height={340}
      onReact={react}
      reactionOptions={REACTIONS} // <--- ADDED HERE
      onSend={(text) =>
        setMessages((current) => [
          ...current,
          {
            id: String(current.length + 1),
            author: { id: 'me', name: 'Me' },
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
    /* No view switcher of its own — `Schedule` already has one in its
       header, and two rows of buttons were overlapping. */
    <Stack gap="md" p="md">
      <LiroSchedule events={EVENTS} date="2026-04-10" view={view} onViewChange={(next) => setView(next as typeof view)} readOnly height={560} />
    </Stack>
  )
}

/*
 * The total goes below the table, not next to it.
 *
 * The eye reads items top to bottom and stops on the total amount; when the
 * total sits on the side, the gaze has to jump sideways and then come back.
 */
function TotalsBlock() {
  return (
    <Stack gap="md">
      <Box>
        <Table fz="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Description</Table.Th>
              <Table.Th ta="right">Quantity</Table.Th>
              <Table.Th ta="right">Value</Table.Th>
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
            <Text size="sm" c="dimmed">Base amount</Text>
            <Text size="sm" data-numeric>199.380,00 RSD</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">VAT 20%</Text>
            <Text size="sm" data-numeric>39.876,00 RSD</Text>
          </Group>
          <Box style={{ borderTop: `1px solid ${liroVar.border.default}`, paddingTop: 6 }}>
            <Group justify="space-between">
              <Text fw={700}>Amount due</Text>
              <Text fw={700} data-numeric>239.256,00 RSD</Text>
            </Group>
          </Box>
        </Stack>
      </Group>
    </Stack>
  )
}

export const otherCategories: CatalogCategory[] = [
  // ---------- BLOCKS ----------
  {
    slug: 'content-blocks',
    title: 'Text and attachments',
    description: 'Rich text, code display and file drag-and-drop.',
    group: 'blocks',
    icon: PenLine,
    entries: [
      {
        id: 'rich-text',
        title: 'Rich text',
        description: 'A short toolbar: no colors, sizes or fonts.',
        from: '@liro/editor',
        demo: <EditorDemo />,
        code: `<RichTextField value={note} onChange={setNote} label={{ en: 'Note' }} />
<RichTextView value={note} />`,
      },
      {
        id: 'code-block',
        title: 'Code and XML display',
        description: 'Tax filings, SEF responses, an integration log.',
        from: '@liro/editor',
        demo: <CodeBlock code={SAMPLE_XML} language="xml" maxHeight={220} />,
        code: `<CodeBlock code={filingXml} language="xml" />`,
      },
      {
        id: 'attachments',
        title: 'Attachments',
        description: 'Uploads happen in sequence, not in parallel.',
        from: '@liro/files',
        demo: <FilesDemo />,
        code: `<FileDropzone onUploaded={add} maxSize={10 * 1024 * 1024} />
<AttachmentList files={files} onRemove={remove} />`,
      },
      {
        id: 'dropzone-button',
        title: 'Attachments with a button',
        description:
          'withButton adds a named button to the same dialog. A hidden input in the Dropzone gets announced by a screen reader as a field with no name.',
        from: '@liro/files',
        demo: (
          <FileDropzone
            onUploaded={() => {}}
            withButton
            multiple={false}
            maxSize={30 * 1024 * 1024}
            accept={['application/pdf']}
            label={{ en: 'Drag the contract here' }}
            description={{ en: 'PDF only, up to 30 MB' }}
          />
        ),
        code: `<FileDropzone onUploaded={attach} withButton accept={['application/pdf']} />`,
      },
      {
        id: 'article-card',
        title: 'Article card',
        description:
          'For documentation and news. The dimming is 55% and is calculated against the lightest possible image — the first card is deliberately almost white.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            <ArticleCard
              image="/cover-light.svg"
              category="Worst case"
              title="Almost-white image — the dimming has to hold up"
              href="#article-card"
            />
            <ArticleCard
              image="/cover-mid.svg"
              category="Guide"
              title="How to start a new project on @liro/preset"
              href="#article-card"
            />
            <ArticleCard
              image="/cover-dark.svg"
              category="Release"
              title="What's new in version 0.1.0"
              href="#article-card"
            />
          </SimpleGrid>
        ),
        code: `<ArticleCard
      image={post.cover}
      category={post.section}
      title={post.title}
      href={\`/docs/\${post.slug}\`}
    />`,
      },
    ],
  },
  {
    slug: 'summary-blocks',
    title: 'Summary blocks',
    description: 'Parts that repeat at the bottom and top of documents.',
    group: 'blocks',
    icon: Layers,
    entries: [
      {
        id: 'totals',
        title: 'Line items and totals',
        description: 'Tabular figures align decimals by column.',
        demo: <TotalsBlock />,
      },
      {
        id: 'metric-carousel',
        title: 'Cards in a horizontal list',
        description: 'So a row of numbers fits on a narrow screen without scrolling the whole page.',
        from: '@liro/ui',
        demo: (
          <LiroCarousel slideSize={{ base: '80%', sm: '45%', md: '30%' }}>
            {[
              { title: { en: 'Employees' }, value: 47 },
              { title: { en: 'Clients' }, value: 12 },
              { title: { en: 'Documents' }, value: 318 },
              { title: { en: 'Payroll runs' }, value: 24 },
              { title: { en: 'Attachments' }, value: 1204 },
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

  // ---------- CHARTS ----------
  {
    slug: 'charts',
    title: 'Charts',
    description: 'Series colors from the Liro palette, amounts through formatDecimal.',
    group: 'charts',
    icon: TrendingUp,
    entries: [
      {
        id: 'bar-chart',
        title: 'Bar — structure by month',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ en: 'Payroll total' }} period="2026." icon={Banknote} height={280}>
            <LiroBarChart
              data={PAYROLL}
              dataKey="month"
              type="stacked"
              currency="RSD"
              series={[
                { name: 'neto', label: 'Net salaries' },
                { name: 'porezi', label: 'Taxes' },
                { name: 'doprinosi', label: 'Contributions' },
              ]}
            />
          </ChartCard>
        ),
        code: `<ChartCard title={{ en: 'Payroll total' }} period="2026.">
  <LiroBarChart
    data={data}
    dataKey="month"
    type="stacked"
    currency="RSD"
    series={[{ name: 'neto', label: 'Net salaries' }]}
  />
</ChartCard>`,
      },
      {
        id: 'area-line',
        title: 'Area and line',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ en: 'Inflows and outflows' }} icon={TrendingUp}>
              <LiroAreaChart
                data={CASHFLOW}
                dataKey="month"
                currency="RSD"
                curveType="monotone"
                series={[{ name: 'prilivi', label: 'Inflows' }, { name: 'odlivi', label: 'Outflows' }]}
              />
            </ChartCard>
            <ChartCard title={{ en: 'Net salary trend' }}>
              <LiroLineChart
                data={PAYROLL}
                dataKey="month"
                currency="RSD"
                curveType="monotone"
                withDots
                series={[{ name: 'neto', label: 'Net salaries' }]}
              />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'donut-bars',
        title: 'Donut and horizontal bars',
        description: 'Bars are more readable than a pie when there are more than five items.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ en: 'Labor cost structure' }} icon={Wallet}>
              <LiroDonutChart data={STRUCTURE} currency="RSD" centerLabel="March" size={200} />
            </ChartCard>
            <ChartCard title={{ en: 'Top clients' }} height={240}>
              <LiroBarsList data={TOP_CLIENTS} currency="RSD" labelLabel="Client" valueLabel="Revenue" />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'sparkline',
        title: 'Sparkline with a number',
        description: 'Same data, different color — invert says that cost growth is not good news.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Stack gap={4}>
              <Text size="xs" fw={600} c="dimmed">REVENUE</Text>
              <Text size="lg" fw={700} data-numeric>3.612.400 RSD</Text>
              <LiroSparkline data={[12, 15, 14, 19, 22, 26, 31, 36]} trend />
            </Stack>
            <Stack gap={4}>
              <Text size="xs" fw={600} c="dimmed">EXPENSE</Text>
              <Text size="lg" fw={700} data-numeric>2.180.900 RSD</Text>
              <LiroSparkline data={[12, 15, 14, 19, 22, 26, 31, 36]} trend invert />
            </Stack>
            <Stack gap={4}>
              <Text size="xs" fw={600} c="dimmed">OVERDUE</Text>
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
    title: 'More charts',
    description: 'Twelve types used less often, but when needed there is no substitute.',
    group: 'charts',
    icon: Layers,
    entries: [
      {
        id: 'composite',
        title: 'Composite — size and trend',
        description: 'Revenue in bars, margin as a line, on the same chart.',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ en: 'Revenue and margin' }} period="2026." height={280}>
            <LiroCompositeChart
              data={CASHFLOW.map((row, index) => ({ ...row, marza: 12 + (index % 5) }))}
              dataKey="month"
              series={[
                { name: 'prilivi', label: 'Inflows', type: 'bar' },
                { name: 'marza', label: 'Margin %', type: 'line' },
              ]}
            />
          </ChartCard>
        ),
      },
      {
        id: 'pie-funnel',
        title: 'Pie and funnel',
        description: 'The funnel shows how many quotes make it to collection.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ en: 'Share by document type' }} height={260}>
              <LiroPieChart data={STRUCTURE} currency="RSD" size={190} />
            </ChartCard>
            <ChartCard title={{ en: 'From quote to collection' }} height={260}>
              <LiroFunnelChart
                data={[
                  { name: 'Quotes', value: 240 },
                  { name: 'Pro forma invoices', value: 168 },
                  { name: 'Invoices', value: 121 },
                  { name: 'Collected', value: 94 },
                ]}
                height={200}
              />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'radar-radial',
        title: 'Radar and radial bars',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ en: 'Client rating' }} height={280}>
              <LiroRadarChart
                data={[
                  { kriterijum: 'Payment terms', ocena: 82 },
                  { kriterijum: 'Volume', ocena: 64 },
                  { kriterijum: 'Margin', ocena: 71 },
                  { kriterijum: 'Clean documentation', ocena: 90 },
                  { kriterijum: 'Communication', ocena: 77 },
                ]}
                dataKey="kriterijum"
                series={[{ name: 'ocena', label: 'Rating' }]}
              />
            </ChartCard>
            <ChartCard title={{ en: 'Plan completion by team' }} height={280}>
              <LiroRadialBarChart
                data={[
                  { name: 'Sales', value: 92 },
                  { name: 'Accounting', value: 78 },
                  { name: 'Support', value: 64 },
                ]}
              />
            </ChartCard>
          </SimpleGrid>
        ),
      },
      {
        id: 'scatter-bubble',
        title: 'Scatter and bubbles',
        description: 'Relationship between two quantities — invoice amount versus days overdue.',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ en: 'Amount versus days overdue' }} height={300}>
            <LiroScatterChart
              data={[
                {
                  name: 'Invoices',
                  data: Array.from({ length: 28 }, (_, index) => ({
                    iznos: 20_000 + (index % 13) * 18_400,
                    docnja: (index % 9) * 7,
                  })),
                },
              ]}
              dataKey={{ x: 'iznos', y: 'docnja' }}
              xAxisLabel="Amount"
              yAxisLabel="Days overdue"
            />
          </ChartCard>
        ),
      },
      {
        id: 'target-bar',
        title: 'Plan versus actual',
        description: 'Color carries the deviation from the target — the zones are quiet because they are context, not data.',
        from: '@liro/charts',
        demo: (
          <Stack gap="lg">
            <TargetBar label="Revenue" value={4_128_500} target={4_500_000} currency="RSD" />
            <TargetBar label="Collections" value={3_612_400} target={3_400_000} currency="RSD" />
            <TargetBar
              label="Costs"
              value={2_180_900}
              target={1_950_000}
              currency="RSD"
              invert
              caption="Budget"
            />
            <TargetBar label="New clients" value={7} target={10} unit="pcs" size="sm" />
          </Stack>
        ),
        code: `<TargetBar label="Revenue" value={actual} target={plan} currency="RSD" />
<TargetBar label="Costs" value={cost} target={budget} currency="RSD" invert />`,
      },
      {
        id: 'heatmap',
        title: 'Heatmap by day',
        description: 'Number of documents entered through the year — the work rhythm becomes visible.',
        from: '@liro/charts',
        demo: (
          <LiroHeatmap
            startDate="2025-06-01"
            endDate="2026-04-30"
            unit="documents"
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
        title: 'Treemap and radial hierarchy',
        description: 'Cost structure where area is the share; accounts by class and group.',
        from: '@liro/charts',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
            <ChartCard title={{ en: 'Cost structure' }} height={300}>
              <LiroTreemap
                data={[
                  { name: 'Salaries', value: 4_128_500 },
                  { name: 'Material', value: 1_842_300 },
                  { name: 'Services', value: 1_204_000 },
                  { name: 'Rent', value: 918_700 },
                  { name: 'Other', value: 412_300 },
                ]}
                height={240}
              />
            </ChartCard>
            <ChartCard title={{ en: 'Accounts by class' }} height={300}>
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
        title: 'Value flow',
        description: 'From inflow to allocation across costs.',
        from: '@liro/charts',
        demo: (
          <ChartCard title={{ en: 'Inflow allocation' }} height={340}>
            <LiroSankeyChart
              data={{
                nodes: [
                  { name: 'Inflows' },
                  { name: 'Salaries' },
                  { name: 'Suppliers' },
                  { name: 'Taxes' },
                  { name: 'Profit' },
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
    title: 'Calendar',
    description: 'The event type picks the color — a legal deadline is the only solid block.',
    group: 'charts',
    icon: CalendarClock,
    entries: [
      {
        id: 'liro-schedule',
        title: 'Payroll and deadline calendar',
        description: 'Four views: day, week, month, year. On a phone the month view adapts on its own.',
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

  // ---------- EXAMPLES ----------
  {
    slug: 'app-screens',
    title: 'Work screens',
    description: 'Whole pages. Pick one, import it, and it works.',
    group: 'examples',
    icon: LayoutDashboard,
    entries: [
      {
        id: 'launchpad',
        title: 'Launchpad — tiles',
        description: 'The home page is not a menu but a grid of tiles with a number that says whether there is work waiting there.',
        from: '@liro/ui',
        fullScreenHref: '/examples/launchpad',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><LayoutDashboard size={18} /><Text fw={600}>Launchpad</Text></Group>
            <Text size="sm" c="dimmed">
              All tiles work with the keyboard: numbers 1–9 open, arrows move the selection, Enter
              confirms.
            </Text>
          </Stack>
        ),
        code: `<Launchpad
  tiles={[
    { id: 'documents', title: { en: 'Documents' }, icon: Receipt, href: '/documents',
      value: 11, valueLabel: { en: 'overdue' }, tone: 'danger' },
  ]}
  columns={4}
/>`,
      },
      {
        id: 'employees',
        title: 'Employees',
        description: 'A list with summary cards, a filter, search, and a form in a drawer.',
        from: '@liro/templates',
        fullScreenHref: '/examples/employees',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><Users size={18} /><Text fw={600}>ListPageTemplate + ResourceTable + FormDrawer</Text></Group>
            <Text size="sm" c="dimmed">Open at full height with the arrow in the top right.</Text>
          </Stack>
        ),
        code: `<ListPageTemplate title={{ en: 'Employees' }} icon={Users} stats={stats} actions={actions} flush>
  <SectionCard flush>
    <ResourceTable resource="employees" columns={columns} onEdit={setEditing} allowDelete />
  </SectionCard>
</ListPageTemplate>`,
      },
      {
        id: 'documents',
        title: 'Outgoing documents',
        description: 'The same layout as employees — only the columns and filters differ.',
        from: '@liro/templates',
        fullScreenHref: '/examples/documents',
        demo: <Group gap="xs"><Receipt size={18} /><Text fw={600}>ResourceTable + RecordStatusBadge + DueDate</Text></Group>,
      },
      {
        id: 'fiscal-receipts',
        title: 'Fiscal receipts',
        description: 'A list that is read, not edited — no button to add a new entry or delete.',
        from: '@liro/templates',
        fullScreenHref: '/examples/fiscal-receipts',
        demo: <Group gap="xs"><ListChecks size={18} /><Text fw={600}>ResourceTable + PeriodPicker</Text></Group>,
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'A list of sentences, not a table. Unread differs by text weight and a dot.',
        from: '@liro/ui',
        fullScreenHref: '/examples/notifications',
        demo: <Group gap="xs"><LayoutDashboard size={18} /><Text fw={600}>ListPageTemplate + SectionCard</Text></Group>,
      },
      {
        id: 'list-page',
        title: 'List — basic layout',
        description: 'Header, summary cards, search, table, pagination.',
        from: '@liro/templates',
        fullScreenHref: '/application',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><ListChecks size={18} /><Text fw={600}>ListPageTemplate + ResourceTable</Text></Group>
            <Text size="sm" c="dimmed">Open at full height with the arrow in the top right.</Text>
          </Stack>
        ),
        code: `<ListPageTemplate title={{ en: 'Employees' }} icon={Users} stats={stats}>
  <ResourceTable resource="employees" columns={columns} allowDelete />
</ListPageTemplate>`,
      },
      {
        id: 'document-page',
        title: 'Document with line items',
        description: 'Status, a toolbar of actions that unlock in order, line items, totals, timeline.',
        from: '@liro/templates',
        fullScreenHref: '/application/invoice',
        demo: (
          <Stack gap="xs">
            <Group gap="xs"><Receipt size={18} /><Text fw={600}>DetailPageTemplate + SectionCard</Text></Group>
            <Text size="sm" c="dimmed">The most complete example in the catalog.</Text>
          </Stack>
        ),
      },
      {
        id: 'account-page',
        title: 'Account and security',
        description: 'Profile, password, two-factor verification, devices, server errors, edit conflicts.',
        from: '@liro/ui',
        fullScreenHref: '/account',
        demo: (
          <Group gap="xs"><UserCog size={18} /><Text fw={600}>ProfileCard + TwoFactorCard + SessionsCard</Text></Group>
        ),
      },
      {
        id: 'login-page',
        title: 'Login and two-factor verification',
        from: '@liro/ui',
        fullScreenHref: '/examples/login',
        demo: <Group gap="xs"><LogIn size={18} /><Text fw={600}>AuthShell + LoginForm + TwoFactorForm</Text></Group>,
      },
    ],
  },
  {
    slug: 'status-screens',
    title: 'Interrupted screens',
    description: 'So a user who runs into an error still sees the product.',
    group: 'examples',
    icon: FileQuestion,
    entries: [
      { id: 'not-found', title: '404 — page not found', from: '@liro/templates', fullScreenHref: '/examples/status?screen=notFound', demo: <Group gap="xs"><FileQuestion size={18} /><Text fw={600}>NotFoundTemplate</Text></Group> },
      { id: 'server-error', title: '500 — server error', from: '@liro/templates', fullScreenHref: '/examples/status?screen=serverError', demo: <Group gap="xs"><ServerCrash size={18} /><Text fw={600}>ServerErrorTemplate</Text></Group> },
      { id: 'forbidden', title: '403 — access denied', from: '@liro/templates', fullScreenHref: '/examples/status?screen=forbidden', demo: <Group gap="xs"><Lock size={18} /><Text fw={600}>ForbiddenTemplate</Text></Group> },
      { id: 'maintenance', title: '503 — maintenance', from: '@liro/templates', fullScreenHref: '/examples/status?screen=maintenance', demo: <Group gap="xs"><Construction size={18} /><Text fw={600}>MaintenanceTemplate</Text></Group> },
      { id: 'suspended', title: 'Locked account', from: '@liro/templates', fullScreenHref: '/examples/status?screen=suspended', demo: <Group gap="xs"><Ban size={18} /><Text fw={600}>SuspendedTemplate</Text></Group> },
    ],
  },

  // ---------- MARKETING ----------
  {
    slug: 'messages',
    title: 'Messages',
    description: 'A conversation attached to a record: a question to a client, a support reply, a communication log.',
    group: 'marketing',
    icon: MessageSquare,
    entries: [
      {
        id: 'message-thread',
        title: 'Conversation',
        description: 'Enter sends, Shift+Enter moves to a new line.',
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
        title: 'Individual bubbles',
        description: 'Delivery state is visible — in a conversation about a document it matters whether the message was received.',
        from: '@liro/ui',
        demo: (
          <Stack gap={0}>
            <MessageBubble message={{ id: '1', author: { id: 'a', name: 'Ana Jovanović' }, text: 'I sent the statement for March.', time: '09:12' }} />
            <MessageBubble message={{ id: '2', author: { id: 'me', name: 'Me' }, text: 'Received, thanks.', time: '09:14', own: true, status: 'read' }} />
            <MessageBubble message={{ id: '3', author: { id: 'me', name: 'Me' }, text: 'Sent for processing.', time: '09:15', own: true, status: 'sent' }} />
            <MessageBubble message={{ id: '4', author: { id: 'me', name: 'Me' }, text: 'Sending failed.', time: '09:16', own: true, status: 'failed' }} />
          </Stack>
        ),
      },
      {
        id: 'comment-thread',
        title: 'Conversation attached to a record',
        description:
          'Two forms: bubbles is a conversation between parties, flat is a series of remarks on a document where the party does not matter.',
        from: '@liro/ui',
        demo: (
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
            <CommentThread
              comments={[
                { id: '1', author: { id: 'ana', name: 'Ana Jovanović' }, body: 'Missing delivery note for item 3.', createdAt: '2026-04-02T09:14:00' },
                { id: '2', author: { id: 'me', name: 'Me' }, body: 'I attached it now.', createdAt: '2026-04-02T09:31:00', own: true },
                { id: '3', author: { id: 'system', name: '' }, body: 'The document has been posted', createdAt: '2026-04-02T10:02:00', system: true },
              ]}
              onSubmit={() => {}}
            />
            <CommentThread
              layout="flat"
              comments={[
                {
                  id: '1',
                  author: { id: 'marko', name: 'Marko Petrović' },
                  body: 'I checked the calculation against the Ordinance, Sl. glasnik RS 89/2020. Account 4310 is correct, but item 7 goes to 4319 since it relates to a liability to a related party.',
                  createdAt: '2026-04-02T11:20:00',
                },
                {
                  id: '2',
                  author: { id: 'djordje', name: 'Đorđe Đurić' },
                  body: 'Fixed. Still need to check the VAT category for item 9.',
                  createdAt: '2026-04-02T12:05:00',
                  own: true,
                },
              ]}
            />
          </SimpleGrid>
        ),
        code: `<CommentThread layout="flat" comments={document.notes} onSubmit={addNote} />`,
      },
    ],
  },
  {
    slug: 'help',
    title: 'Help and documentation',
    description: 'FAQs, articles and comments — for a help page inside the application.',
    group: 'marketing',
    icon: HelpCircle,
    entries: [
      {
        id: 'faq',
        title: 'Frequently asked questions',
        demo: (
          <Accordion variant="separated" radius="md">
            <Accordion.Item value="1">
              <Accordion.Control>When is the PPP-PD filing submitted?</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">At the latest on the day of salary payment, and before the payment itself.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="2">
              <Accordion.Control>How is a posted payroll run corrected?</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">Through a correcting entry — the original stays untouched for audit purposes.</Text>
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="3">
              <Accordion.Control>Where does the NBS exchange rate come from?</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm">The middle exchange rate is pulled every business day at 08:00.</Text>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ),
        code: `<Accordion variant="separated" radius="md">
  <Accordion.Item value="1">
    <Accordion.Control>Question</Accordion.Control>
    <Accordion.Panel>Answer</Accordion.Panel>
  </Accordion.Item>
</Accordion>`,
      },
      {
        id: 'article-card',
        title: 'Article card',
        demo: (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {[
              { title: 'New employment incentives for 2026.', date: '12.03.2026.', tag: 'Regulations' },
              { title: 'How to fill out the IOSI form', date: '04.03.2026.', tag: 'Guide' },
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
        title: 'Page contents',
        description: 'For long legal texts and guides.',
        demo: (
          <Stack gap={6}>
            {['Subject of the contract', 'Price and payment terms', 'Term', 'Termination of the contract'].map((item, index) => (
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

  // ---------- DESIGN SYSTEM ----------
  {
    slug: 'colors',
    title: 'Colors',
    description: 'Semantic tokens, intent families and raw palettes.',
    group: 'design',
    icon: Palette,
    entries: [
      {
        id: 'intent-families',
        title: 'Intent families',
        description: 'Color describes the purpose of the action, not the mood of the screen.',
        demo: (
          <Table fz="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={130}>Family</Table.Th>
                <Table.Th w={130}>Mantine color</Table.Th>
                <Table.Th>Meaning</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {[
                ['primary', 'Creation and confirmation'],
                ['verify', 'Verification, signing, sending to an authority'],
                ['document', 'Documents and output — PDF, print'],
                ['positive', 'Positive outcome — approved, posted'],
                ['destructive', 'Destruction and rejection'],
                ['caution', 'Actions that are hard to undo'],
                ['neutral', 'Editing, filtering, canceling'],
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
        title: 'Semantic tokens',
        description: 'Change the theme in the header — all values update on their own.',
        demo: (
          <Stack gap="lg">
            {[
              { title: 'Surfaces', prefix: 'surface', tokens: liroVar.surface },
              { title: 'Text', prefix: 'text', tokens: liroVar.text },
              { title: 'Borders', prefix: 'border', tokens: liroVar.border },
              { title: 'Brand', prefix: 'brand', tokens: liroVar.brand },
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
        title: 'Raw palettes',
        description: 'A component that uses them directly has broken the rule.',
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
    title: 'Scales and rules',
    description: 'Typography, spacing, radii, shadows and system rules.',
    group: 'design',
    icon: Sparkles,
    entries: [
      {
        id: 'typography',
        title: 'Typography',
        demo: (
          <Stack gap="md">
            <Title order={1}>First-level heading</Title>
            <Title order={2}>Second-level heading</Title>
            <Title order={3}>Third-level heading</Title>
            <Text size="lg">Intro text at 16 pixels</Text>
            <Text>Base text at 14 pixels — the measure of the whole application</Text>
            <Text size="sm">Smaller text at 13 pixels</Text>
            <Text size="xs" c="dimmed">Helper text at 12 pixels</Text>
            <Text data-numeric>Tabular figures: 1.234.567,89 — 1.111.111,11</Text>
            <Text className="liro-brand-type" size="xl">Brand typeface (wordmark only)</Text>
          </Stack>
        ),
      },
      {
        id: 'spacing-radius',
        title: 'Spacing, radii and shadows',
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
        title: 'System rules',
        demo: (
          <Stack gap="sm">
            <Callout tone="warning" title={{ en: 'The system is deliberately rigid' }}>
              The constraints are not an oversight but the product. A developer should not be making
              visual decisions under a deadline — they should describe what the screen does.
            </Callout>
            <Table fz="sm">
              <Table.Tbody>
                {[
                  ['ActionButton takes no color or variant', 'Those two props are why two screens look like two products.'],
                  ['Components contain no hex values', 'Everything goes through liroVar, so the dark theme works without extra rules.'],
                  ['The label changes, the color does not', '"New person" instead of "New" is useful. A green "New" is not.'],
                  ['A table on a phone is not a table', 'Nobody reads a horizontal scroll through five columns.'],
                  ['An empty value is a dash', 'Otherwise you cannot tell the difference between "no data" and "failed to load".'],
                  ['Modals live outside Tabs', 'keepMounted is false, so a modal in an inactive panel does not exist.'],
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
'use client'

import { useState } from 'react'
import { SimpleGrid, Stack, Text } from '@mantine/core'
import { GanttChartSquare, GitCompareArrows, Network } from 'lucide-react'
import { CapacityTimeline, StructureTree, VersionCompare, notice, type FieldChange } from '@liro/ui'
import type { CatalogCategory } from '../types'

/**
 * Third-layer pattern showcase.
 *
 * Same rule: every pattern is shown at least twice, from different
 * industries, with the same code - to show that the difference is not in
 * the component but in the data.
 */

const ORG_CHART = [
  {
    id: '1',
    label: 'Managing director',
    kind: 'Management',
    value: '47',
    children: [
      {
        id: '2',
        label: 'Accounting division',
        kind: 'Division',
        value: '18',
        children: [
          { id: '3', label: 'Payroll', value: '7' },
          { id: '4', label: 'General ledger', value: '6' },
          { id: '5', label: 'VAT', value: '5' },
        ],
      },
      {
        id: '6',
        label: 'Sales division',
        kind: 'Division',
        value: '21',
        children: [
          { id: '7', label: 'Wholesale', value: '12' },
          { id: '8', label: 'Retail', value: '9' },
        ],
      },
      { id: '9', label: 'Legal', kind: 'Department', value: '4' },
      { id: '10', label: 'Maintenance', kind: 'Department', value: '4' },
    ],
  },
]

const CHART_OF_ACCOUNTS = [
  {
    id: 'k2',
    code: '2',
    label: 'Zalihe',
    kind: 'Klasa',
    value: '1.842.300',
    children: [
      {
        id: 'k20',
        code: '20',
        label: 'Materijal',
        kind: 'Grupa',
        value: '1.204.000',
        children: [
          { id: 'k201', code: '2010', label: 'Materijal u magacinu', value: '1.104.000' },
          { id: 'k202', code: '2020', label: 'Materijal na putu', value: '100.000' },
        ],
      },
      { id: 'k21', code: '21', label: 'Nedovršena proizvodnja', kind: 'Grupa', value: '638.300' },
    ],
  },
  {
    id: 'k4',
    code: '4',
    label: 'Obaveze',
    kind: 'Klasa',
    value: '3.412.700',
    children: [
      { id: 'k43', code: '43', label: 'Obaveze prema dobavljačima', kind: 'Grupa', value: '2.460.000' },
      { id: 'k45', code: '45', label: 'Obaveze po zaradama', kind: 'Grupa', value: '952.700' },
    ],
  },
]

const CONTRACT_CHANGES: FieldChange[] = [
  { group: 'Header', label: { en: 'Client' }, before: 'Konfirs d.o.o.', after: 'Konfirs d.o.o.' },
  { group: 'Header', label: { en: 'Subject of the contract' }, before: 'Bookkeeping services', after: 'Bookkeeping and advisory services' },
  { group: 'Terms', label: { en: 'Monthly fee' }, before: '48.000,00 RSD', after: '56.500,00 RSD' },
  { group: 'Terms', label: { en: 'Payment term' }, before: '15 days', after: '30 days' },
  { group: 'Terms', label: { en: 'Currency' }, before: 'RSD', after: 'RSD' },
  { group: 'Terms', label: { en: 'Confidentiality clause' }, before: null, after: 'Article 12 - the obligation lasts 5 years after termination' },
  { group: 'Terms', label: { en: 'Advance payment discount' }, before: '3%', after: null },
]

const SPEC_CHANGES: FieldChange[] = [
  { group: 'Specification', label: { en: 'Housing material' }, before: 'ABS plastika', after: 'Polikarbonat' },
  { group: 'Specification', label: { en: 'Weight' }, before: '1,84 kg', after: '2,01 kg' },
  { group: 'Specification', label: { en: 'Operating temperature' }, before: '−10 do 40 °C', after: '−10 do 40 °C' },
  { group: 'Inspection', label: { en: 'Drop test' }, before: null, after: 'Obavezno, visina 1,2 m' },
]

const CAPACITY_ROWS = [
  {
    id: '1',
    label: 'Ana Jovanović',
    caption: 'Bookkeeper',
    utilisation: 92,
    bars: [
      { id: 'a1', label: 'Payroll run — March', start: '2026-04-01', end: '2026-04-08', tone: 'info' as const, progress: 100 },
      { id: 'a2', label: 'VAT filing', start: '2026-04-09', end: '2026-04-15', tone: 'warning' as const, progress: 60 },
      { id: 'a3', label: 'Annual report', start: '2026-04-20', end: '2026-05-12', tone: 'neutral' as const },
    ],
  },
  {
    id: '2',
    label: 'Marko Petrović',
    caption: 'Sales rep',
    utilisation: 118,
    bars: [
      { id: 'b1', label: 'Q2 quotes', start: '2026-04-02', end: '2026-04-24', tone: 'info' as const, progress: 40 },
      { id: 'b2', label: 'Trade fair', start: '2026-04-20', end: '2026-04-28', tone: 'danger' as const, detail: 'Overlaps with quote preparation' },
      { id: 'b3', label: 'Client visits', start: '2026-05-04', end: '2026-05-20', tone: 'info' as const },
    ],
  },
  {
    id: '3',
    label: 'Meeting room 2',
    caption: 'Capacity 12',
    utilisation: 44,
    bars: [
      { id: 'c1', label: 'Staff meeting', start: '2026-04-06', end: '2026-04-06', tone: 'neutral' as const },
      { id: 'c2', label: 'SEF training', start: '2026-04-13', end: '2026-04-16', tone: 'success' as const, progress: 100 },
      { id: 'c3', label: 'Internal audit', start: '2026-05-05', end: '2026-05-07', tone: 'neutral' as const },
    ],
  },
  {
    id: '4',
    label: 'CNC machine 1',
    caption: 'Zemun plant',
    utilisation: 76,
    bars: [
      { id: 'd1', label: 'Order 4821', start: '2026-04-01', end: '2026-04-11', tone: 'info' as const, progress: 100 },
      { id: 'd2', label: 'Service', start: '2026-04-13', end: '2026-04-14', tone: 'warning' as const, detail: 'Routine maintenance' },
      { id: 'd3', label: 'Order 4839', start: '2026-04-16', end: '2026-05-08', tone: 'info' as const, progress: 25 },
    ],
  },
]

function VersionDemo({ changes, before, after }: { changes: FieldChange[]; before: string; after: string }) {
  const [showAll, setShowAll] = useState(false)
  return (
    <VersionCompare
      changes={changes}
      beforeLabel={before}
      afterLabel={after}
      showUnchanged={showAll}
      onToggleUnchanged={setShowAll}
    />
  )
}

export const structureCategories: CatalogCategory[] = [
  {
    slug: 'hierarchy',
    title: 'Hierarchy and structure',
    description: 'Org chart, bill of materials, chart of accounts, categories, rooms.',
    group: 'blocks',
    icon: Network,
    entries: [
      {
        id: 'org-chart',
        title: 'Org chart',
        description: 'Indentation is drawn with lines — at the fourth level, spacing alone stops showing membership.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Stack gap={0} p="md">
            <StructureTree nodes={ORG_CHART} defaultExpandedDepth={2} valueLabel="Number of people" />
          </Stack>
        ),
        code: `<StructureTree nodes={orgChart} defaultExpandedDepth={2} valueLabel="Number of people" />`,
      },
      {
        id: 'chart-of-accounts',
        title: 'Chart of accounts',
        description: 'Same code, different data — classes, groups and sub-accounts with a balance.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Stack gap={0} p="md">
            <StructureTree nodes={CHART_OF_ACCOUNTS} defaultExpandedDepth={1} valueLabel="Balance" />
          </Stack>
        ),
      },
    ],
  },

  {
    slug: 'versions',
    title: 'Version comparison',
    description: 'Exactly what changed between two states of a record.',
    group: 'blocks',
    icon: GitCompareArrows,
    entries: [
      {
        id: 'contract-diff',
        title: 'Contract revision',
        description: 'Unchanged fields are hidden — the contract has forty fields, four changed.',
        from: '@liro/ui',
        demo: <VersionDemo changes={CONTRACT_CHANGES} before="v2 · 12.01.2026." after="v3 · 02.04.2026." />,
        code: `<VersionCompare
  changes={diff}
  beforeLabel="v2 · 12.01.2026."
  afterLabel="v3 · 02.04.2026."
  showUnchanged={showAll}
  onToggleUnchanged={setShowAll}
/>`,
      },
      {
        id: 'spec-diff',
        title: 'Product specification change',
        description: 'The same component in production and quality control.',
        from: '@liro/ui',
        demo: <VersionDemo changes={SPEC_CHANGES} before="Rev. B" after="Rev. C" />,
      },
    ],
  },

  {
    slug: 'capacity',
    title: 'Capacity allocation',
    description: 'Who is working on what over time — people, machines, rooms, vehicles.',
    group: 'blocks',
    icon: GanttChartSquare,
    entries: [
      {
        id: 'capacity-timeline',
        title: 'Timeline allocation',
        description: 'A real date axis, scale switching, a marker for today, overlaps across multiple rows.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Stack gap={0} p="md">
            <CapacityTimeline
              rows={CAPACITY_ROWS}
              from="2026-04-01"
              to="2026-12-31" // Extended into December so the horizontal scroll is visible in the demo.
              onBarClick={(row, bar) => {
                // Uses the shared notification system, not a browser alert.
                notice.info({
                  title: { en: 'Task opened' },
                  message: { en: `Showing details for: ${bar.label}` }
                })
              }}
            />
          </Stack>
        ),
        code: `<CapacityTimeline
  rows={allocations}
  from="2026-04-01"
  to="2026-12-31"
  onBarClick={(row, bar) => openTask(bar.id)}
/>`,
      },
      {
        id: 'capacity-notes',
        title: 'What changed',
        demo: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Stack gap="sm">
              <Text size="sm">
                The first version accepted shares from 0 to 1. It seemed flexible, but it forced the
                application to compute positions itself, and left the user without an answer to the
                most important question — <strong>exactly when</strong>.
              </Text>
              <Text size="sm">
                Now the component receives real dates and computes the layout itself. In return it
                gained a tick-marked axis, a scale switch, a marker for today, and horizontal scroll
                independent of the name column.
              </Text>
            </Stack>
            <Stack gap="sm">
              <Text size="sm">
                Utilization over 100% is colored red. An overloaded resource is the most common
                reason this screen gets opened at all, so it has to be visible without reading the
                bars.
              </Text>
              <Text size="sm">
                How full a bar is reflects task progress, not time — a bar can be in the past while
                the task is unfinished.
              </Text>
              <Text size="sm">
                Overlaps are no longer drawn on top of each other but in separate sub-rows. Marko
                Petrović's row has three bars in two sub-rows — the overload is visible without
                reading the percentage.
              </Text>
            </Stack>
          </SimpleGrid>
        ),
      },
    ],
  },
]
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Stack, Text } from '@mantine/core'
import { Layers } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  DataTable,
  BulkActionBar,
  JobProgress,
  StatusBadge,
  type BulkAction,
  type DataTableColumn,
  type JobPhase,
  type JobState,
} from '@liro/ui'

interface Partner extends Record<string, unknown> {
  id: string
  naziv: string
  pib: string
  saldo: number
  poslato: boolean
}

/* Deterministic data — see the note in `table-large`. */
function pseudo(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function generisi(): Partner[] {
  return Array.from({ length: 240 }, (_, index) => ({
    id: `p-${index}`,
    naziv: `Partner ${String(index + 1).padStart(3, '0')} d.o.o.`,
    pib: String(100000000 + index * 137),
    saldo: Math.round((pseudo(index) - 0.35) * 900000),
    poslato: index % 7 === 0,
  }))
}

const PHASES: JobPhase[] = [
  { id: 'prep', label: { en: 'Preparing data' }, state: 'pending' },
  { id: 'render', label: { en: 'Generating PDFs' }, state: 'pending' },
  { id: 'zip', label: { en: 'Packaging archive' }, state: 'pending' },
]

const getPartnerId = (row: Partner) => row.id
const partnerSelectable = (row: Partner) => !row.poslato

export default function MassProcessingPage() {
  const rows = useMemo(generisi, [])
  const [selected, setSelected] = useState<string[]>([])

  const [jobState, setJobState] = useState<JobState | null>(null)
  const [processed, setProcessed] = useState(0)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [phases, setPhases] = useState<JobPhase[]>(PHASES)

  const total = selected.length

  /*
   * Simulation of a server-side job. In a real application, this would be a
   * `useCall` that periodically polls `background_jobs` for status, or a
   * Supabase realtime channel.
   */
  useEffect(() => {
    if (jobState !== 'running') return

    const timer = setInterval(() => {
      setProcessed((current) => {
        const next = current + Math.max(1, Math.round(total / 25))
        if (next >= total) {
          clearInterval(timer)
          setPhases(PHASES.map((phase) => ({ ...phase, state: 'done' })))
          setJobState('succeeded')
          return total
        }

        const share = next / total
        setPhases([
          { ...PHASES[0]!, state: 'done' },
          { ...PHASES[1]!, state: share < 0.9 ? 'active' : 'done', note: `${next} / ${total}` },
          { ...PHASES[2]!, state: share < 0.9 ? 'pending' : 'active' },
        ])
        return next
      })
    }, 300)

    return () => clearInterval(timer)
  }, [jobState, total])

  const start = () => {
    setProcessed(0)
    setPhases([{ ...PHASES[0]!, state: 'active' }, PHASES[1]!, PHASES[2]!])
    setStartedAt(new Date())
    setJobState('running')
  }

  const columns: DataTableColumn<Partner>[] = [
    { name: 'naziv', label: { en: 'Partner' }, sortable: true },
    { name: 'pib', label: { en: 'Tax ID' }, width: 130 },
    { name: 'saldo', label: { en: 'Balance' }, type: 'currency', width: 150 },
    {
      name: 'poslato',
      label: { en: 'Statement' },
      width: 130,
      render: (_value, row) =>
        row.poslato ? (
          <StatusBadge tone="success" label={{ en: 'Sent' }} />
        ) : (
          <StatusBadge tone="neutral" label={{ en: 'Not sent' }} />
        ),
    },
  ]

  const bulkActions: BulkAction[] = [
    {
      intent: 'pdf',
      label: { en: 'Generate statements' },
      confirm: true,
      confirmTitle: { en: 'Bulk generation' },
      disabledReason: (ids) =>
        ids.length > 200 ? { en: 'Max 200 at once' } : false,
      onClick: start,
    },
    {
      intent: 'excel',
      label: { en: 'Export list' },
      onClick: () => {},
    },
  ]

  return (
    <PageContainer width="wide">
      <PageHeader
        icon={Layers}
        title={{ en: 'Bulk statements' }}
        description={{ en: 'Select partners, then run' }}
        withDivider
      />

      <Stack gap="md">
        {jobState && (
          <JobProgress
            state={jobState}
            title={{ en: 'Generating statements' }}
            description={{ en: 'Result arrives as a ZIP archive' }}
            processed={processed}
            total={total}
            phases={phases}
            startedAt={startedAt}
            onCancel={() => setJobState('cancelled')}
            onDownload={() => {}}
          />
        )}

        <BulkActionBar
          selected={selected}
          onClear={() => setSelected([])}
          actions={bulkActions}
          totalCount={rows.filter(partnerSelectable).length}
          onSelectAll={() => setSelected(rows.filter(partnerSelectable).map(getPartnerId))}
          loading={jobState === 'running'}
        />

        <SectionCard flush>
          <DataTable<Partner>
            columns={columns}
            rows={rows}
            getRowId={getPartnerId}
            selected={selected}
            onSelectionChange={setSelected}
            /* Partners who already received a statement can't be selected again. */
            isRowSelectable={partnerSelectable}
            virtualized
            stickyFirstColumn
            maxHeight={440}
            mobile={{ titleField: 'naziv', subtitleField: 'pib' }}
          />
        </SectionCard>

        <Text size="xs" c="dimmed">
          Select partners, then „Generate statements". The progress bar and phases appear above the
          table.
        </Text>
      </Stack>
    </PageContainer>
  )
}

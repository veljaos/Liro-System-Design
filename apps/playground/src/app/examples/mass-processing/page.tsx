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

/* Deterministicki podaci — vidi napomenu u `table-large`. */
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
  { id: 'prep', label: { sr: 'Priprema podataka', en: 'Preparing data' }, state: 'pending' },
  { id: 'render', label: { sr: 'Generisanje PDF-ova', en: 'Generating PDFs' }, state: 'pending' },
  { id: 'zip', label: { sr: 'Pakovanje u arhivu', en: 'Packaging archive' }, state: 'pending' },
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
   * Simulacija posla na serveru. U aplikaciji bi ovde stajao `useCall` koji
   * povremeno pita `background_jobs` za stanje, ili Supabase realtime kanal.
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
    { name: 'naziv', label: { sr: 'Partner', en: 'Partner' }, sortable: true },
    { name: 'pib', label: { sr: 'PIB', en: 'Tax ID' }, width: 130 },
    { name: 'saldo', label: { sr: 'Saldo', en: 'Balance' }, type: 'currency', width: 150 },
    {
      name: 'poslato',
      label: { sr: 'IOS', en: 'Statement' },
      width: 130,
      render: (_value, row) =>
        row.poslato ? (
          <StatusBadge tone="success" label={{ sr: 'Poslato', en: 'Sent' }} />
        ) : (
          <StatusBadge tone="neutral" label={{ sr: 'Nije poslato', en: 'Not sent' }} />
        ),
    },
  ]

  const bulkActions: BulkAction[] = [
    {
      intent: 'pdf',
      label: { sr: 'Generiši IOS', 'sr-Cyrl': 'Генериши ИОС', en: 'Generate statements' },
      confirm: true,
      confirmTitle: { sr: 'Masovno generisanje', 'sr-Cyrl': 'Масовно генерисање', en: 'Bulk generation' },
      disabledReason: (ids) =>
        ids.length > 200 ? { sr: 'Najviše 200 partnera odjednom', en: 'Max 200 at once' } : false,
      onClick: start,
    },
    {
      intent: 'excel',
      label: { sr: 'Izvezi spisak', en: 'Export list' },
      onClick: () => {},
    },
  ]

  return (
    <PageContainer width="wide">
      <PageHeader
        icon={Layers}
        title={{ sr: 'Masovno slanje IOS-a', 'sr-Cyrl': 'Масовно слање ИОС-а', en: 'Bulk statements' }}
        description={{ sr: 'Izaberi partnere pa pokreni obradu', en: 'Select partners, then run' }}
        withDivider
      />

      <Stack gap="md">
        {jobState && (
          <JobProgress
            state={jobState}
            title={{ sr: 'Generisanje IOS-a', 'sr-Cyrl': 'Генерисање ИОС-а', en: 'Generating statements' }}
            description={{ sr: 'Rezultat stiže kao ZIP arhiva', en: 'Result arrives as a ZIP archive' }}
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
            /* Partneri kojima je IOS vec poslat se ne biraju ponovo. */
            isRowSelectable={partnerSelectable}
            virtualized
            stickyFirstColumn
            maxHeight={440}
            mobile={{ titleField: 'naziv', subtitleField: 'pib' }}
          />
        </SectionCard>

        <Text size="xs" c="dimmed">
          Izaberi partnere, pa „Generiši IOS". Traka napretka i faze se pojavljuju iznad tabele.
        </Text>
      </Stack>
    </PageContainer>
  )
}
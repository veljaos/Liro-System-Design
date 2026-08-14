'use client'

import { useMemo, useState } from 'react'
import { Group, Stack, Text } from '@mantine/core'
import { Table2 } from 'lucide-react'
import {
  PageContainer,
  PageHeader,
  SectionCard,
  DataTable,
  BulkActionBar,
  type BulkAction,
  type DataTableColumn,
} from '@liro/ui'

interface Konto extends Record<string, unknown> {
  sifra: string
  naziv: string
  vrsta: string
  duguje: number
  potrazuje: number
}

/*
* Deterministic pseudo-random number from the index.
*
* `Math.random()` would be a mistake here: the server computes one set of
* amounts, the browser another, and React reports a hydration mismatch. The
* same applies to `Date.now()` and `new Date()` during render.
*/
function pseudo(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/* 932 rows — roughly the size of a real chart of accounts. */
function generisi(): Konto[] {
  const grupe = ['Sredstva', 'Obaveze', 'Kapital', 'Rashodi', 'Prihodi']
  return Array.from({ length: 932 }, (_, index) => ({
    sifra: String(100000 + index * 7),
    naziv: `Analitički konto broj ${index + 1}`,
    vrsta: grupe[index % grupe.length] ?? 'Sredstva',
    duguje: Math.round(pseudo(index * 2 + 1) * 400000),
    potrazuje: Math.round(pseudo(index * 2 + 2) * 400000),
  }))
}

/*
* Deliberately defined OUTSIDE the component.
*
* If written inline (`getRowId={(row) => row.sifra}`), they would be
* recreated on every render and break every `useMemo` that depends on them.
* In a virtualized table that means recomputing over all 932 rows on every
* frame.
*/
const getKontoId = (row: Konto) => row.sifra
const kontoSelectable = (row: Konto) => row.vrsta !== 'Prihodi'

export default function LargeTablePage() {
  const rows = useMemo(generisi, [])
  const [selected, setSelected] = useState<string[]>([])
  const [poslednji, setPoslednji] = useState<string | null>(null)
  const [poruka, setPoruka] = useState<string | null>(null)

  /* The count must match what a click will actually select. */
  const izborivi = useMemo(() => rows.filter(kontoSelectable).map(getKontoId), [rows])

  const bulkActions: BulkAction[] = [
  {
    intent: 'excel',
    label: { en: 'Export' },
    onClick: (ids) => setPoruka(`Exported: ${ids.length}`),
  },
  {
    intent: 'post',
    label: { en: 'Post' },
    /* Irreversible intent — confirmation is requested automatically, without confirm: true. */
    disabledReason: (ids) =>
      ids.length > 100 ? { en: 'Max 100 at once' } : false,
    onClick: (ids) => setPoruka(`Posted: ${ids.length}`),
  },
  {
    intent: 'delete',
    onClick: (ids) => {
      setPoruka(`Deleted: ${ids.length}`)
      setSelected([])
    },
  },
]


  const columns: DataTableColumn<Konto>[] = [
    { name: 'sifra', label: { en: 'Code' }, width: 110, sortable: true },
    { name: 'naziv', label: { en: 'Name' }, sortable: true },
    { name: 'vrsta', label: { en: 'Type' }, width: 140 },
    { name: 'duguje', label: { en: 'Debit' }, type: 'currency', width: 150 },
    { name: 'potrazuje', label: { en: 'Credit' }, type: 'currency', width: 150 },
  ]

  /*
   * In a real application, the total would arrive from the server along with
   * the page of data. Here it is computed locally only because all rows are
   * in memory anyway.
   */
  const zbir = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          duguje: acc.duguje + row.duguje,
          potrazuje: acc.potrazuje + row.potrazuje,
        }),
        { duguje: 0, potrazuje: 0 },
      ),
    [rows],
  )

  return (
    <PageContainer width="wide">
      <PageHeader
        icon={Table2}
        title={{ en: 'Chart of accounts' }}
        description={{ en: '932 rows, virtualized' }}
        actions={
          <Group gap="lg">
            <Text size="sm" c="dimmed">Last opened: {poslednji ?? '—'}</Text>
            <Text size="sm" c="dimmed">{poruka ?? '—'}</Text>
          </Group>
        }
        withDivider
      />

      <Stack gap="md">
        <BulkActionBar
          selected={selected}
          onClear={() => setSelected([])}
          actions={bulkActions}
          totalCount={izborivi.length}
          onSelectAll={() => setSelected(izborivi)}
        />
        <SectionCard flush>
          <DataTable<Konto>
            columns={columns}
            rows={rows}
            getRowId={getKontoId}
            selected={selected}
            onSelectionChange={setSelected}
            /* Revenue accounts cannot be selected — an example of conditional selection. */
            isRowSelectable={kontoSelectable}
            footer={{
              label: { en: 'Total' },
              values: { duguje: zbir.duguje, potrazuje: zbir.potrazuje },
            }}
            virtualized
            stickyFirstColumn
            maxHeight={520}
            onRowClick={(row) => setPoslednji(row.sifra)}
            sort={{ field: 'sifra', order: 'asc' }}
            onSortChange={() => {}}
          />
        </SectionCard>

        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Try it: Tab to a row then <b>Enter</b> (opens) or <b>space</b> (checks) · scroll to the bottom
          </Text>
        </Group>
      </Stack>
    </PageContainer>
  )
}
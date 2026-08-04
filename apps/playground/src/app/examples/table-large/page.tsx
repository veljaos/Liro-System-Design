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
* Deterministicki pseudo-slucajan broj iz rednog broja.
*
* `Math.random()` bi ovde bio greska: server izracuna jedne iznose, pregledac
* druge, i React prijavi neslaganje pri hidrataciji. Isto vazi za `Date.now()`
* i `new Date()` u renderu.
*/
function pseudo(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/* 932 reda — priblizno velicina pravog kontnog plana. */
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
* Definisane VAN komponente namerno.
*
* Da su pisane inline (`getRowId={(row) => row.sifra}`), pravile bi se iznova
* pri svakom renderu i rusile bi svaki `useMemo` koji zavisi od njih. U
* virtuelizovanoj tabeli to znaci racunanje nad svih 932 reda na svaki kadar.
*/
const getKontoId = (row: Konto) => row.sifra
const kontoSelectable = (row: Konto) => row.vrsta !== 'Prihodi'

export default function LargeTablePage() {
  const rows = useMemo(generisi, [])
  const [selected, setSelected] = useState<string[]>([])
  const [poslednji, setPoslednji] = useState<string | null>(null)
  const [poruka, setPoruka] = useState<string | null>(null)

  /* Broj mora odgovarati onome sto ce klik stvarno izabrati. */
  const izborivi = useMemo(() => rows.filter(kontoSelectable).map(getKontoId), [rows])

  const bulkActions: BulkAction[] = [
  {
    intent: 'excel',
    label: { sr: 'Izvezi', 'sr-Cyrl': 'Извези', en: 'Export' },
    onClick: (ids) => setPoruka(`Izvezeno: ${ids.length}`),
  },
  {
    intent: 'post',
    label: { sr: 'Proknjiži', 'sr-Cyrl': 'Прокњижи', en: 'Post' },
    /* Nepovratna namera — potvrda se trazi sama, bez confirm: true. */
    disabledReason: (ids) =>
      ids.length > 100 ? { sr: 'Najviše 100 odjednom', en: 'Max 100 at once' } : false,
    onClick: (ids) => setPoruka(`Proknjiženo: ${ids.length}`),
  },
  {
    intent: 'delete',
    onClick: (ids) => {
      setPoruka(`Obrisano: ${ids.length}`)
      setSelected([])
    },
  },
]


  const columns: DataTableColumn<Konto>[] = [
    { name: 'sifra', label: { sr: 'Šifra', en: 'Code' }, width: 110, sortable: true },
    { name: 'naziv', label: { sr: 'Naziv', en: 'Name' }, sortable: true },
    { name: 'vrsta', label: { sr: 'Vrsta', en: 'Type' }, width: 140 },
    { name: 'duguje', label: { sr: 'Duguje', en: 'Debit' }, type: 'currency', width: 150 },
    { name: 'potrazuje', label: { sr: 'Potražuje', en: 'Credit' }, type: 'currency', width: 150 },
  ]

  /*
   * Zbir bi u pravoj aplikaciji stigao sa servera zajedno sa stranom podataka.
   * Ovde ga racunamo lokalno samo zato sto su svi redovi ionako u memoriji.
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
        title={{ sr: 'Kontni plan', 'sr-Cyrl': 'Контни план', en: 'Chart of accounts' }}
        description={{ sr: '932 reda, virtuelizovano', en: '932 rows, virtualized' }}
        actions={
          <Group gap="lg">
            <Text size="sm" c="dimmed">Poslednji otvoren: {poslednji ?? '—'}</Text>
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
            /* Prihodi se ne mogu birati — primer uslovnog izbora. */
            isRowSelectable={kontoSelectable}
            footer={{
              label: { sr: 'Ukupno', 'sr-Cyrl': 'Укупно', en: 'Total' },
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
            Probaj: Tab do reda pa <b>Enter</b> (otvara) ili <b>razmak</b> (čekira) · skrol do dna
          </Text>
        </Group>
      </Stack>
    </PageContainer>
  )
}
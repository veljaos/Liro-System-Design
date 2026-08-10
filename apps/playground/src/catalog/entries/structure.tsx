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
    label: 'Direktor',
    kind: 'Uprava',
    value: '47',
    children: [
      {
        id: '2',
        label: 'Sektor knjigovodstva',
        kind: 'Sektor',
        value: '18',
        children: [
          { id: '3', label: 'Odeljenje zarada', value: '7' },
          { id: '4', label: 'Odeljenje glavne knjige', value: '6' },
          { id: '5', label: 'Odeljenje PDV-a', value: '5' },
        ],
      },
      {
        id: '6',
        label: 'Sektor prodaje',
        kind: 'Sektor',
        value: '21',
        children: [
          { id: '7', label: 'Veleprodaja', value: '12' },
          { id: '8', label: 'Maloprodaja', value: '9' },
        ],
      },
      { id: '9', label: 'Pravna služba', kind: 'Služba', value: '4' },
      { id: '10', label: 'Održavanje', kind: 'Služba', value: '4' },
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
  { group: 'Zaglavlje', label: { sr: 'Naručilac' }, before: 'Konfirs d.o.o.', after: 'Konfirs d.o.o.' },
  { group: 'Zaglavlje', label: { sr: 'Predmet ugovora' }, before: 'Knjigovodstvene usluge', after: 'Knjigovodstvene i savetodavne usluge' },
  { group: 'Uslovi', label: { sr: 'Mesečna naknada' }, before: '48.000,00 RSD', after: '56.500,00 RSD' },
  { group: 'Uslovi', label: { sr: 'Rok plaćanja' }, before: '15 dana', after: '30 dana' },
  { group: 'Uslovi', label: { sr: 'Valuta' }, before: 'RSD', after: 'RSD' },
  { group: 'Uslovi', label: { sr: 'Klauzula o poverljivosti' }, before: null, after: 'Član 12 — obaveza traje 5 godina po raskidu' },
  { group: 'Uslovi', label: { sr: 'Popust za avansno plaćanje' }, before: '3%', after: null },
]

const SPEC_CHANGES: FieldChange[] = [
  { group: 'Specifikacija', label: { sr: 'Materijal kućišta' }, before: 'ABS plastika', after: 'Polikarbonat' },
  { group: 'Specifikacija', label: { sr: 'Masa' }, before: '1,84 kg', after: '2,01 kg' },
  { group: 'Specifikacija', label: { sr: 'Radna temperatura' }, before: '−10 do 40 °C', after: '−10 do 40 °C' },
  { group: 'Kontrola', label: { sr: 'Ispitivanje pada' }, before: null, after: 'Obavezno, visina 1,2 m' },
]

const CAPACITY_ROWS = [
  {
    id: '1',
    label: 'Ana Jovanović',
    caption: 'Knjigovođa',
    utilisation: 92,
    bars: [
      { id: 'a1', label: 'Obračun zarada — mart', start: '2026-04-01', end: '2026-04-08', tone: 'info' as const, progress: 100 },
      { id: 'a2', label: 'PDV prijava', start: '2026-04-09', end: '2026-04-15', tone: 'warning' as const, progress: 60 },
      { id: 'a3', label: 'Godišnji izveštaj', start: '2026-04-20', end: '2026-05-12', tone: 'neutral' as const },
    ],
  },
  {
    id: '2',
    label: 'Marko Petrović',
    caption: 'Komercijalista',
    utilisation: 118,
    bars: [
      { id: 'b1', label: 'Ponude Q2', start: '2026-04-02', end: '2026-04-24', tone: 'info' as const, progress: 40 },
      { id: 'b2', label: 'Sajam', start: '2026-04-20', end: '2026-04-28', tone: 'danger' as const, detail: 'Preklapa se sa pripremom ponuda' },
      { id: 'b3', label: 'Obilazak klijenata', start: '2026-05-04', end: '2026-05-20', tone: 'info' as const },
    ],
  },
  {
    id: '3',
    label: 'Sala za sastanke 2',
    caption: 'Kapacitet 12',
    utilisation: 44,
    bars: [
      { id: 'c1', label: 'Kolegijum', start: '2026-04-06', end: '2026-04-06', tone: 'neutral' as const },
      { id: 'c2', label: 'Obuka SEF', start: '2026-04-13', end: '2026-04-16', tone: 'success' as const, progress: 100 },
      { id: 'c3', label: 'Interna revizija', start: '2026-05-05', end: '2026-05-07', tone: 'neutral' as const },
    ],
  },
  {
    id: '4',
    label: 'CNC mašina 1',
    caption: 'Pogon Zemun',
    utilisation: 76,
    bars: [
      { id: 'd1', label: 'Nalog 4821', start: '2026-04-01', end: '2026-04-11', tone: 'info' as const, progress: 100 },
      { id: 'd2', label: 'Servis', start: '2026-04-13', end: '2026-04-14', tone: 'warning' as const, detail: 'Redovno održavanje' },
      { id: 'd3', label: 'Nalog 4839', start: '2026-04-16', end: '2026-05-08', tone: 'info' as const, progress: 25 },
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
    title: 'Hijerarhija i struktura',
    description: 'Organizaciona šema, sastavnica proizvoda, kontni plan, kategorije, prostorije.',
    group: 'blocks',
    icon: Network,
    entries: [
      {
        id: 'org-chart',
        title: 'Organizaciona šema',
        description: 'Uvlačenje se crta linijama — na četvrtom nivou razmak prestaje da pokazuje pripadnost.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Stack gap={0} p="md">
            <StructureTree nodes={ORG_CHART} defaultExpandedDepth={2} valueLabel="Broj lica" />
          </Stack>
        ),
        code: `<StructureTree nodes={orgChart} defaultExpandedDepth={2} valueLabel="Broj lica" />`,
      },
      {
        id: 'chart-of-accounts',
        title: 'Kontni plan',
        description: 'Isti kod, drugi podaci — klase, grupe i analitika sa saldom.',
        from: '@liro/ui',
        wide: true,
        demo: (
          <Stack gap={0} p="md">
            <StructureTree nodes={CHART_OF_ACCOUNTS} defaultExpandedDepth={1} valueLabel="Saldo" />
          </Stack>
        ),
      },
    ],
  },

  {
    slug: 'versions',
    title: 'Poređenje verzija',
    description: 'Šta se tačno promenilo između dva stanja zapisa.',
    group: 'blocks',
    icon: GitCompareArrows,
    entries: [
      {
        id: 'contract-diff',
        title: 'Revizija ugovora',
        description: 'Nepromenjena polja su sakrivena — ugovor ima četrdeset polja, promenila su se četiri.',
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
        title: 'Izmena specifikacije proizvoda',
        description: 'Ista komponenta u proizvodnji i kontroli kvaliteta.',
        from: '@liro/ui',
        demo: <VersionDemo changes={SPEC_CHANGES} before="Rev. B" after="Rev. C" />,
      },
    ],
  },

  {
    slug: 'capacity',
    title: 'Raspodela kapaciteta',
    description: 'Ko radi na čemu kroz vreme — ljudi, mašine, sale, vozila.',
    group: 'blocks',
    icon: GanttChartSquare,
    entries: [
      {
        id: 'capacity-timeline',
        title: 'Vremenska raspodela',
        description: 'Prava osa sa datumima, promena razmere, oznaka današnjeg dana, preklapanja u više redova.',
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
                  title: { sr: 'Zadatak otvoren' },
                  message: { sr: `Prikazujem detalje za: ${bar.label}` }
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
        title: 'Šta je promenjeno',
        demo: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Stack gap="sm">
              <Text size="sm">
                Prva verzija je primala udele od 0 do 1. Delovalo je fleksibilno, ali je aplikaciju
                teralo da sama računa pozicije, a korisnika ostavljalo bez odgovora na najvažnije
                pitanje — <strong>kada tačno</strong>.
              </Text>
              <Text size="sm">
                Sada komponenta prima stvarne datume i sama računa raspored. Zauzvrat je dobila osu
                sa podeocima, prekidač razmere, oznaku današnjeg dana i vodoravni skrol nezavisan od
                kolone sa nazivima.
              </Text>
            </Stack>
            <Stack gap="sm">
              <Text size="sm">
                Iskorišćenost preko 100% se boji crveno. Preopterećen resurs je najčešći razlog zbog
                kojeg se ovaj ekran uopšte otvara, pa mora da se vidi bez čitanja traka.
              </Text>
              <Text size="sm">
                Popunjenost trake je napredak zadatka, a ne vreme — traka može biti u prošlosti a
                zadatak nezavršen.
              </Text>
              <Text size="sm">
                Preklapanja se više ne crtaju jedno preko drugog nego u zasebnim podredovima. Red
                Marka Petrovića ima tri trake u dva reda — preopterećenje se vidi bez čitanja
                procenta.
              </Text>
            </Stack>
          </SimpleGrid>
        ),
      },
    ],
  },
]

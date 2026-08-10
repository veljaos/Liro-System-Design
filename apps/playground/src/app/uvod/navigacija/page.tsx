'use client'

import { Code, Stack, Table, Text, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { Callout } from '@liro/ui'
import { DocsPage, DocsShell } from '@/components/DocsShell'

/**
 * Navigation rules derived from Liro Business App.
 *
 * Not invented but read from existing code: entities with many fields
 * already have full routes (`employees/new`, `employees/[id]`, same for
 * clients and other income), and modals are used only for short actions.
 */

const RULES: [string, string, string][] = [
  [
    'Puna stranica',
    'Unos i izmena entiteta sa više od desetak polja, sa tabovima, prilozima ili podacima iz više izvora.',
    'Zaposleno lice, klijent, ugovor, nalog, ostali prihod',
  ],
  [
    'Fioka',
    'Izmena podskupa polja dok spisak iza ostaje vidljiv. Kratko, jedan cilj.',
    'Brza izmena cene, dodela oznake, filter sa mnogo polja',
  ],
  [
    'Modal',
    'Jedna radnja sa jednim ishodom, ili pregled bez izmene.',
    'Potvrda brisanja, unos fiskalnog računa, pregled dokumenta, izbor izveštaja',
  ],
]

const WHY: [string, string][] = [
  ['Modal nema adresu', 'Dug unos koji se prekine ne može da se nastavi, ne može da se pošalje kolegi i ne preživljava osvežavanje.'],
  ['Modal ne podnosi grešku', 'Kad server odbije zapis sa greškom po polju, u modalu se ne vidi koje je polje ispod pregiba.'],
  ['Modal nema mesta', 'Četrdeset polja u modalu znači skrol unutar skrola — najgori mogući unos.'],
  ['Stranica ima povratak', 'Dugme „nazad" u pregledaču radi ono što korisnik očekuje, bez ijedne linije koda.'],
]

export default function NavigationPatternsPage() {
  return (
    <DocsShell>
      <DocsPage
        toc={[
          { id: 'pravilo', title: 'Kada šta' },
          { id: 'zasto', title: 'Zašto puna stranica' },
          { id: 'rute', title: 'Oblik ruta' },
          { id: 'sablon', title: 'RecordFormTemplate' },
        ]}
      >
        <Stack gap="xl">
          <Stack gap="md">
            <Title order={1}>Obrasci navigacije</Title>
            <Text size="lg" style={{ color: liroVar.text.secondary }}>
              Kada modal, kada fioka, kada nova stranica. Pravila su pročitana iz Liro Business
              App-a, ne izmišljena.
            </Text>
          </Stack>

          <Stack gap="md" id="pravilo" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Kada šta</Title>
            <Table fz="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={130}>Oblik</Table.Th>
                  <Table.Th>Kada</Table.Th>
                  <Table.Th w="30%">Primeri</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {RULES.map(([form, when, examples]) => (
                  <Table.Tr key={form}>
                    <Table.Td fw={700}>{form}</Table.Td>
                    <Table.Td>{when}</Table.Td>
                    <Table.Td c="dimmed">{examples}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>

          <Stack gap="md" id="zasto" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Zašto puna stranica za entitete</Title>
            <Callout tone="info" title={{ sr: 'Razlog nije estetika' }}>
              Modal je brz za programera i skup za korisnika. Četiri stvari koje puna stranica dobija
              besplatno, a u modalu se moraju graditi ručno ili se ne mogu uopšte.
            </Callout>
            <Table fz="sm">
              <Table.Tbody>
                {WHY.map(([rule, why]) => (
                  <Table.Tr key={rule}>
                    <Table.Td w="34%" fw={600}>{rule}</Table.Td>
                    <Table.Td c="dimmed">{why}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>

          <Stack gap="md" id="rute" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Oblik ruta</Title>
            <Text>Isti oblik koji Liro Business App već koristi:</Text>
            <Table fz="sm">
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td w={200}><Code>/employees</Code></Table.Td>
                  <Table.Td c="dimmed">Spisak sa filterima i pretragom</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Code>/employees/new</Code></Table.Td>
                  <Table.Td c="dimmed">Unos novog zapisa</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Code>/employees/[id]</Code></Table.Td>
                  <Table.Td c="dimmed">Detalji i izmena</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td><Code>/employees/[id]/payroll</Code></Table.Td>
                  <Table.Td c="dimmed">Podređena celina istog zapisa</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
            <Text size="sm" style={{ color: liroVar.text.secondary }}>
              Zbog toga <code>ResourceTable</code> prima <code>onEdit</code> kao funkciju, a ne
              otvara formu sam — aplikacija odlučuje da li ide na rutu ili otvara fioku.
            </Text>
          </Stack>

          <Stack gap="md" id="sablon" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>RecordFormTemplate</Title>
            <Text>
              Šablon koji sprovodi ovo pravilo. Nosi zaglavlje sa povratkom, radnje na vrhu{' '}
              <strong>i na dnu</strong>, opcionu bočnu kolonu i napomenu o nesačuvanim izmenama.
            </Text>
            <Callout tone="neutral" title={{ sr: 'Zašto dugmad i na dnu' }}>
              Na formi koja se skroluje korisnik završi unos na dnu ekrana. Tražiti od njega da se
              vrati na vrh da bi sačuvao je nepotrebno — a upravo to radi većina poslovnih
              aplikacija.
            </Callout>
          </Stack>
        </Stack>
      </DocsPage>
    </DocsShell>
  )
}

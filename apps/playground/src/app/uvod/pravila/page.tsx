'use client'

import { Stack, Table, Text, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { Callout } from '@liro/ui'
import { DocsPage, DocsShell } from '@/components/DocsShell'

const RULES: [string, string][] = [
  ['ActionButton ne prima color ni variant', 'Ta dva propa su razlog zbog kojeg dva ekrana u istoj aplikaciji izgledaju kao dva proizvoda.'],
  ['Komponente ne sadrže heks vrednosti', 'Sve ide kroz liroVar. Zato tamna tema radi bez ijednog dodatnog pravila.'],
  ['Natpis se menja, boja ne', '„Novo lice" umesto „Novo" je preciznije i korisno. Zeleno „Novo" nije.'],
  ['Jedna puna dugmad po ekranu', 'Namera nosi podrazumevanu težinu, pa se šest punih dugmadi ne mogu ni napraviti.'],
  ['Tabela na telefonu nije tabela', 'Horizontalni skrol kroz pet kolona niko ne čita. mobileCard opisuje karticu.'],
  ['Prazna vrednost je crtica', 'Bez nje se ne vidi razlika između „nema podatka" i „polje se nije učitalo".'],
  ['Modali stoje izvan Tabs', 'keepMounted je false, pa modal u neaktivnom panelu ne postoji.'],
  ['Sakrivena polja ne putuju u bazu', 'Inače se čuva vrednost koju korisnik nije ni video.'],
  ['Greška stoji uz polje', 'Opšta poruka na vrhu se ne povezuje sa unosom.'],
  ['Uspeh nestaje, greška čeka', 'Poruka o grešci koja nestane za tri sekunde je isto što i poruka koje nije bilo.'],
]

export default function RulesPage() {
  return (
    <DocsShell>
      <DocsPage toc={[{ id: 'pravila', title: 'Pravila' }, { id: 'zasto', title: 'Zašto je krut' }]}>
        <Stack gap="xl">
          <Stack gap="md">
            <Title order={1}>Pravila sistema</Title>
            <Text size="lg" style={{ color: liroVar.text.secondary }}>
              Pročita se jednom; posle toga ih sistem sam sprovodi.
            </Text>
          </Stack>

          <Stack gap="md" id="pravila" style={{ scrollMarginTop: 80 }}>
            <Table fz="sm">
              <Table.Tbody>
                {RULES.map(([rule, why]) => (
                  <Table.Tr key={rule}>
                    <Table.Td w="42%" fw={600}>{rule}</Table.Td>
                    <Table.Td c="dimmed">{why}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>

          <Stack gap="md" id="zasto" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>Zašto je namerno krut</Title>
            <Callout tone="warning" title={{ sr: 'Ograničenja su proizvod' }}>
              Programer ne treba da donosi vizuelne odluke pod rokom. Treba da opiše šta ekran radi,
              a sistem da se pobrine kako izgleda — jer se tehnologije menjaju, a ljudsko ponašanje ne.
            </Callout>
            <Text>
              Ako neka radnja traži boju koja ne postoji u katalogu namera, greška je u katalogu, ne
              na mestu upotrebe. Dodaje se tamo, jednom, i odmah važi u svim aplikacijama.
            </Text>
          </Stack>
        </Stack>
      </DocsPage>
    </DocsShell>
  )
}

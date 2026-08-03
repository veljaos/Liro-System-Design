'use client'

import { useState } from 'react'
import { Divider, Grid, Group, Stack, Table, Tabs, Text, Timeline } from '@mantine/core'
import { FileText, Receipt } from 'lucide-react'
import {
  ActionButton,
  ActionGroup,
  Callout,
  CommandPalette,
  KeyValueList,
  PageContainer,
  RecordStatusBadge,
  SectionCard,
  commonNotice,
  notice,
  openCommandPalette,
  useShortcuts,
} from '@liro/ui'
import { DetailPageTemplate } from '@liro/templates'
import { useI18n } from '@liro/i18n'
import { DemoAppShell } from '@/components/DemoAppShell'

interface Line {
  id: string
  description: string
  quantity: number
  price: number
  vatRate: number
}

const LINES: Line[] = [
  { id: '1', description: 'Toner HP 26A crni', quantity: 12, price: 8450, vatRate: 20 },
  { id: '2', description: 'Papir A4 80g, ris', quantity: 200, price: 489.9, vatRate: 20 },
  { id: '3', description: 'Dispenzer za vodu — mesečni zakup', quantity: 3, price: 2200, vatRate: 20 },
  { id: '4', description: 'Usluga isporuke', quantity: 1, price: 3600, vatRate: 20 },
]

/**
 * Cela stranica jednog dokumenta.
 *
 * Poenta ove kartice nije da pokaze komponente pojedinacno - to radi kartica
 * "Komponente". Ovde se vidi kako izgledaju zajedno, na ekranu koji stvarno
 * postoji u knjigovodstvenom softveru: zaglavlje sa stanjem, traka radnji,
 * stavke, obracun, bocna kolona sa tokom dokumenta.
 */
export default function PagesShowcase() {
  const { formatDecimal, formatDate } = useI18n()
  const [status, setStatus] = useState<'draft' | 'signed' | 'posted'>('draft')

  const net = LINES.reduce((sum, line) => sum + line.quantity * line.price, 0)
  const vat = net * 0.2
  const total = net + vat

  useShortcuts([
    { keys: 'mod+P', handler: () => notice.info({ message: { sr: 'Štampa bi krenula ovde.', en: 'Print would start here.' } }) },
  ])

  return (
    <DemoAppShell>
      <CommandPalette
        actions={[
          {
            id: 'sign',
            label: { sr: 'Potpiši dokument', en: 'Sign document' },
            intent: 'sign',
            onTrigger: () => {
              setStatus('signed')
              commonNotice.saved({ sr: 'Dokument je potpisan.', en: 'Document signed.' })
            },
          },
          {
            id: 'post',
            label: { sr: 'Proknjiži', en: 'Post to ledger' },
            intent: 'post',
            onTrigger: () => {
              setStatus('posted')
              commonNotice.saved({ sr: 'Dokument je proknjižen.', en: 'Document posted.' })
            },
          },
        ]}
      />

      <PageContainer width="wide">
        <DetailPageTemplate
          title="Faktura 2026-000318"
          description={{ sr: 'Officedirect d.o.o. · PIB 101987654', en: 'Officedirect · Tax ID 101987654' }}
          icon={Receipt}
          badge={<RecordStatusBadge status={status} />}
          onBack={() => {}}
          actions={
            <ActionGroup>
              <ActionButton intent="pdf" />
              <ActionButton intent="print" />
              <ActionButton
                intent="sign"
                disabled={status !== 'draft'}
                onClick={() => {
                  setStatus('signed')
                  commonNotice.saved({ sr: 'Dokument je potpisan.', en: 'Document signed.' })
                }}
              />
              <ActionButton
                intent="post"
                disabled={status !== 'signed'}
                onClick={() => {
                  setStatus('posted')
                  commonNotice.saved({ sr: 'Dokument je proknjižen.', en: 'Document posted.' })
                }}
              />
            </ActionGroup>
          }
          aside={
            <>
              <SectionCard title={{ sr: 'Tok dokumenta', en: 'Document flow' }}>
                <Timeline active={status === 'posted' ? 2 : status === 'signed' ? 1 : 0} bulletSize={18} lineWidth={2}>
                  <Timeline.Item title="Sastavljen">
                    <Text size="xs" c="dimmed">{formatDate('2026-03-01')} · Ana Jovanović</Text>
                  </Timeline.Item>
                  <Timeline.Item title="Potpisan">
                    <Text size="xs" c="dimmed">
                      {status === 'draft' ? 'Čeka potpis' : `${formatDate('2026-03-02')} · elektronski potpis`}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item title="Proknjižen">
                    <Text size="xs" c="dimmed">
                      {status === 'posted' ? `${formatDate('2026-03-02')} · nalog 318` : 'Nije proknjižen'}
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </SectionCard>

              <SectionCard title={{ sr: 'Zaglavlje', en: 'Header' }}>
                <KeyValueList
                  columns={1}
                  items={[
                    { label: { sr: 'Datum prometa', en: 'Supply date' }, value: formatDate('2026-03-01') },
                    { label: { sr: 'Datum dospeća', en: 'Due date' }, value: formatDate('2026-03-31') },
                    { label: { sr: 'Valuta', en: 'Currency' }, value: 'RSD' },
                    { label: { sr: 'Način plaćanja', en: 'Payment' }, value: 'Virman' },
                  ]}
                />
              </SectionCard>
            </>
          }
        >
          <Callout tone="info" title={{ sr: 'Ovo je ceo kod stranice', en: 'This is the whole page' }}>
            Jedan <code>DetailPageTemplate</code>, jedan <code>ActionGroup</code> i tri{' '}
            <code>SectionCard</code>. Bez ijedne linije CSS-a, bez ijedne heks vrednosti. Pritisnite{' '}
            <strong>Ctrl+K</strong> — radnje ovog ekrana su i u komandnoj paleti.
          </Callout>

          <SectionCard title={{ sr: 'Stavke', en: 'Line items' }} flush>
            <Table.ScrollContainer minWidth={640}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Opis</Table.Th>
                    <Table.Th ta="right" w={110}>Količina</Table.Th>
                    <Table.Th ta="right" w={140}>Cena</Table.Th>
                    <Table.Th ta="right" w={90}>PDV</Table.Th>
                    <Table.Th ta="right" w={150}>Vrednost</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {LINES.map((line) => (
                    <Table.Tr key={line.id}>
                      <Table.Td>{line.description}</Table.Td>
                      <Table.Td ta="right" data-numeric>{formatDecimal(line.quantity, 0)}</Table.Td>
                      <Table.Td ta="right" data-numeric>{formatDecimal(line.price, 2)}</Table.Td>
                      <Table.Td ta="right" data-numeric>{line.vatRate}%</Table.Td>
                      <Table.Td ta="right" data-numeric fw={600}>
                        {formatDecimal(line.quantity * line.price, 2)}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </SectionCard>

          <SectionCard title={{ sr: 'Obračun', en: 'Totals' }}>
            <Grid gap="lg">
              <Grid.Col span={{ base: 12, sm: 7 }}>
                <Text size="sm" c="dimmed">
                  Iznosi koriste tabularne cifre, pa se decimale poravnavaju po koloni. Format je{' '}
                  <code>#.###,##</code> — tačka razdvaja hiljade, zarez decimale, kako se piše u
                  srpskom knjigovodstvu.
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Broj decimala je podesiv: iznosi na dve, kursevi NBS-a na četiri.
                  Kurs EUR: <strong data-numeric>{formatDecimal(117.2043, 4)}</strong>
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 5 }}>
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Osnovica</Text>
                    <Text size="sm" data-numeric>{formatDecimal(net, 2)} RSD</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">PDV 20%</Text>
                    <Text size="sm" data-numeric>{formatDecimal(vat, 2)} RSD</Text>
                  </Group>
                  <Divider my={4} />
                  <Group justify="space-between">
                    <Text fw={700}>Za uplatu</Text>
                    <Text fw={700} data-numeric>{formatDecimal(total, 2)} RSD</Text>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </SectionCard>

          <SectionCard title={{ sr: 'Obaveštenja', en: 'Notifications' }}>
            <Stack gap="sm">
              <Text size="sm">
                Uspeh je uvek zelen i nestaje sam. Greška je uvek crvena i čeka da je korisnik
                zatvori — poruka o grešci koja nestane za tri sekunde je isto što i poruka koje nije
                bilo.
              </Text>
              <Group gap="xs">
                <ActionButton intent="save" label={{ sr: 'Uspeh', en: 'Success' }} onClick={() => commonNotice.saved()} />
                <ActionButton
                  intent="delete"
                  label={{ sr: 'Greška', en: 'Error' }}
                  onClick={() => commonNotice.failed(new Error('Веза са SEF-om nije uspostavljena.'))}
                />
                <ActionButton
                  intent="filter"
                  label={{ sr: 'Komandna paleta', en: 'Command palette' }}
                  onClick={openCommandPalette}
                />
              </Group>
            </Stack>
          </SectionCard>
        </DetailPageTemplate>
      </PageContainer>
    </DemoAppShell>
  )
}

'use client'

import { useState } from 'react'
import { Divider, Grid, Group, Stack, Table, Text, Timeline } from '@mantine/core'
import { Receipt } from 'lucide-react'
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
 * A whole single-document page.
 *
 * The point of this card is not to show components individually - the
 * "Components" card does that. Here you see how they look together, on a
 * screen that actually exists in accounting software: header with status,
 * action bar, line items, totals, side column with the document flow.
 */
export default function PagesShowcase() {
  const { formatDecimal, formatDate } = useI18n()
  const [status, setStatus] = useState<'draft' | 'signed' | 'posted'>('draft')

  const net = LINES.reduce((sum, line) => sum + line.quantity * line.price, 0)
  const vat = net * 0.2
  const total = net + vat

  useShortcuts([
    { keys: 'mod+P', handler: () => notice.info({ message: { en: 'Print would start here.' } }) },
  ])

  return (
    <DemoAppShell>
      <CommandPalette
        actions={[
          {
            id: 'sign',
            label: { en: 'Sign document' },
            intent: 'sign',
            onTrigger: () => {
              setStatus('signed')
              commonNotice.saved({ en: 'Document signed.' })
            },
          },
          {
            id: 'post',
            label: { en: 'Post to ledger' },
            intent: 'post',
            onTrigger: () => {
              setStatus('posted')
              commonNotice.saved({ en: 'Document posted.' })
            },
          },
        ]}
      />

      <PageContainer width="wide">
        <DetailPageTemplate
          title="Invoice 2026-000318"
          description={{ en: 'Officedirect · Tax ID 101987654' }}
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
                  commonNotice.saved({ en: 'Document signed.' })
                }}
              />
              <ActionButton
                intent="post"
                disabled={status !== 'signed'}
                onClick={() => {
                  setStatus('posted')
                  commonNotice.saved({ en: 'Document posted.' })
                }}
              />
            </ActionGroup>
          }
          aside={
            <>
              <SectionCard title={{ en: 'Document flow' }}>
                <Timeline active={status === 'posted' ? 2 : status === 'signed' ? 1 : 0} bulletSize={18} lineWidth={2}>
                  <Timeline.Item title="Drafted">
                    <Text size="xs" c="dimmed">{formatDate('2026-03-01')} · Ana Jovanović</Text>
                  </Timeline.Item>
                  <Timeline.Item title="Signed">
                    <Text size="xs" c="dimmed">
                      {status === 'draft' ? 'Awaiting signature' : `${formatDate('2026-03-02')} · electronic signature`}
                    </Text>
                  </Timeline.Item>
                  <Timeline.Item title="Posted">
                    <Text size="xs" c="dimmed">
                      {status === 'posted' ? `${formatDate('2026-03-02')} · order 318` : 'Not posted'}
                    </Text>
                  </Timeline.Item>
                </Timeline>
              </SectionCard>

              <SectionCard title={{ en: 'Header' }}>
                <KeyValueList
                  columns={1}
                  items={[
                    { label: { en: 'Supply date' }, value: formatDate('2026-03-01') },
                    { label: { en: 'Due date' }, value: formatDate('2026-03-31') },
                    { label: { en: 'Currency' }, value: 'RSD' },
                    { label: { en: 'Payment' }, value: 'Bank transfer' },
                  ]}
                />
              </SectionCard>
            </>
          }
        >
          <Callout tone="info" title={{ en: 'This is the whole page' }}>
            One <code>DetailPageTemplate</code>, one <code>ActionGroup</code> and three{' '}
            <code>SectionCard</code>. Without a single line of CSS, without a single hex value.
            Press <strong>Ctrl+K</strong> — this screen's actions are also in the command palette.
          </Callout>

          <SectionCard title={{ en: 'Line items' }} flush>
            <Table.ScrollContainer minWidth={640}>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Description</Table.Th>
                    <Table.Th ta="right" w={110}>Quantity</Table.Th>
                    <Table.Th ta="right" w={140}>Price</Table.Th>
                    <Table.Th ta="right" w={90}>VAT</Table.Th>
                    <Table.Th ta="right" w={150}>Value</Table.Th>
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

          <SectionCard title={{ en: 'Totals' }}>
            <Grid gap="lg">
              <Grid.Col span={{ base: 12, sm: 7 }}>
                <Text size="sm" c="dimmed">
                  Amounts use tabular figures, so decimals align by column. The format is{' '}
                  <code>#.###,##</code> — a dot separates thousands, a comma the decimals, the way
                  it is written in Serbian bookkeeping.
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  The number of decimals is adjustable: amounts to two, NBS exchange rates to four.
                  EUR rate: <strong data-numeric>{formatDecimal(117.2043, 4)}</strong>
                </Text>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 5 }}>
                <Stack gap={6}>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Base amount</Text>
                    <Text size="sm" data-numeric>{formatDecimal(net, 2)} RSD</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">VAT 20%</Text>
                    <Text size="sm" data-numeric>{formatDecimal(vat, 2)} RSD</Text>
                  </Group>
                  <Divider my={4} />
                  <Group justify="space-between">
                    <Text fw={700}>Amount due</Text>
                    <Text fw={700} data-numeric>{formatDecimal(total, 2)} RSD</Text>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </SectionCard>

          <SectionCard title={{ en: 'Notifications' }}>
            <Stack gap="sm">
              <Text size="sm">
                Success is always green and disappears on its own. An error is always red and
                waits for the user to close it — an error message that vanishes after three
                seconds is the same as no message at all.
              </Text>
              <Group gap="xs">
                <ActionButton intent="save" label={{ en: 'Success' }} onClick={() => commonNotice.saved()} />
                <ActionButton
                  intent="delete"
                  label={{ en: 'Error' }}
                  onClick={() => commonNotice.failed(new Error('Connection to SEF could not be established.'))}
                />
                <ActionButton
                  intent="filter"
                  label={{ en: 'Command palette' }}
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

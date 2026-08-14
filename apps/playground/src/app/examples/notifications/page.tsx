'use client'

import { useState } from 'react'
import { Badge, Box, Center, Group, Modal, Paper, Stack, Tabs, Text } from '@mantine/core'
import { AtSign, CalendarClock, FileText, Settings, type LucideIcon } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import {
  ActionButton,
  ActionGroup,
  EmptyState,
  StatusBadge,
  commonNotice,
} from '@liro/ui'
import { DateText } from '@liro/dates'
import { ListPageTemplate } from '@liro/templates'
import { DemoAppShell } from '@/components/DemoAppShell'

/**
 * Notifications.
 *
 * Not a table but a list — each item carries a sentence, not fields. Unread
 * is distinguished by text weight and a dot, not by the color of the whole
 * background: twenty colored rows one under another stop highlighting
 * anything.
 */

type Kind = 'deadline' | 'document' | 'system' | 'mention'

interface Notification {
  id: string
  kind: Kind
  title: string
  body: string
  created_at: string
  read: boolean
}

const KIND_ICON: Record<Kind, LucideIcon> = {
  deadline: CalendarClock,
  document: FileText,
  system: Settings,
  mention: AtSign,
}

const KIND_TONE: Record<Kind, 'danger' | 'info' | 'neutral' | 'premium'> = {
  deadline: 'danger',
  document: 'info',
  system: 'neutral',
  mention: 'premium',
}

const KIND_LABEL: Record<Kind, string> = {
  deadline: 'Deadline',
  document: 'Document',
  system: 'System',
  mention: 'Mention',
}

const ITEMS: Notification[] = Array.from({ length: 14 }, (_, index) => {
  const kinds: Kind[] = ['deadline', 'document', 'system', 'mention']
  const kind = kinds[index % kinds.length] ?? 'system'
  return {
    id: `n${index + 1}`,
    kind,
    title:
      kind === 'deadline'
        ? 'PPP-PD deadline expires in 2 days'
        : kind === 'document'
          ? `Invoice 2026-${String(318 - index).padStart(6, '0')} has been signed`
          : kind === 'system'
            ? 'NBS exchange rate refreshed'
            : 'Ana Jovanović mentioned you in a note',
    body:
      kind === 'deadline'
        ? 'The filing for accounting period 2026-03 must be submitted by 05.04.2026.'
        : kind === 'document'
          ? 'The document has been forwarded to SEF and is awaiting receipt confirmation.'
          : kind === 'system'
            ? 'EUR middle rate: 117,2043 · valid for 02.04.2026.'
            : 'Check item 3 on the delivery note, the quantity does not match.',
    created_at: `2026-04-0${(index % 9) + 1}`,
    read: index % 3 !== 0,
  }
})

function NotificationList({
  items,
  onOpen,
  empty,
}: {
  items: Notification[]
  onOpen: (item: Notification) => void
  empty: string
}) {
  if (items.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md" style={{ borderColor: liroVar.border.default }}>
        <EmptyState variant="empty" title={{ en: empty }} description={{ en: '' }} compact />
      </Paper>
    )
  }

  return (
    <Stack gap="xs">
      {items.map((item) => {
        const Icon = KIND_ICON[item.kind]
        const tone = liroVar.status[KIND_TONE[item.kind]]

        return (
          /*
           * Deliberately <Paper> (div), not <UnstyledButton>.
           *
           * Buttons can sit inside the row, and a <button> inside a <button>
           * is invalid HTML and breaks hydration. Clicking the whole row
           * works through onClick on the div.
           */
          <Paper
            key={item.id}
            withBorder
            p="md"
            radius="md"
            onClick={() => onOpen(item)}
            /*
             * Unread is not distinguished by background.
             *
             * A blue background on every unread row turns the list into a
             * wall of color — when everything is highlighted, nothing is.
             * The difference is carried by the title's weight, the dot on
             * the right, and the thin bar along the left edge.
             */
            style={{
              cursor: 'pointer',
              backgroundColor: liroVar.surface.raised,
              borderColor: liroVar.border.default,
              borderLeft: item.read
                ? `1px solid ${liroVar.border.default}`
                : `3px solid ${liroVar.brand.solid}`,
            }}
          >
            <Group gap="sm" align="flex-start" wrap="nowrap">
              <Box
                p={8}
                style={{
                  borderRadius: 'var(--liro-radius-md)',
                  backgroundColor: tone.bg,
                  color: tone.fg,
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} />
              </Box>

              <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" wrap="nowrap">
                  <Text size="sm" fw={item.read ? 400 : 700} style={{ flex: 1 }}>{item.title}</Text>
                  {!item.read && (
                    <Box
                      w={7}
                      h={7}
                      style={{ borderRadius: '50%', backgroundColor: liroVar.brand.solid, flexShrink: 0 }}
                    />
                  )}
                </Group>
                <Text size="xs" lineClamp={2} style={{ color: liroVar.text.secondary }}>{item.body}</Text>
                <Group gap="xs" mt={2}>
                  <StatusBadge tone={KIND_TONE[item.kind]} label={KIND_LABEL[item.kind]} />
                  <DateText value={item.created_at} size="xs" dimmed />
                </Group>
              </Stack>
            </Group>
          </Paper>
        )
      })}
    </Stack>
  )
}

export default function NotificationsScreen() {
  const [items, setItems] = useState(ITEMS)
  const [detail, setDetail] = useState<Notification | null>(null)

  /*
   * Unread comes first — same as in Liro Business App.
   *
   * These are separate tabs, not a filter over one list: read notifications
   * are an archive and should not mix with what needs attention.
   */
  const unreadItems = items.filter((item) => !item.read)
  const readItems = items.filter((item) => item.read)

  const open = (item: Notification) => {
    setDetail(item)
    if (!item.read) {
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)))
    }
  }

  return (
    <DemoAppShell breadcrumbs={[{ label: { en: 'Notifications' } }]}>
      <ListPageTemplate
        title={{ en: 'Notifications' }}
        badge={unreadItems.length > 0 ? <StatusBadge tone="danger" label={`${unreadItems.length} unread`} /> : undefined}
        actions={
          <ActionGroup>
            <ActionButton
              intent="complete"
              label={{ en: 'Mark all read' }}
              onClick={() => {
                setItems((current) => current.map((item) => ({ ...item, read: true })))
                commonNotice.saved()
              }}
              disabled={unreadItems.length === 0}
            />
            <ActionButton intent="settings" />
          </ActionGroup>
        }
        flush
      >
        <Tabs defaultValue="unread" variant="pills" color="liro-blue">
          <Center mb="md">
            <Tabs.List style={{ backgroundColor: liroVar.surface.sunken, padding: 4, borderRadius: 10 }}>
              <Tabs.Tab value="unread">
                <Group gap={6} wrap="nowrap">
                  <span>Unread</span>
                  {unreadItems.length > 0 && <Badge size="xs" circle>{unreadItems.length}</Badge>}
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="read">Read</Tabs.Tab>
            </Tabs.List>
          </Center>

          <Tabs.Panel value="unread">
            <NotificationList items={unreadItems} onOpen={open} empty="You have no unread notifications." />
          </Tabs.Panel>

          <Tabs.Panel value="read">
            <NotificationList items={readItems} onOpen={open} empty="You have no read notifications." />
          </Tabs.Panel>
        </Tabs>
      </ListPageTemplate>

      {/* The modal sits outside <Tabs> — a panel that is not active does not render. */}
      <Modal opened={detail !== null} onClose={() => setDetail(null)} title={detail?.title} size="sm">
        <Stack gap="md">
          <Text size="sm">{detail?.body}</Text>
          <DateText value={detail?.created_at} dimmed />
          <Group justify="flex-end">
            <ActionButton intent="view" label={{ en: 'Open' }} onClick={() => setDetail(null)} />
          </Group>
        </Stack>
      </Modal>
    </DemoAppShell>
  )
}

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
 * Obaveštenja.
 *
 * Nije tabela nego spisak — svaka stavka nosi rečenicu, ne polja. Nepročitano
 * se razlikuje težinom teksta i tačkom, ne bojom cele pozadine: dvadeset
 * obojenih redova jedan ispod drugog prestaje da išta ističe.
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
  deadline: 'Rok',
  document: 'Dokument',
  system: 'Sistem',
  mention: 'Pominjanje',
}

const ITEMS: Notification[] = Array.from({ length: 14 }, (_, index) => {
  const kinds: Kind[] = ['deadline', 'document', 'system', 'mention']
  const kind = kinds[index % kinds.length] ?? 'system'
  return {
    id: `n${index + 1}`,
    kind,
    title:
      kind === 'deadline'
        ? 'Rok za PPP-PD ističe za 2 dana'
        : kind === 'document'
          ? `Faktura 2026-${String(318 - index).padStart(6, '0')} je potpisana`
          : kind === 'system'
            ? 'Kurs NBS-a je osvežen'
            : 'Ana Jovanović vas je pomenula u napomeni',
    body:
      kind === 'deadline'
        ? 'Prijava za obračunski period 2026-03 mora biti predata do 05.04.2026.'
        : kind === 'document'
          ? 'Dokument je prosleđen u SEF i čeka potvrdu prijema.'
          : kind === 'system'
            ? 'Srednji kurs EUR: 117,2043 · važi za 02.04.2026.'
            : 'Proveri stavku 3 na otpremnici, količina ne odgovara.',
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
        <EmptyState variant="empty" title={{ sr: empty }} description={{ sr: '' }} compact />
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
           * Namerno <Paper> (div), ne <UnstyledButton>.
           *
           * Unutar reda mogu stajati dugmad, a <button> u <button> je nevažeći
           * HTML i lomi hidrataciju. Klik na ceo red radi preko onClick na div-u.
           */
          <Paper
            key={item.id}
            withBorder
            p="md"
            radius="md"
            onClick={() => onOpen(item)}
            /*
             * Nepročitano se ne razlikuje pozadinom.
             *
             * Plava podloga na svakom nepročitanom redu pretvara spisak u zid
             * boje — kada je sve istaknuto, ništa nije. Razliku nose debljina
             * naslova, tačka desno i tanka traka uz levu ivicu.
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
   * Nepročitano ide prvo — kao u Liro Business App-u.
   *
   * Kartice su odvojene, a ne filter nad jednim spiskom: pročitana obaveštenja
   * su arhiva i ne treba da se mešaju sa onim što traži pažnju.
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
    <DemoAppShell breadcrumbs={[{ label: { sr: 'Obaveštenja', en: 'Notifications' } }]}>
      <ListPageTemplate
        title={{ sr: 'Obaveštenja', en: 'Notifications' }}
        badge={unreadItems.length > 0 ? <StatusBadge tone="danger" label={`${unreadItems.length} nepročitanih`} /> : undefined}
        actions={
          <ActionGroup>
            <ActionButton
              intent="complete"
              label={{ sr: 'Označi sve kao pročitano', en: 'Mark all read' }}
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
                  <span>Nepročitane</span>
                  {unreadItems.length > 0 && <Badge size="xs" circle>{unreadItems.length}</Badge>}
                </Group>
              </Tabs.Tab>
              <Tabs.Tab value="read">Pročitane</Tabs.Tab>
            </Tabs.List>
          </Center>

          <Tabs.Panel value="unread">
            <NotificationList items={unreadItems} onOpen={open} empty="Nemate nepročitanih obaveštenja." />
          </Tabs.Panel>

          <Tabs.Panel value="read">
            <NotificationList items={readItems} onOpen={open} empty="Nemate pročitanih obaveštenja." />
          </Tabs.Panel>
        </Tabs>
      </ListPageTemplate>

      {/* Modal stoji izvan <Tabs> — panel koji nije aktivan se ne renderuje. */}
      <Modal opened={detail !== null} onClose={() => setDetail(null)} title={detail?.title} size="sm">
        <Stack gap="md">
          <Text size="sm">{detail?.body}</Text>
          <DateText value={detail?.created_at} dimmed />
          <Group justify="flex-end">
            <ActionButton intent="view" label={{ sr: 'Otvori' }} onClick={() => setDetail(null)} />
          </Group>
        </Stack>
      </Modal>
    </DemoAppShell>
  )
}

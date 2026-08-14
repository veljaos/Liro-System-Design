'use client'

import {
  Banknote,
  Bell,
  Building2,
  Calculator,
  CalendarClock,
  FileStack,
  Landmark,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Kbd, Group, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { ActionButton, ActionGroup, Launchpad, SectionCard, type LaunchpadTile } from '@liro/ui'
import { DemoAppShell } from '@/components/DemoAppShell'

/**
 * Application launchpad.
 *
 * This is what the home page of a Liro product looks like: a grid of tiles,
 * each with a job's name and one number that says whether there is anything
 * to do there.
 *
 * The point is that the user does not have to open a screen to find out
 * whether something is waiting for them. "Documents · 11 overdue" is an
 * answer a menu cannot give.
 */

const TILES: LaunchpadTile[] = [
  {
    id: 'payroll',
    title: { en: 'Payroll' },
    subtitle: { en: 'Salaries, incentives and tax filings' },
    icon: Banknote,
    href: '/examples/employees',
  },
  {
    id: 'documents',
    title: { en: 'Documents' },
    subtitle: { en: 'Invoices, delivery notes and credit notes' },
    icon: Receipt,
    href: '/examples/documents',
  },
  {
    id: 'receipts',
    title: { en: 'Fiscal receipts' },
    subtitle: { en: 'Turnover from fiscal devices by location' },
    icon: ScrollText,
    href: '/examples/fiscal-receipts',
  },
  {
    id: 'notifications',
    title: { en: 'Notifications' },
    subtitle: { en: 'Deadlines, documents and system messages' },
    icon: Bell,
    href: '/examples/notifications',
  },
  {
    id: 'clients',
    title: { en: 'Clients' },
    subtitle: { en: 'Registry of legal entities and sole proprietors' },
    icon: Building2,
    href: '/application',
  },
  {
    id: 'employees',
    title: { en: 'Employees' },
    subtitle: { en: 'Record of employed persons' },
    icon: Users,
    href: '/examples/employees',
  },
  {
    id: 'calendar',
    title: { en: 'Deadlines and obligations' },
    subtitle: { en: 'Calendar of payroll runs and legal deadlines' },
    icon: CalendarClock,
    href: '/category/schedule',
  },
  {
    id: 'reports',
    title: { en: 'Reports' },
    subtitle: { en: 'Trial balance, account cards and IOS' },
    icon: FileStack,
    href: '/category/charts',
  },
  {
    id: 'vat',
    title: { en: 'VAT records' },
    subtitle: { en: 'Purchase and sales invoice ledgers' },
    icon: Calculator,
    href: '/application',
  },
  {
    id: 'signing',
    title: { en: 'Electronic signature' },
    subtitle: { en: 'Signing documents with a certificate' },
    icon: Landmark,
    href: '/category/signing',
  },
  {
    id: 'settings',
    title: { en: 'Settings' },
    subtitle: { en: 'Account, roles and integrations' },
    icon: Settings,
    href: '/account',
  },
  {
    id: 'audit',
    title: { en: 'Internal control' },
    subtitle: { en: 'Record audit and change trails' },
    icon: ShieldCheck,
    href: '/category/business-patterns',
    permission: 'audit.view',
    tier: 'enterprise',
  },
]

export default function LaunchpadScreen() {
  const [editing, setEditing] = useState(false)

  return (
    <DemoAppShell>
      {/*
        No header.

        In Liro Business App, the home page is literally `<ModuleGrid />` —
        no title, no greeting. The grid of tiles is its own header.
      */}
      <Stack gap="lg">
        <ActionGroup>
          <ActionButton
            intent={editing ? 'save' : 'edit'}
            label={editing ? { en: 'Save layout' } : { en: 'Edit layout' }}
            onClick={() => setEditing((state) => !state)}
          />
        </ActionGroup>

        <Launchpad tiles={TILES} columns={3} editing={editing} />

        <SectionCard title={{ en: 'Keyboard use' }}>
          <Group gap="lg" wrap="wrap">
            <Group gap={6}>
              <Kbd>1</Kbd>–<Kbd>9</Kbd>
              <Text size="sm" c="dimmed">opens the tile in order</Text>
            </Group>
            <Group gap={6}>
              <Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>←</Kbd><Kbd>→</Kbd>
              <Text size="sm" c="dimmed">moves the selection</Text>
            </Group>
            <Group gap={6}>
              <Kbd>Enter</Kbd>
              <Text size="sm" c="dimmed">opens the selected one</Text>
            </Group>
            <Group gap={6}>
              <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd>
              <Text size="sm" c="dimmed">command palette</Text>
            </Group>
            <Group gap={6}>
              <Text size="sm" c="dimmed">
                Dragging only works in edit mode — otherwise you would drag the tile instead of
                opening it.
              </Text>
            </Group>
          </Group>
          <Text size="xs" c="dimmed" mt="sm">
            Click anywhere in the tile grid and try the arrows. Someone who works in the
            application all day does not hunt with a mouse for the tile they open fifty times a
            day.
          </Text>
        </SectionCard>
      </Stack>
    </DemoAppShell>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { Box, Group, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import * as Lucide from 'lucide-react'
import { Search, Shapes } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { CopyChip } from '../DemoCard'
import type { CatalogCategory } from '../types'

/**
 * Icon catalog.
 *
 * `lucide-react` has over a thousand icons; showing all of them would kill
 * the page, and would not help either. This is the selection a business
 * application actually uses, grouped by the job the icon does — because an
 * icon is looked for by meaning, not by name.
 */

type IconComponent = typeof Shapes

const GROUPS: { title: string; names: string[] }[] = [
  {
    title: 'Actions',
    names: ['Plus', 'Save', 'Check', 'CheckCheck', 'X', 'Pencil', 'Trash2', 'Copy', 'RotateCcw', 'Undo2', 'RefreshCw', 'Search', 'Filter', 'SlidersHorizontal', 'MoreVertical', 'MoreHorizontal'],
  },
  {
    title: 'Documents',
    names: ['FileText', 'FileSignature', 'FileSpreadsheet', 'FileQuestion', 'Files', 'FileStack', 'Printer', 'Download', 'Upload', 'Paperclip', 'Receipt', 'ClipboardList', 'BookOpen', 'Archive'],
  },
  {
    title: 'Money and accounting',
    names: ['Banknote', 'Wallet', 'Coins', 'CreditCard', 'Calculator', 'Percent', 'TrendingUp', 'TrendingDown', 'ChartNoAxesColumn', 'ChartPie', 'Scale', 'Landmark'],
  },
  {
    title: 'People and organization',
    names: ['User', 'Users', 'UserPlus', 'UserCog', 'Building2', 'Briefcase', 'IdCard', 'Contact', 'Network'],
  },
  {
    title: 'Time',
    names: ['Calendar', 'CalendarDays', 'CalendarClock', 'CalendarCheck', 'Clock', 'History', 'Hourglass', 'Timer'],
  },
  {
    title: 'State and security',
    names: ['ShieldCheck', 'ShieldAlert', 'Lock', 'Unlock', 'KeyRound', 'AlertTriangle', 'CircleAlert', 'CircleCheck', 'CircleX', 'Info', 'Ban', 'CloudAlert'],
  },
  {
    title: 'Navigation',
    names: ['Home', 'LayoutGrid', 'LayoutDashboard', 'Menu', 'ChevronRight', 'ChevronDown', 'ArrowLeft', 'ArrowRight', 'ArrowUpRight', 'ExternalLink', 'LogIn', 'LogOut', 'Settings', 'Bell'],
  },
]

function resolveIcon(name: string): IconComponent | null {
  const icon = (Lucide as unknown as Record<string, unknown>)[name]
  /*
   * The check must NOT be `typeof icon === 'function'`.
   *
   * Lucide exports icons as `forwardRef` objects, so `typeof` returns
   * 'object' — with a function check, the catalog stayed completely empty.
   */
  if (icon === null || icon === undefined) return null
  if (typeof icon !== 'function' && typeof icon !== 'object') return null
  return icon as IconComponent
}

function IconGrid() {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    return GROUPS.map((group) => ({
      ...group,
      names: group.names.filter((name) => !term || name.toLowerCase().includes(term)),
    })).filter((group) => group.names.length > 0)
  }, [query])

  return (
    <Stack gap="lg">
      <TextInput
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        placeholder="Search icons…"
        leftSection={<Search size={15} />}
        w={{ base: '100%', sm: 280 }}
      />

      {groups.map((group) => (
        <Stack key={group.title} gap="xs">
          <Text size="xs" fw={700} style={{ color: liroVar.text.tertiary, textTransform: 'uppercase', letterSpacing: 'var(--liro-tracking-caps)' }}>
            {group.title}
          </Text>
          <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, lg: 6 }} spacing="xs">
            {group.names.map((name) => {
              const Icon = resolveIcon(name)
              if (!Icon) return null
              return (
                <Group
                  key={name}
                  gap={8}
                  wrap="nowrap"
                  p="xs"
                  style={{
                    border: `1px solid ${liroVar.border.subtle}`,
                    borderRadius: 'var(--liro-radius-md)',
                    backgroundColor: liroVar.surface.raised,
                  }}
                >
                  <Box style={{ color: liroVar.text.secondary, display: 'flex', flexShrink: 0 }}>
                    <Icon size={17} />
                  </Box>
                  <Text size="xs" ff="monospace" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {name}
                  </Text>
                  <Box ml="auto"><CopyChip value={name} label={`import { ${name} }`} /></Box>
                </Group>
              )
            })}
          </SimpleGrid>
        </Stack>
      ))}

      {groups.length === 0 && (
        <Text size="sm" c="dimmed">No icon with that name in the selection.</Text>
      )}
    </Stack>
  )
}

export const iconCategory: CatalogCategory = {
  slug: 'icons',
  title: 'Icons',
  description: 'A selection from lucide-react grouped by the job the icon does.',
  group: 'components',
  icon: Shapes,
  entries: [
    {
      id: 'icon-catalog',
      title: 'Icon catalog',
      description: 'Click the copy button to get the name for the import.',
      from: 'lucide-react',
      demo: <IconGrid />,
      code: `import { FileSignature } from 'lucide-react'

<ActionButton intent="sign" />   // the icon comes from the intent catalog
<PageHeader icon={FileSignature} title={{ en: 'Signing' }} />`,
    },
  ],
}

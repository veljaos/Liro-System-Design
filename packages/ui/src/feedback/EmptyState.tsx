'use client'

import { Box, Button, Stack, Text } from '@mantine/core'
import { CloudAlert, Inbox, SearchX, type LucideIcon } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export type EmptyStateVariant = 'empty' | 'no-results' | 'error'

export interface EmptyStateProps {
  icon?: LucideIcon
  title?: LocalizedLabel
  description?: LocalizedLabel
  actionLabel?: LocalizedLabel
  onAction?: () => void
  /**
   * `empty` - no entries yet; `no-results` - the filter matched nothing;
   * `error` - loading failed. The difference matters: an empty database
   * invites data entry, an empty result invites changing the filter.
   */
  variant?: EmptyStateVariant
  compact?: boolean
}

const DEFAULTS: Record<EmptyStateVariant, { icon: LucideIcon; title: LocalizedLabel; description: LocalizedLabel }> = {
  empty: {
    icon: Inbox,
    title: { sr: 'Nema podataka', 'sr-Cyrl': 'Нема података', en: 'Nothing here yet' },
    description: {
      sr: 'Podaci koje unesete pojaviće se na ovom mestu.',
      'sr-Cyrl': 'Подаци које унесете појавиће се на овом месту.',
      en: 'Records you add will show up here.',
    },
  },
  'no-results': {
    icon: SearchX,
    title: { sr: 'Nema rezultata', 'sr-Cyrl': 'Нема резултата', en: 'No results' },
    description: {
      sr: 'Promenite pojam pretrage ili uklonite neki filter.',
      'sr-Cyrl': 'Промените појам претраге или уклоните неки филтер.',
      en: 'Change the search term or remove a filter.',
    },
  },
  error: {
    /* Must not share an icon with the empty state - an empty database and a
       failed query call for a different user reaction, so they must also
       look different. */
    icon: CloudAlert,
    title: { sr: 'Učitavanje nije uspelo', 'sr-Cyrl': 'Учитавање није успело', en: 'Could not load' },
    description: {
      sr: 'Pokušajte ponovo. Ako se ponovi, obratite se podršci.',
      'sr-Cyrl': 'Покушајте поново. Ако се понови, обратите се подршци.',
      en: 'Try again. If it keeps happening, contact support.',
    },
  },
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'empty',
  compact = false,
}: EmptyStateProps) {
  const { t } = useI18n()
  const fallback = DEFAULTS[variant]
  const Icon = icon ?? fallback.icon

  return (
    <Stack align="center" justify="center" gap={4} py={compact ? 'md' : 'xl'}>
      <Box mb={4} style={{ color: liroVar.text.tertiary }}>
        <Icon size={compact ? 24 : 32} strokeWidth={1.5} />
      </Box>
      <Text size={compact ? 'sm' : 'md'} fw={600} style={{ color: liroVar.text.primary }}>
        {t(title) || t(fallback.title)}
      </Text>
      <Text size="xs" ta="center" maw={320} style={{ color: liroVar.text.secondary }}>
        {t(description) || t(fallback.description)}
      </Text>
      {onAction && actionLabel && (
        <Button variant="default" size="xs" mt="sm" onClick={onAction}>
          {t(actionLabel)}
        </Button>
      )}
    </Stack>
  )
}

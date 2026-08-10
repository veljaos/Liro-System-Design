'use client'

import { CloseButton, Group, TextInput } from '@mantine/core'
import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export interface ToolbarProps {
  /** When passed, shows the search field. */
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: LocalizedLabel
  /** Selectors and buttons for filtering. */
  filters?: ReactNode
  /** Actions on the right side — export, new entry. */
  actions?: ReactNode
}

const DEFAULT_PLACEHOLDER: LocalizedLabel = {
  sr: 'Pretraga…',
  'sr-Cyrl': 'Претрага…',
  en: 'Search…',
}

/**
 * Bar above the table: search on the left, filters next to it, actions on
 * the right.
 *
 * Always the same layout, across all modules. Once the user knows where
 * search is on one screen, they know it on every next one.
 */
export function Toolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  actions,
}: ToolbarProps) {
  const { t } = useI18n()
  const showSearch = search !== undefined && onSearchChange !== undefined

  return (
    /* The bar sits inside a card, so it needs padding from the top too, not
         just from the table below. Without it, the search field touches the
         card's edge. */
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm" px="md" pt="md" pb="xs">
      <Group gap="sm" wrap="wrap" style={{ flex: 1, minWidth: 0 }}>
        {showSearch && (
          <TextInput
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t(searchPlaceholder ?? DEFAULT_PLACEHOLDER)}
            leftSection={<Search size={15} />}
            rightSection={
              search ? (
                <CloseButton size="sm" onClick={() => onSearchChange('')} />
              ) : null
            }
            w={{ base: '100%', xs: 260 }}
          />
        )}
        {filters}
      </Group>

      {actions && <Group gap="xs" wrap="wrap">{actions}</Group>}
    </Group>
  )
}

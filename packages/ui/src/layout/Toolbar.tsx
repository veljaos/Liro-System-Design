'use client'

import { CloseButton, Group, TextInput } from '@mantine/core'
import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export interface ToolbarProps {
  /** Kada je prosledjeno, prikazuje polje za pretragu. */
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: LocalizedLabel
  /** Selektori i dugmad za filtriranje. */
  filters?: ReactNode
  /** Radnje sa desne strane - izvoz, novi unos. */
  actions?: ReactNode
}

const DEFAULT_PLACEHOLDER: LocalizedLabel = {
  sr: 'Pretraga…',
  'sr-Cyrl': 'Претрага…',
  en: 'Search…',
}

/**
 * Traka iznad tabele: pretraga levo, filteri do nje, radnje desno.
 *
 * Uvek isti raspored, u svim modulima. Kada korisnik zna gde je pretraga na
 * jednom ekranu, zna i na svakom sledecem.
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
    /* Traka sedi unutar kartice, pa joj treba razmak i od vrha, ne samo od tabele
         ispod. Bez toga polje za pretragu dodiruje ivicu kartice. */
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

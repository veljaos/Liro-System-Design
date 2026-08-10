import { SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

export interface KeyValueViewItem {
  /** Already-resolved text. */
  label: string
  value: ReactNode
  /** Takes the full width — for addresses, notes, long names. */
  fullWidth?: boolean
  /** Aligns the value to the right and enables tabular figures. */
  numeric?: boolean
}

export interface KeyValueListViewProps {
  items: KeyValueViewItem[]
  columns?: number
  loading?: boolean
}

/**
 * Label/value pairs on detail pages.
 *
 * The label is always smaller and quieter than the value. An empty value is
 * shown as a dash, never as empty space — otherwise there is no visible
 * difference between "no data" and "the field did not load".
 */
export function KeyValueList({ items, columns = 2, loading = false }: KeyValueListViewProps) {
  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: columns }} spacing="md">
        {items.map((_, index) => (
          <Stack key={index} gap={4}>
            <Skeleton height={12} width={90} />
            <Skeleton height={16} width={150} />
          </Stack>
        ))}
      </SimpleGrid>
    )
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: columns }} spacing="md">
      {items.map((item, index) => (
        <Stack key={index} gap={2} style={item.fullWidth ? { gridColumn: '1 / -1' } : undefined}>
          <Text
            size="xs"
            fw={600}
            style={{
              color: liroVar.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 'var(--liro-tracking-caps)',
            }}
          >
            {item.label}
          </Text>
          {/*
            `component="div"` is required: the value often contains a badge,
            a date, or another component that itself renders a <p>. The
            default <p> here would produce a <p> inside a <p>, which the
            browser splits apart and breaks hydration.
          */}
          <Text
            component="div"
            size="sm"
            data-numeric={item.numeric || undefined}
            style={{ color: liroVar.text.primary, wordBreak: 'break-word' }}
          >
            {item.value === null || item.value === undefined || item.value === '' ? '—' : item.value}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  )
}
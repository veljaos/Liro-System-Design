import { SimpleGrid, Skeleton, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

export interface KeyValueViewItem {
  /** Vec razresen tekst. */
  label: string
  value: ReactNode
  /** Zauzima celu sirinu - za adrese, napomene, duge nazive. */
  fullWidth?: boolean
  /** Poravnava vrednost desno i ukljucuje tabularne cifre. */
  numeric?: boolean
}

export interface KeyValueListViewProps {
  items: KeyValueViewItem[]
  columns?: number
  loading?: boolean
}

/**
 * Parovi oznaka/vrednost na stranicama sa detaljima.
 *
 * Oznaka je uvek manja i tiša od vrednosti. Prazna vrednost se prikazuje kao
 * crtica, nikad kao prazan prostor - inace se ne vidi razlika izmedju
 * "nema podatka" i "polje se nije ucitalo".
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
            `component="div"` je obavezno: vrednost cesto sadrzi badge, datum ili
            drugu komponentu koja i sama renderuje <p>. Podrazumevani <p> ovde bi
            proizveo <p> u <p>, sto pregledac razdvaja i lomi hidrataciju.
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
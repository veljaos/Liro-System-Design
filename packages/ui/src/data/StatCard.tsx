'use client'

import { Box, Group, Paper, SimpleGrid, Skeleton, Text } from '@mantine/core'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export interface StatItem {
  title: LocalizedLabel
  value: string | number
  /** Promena u procentima u odnosu na prethodni period. */
  diff?: number
  /**
   * Kada je `true`, rast se prikazuje crveno a pad zeleno.
   * Za troskove i dugovanja rast nije dobra vest.
   */
  invertDiff?: boolean
  description?: LocalizedLabel
  icon?: LucideIcon
  onClick?: () => void
}

export interface StatCardProps extends StatItem {}

export function StatCard({
  title,
  value,
  diff,
  invertDiff = false,
  description,
  icon: Icon,
  onClick,
}: StatCardProps) {
  const { t } = useI18n()
  const hasDiff = diff !== undefined && diff !== 0
  const rising = (diff ?? 0) > 0
  const good = invertDiff ? !rising : rising
  const diffColor = good ? liroVar.status.success.fg : liroVar.status.danger.fg

  return (
    <Paper
      withBorder
      p="md"
      radius="lg"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: liroVar.surface.raised,
        borderColor: liroVar.border.default,
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Text
          size="xs"
          fw={700}
          style={{
            letterSpacing: 'var(--liro-tracking-caps)',
            textTransform: 'uppercase',
            color: liroVar.text.secondary,
          }}
        >
          {t(title)}
        </Text>
        {Icon && (
          <Box style={{ flexShrink: 0, color: liroVar.text.tertiary, display: 'flex' }}>
            <Icon size={18} />
          </Box>
        )}
      </Group>

      <Group align="flex-end" gap="xs" mt="sm" wrap="nowrap">
        <Text size="xl" fw={700} lh={1} data-numeric>
          {value}
        </Text>
        {hasDiff && (
          <Group gap={2} wrap="nowrap" style={{ color: diffColor }}>
            <Text size="sm" fw={700} lh={1} data-numeric>
              {rising ? '+' : ''}{diff}%
            </Text>
            {rising ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </Group>
        )}
      </Group>

      {description && (
        <Text size="xs" mt="xs" style={{ color: liroVar.text.secondary }}>
          {t(description)}
        </Text>
      )}
    </Paper>
  )
}

export interface StatGridProps {
  data: StatItem[]
  loading?: boolean
  /** Broj kolona na najsirim ekranima; ograniceno na 4. */
  maxColumns?: number
}

export function StatGrid({ data, loading = false, maxColumns = 4 }: StatGridProps) {
  const columns = Math.min(Math.max(data.length || 1, 1), maxColumns)
  const cols = { base: 1, sm: 2, lg: columns }

  if (loading) {
    return (
      <SimpleGrid cols={cols} spacing="md" mb="xl">
        {Array.from({ length: data.length || maxColumns }).map((_, index) => (
          <Skeleton key={index} height={104} radius="lg" />
        ))}
      </SimpleGrid>
    )
  }

  return (
    <SimpleGrid cols={cols} spacing="md" mb="xl">
      {data.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </SimpleGrid>
  )
}

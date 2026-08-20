'use client'

import { Box, Group, Stack, Text, Tooltip } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { createValueFormatter, type ValueFormatOptions } from './series'

const TARGET_LABEL: TranslationKey = 'charts.targetBar.target'

/**
 * Plan versus actuals.
 *
 * Mantine's `BulletChart` draws three zones behind the bar with labels and
 * numbers on both sides; at card width that blurs into an unreadable strip.
 * This component is written from scratch with one goal: to show at a glance
 * whether the plan was met, and by how much it was missed.
 *
 * The zones are quiet gray shades in the background — they are context, not
 * data. What carries color is the deviation from the target, because that is
 * the only reason this display is looked at in the first place.
 */

export interface TargetBarProps extends ValueFormatOptions {
  label: LocalizedLabel | string
  value: number
  target: number
  /** Upper bound of the axis; defaults to 125% of the target so an overshoot has room. */
  max?: number
  /** For expenses, an overshoot is bad news. */
  invert?: boolean
  /** Extra data below: previous period, average, daily plan. */
  caption?: string
  size?: 'sm' | 'md'
}

export function TargetBar({
  label,
  value,
  target,
  max,
  invert = false,
  caption,
  size = 'md',
  ...format
}: TargetBarProps) {
  const { t, locale } = useI18n()
  const formatter = createValueFormatter(locale, format)

  const ceiling = max ?? Math.max(target * 1.25, value * 1.05)
  const valuePercent = Math.min((value / ceiling) * 100, 100)
  const targetPercent = Math.min((target / ceiling) * 100, 100)

  const variance = value - target
  const variancePercent = target === 0 ? 0 : Math.round((variance / target) * 100)
  const above = variance >= 0
  const good = invert ? !above : above
  const tone = variance === 0 ? liroVar.status.neutral : good ? liroVar.status.success : liroVar.status.danger

  const height = size === 'sm' ? 14 : 20

  return (
    <Stack gap={4}>
      <Group justify="space-between" align="baseline" wrap="nowrap">
        <Text size="sm" fw={500} truncate>{typeof label === 'string' ? label : t(label)}</Text>
        <Group gap={8} wrap="nowrap" align="baseline">
          <Text size="sm" fw={700} data-numeric>{formatter(value)}</Text>
          <Text size="xs" fw={600} data-numeric style={{ color: tone.fg, whiteSpace: 'nowrap' }}>
            {above ? '+' : ''}{variancePercent}%
          </Text>
        </Group>
      </Group>

      <Box pos="relative" h={height}>
        {/* Zones are context — gray and quiet, so they do not compete with the bar. */}
        <Box
          pos="absolute"
          inset={0}
          style={{ backgroundColor: liroVar.surface.sunken, borderRadius: 'var(--liro-radius-xs)' }}
        />
        <Box
          pos="absolute"
          top={0}
          bottom={0}
          left={0}
          style={{
            width: `${targetPercent * 0.75}%`,
            backgroundColor: liroVar.border.subtle,
            borderRadius: 'var(--liro-radius-xs) 0 0 var(--liro-radius-xs)',
          }}
        />

        <Tooltip label={`${formatter(value)} / ${formatter(target)}`} withArrow>
          <Box
            pos="absolute"
            top={height * 0.2}
            bottom={height * 0.2}
            left={0}
            style={{
              width: `${valuePercent}%`,
              backgroundColor: tone.solid,
              borderRadius: 'var(--liro-radius-xs)',
              minWidth: 3,
            }}
          />
        </Tooltip>

        {/* The target is a single line across the full height — the most important marker in the display. */}
        <Box
          pos="absolute"
          top={-2}
          bottom={-2}
          style={{
            insetInlineStart: `${targetPercent}%`,
            width: 2,
            backgroundColor: liroVar.text.primary,
            transform: 'translateX(-1px)',
          }}
        />
      </Box>

      <Group justify="space-between" wrap="nowrap">
        <Text size="xs" style={{ color: liroVar.text.tertiary }}>
          {caption ?? t(TARGET_LABEL)}: {formatter(target)}
        </Text>
        <Text size="xs" data-numeric style={{ color: liroVar.text.tertiary }}>
          {formatter(ceiling)}
        </Text>
      </Group>
    </Stack>
  )
}
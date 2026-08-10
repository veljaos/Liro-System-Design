'use client'

import { Box, Group, Paper, Progress, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { StatusBadge } from '../feedback/StatusBadge'

/**
 * Card for work in progress: how much is done out of the total.
 *
 * Deliberately looks like `StatCard` — same header, same icon placement, same
 * frame. Two cards in the same row should not differ in shape, only in that
 * one carries a number and the other progress.
 */

const PROGRESS_LABEL: LocalizedLabel = {
  sr: 'Napredak',
  'sr-Cyrl': 'Напредак',
  en: 'Progress',
}

export interface ProgressCardProps {
  title: LocalizedLabel
  description?: LocalizedLabel
  done: number
  total: number
  /** Unit in the row below the bar: "32 of 47 people". */
  unit?: LocalizedLabel
  icon?: LucideIcon
  /** Bar color. */
  tone?: StatusToneName
  /** Badge in the bottom-right corner: deadline, status, warning. */
  badge?: LocalizedLabel
  badgeTone?: StatusToneName
}

export function ProgressCard({
  title,
  description,
  done,
  total,
  unit,
  icon: Icon,
  tone = 'info',
  badge,
  badgeTone = 'neutral',
}: ProgressCardProps) {
  const { t, formatNumber } = useI18n()

  /*
   * The percentage is COMPUTED, not received as a prop.
   *
   * If the card accepted both `value` and `done`/`total`, those two numbers
   * could drift apart — "70%" above "32 of 47", which is 68.1%, is a card
   * that lies. In payroll calculations that is not a cosmetic issue.
   */
  const safeTotal = total > 0 ? total : 0
  const exact = safeTotal > 0 ? (done / safeTotal) * 100 : 0

  /*
   * ROUNDED DOWN, not to the nearest whole number.
   *
   * 46 of 47 is 97.87% — rounding would give 98%, which is harmless. But 46.9
   * of 47 would give 100% on a job that is NOT finished, and someone who
   * sees one hundred percent stops watching. One hundred percent is only
   * shown when everything is actually done.
   */
  const shown = safeTotal > 0 && done >= safeTotal ? 100 : Math.floor(exact)

  return (
    <Paper
      withBorder
      p="md"
      radius="lg"
      style={{ backgroundColor: liroVar.surface.raised, borderColor: liroVar.border.default }}
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

      {description && (
        <Text size="xs" mt={4} style={{ color: liroVar.text.secondary }}>
          {t(description)}
        </Text>
      )}

      <Group justify="space-between" mt="md" wrap="nowrap">
        <Text size="xs" style={{ color: liroVar.text.tertiary }}>
          {t(PROGRESS_LABEL)}
        </Text>
        <Text size="xs" fw={700} data-numeric>
          {shown}%
        </Text>
      </Group>

      {/*
        The bar carries the EXACT value, while the printed number is rounded
        down. The eye sees the job is almost done, and the number does not
        claim that it is.

        The bar's color does not need to be measured — a bar is not text, so
        the 4.5 contrast rule does not apply to it.
      */}
      <Progress
        value={exact}
        size="sm"
        radius="xl"
        mt={4}
        aria-label={t(title)}
        styles={{
          root: { backgroundColor: liroVar.surface.sunken },
          section: { backgroundColor: liroVar.status[tone].solid },
        }}
      />

      <Group justify="space-between" mt="sm" wrap="nowrap">
        <Text size="sm" data-numeric>
          {t({
            sr: `${formatNumber(done)} od ${formatNumber(safeTotal)}`,
            'sr-Cyrl': `${formatNumber(done)} од ${formatNumber(safeTotal)}`,
            en: `${formatNumber(done)} of ${formatNumber(safeTotal)}`,
          })}
          {unit ? ` ${t(unit)}` : ''}
        </Text>
        {badge && <StatusBadge tone={badgeTone} label={badge} />}
      </Group>
    </Paper>
  )
}
'use client'

import { Box, Group, Stack, Text, Tooltip } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { createValueFormatter, type ValueFormatOptions } from './series'

/**
 * Plan naspram ostvarenja.
 *
 * Mantine `BulletChart` crta tri zone iza trake sa natpisima i brojevima na
 * obe strane; na sirini kartice se to slije u nerazumljivu traku. Ova
 * komponenta je pisana od nule sa jednim ciljem: da se u jednom pogledu vidi
 * da li je plan ispunjen i za koliko se promasilo.
 *
 * Zone su tihe sive nijanse u pozadini - one su kontekst, ne podatak. Ono sto
 * nosi boju je odstupanje od cilja, jer je to jedino zbog cega se ovaj prikaz
 * uopste gleda.
 */

export interface TargetBarProps extends ValueFormatOptions {
  label: LocalizedLabel | string
  value: number
  target: number
  /** Gornja granica ose; podrazumevano 125% cilja da premašaj ima gde da stane. */
  max?: number
  /** Kod troškova je premašaj loša vest. */
  invert?: boolean
  /** Dodatni podatak ispod: prethodni period, prosek, plan po danu. */
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
        {/* Zone su kontekst — sive i tihe, da ne takmiče se sa trakom. */}
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

        {/* Cilj je jedna crta preko cele visine — najvažnija oznaka na prikazu. */}
        <Box
          pos="absolute"
          top={-2}
          bottom={-2}
          style={{
            left: `${targetPercent}%`,
            width: 2,
            backgroundColor: liroVar.text.primary,
            transform: 'translateX(-1px)',
          }}
        />
      </Box>

      <Group justify="space-between" wrap="nowrap">
        <Text size="xs" style={{ color: liroVar.text.tertiary }}>
          {caption ?? t({ sr: 'Cilj', en: 'Target' })}: {formatter(target)}
        </Text>
        <Text size="xs" data-numeric style={{ color: liroVar.text.tertiary }}>
          {formatter(ceiling)}
        </Text>
      </Group>
    </Stack>
  )
}

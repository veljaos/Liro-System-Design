'use client'

import { Box, Group, Paper, Progress, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { StatusBadge } from '../feedback/StatusBadge'

/**
 * Kartica posla u toku: koliko je ucinjeno od ukupnog.
 *
 * Namerno izgleda kao `StatCard` - isto zaglavlje, isto mesto ikonice, isti
 * okvir. Dve kartice u istom redu ne treba da se razlikuju po obliku, samo po
 * tome sto jedna nosi brojku a druga napredak.
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
  /** Jedinica u redu ispod trake: "32 od 47 lica". */
  unit?: LocalizedLabel
  icon?: LucideIcon
  /** Boja trake. */
  tone?: StatusToneName
  /** Oznaka u donjem desnom uglu: rok, stanje, upozorenje. */
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
   * Procenat se RACUNA, ne prima kao prop.
   *
   * Da kartica prima i `value` i `done`/`total`, ta dva broja bi mogla da se
   * raziđu - "70%" iznad "32 od 47" koje daje 68.1% je kartica koja laze. U
   * obracunu zarada to nije kozmeticko pitanje.
   */
  const safeTotal = total > 0 ? total : 0
  const exact = safeTotal > 0 ? (done / safeTotal) * 100 : 0

  /*
   * NANIZE, ne zaokruzivanje na najblizi ceo broj.
   *
   * 46 od 47 je 97.87% - zaokruzivanje bi dalo 98%, sto je bezopasno. Ali
   * 46.9 od 47 bi dalo 100% na poslu koji NIJE zavrsen, a covek koji vidi
   * sto posto prestaje da gleda. Sto posto se ispisuje samo kad je sve gotovo.
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
        Traka nosi TACNU vrednost, a ispis zaokruzenu nanize. Oko vidi da je
        posao gotovo zavrsen, a broj ne tvrdi da jeste.

        Boja trake ne mora da se meri - traka nije tekst, pa pravilo o
        kontrastu 4.5 na nju ne vazi.
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
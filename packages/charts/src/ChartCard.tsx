'use client'

import { Box, Center, Group, Loader, Paper, Skeleton, Stack, Text, Title } from '@mantine/core'
import { ChartNoAxesColumn, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export interface ChartCardProps {
  title: LocalizedLabel
  /** Period na koji se grafikon odnosi - „Mart 2026." ili „Poslednjih 12 meseci". */
  period?: LocalizedLabel | string
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Izbor perioda, prekidač tipa grafikona, izvoz. */
  actions?: ReactNode
  /** Zbirna brojka koja stoji uz naslov - najčešće ukupno za period. */
  total?: ReactNode
  loading?: boolean
  /** Kada nema podataka, grafikon se ne crta - prikazuje se objašnjenje. */
  isEmpty?: boolean
  emptyMessage?: LocalizedLabel
  height?: number
  children: ReactNode
  /** Napomena ispod grafikona - izvor podataka, način obračuna. */
  footnote?: LocalizedLabel
}

const NO_DATA: LocalizedLabel = {
  sr: 'Za izabrani period nema podataka.',
  'sr-Cyrl': 'За изабрани период нема података.',
  en: 'No data for the selected period.',
}

/**
 * Okvir svakog grafikona.
 *
 * Postoji zbog tri stanja koja se u praksi uvek zaborave: ucitavanje, prazan
 * period i greska. Prazan grafikon bez objasnjenja izgleda kao pokvaren
 * ekran - korisnik ne zna da li podataka nema ili se nesto slomilo.
 *
 * Naslov, period i ukupna brojka stoje uvek na istom mestu, pa se dva
 * grafikona jedan pored drugog citaju kao par a ne kao dve kartice.
 */
export function ChartCard({
  title,
  period,
  description,
  icon: Icon = ChartNoAxesColumn,
  actions,
  total,
  loading = false,
  isEmpty = false,
  emptyMessage,
  height = 260,
  children,
  footnote,
}: ChartCardProps) {
  const { t } = useI18n()
  const periodText = typeof period === 'string' ? period : t(period)

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      style={{ backgroundColor: liroVar.surface.raised, borderColor: liroVar.border.default }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="md">
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Box
            p={9}
            style={{
              borderRadius: 'var(--liro-radius-md)',
              backgroundColor: liroVar.brand.subtle,
              color: liroVar.text.brand,
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <Icon size={18} />
          </Box>

          <Stack gap={2} style={{ minWidth: 0 }}>
            <Group gap="xs" align="baseline" wrap="wrap">
              <Title order={4}>{t(title)}</Title>
              {periodText && (
                <Text size="xs" style={{ color: liroVar.text.tertiary }}>{periodText}</Text>
              )}
            </Group>
            {description && (
              <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(description)}</Text>
            )}
          </Stack>
        </Group>

        <Group gap="sm" wrap="nowrap" align="center">
          {total !== undefined && (
            <Text size="lg" fw={700} data-numeric style={{ whiteSpace: 'nowrap' }}>
              {total}
            </Text>
          )}
          {actions}
        </Group>
      </Group>

      {loading ? (
        <Stack gap="xs">
          <Skeleton height={height - 40} radius="md" />
          <Group gap="xs" justify="center">
            <Skeleton height={10} width={70} />
            <Skeleton height={10} width={70} />
          </Group>
        </Stack>
      ) : isEmpty ? (
        <Center h={height}>
          <Stack align="center" gap={6}>
            <Box style={{ color: liroVar.text.tertiary }}>
              <ChartNoAxesColumn size={28} strokeWidth={1.5} />
            </Box>
            <Text size="sm" style={{ color: liroVar.text.secondary }}>
              {t(emptyMessage ?? NO_DATA)}
            </Text>
          </Stack>
        </Center>
      ) : (
        <Box h={height}>{children}</Box>
      )}

      {footnote && !loading && (
        <Text size="xs" mt="sm" style={{ color: liroVar.text.tertiary }}>
          {t(footnote)}
        </Text>
      )}
    </Paper>
  )
}

/** Diskretan indikator za grafikone koji se osvežavaju u pozadini. */
export function ChartRefreshing() {
  return (
    <Center>
      <Loader size={14} />
    </Center>
  )
}

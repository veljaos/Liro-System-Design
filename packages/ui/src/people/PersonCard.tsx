'use client'

import { Card, Group, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Kartica lica sa pojasom u zaglavlju i brojkama.
 *
 * Zaglavlje je podrazumevano POJAS U BOJI, ne fotografija. Dva razloga:
 * vizuelna regresija ne sme da zavisi od mreze, a u poslovnom sistemu
 * ukrasni pejzaz iza zaposlenog je sum. `coverImage` postoji kad zaista treba.
 *
 * Radnja je slot, ne prop tipa `intent`: kartica ne treba da zna za katalog
 * namera - aplikacija prosledi `<ActionButton intent="view" />`.
 */

export interface PersonCardStat {
  value: string | number
  label: LocalizedLabel
}

export interface PersonCardProps {
  name: string
  /** Radno mesto ili zvanje. Nije `role` - to je ARIA prop, vidi `PersonInfo`. */
  position?: string
  avatarUrl?: string | null
  stats?: PersonCardStat[]
  action?: ReactNode
  coverImage?: string
  coverHeight?: number
}

export function PersonCard({
  name,
  position,
  avatarUrl,
  stats,
  action,
  coverImage,
  coverHeight = 120,
}: PersonCardProps) {
  const { t } = useI18n()

  return (
    <Card withBorder padding="lg" radius="md">
      {/* Ukrasna slika ide kao CSS pozadina, ne kao `<img>` - tako je
          nedostupna citacu ekrana, sto je za ukras ISPRAVNO ponasanje. */}
      <Card.Section
        h={coverHeight}
        style={
          coverImage
            ? {
                backgroundImage: `url(${coverImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : { backgroundColor: liroVar.brand.subtle }
        }
      />

      <PersonAvatar
        name={name}
        src={avatarUrl}
        size={80}
        mx="auto"
        mt={-40}
        className="liro-person-cover-avatar"
      />

      <Text ta="center" size="lg" fw={500} mt="sm">
        {name}
      </Text>

      {position && (
        <Text ta="center" size="sm" style={{ color: liroVar.text.tertiary }}>
          {position}
        </Text>
      )}

      {stats && stats.length > 0 && (
        <Group mt="md" justify="center" gap={30}>
          {stats.map((stat) => (
            <Stack key={t(stat.label)} gap={0}>
              <Text ta="center" size="lg" fw={500} data-numeric>
                {stat.value}
              </Text>
              <Text ta="center" size="xs" lh={1.3} style={{ color: liroVar.text.tertiary }}>
                {t(stat.label)}
              </Text>
            </Stack>
          ))}
        </Group>
      )}

      {action && (
        <Group mt="xl" grow>
          {action}
        </Group>
      )}
    </Card>
  )
}
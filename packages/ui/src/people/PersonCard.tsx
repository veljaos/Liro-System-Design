'use client'

import { Card, Group, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Person card with a colored band in the header and figures.
 *
 * The header is a COLORED BAND by default, not a photo. Two reasons: visual
 * regression must not depend on the network, and in a business system a
 * decorative landscape behind an employee is noise. `coverImage` exists for
 * when it is genuinely needed.
 *
 * The action is a slot, not an `intent`-typed prop: the card should not know
 * about the intent catalog — the application passes
 * `<ActionButton intent="view" />`.
 */

export interface PersonCardStat {
  value: string | number
  label: LocalizedLabel
}

export interface PersonCardProps {
  name: string
  /** Job title or role. Not `role` — that is an ARIA prop, see `PersonInfo`. */
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
      {/* The decorative image goes in as a CSS background, not as an `<img>`
          — that way it is unreachable by a screen reader, which for
          decoration is the CORRECT behavior. */}
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
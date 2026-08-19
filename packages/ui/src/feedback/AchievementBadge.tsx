'use client'

import { Box, Paper, Progress, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core'
import { Lock, type LucideIcon } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'

/**
 * Achievements.
 *
 * Business software is dry, and the work inside it is repetitive and largely
 * invisible - nobody notices a bookkeeper who cleared the queue, only one who
 * did not. An achievement says the work was seen.
 *
 * Follows the GitHub pattern: the badge is an IMAGE the application supplies, not
 * an icon from a set. That is the line between a design system and a product -
 * the system frames, crops, dims and labels the badge; what is drawn on it is the
 * product's decision, and a customer will want their own.
 *
 * Three rules the component enforces, and each is about not doing harm:
 *
 * A locked achievement shows WHAT is required, not just that it is locked. A grey
 * square with no explanation is a taunt, not a goal.
 *
 * Progress is shown where it exists. "6 of 10" is something a person can act on
 * today; "not yet earned" is not.
 *
 * A locked badge is DIMMED, never hidden. A goal nobody can see is not a goal.
 */

const LOCKED: TranslationKey = 'feedback.achievement.locked'
const EARNED: TranslationKey = 'feedback.achievement.earned'
const LEVEL: TranslationKey = 'feedback.achievement.level'

export interface Achievement {
  id: string
  label: LocalizedLabel
  /** What it takes. Shown whether earned or not. */
  description: LocalizedLabel
  /**
   * Path to the badge image - PNG or SVG, supplied by the application.
   *
   * When absent, `icon` is used. A design system cannot ship artwork for a
   * customer's achievements, so the image is a prop and the icon is the fallback.
   */
  image?: string
  /** Fallback when there is no image, and what a locked badge shows. */
  icon?: LucideIcon
  earned?: boolean
  /** Already formatted by the application. */
  earnedAt?: string
  /**
   * Repeat count, as on GitHub: `×2`, `×3`.
   *
   * Only shown from 2 upwards - a `×1` on every badge is noise.
   */
  level?: number
  /** Progress towards it, when it can be counted. */
  progress?: { done: number; total: number }
  tone?: StatusToneName
}

export interface AchievementBadgeProps {
  achievement: Achievement
  size?: number
  /** Turns off the tooltip when the name is already written beside the badge. */
  withTooltip?: boolean
}

export function AchievementBadge({
  achievement,
  size = 64,
  withTooltip = true,
}: AchievementBadgeProps) {
  const { t } = useI18n()
  const earned = achievement.earned ?? false
  const tone = liroVar.status[achievement.tone ?? 'premium']
  const level = achievement.level ?? 1

  const name = t(achievement.label)
  const state = t(earned ? EARNED : LOCKED)
  const levelPart = earned && level > 1 ? `, ${t(LEVEL)} ${level}` : ''

  const FallbackIcon = earned ? achievement.icon : (achievement.icon ?? Lock)

  const badge = (
    <Box
      /*
       * `role="img"` on the wrapper, not on the picture.
       *
       * The badge as a whole carries the meaning - image, ring and level mark
       * together. Without the role, `aria-label` would sit on a `<div>`, where it
       * is prohibited.
       */
      role="img"
      aria-label={`${name}, ${state}${levelPart}`}
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
    >
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--liro-radius-full)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: earned ? tone.bg : liroVar.surface.sunken,
          border: `2px solid ${earned ? tone.border : liroVar.border.subtle}`,
          color: earned ? tone.fg : liroVar.text.tertiary,
          /*
           * A locked badge is desaturated and dimmed rather than replaced.
           *
           * The shape stays recognisable, so the user can see what they are
           * working towards - which is the whole point of showing it at all.
           */
          filter: earned ? undefined : 'grayscale(1)',
          opacity: earned ? 1 : 0.45,
        }}
      >
        {achievement.image ? (
          /* Decorative: the wrapper's `role="img"` already carries the name, so a
             second name here would be read twice. */
          <img src={achievement.image} alt="" aria-hidden width={size} height={size} />
        ) : FallbackIcon ? (
          <FallbackIcon size={Math.round(size * 0.42)} aria-hidden />
        ) : null}
      </Box>

      {earned && level > 1 && (
        /*
         * The level mark sits over the corner, as on GitHub. `text.onAccent` on
         * `status.solid` is white on a full tone - the same pair every filled
         * button in the system uses, measured at 4.5+.
         */
        <Box
          aria-hidden
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            minWidth: 22,
            height: 22,
            padding: '0 5px',
            borderRadius: 'var(--liro-radius-full)',
            backgroundColor: liroVar.surface.raised,
            backgroundImage: `linear-gradient(${tone.bg}, ${tone.bg})`,
            color: tone.fg,
            border: `2px solid ${liroVar.surface.raised}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--liro-font-size-xs)',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {`×${level}`}
        </Box>
      )}
    </Box>
  )

  if (!withTooltip) return badge

  return (
    <Tooltip
      label={`${name} — ${t(achievement.description)}`}
      withArrow
      multiline
      w={240}
      /* A locked badge is not interactive, so a hover-only tooltip would be
         unreachable by keyboard. */
      events={{ hover: true, focus: true, touch: true }}
    >
      {badge}
    </Tooltip>
  )
}

export interface AchievementGridProps {
  achievements: Achievement[]
  cols?: { base: number; sm?: number; lg?: number }
}

/** Achievements as cards, with names, level and progress. */
export function AchievementGrid({ achievements, cols }: AchievementGridProps) {
  const { t, formatNumber } = useI18n()

  return (
    <SimpleGrid cols={cols ?? { base: 1, sm: 2, lg: 3 }} spacing="lg">
      {achievements.map((achievement) => {
        const earned = achievement.earned ?? false
        const progress = achievement.progress
        const tone = liroVar.status[achievement.tone ?? 'premium']

        return (
          <Paper
            key={achievement.id}
            withBorder
            p="xl"
            radius="lg"
            style={{
              backgroundColor: liroVar.surface.raised,
              /* An earned card is tinted on its left edge - the tone tells you at
                 a glance which ones are done, without reading. */
              borderColor: earned ? tone.border : liroVar.border.default,
              borderLeftWidth: 3,
              borderLeftColor: earned ? tone.solid : liroVar.border.subtle,
            }}
          >
            <Stack gap="md" align="center">
              {/* The name is written below, so the badge does not need a tooltip
                  repeating it. */}
              <AchievementBadge achievement={achievement} size={72} withTooltip={false} />

              <Stack gap={2} align="center" style={{ width: '100%' }}>
                <Text size="sm" fw={600} ta="center">
                  {t(achievement.label)}
                </Text>
                <Text size="xs" ta="center" style={{ color: liroVar.text.secondary }}>
                  {t(achievement.description)}
                </Text>
              </Stack>

              {earned ? (
                achievement.earnedAt && (
                  <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                    {`${t(EARNED)} · ${achievement.earnedAt}`}
                  </Text>
                )
              ) : progress && progress.total > 0 ? (
                <Box style={{ width: '100%' }}>
                  <Progress
                    value={(progress.done / progress.total) * 100}
                    size="sm"
                    radius="xl"
                    aria-label={t(achievement.label)}
                    styles={{ section: { backgroundColor: tone.solid } }}
                  />
                  <Text size="xs" mt={4} ta="center" data-numeric style={{ color: liroVar.text.tertiary }}>
                    {`${formatNumber(progress.done)} / ${formatNumber(progress.total)}`}
                  </Text>
                </Box>
              ) : (
                <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                  {t(LOCKED)}
                </Text>
              )}
            </Stack>
          </Paper>
        )
      })}
    </SimpleGrid>
  )
}
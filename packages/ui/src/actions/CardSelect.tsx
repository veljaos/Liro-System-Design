'use client'

import { useId, type ReactNode } from 'react'
import { Box, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Selection via cards instead of radio buttons.
 *
 * Five options in a radio group is a list to be read. Five cards with an icon
 * are recognized at a glance — and that is a difference that is felt when the
 * user opens the same screen a hundred times a day.
 *
 * Underneath is a real `<input type="radio">`, just visually hidden. That
 * gives, for free, what is hard to get exactly right with `<div onClick>`:
 * arrow-key movement within the group, selection with Space, grouping for a
 * screen reader, and behavior inside a `<form>`.
 *
 * When an option's description is longer than two sentences, this is not the
 * right component — the card stops being recognizable at a glance and
 * becomes a paragraph.
 */

export interface CardOption {
  value: string
  label: LocalizedLabel
  /** One short sentence. Anything longer does not belong on a card. */
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Badge in the top-right corner — e.g. `<StatusBadge label="Most common" />`. */
  badge?: ReactNode
  disabled?: boolean
}

interface SharedProps {
  options: CardOption[]
  label?: LocalizedLabel
  description?: LocalizedLabel
  /** Error message; shown below the group and colors the border. */
  error?: string | null
  columns?: number
  disabled?: boolean
}

export interface CardSelectProps extends SharedProps {
  value: string | null
  onChange: (value: string) => void
}

export interface CardMultiSelectProps extends SharedProps {
  value: string[]
  onChange: (value: string[]) => void
  /** Maximum number of selections allowed; beyond that, the rest are disabled. */
  max?: number
}

function CardBody({
  option,
  selected,
  invalid,
}: {
  option: CardOption
  selected: boolean
  invalid: boolean
}) {
  const { t } = useI18n()
  const Icon = option.icon

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      className="liro-card-option"
      data-selected={selected || undefined}
      data-invalid={invalid || undefined}
      data-disabled={option.disabled || undefined}
      style={{ height: '100%' }}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start" gap="xs">
        <Stack gap={8} style={{ minWidth: 0 }}>
          {Icon && (
            <Box
              p={8}
              style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                borderRadius: 'var(--liro-radius-md)',
                backgroundColor: selected ? liroVar.brand.subtle : liroVar.surface.sunken,
                color: selected ? liroVar.text.brand : liroVar.text.secondary,
              }}
            >
              <Icon size={20} />
            </Box>
          )}

          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} style={{ color: liroVar.text.primary }}>
              {t(option.label)}
            </Text>
            {option.description && (
              <Text size="xs" style={{ color: liroVar.text.secondary }}>
                {t(option.description)}
              </Text>
            )}
          </Stack>
        </Stack>

        {option.badge}
      </Group>
    </Paper>
  )
}

function GroupShell({
  label,
  description,
  error,
  children,
}: {
  label?: LocalizedLabel
  description?: LocalizedLabel
  error?: string | null
  children: ReactNode
}) {
  const { t } = useI18n()

  return (
    /*
     * `fieldset` and `legend` are not decoration: they tell a screen reader
     * that the cards are one group and what the question is. Without them,
     * five unrelated options are read out.
     */
    <Box component="fieldset" className="liro-card-select">
      {label && (
        <Text component="legend" size="sm" fw={500} mb={2}>
          {t(label)}
        </Text>
      )}
      {description && (
        <Text size="xs" mb="xs" style={{ color: liroVar.text.secondary }}>
          {t(description)}
        </Text>
      )}

      {children}

      {error && (
        <Text size="xs" mt={6} style={{ color: liroVar.status.danger.fg }}>
          {error}
        </Text>
      )}
    </Box>
  )
}

export function CardSelect({
  options,
  value,
  onChange,
  label,
  description,
  error,
  columns = 3,
  disabled = false,
}: CardSelectProps) {
  /* The group must have a unique name — otherwise two groups on the same
     page behave as one. */
  const name = useId()

  return (
    <GroupShell label={label} description={description} error={error}>
      <SimpleGrid cols={{ base: 1, sm: Math.min(2, columns), md: columns }} spacing="sm">
        {options.map((option) => {
          const selected = value === option.value
          const isDisabled = disabled || option.disabled

          return (
            <Box component="label" key={option.value} className="liro-card-label">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={isDisabled}
                onChange={() => onChange(option.value)}
                className="liro-visually-hidden"
              />
              <CardBody option={{ ...option, disabled: isDisabled }} selected={selected} invalid={Boolean(error)} />
            </Box>
          )
        })}
      </SimpleGrid>
    </GroupShell>
  )
}

export function CardMultiSelect({
  options,
  value,
  onChange,
  label,
  description,
  error,
  columns = 3,
  disabled = false,
  max,
}: CardMultiSelectProps) {
  const atLimit = max !== undefined && value.length >= max

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    )
  }

  return (
    <GroupShell label={label} description={description} error={error}>
      <SimpleGrid cols={{ base: 1, sm: Math.min(2, columns), md: columns }} spacing="sm">
        {options.map((option) => {
          const selected = value.includes(option.value)
          /* When the maximum is reached, unselected ones turn off — but
             selected ones stay clickable, so the selection can be swapped. */
          const isDisabled = disabled || option.disabled || (atLimit && !selected)

          return (
            <Box component="label" key={option.value} className="liro-card-label">
              <input
                type="checkbox"
                checked={selected}
                disabled={isDisabled}
                onChange={() => toggle(option.value)}
                className="liro-visually-hidden"
              />
              <CardBody option={{ ...option, disabled: isDisabled }} selected={selected} invalid={Boolean(error)} />
            </Box>
          )
        })}
      </SimpleGrid>
    </GroupShell>
  )
}
'use client'

import { useId, type ReactNode } from 'react'
import { Box, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Izbor karticama umesto radio dugmadi.
 *
 * Pet opcija u radio grupi je spisak koji se cita. Pet kartica sa ikonicom se
 * prepoznaje pogledom - a to je razlika koja se oseti kada korisnik isti ekran
 * otvara sto puta dnevno.
 *
 * Ispod je pravi `<input type="radio">`, samo vizuelno sakriven. Time se
 * besplatno dobija ono sto je kod `<div onClick>` tesko izvesti tacno:
 * kretanje strelicama unutar grupe, izbor razmakom, grupisanje za citac ekrana
 * i ponasanje unutar `<form>`.
 *
 * Kada opcija ima vise od dve recenice opisa, ovo nije prava komponenta -
 * kartica prestaje da bude prepoznatljiva i postaje pasus.
 */

export interface CardOption {
  value: string
  label: LocalizedLabel
  /** Jedna kratka recenica. Duze od toga ne pripada na karticu. */
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Oznaka u gornjem desnom uglu - npr. `<StatusBadge label="Najčešće" />`. */
  badge?: ReactNode
  disabled?: boolean
}

interface SharedProps {
  options: CardOption[]
  label?: LocalizedLabel
  description?: LocalizedLabel
  /** Poruka greske; prikazuje se ispod grupe i boji ivice. */
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
  /** Najveci dozvoljen broj izabranih; preko toga se ostale onemogucavaju. */
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
     * `fieldset` i `legend` nisu ukras: oni citacu ekrana kazu da su kartice
     * jedna grupa i koje je pitanje. Bez njih se cita pet nepovezanih opcija.
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
  /* Grupa mora imati jedinstveno ime - inace se dve grupe na istoj stranici
     ponasaju kao jedna. */
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
          /* Kada je dostignut najveci broj, neizabrane se gase - ali izabrane
             ostaju kliktave, da se izbor moze zameniti. */
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
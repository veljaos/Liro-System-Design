'use client'

import { Group, Stack, Text } from '@mantine/core'
import { GitCompareArrows } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton, ActionGroup } from '../actions/ActionButton'

export interface ConflictField {
  label: LocalizedLabel
  /** Vrednost koju je korisnik uneo. */
  mine: string
  /** Vrednost koja je u međuvremenu upisana u bazu. */
  theirs: string
}

export interface ConflictBannerProps {
  /** Ko je izmenio zapis, ako je poznato. */
  changedBy?: string
  changedAt?: string
  /** Polja koja se razlikuju - prikazuju se jedno pored drugog. */
  fields?: ConflictField[]
  onReload: () => void
  onOverwrite?: () => void
}

/**
 * Sukob istovremene izmene.
 *
 * Podrazumevani izlaz je ponovno ucitavanje, ne prepisivanje - jer korisnik u
 * tom trenutku ne zna sta je druga strana promenila. `onOverwrite` postoji za
 * slucajeve gde aplikacija zna da je bezbedno, ali nije ponudjen kao prvi
 * izbor i nikada nije istaknut.
 */
export function ConflictBanner({ changedBy, changedAt, fields, onReload, onOverwrite }: ConflictBannerProps) {
  const { t } = useI18n()

  return (
    <Stack
      gap="sm"
      p="md"
      style={{
        backgroundColor: liroVar.status.warning.bg,
        border: `1px solid ${liroVar.status.warning.border}`,
        borderRadius: 'var(--liro-radius-lg)',
      }}
    >
      <Group gap="xs" wrap="nowrap" align="flex-start">
        <span style={{ color: liroVar.status.warning.fg, display: 'flex', marginTop: 2 }}>
          <GitCompareArrows size={18} />
        </span>
        <Stack gap={2}>
          <Text size="sm" fw={700} style={{ color: liroVar.status.warning.fg }}>
            {t({
              sr: 'Zapis je izmenjen dok ste unosili',
              'sr-Cyrl': 'Запис је измењен док сте уносили',
              en: 'This record changed while you were editing',
            })}
          </Text>
          <Text size="xs" style={{ color: liroVar.text.secondary }}>
            {changedBy || changedAt
              ? [changedBy, changedAt].filter(Boolean).join(' · ')
              : t({
                  sr: 'Vaše izmene nisu sačuvane.',
                  'sr-Cyrl': 'Ваше измене нису сачуване.',
                  en: 'Your changes were not saved.',
                })}
          </Text>
        </Stack>
      </Group>

      {fields && fields.length > 0 && (
        <Stack gap={4} pl={26}>
          {fields.map((field, index) => (
            <Group key={index} gap="xs" wrap="nowrap" align="baseline">
              <Text size="xs" fw={600} w={140} style={{ color: liroVar.text.secondary }}>
                {t(field.label)}
              </Text>
              <Text size="xs" style={{ textDecoration: 'line-through', color: liroVar.text.tertiary }}>
                {field.mine}
              </Text>
              <Text size="xs" fw={600}>→ {field.theirs}</Text>
            </Group>
          ))}
        </Stack>
      )}

      <ActionGroup>
        <ActionButton
          intent="refresh"
          label={{ sr: 'Učitaj najnovije', en: 'Load latest' }}
          onClick={onReload}
        />
        {onOverwrite && (
          <ActionButton
            intent="revert"
            label={{ sr: 'Ipak sačuvaj moje izmene', en: 'Overwrite with mine' }}
            onClick={onOverwrite}
          />
        )}
      </ActionGroup>
    </Stack>
  )
}

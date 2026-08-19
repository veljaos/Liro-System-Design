'use client'

import { Group, Stack, Text } from '@mantine/core'
import { GitCompareArrows } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton, ActionGroup } from '../actions/ActionButton'

const CHANGED_TITLE: TranslationKey = 'feedback.conflictBanner.title'
const CHANGES_NOT_SAVED: TranslationKey = 'feedback.conflictBanner.changesNotSaved'
const LOAD_LATEST: TranslationKey = 'feedback.conflictBanner.loadLatest'
const OVERWRITE_MINE: TranslationKey = 'feedback.conflictBanner.overwriteMine'

export interface ConflictField {
  label: LocalizedLabel
  /** Value the user entered. */
  mine: string
  /** Value that was written to the database in the meantime. */
  theirs: string
}

export interface ConflictBannerProps {
  /** Who changed the record, if known. */
  changedBy?: string
  changedAt?: string
  /** Fields that differ - shown side by side. */
  fields?: ConflictField[]
  onReload: () => void
  onOverwrite?: () => void
}

/**
 * Concurrent-edit conflict.
 *
 * The default way out is reloading, not overwriting — because at that
 * moment the user does not know what the other side changed. `onOverwrite`
 * exists for cases where the application knows it is safe, but it is never
 * offered as the first choice and is never highlighted.
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
            {t(CHANGED_TITLE)}
          </Text>
          <Text size="xs" style={{ color: liroVar.text.secondary }}>
            {changedBy || changedAt
              ? [changedBy, changedAt].filter(Boolean).join(' · ')
              : t(CHANGES_NOT_SAVED)}
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
          label={LOAD_LATEST}
          onClick={onReload}
        />
        {onOverwrite && (
          <ActionButton
            intent="revert"
            label={OVERWRITE_MINE}
            onClick={onOverwrite}
          />
        )}
      </ActionGroup>
    </Stack>
  )
}

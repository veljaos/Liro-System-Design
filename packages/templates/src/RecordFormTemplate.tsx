'use client'

import { Box, Group, Stack, Text } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton, ActionGroup, PageHeader } from '@liro/ui'

/**
 * Full page for creating and editing a record.
 *
 * Exists because a form with forty fields does not belong in a modal.
 *
 * The rule this template enforces:
 *
 *   full page   an entity with more than about ten fields, with tabs, with
 *               attachments, or with data read from multiple sources —
 *               employee, client, contract, entry
 *   drawer      editing a subset of fields with a list that stays visible —
 *               a quick price change, assigning a tag
 *   modal       a short action with one outcome — confirmation, a single
 *               input, a document preview
 *
 * The reason is not aesthetics but that a modal has no URL. A long entry
 * that gets interrupted cannot be resumed, cannot be sent to a colleague, and
 * does not survive a page refresh. A full page gets all of that for free.
 */

export interface RecordFormTemplateProps {
  /** Title: "New person" or the name of the record being edited. */
  title: LocalizedLabel | string
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Status badge next to the title. */
  badge?: ReactNode
  /** Back to the list. Always present — the user must know how to leave. */
  onBack: () => void
  onSubmit: () => void
  onCancel?: () => void
  submitting?: boolean
  /** Disables saving while the form is not valid. */
  canSubmit?: boolean
  submitLabel?: LocalizedLabel
  /** Extra actions in the header — delete, duplicate, print. */
  extraActions?: ReactNode
  /** Tabs or a progress bar below the title. */
  subheader?: ReactNode
  children: ReactNode
  /** Secondary data next to the form — edit history, attachments, help. */
  aside?: ReactNode
  /** Note above the buttons — what happens upon saving. */
  footnote?: LocalizedLabel
}

const UNSAVED: TranslationKey = 'templates.recordForm.unsavedChanges'

export function RecordFormTemplate({
  title,
  description,
  icon,
  badge,
  onBack,
  onSubmit,
  onCancel,
  submitting = false,
  canSubmit = true,
  submitLabel,
  extraActions,
  subheader,
  children,
  aside,
  footnote,
}: RecordFormTemplateProps) {
  const { t } = useI18n()

  const actions = (
    <ActionGroup>
      {extraActions}
      <ActionButton intent="cancel" onClick={onCancel ?? onBack} disabled={submitting} />
      <ActionButton intent="save" label={submitLabel} onClick={onSubmit} loading={submitting} disabled={!canSubmit} />
    </ActionGroup>
  )

  return (
    <Stack gap={0}>
      <PageHeader
        title={title as LocalizedLabel}
        description={description}
        icon={icon}
        badge={badge}
        onBack={onBack}
        actions={actions}
      >
        {subheader}
      </PageHeader>

      <Box style={{ display: 'flex', gap: 'var(--liro-space-lg)', alignItems: 'flex-start' }}>
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          {children}

          {footnote && (
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>{t(footnote)}</Text>
          )}

          {/*
            The button bar is STICKY to the bottom of the window.
            On a form that scrolls, the save button must not have to be
            hunted for at the bottom of the page — it stays visible as long
            as there is something to save.
          */}
          <Group
            justify="space-between"
            align="center"
            p="sm"
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              backgroundColor: liroVar.surface.page,
              borderTop: `1px solid ${liroVar.border.default}`,
              marginInline: 'calc(-1 * var(--liro-space-sm))',
            }}
          >
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>{t(UNSAVED)}</Text>
            {actions}
          </Group>
        </Stack>

        {aside && (
          <Box visibleFrom="lg" style={{ width: 300, flexShrink: 0 }}>
            <Stack gap="md">{aside}</Stack>
          </Box>
        )}
      </Box>
    </Stack>
  )
}

'use client'

import { Group, Paper, Text, Transition, UnstyledButton } from '@mantine/core'
import { useState } from 'react'
import { liroVar, type ActionIntent } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { ConfirmModal } from '../feedback/ConfirmModal'

/**
 * Bar of actions over selected rows.
 *
 * Appears above the table when something is checked and disappears when it
 * is not. Deliberately pushes content down instead of floating over it: a bar
 * floating at the bottom of the screen covers the last row exactly when the
 * user is checking what they selected.
 */

export interface BulkAction {
  intent: ActionIntent
  /** A more precise label - "Post entries" instead of "Post". */
  label?: LocalizedLabel
  onClick: (ids: string[]) => void
  /**
   * Reason the action is currently not possible, or `false` when it is.
   *
   * Receives the selection because the restriction, as a rule, depends on it
   * — "at most 100 at once", "the statement is only sent to customers".
   */
  disabledReason?: (ids: string[]) => LocalizedLabel | false
  /** Requires confirmation. Defaults to following the list of irreversible intents. */
  confirm?: boolean
  /** Title of the confirmation dialog; defaults to following the intent. */
  confirmTitle?: LocalizedLabel
  /** Custom text in the confirmation dialog. */
  confirmText?: LocalizedLabel
}

export interface BulkActionBarProps {
  selected: string[]
  onClear: () => void
  actions: BulkAction[]
  /** Total number of rows matching the filter — for "select all N". */
  totalCount?: number
  onSelectAll?: () => void
  loading?: boolean
}

/**
 * Intents after which there is no going back.
 *
 * A bulk action is not undone: when 200 entries are posted, reverting means
 * 200 reversals. That is why confirmation here is not a formality.
 */
const IRREVERSIBLE: ActionIntent[] = [
  'delete',
  'void',
  'reject',
  'cancelDocument',
  'post',
  'approve',
]

const SELECTED_COUNT: TranslationKey = 'data.bulk.selectedCount'
const SELECT_ALL_COUNT: TranslationKey = 'data.bulk.selectAllCount'
const CONFIRM_COUNT: TranslationKey = 'data.bulk.confirmCount'
const CLEAR_LABEL: TranslationKey = 'data.bulk.clearSelection'

/*
* The title names the action before the user reads the text. "Delete" and
* "Post" do not carry the same weight, and without a title both dialogs look
* the same.
*/
const CONFIRM_TITLE: Partial<Record<ActionIntent, TranslationKey>> = {
  delete: 'data.bulk.confirmTitle.delete',
  post: 'data.bulk.confirmTitle.post',
  approve: 'data.bulk.confirmTitle.approve',
  reject: 'data.bulk.confirmTitle.reject',
  void: 'data.bulk.confirmTitle.void',
  cancelDocument: 'data.bulk.confirmTitle.cancelDocument',
}

const CONFIRM_FALLBACK: TranslationKey = 'data.bulk.confirmFallback'

export function BulkActionBar({
  selected,
  onClear,
  actions,
  totalCount,
  onSelectAll,
  loading = false,
}: BulkActionBarProps) {
  const { t } = useI18n()
  const [pending, setPending] = useState<BulkAction | null>(null)

  const count = selected.length
  const canSelectAll = Boolean(onSelectAll && totalCount && totalCount > count)

  const run = (action: BulkAction) => {
    const needsConfirm = action.confirm ?? IRREVERSIBLE.includes(action.intent)
    if (needsConfirm) setPending(action)
    else action.onClick(selected)
  }

  const confirmPending = () => {
    pending?.onClick(selected)
    setPending(null)
  }

  return (
    <>
      <Transition mounted={count > 0} transition="slide-down" duration={140}>
        {(styles) => (
          <Paper
            withBorder
            radius="md"
            p="xs"
            style={{
              ...styles,
              backgroundColor: liroVar.brand.subtle,
              borderColor: liroVar.border.brand,
            }}
          >
            <Group justify="space-between" wrap="wrap" gap="xs">
              <Group gap="sm" wrap="nowrap">
                <ActionButton
                  intent="cancel"
                  iconOnly
                  size="xs"
                  label={CLEAR_LABEL}
                  onClick={onClear}
                />

                {/*
                  `aria-live` is the only way for a screen reader to know that
                  the number changed. Without it, the user checks a row and
                  gets no feedback at all.
                */}
                <Text size="sm" fw={600} aria-live="polite" style={{ color: liroVar.text.brand }}>
                  {t(SELECTED_COUNT, undefined, { count })}
                </Text>

                {canSelectAll && totalCount && (
                  <UnstyledButton onClick={onSelectAll}>
                    <Text size="xs" td="underline" style={{ color: liroVar.text.brand }}>
                      {t(SELECT_ALL_COUNT, undefined, { count: totalCount })}
                    </Text>
                  </UnstyledButton>
                )}
              </Group>

              <Group gap="xs" wrap="wrap">
                {actions.map((action, index) => {
                  const reason = action.disabledReason?.(selected)
                  return (
                    <ActionButton
                      key={`${action.intent}-${index}`}
                      intent={action.intent}
                      label={action.label}
                      size="xs"
                      disabled={Boolean(reason) || loading}
                      disabledReason={reason || undefined}
                      onClick={() => run(action)}
                    />
                  )
                })}
              </Group>
            </Group>
          </Paper>
        )}
      </Transition>

      <ConfirmModal
        opened={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={confirmPending}
        loading={loading}
        title={
          pending
            ? (pending.confirmTitle ?? CONFIRM_TITLE[pending.intent] ?? CONFIRM_FALLBACK)
            : CONFIRM_FALLBACK
        }
        tone={pending && IRREVERSIBLE.includes(pending.intent) ? 'danger' : 'info'}
        text={pending?.confirmText ?? t(CONFIRM_COUNT, undefined, { count })}
      />
    </>
  )
}
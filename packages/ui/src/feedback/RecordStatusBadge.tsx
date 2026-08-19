'use client'

import { RECORD_STATUS_TONE, type RecordStatus } from '@liro/tokens'
import { type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { StatusBadge } from './StatusBadge'

/**
 * Record status badge.
 *
 * Same principle as with buttons: the developer picks the state, not the
 * color. Draft is always gray, overdue is always red, posted is always
 * green - across every module and every application.
 */

const STATUS_LABEL: Record<RecordStatus, TranslationKey> = {
  draft: 'feedback.recordStatus.draft',
  pending: 'feedback.recordStatus.pending',
  inReview: 'feedback.recordStatus.inReview',
  approved: 'feedback.recordStatus.approved',
  posted: 'feedback.recordStatus.posted',
  signed: 'feedback.recordStatus.signed',
  sent: 'feedback.recordStatus.sent',
  paid: 'feedback.recordStatus.paid',
  partiallyPaid: 'feedback.recordStatus.partiallyPaid',
  overdue: 'feedback.recordStatus.overdue',
  rejected: 'feedback.recordStatus.rejected',
  cancelled: 'feedback.recordStatus.cancelled',
  archived: 'feedback.recordStatus.archived',
  /* Same words as ActiveStatusBadge in StatusBadge.tsx - reuses its keys. */
  active: 'feedback.status.active',
  inactive: 'feedback.status.inactive',
  locked: 'feedback.recordStatus.locked',
  error: 'feedback.recordStatus.error',
}

export interface RecordStatusBadgeProps {
  status: RecordStatus
  /** A more precise label for a specific module; the color doesn't change. */
  label?: LocalizedLabel
  withBorder?: boolean
}

export function RecordStatusBadge({ status, label, withBorder }: RecordStatusBadgeProps) {
  return (
    <StatusBadge
      tone={RECORD_STATUS_TONE[status]}
      label={label ?? STATUS_LABEL[status]}
      withBorder={withBorder}
    />
  )
}

export function recordStatusLabel(status: RecordStatus): TranslationKey {
  return STATUS_LABEL[status]
}

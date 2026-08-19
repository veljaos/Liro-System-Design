'use client'

import type { ReactNode } from 'react'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { StatusBadge as StatusBadgeView, type StatusTone } from '../primitives/StatusBadge'

export type { StatusTone }

export interface StatusBadgeProps {
  label: LocalizedLabel
  tone?: StatusTone
  /** Icon to the left of the text - useful when color alone carries meaning. */
  icon?: ReactNode
  /** Shows a border; useful on colored surfaces where the background doesn't contrast. */
  withBorder?: boolean
}

export function StatusBadge({ label, tone = 'neutral', icon, withBorder = false }: StatusBadgeProps) {
  const { t } = useI18n()
  return <StatusBadgeView label={t(label)} tone={tone} icon={icon} withBorder={withBorder} />
}

const ACTIVE_LABEL: TranslationKey = 'feedback.status.active'
const INACTIVE_LABEL: TranslationKey = 'feedback.status.inactive'

export function ActiveStatusBadge({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? 'success' : 'neutral'} label={active ? ACTIVE_LABEL : INACTIVE_LABEL} />
}
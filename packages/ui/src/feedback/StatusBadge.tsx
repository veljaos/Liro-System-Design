'use client'

import type { ReactNode } from 'react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { StatusBadge as StatusBadgeView, type StatusTone } from '../primitives/StatusBadge'

export type { StatusTone }

export interface StatusBadgeProps {
  label: LocalizedLabel
  tone?: StatusTone
  /** Ikonica levo od teksta - korisna kada boja sama nosi znacenje. */
  icon?: ReactNode
  /** Prikazuje ivicu; korisno na obojenim povrsinama gde pozadina ne kontrastira. */
  withBorder?: boolean
}

export function StatusBadge({ label, tone = 'neutral', icon, withBorder = false }: StatusBadgeProps) {
  const { t } = useI18n()
  return <StatusBadgeView label={t(label)} tone={tone} icon={icon} withBorder={withBorder} />
}

const ACTIVE_LABEL: LocalizedLabel = { sr: 'Aktivan', 'sr-Cyrl': 'Активан', en: 'Active' }
const INACTIVE_LABEL: LocalizedLabel = { sr: 'Neaktivan', 'sr-Cyrl': 'Неактиван', en: 'Inactive' }

export function ActiveStatusBadge({ active }: { active: boolean }) {
  return <StatusBadge tone={active ? 'success' : 'neutral'} label={active ? ACTIVE_LABEL : INACTIVE_LABEL} />
}
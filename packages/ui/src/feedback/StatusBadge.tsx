'use client'

import { Box } from '@mantine/core'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import type { ReactNode } from 'react'

export type StatusTone = StatusToneName

export interface StatusBadgeProps {
  label: LocalizedLabel
  tone?: StatusTone
  /** Ikonica levo od teksta - korisna kada boja sama nosi znacenje. */
  icon?: ReactNode
  /** Prikazuje ivicu; korisno na obojenim povrsinama gde pozadina ne kontrastira. */
  withBorder?: boolean
}

/**
 * Ostar pravougaonik od 2px umesto zaobljene pilule.
 *
 * Razlika je namerna: badge u tabeli je oznaka stanja, ne dugme. Ostra ivica
 * ga vizuelno odvaja od interaktivnih elemenata koji su svi zaobljeni.
 */
export function StatusBadge({ label, tone = 'neutral', icon, withBorder = false }: StatusBadgeProps) {
  const { t } = useI18n()
  const palette = liroVar.status[tone]

  return (
    <Box
      component="span"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        backgroundColor: palette.bg,
        color: palette.fg,
        border: withBorder ? `1px solid ${palette.border}` : undefined,
        borderRadius: 'var(--liro-radius-xs)',
        padding: '2px 6px',
        fontSize: 'var(--liro-font-size-xs)',
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {t(label)}
    </Box>
  )
}

const ACTIVE_LABEL: LocalizedLabel = { sr: 'Aktivan', 'sr-Cyrl': 'Активан', en: 'Active' }
const INACTIVE_LABEL: LocalizedLabel = { sr: 'Neaktivan', 'sr-Cyrl': 'Неактиван', en: 'Inactive' }

export function ActiveStatusBadge({ active }: { active: boolean }) {
  return (
    <StatusBadge
      tone={active ? 'success' : 'neutral'}
      label={active ? ACTIVE_LABEL : INACTIVE_LABEL}
    />
  )
}

import { Box } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar, type StatusToneName } from '@liro/tokens'

export type StatusTone = StatusToneName

export interface StatusBadgeViewProps {
  /** Already-resolved text. Translation is the job of the layer above. */
  label: string
  tone?: StatusTone
  /** Icon to the left of the text — useful when the color alone carries the meaning. */
  icon?: ReactNode
  /** Shows a border; useful on colored surfaces where the background does not contrast. */
  withBorder?: boolean
}

/**
 * A sharp 2px rectangle instead of a rounded pill.
 *
 * The difference is deliberate: a badge in a table is a status marker, not a
 * button. The sharp edge visually separates it from interactive elements,
 * which are all rounded.
 */
export function StatusBadge({ label, tone = 'neutral', icon, withBorder = false }: StatusBadgeViewProps) {
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
      {label}
    </Box>
  )
}
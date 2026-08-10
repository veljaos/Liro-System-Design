'use client'

import { Box, Group, Stack, Text } from '@mantine/core'
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export interface CalloutProps {
  tone?: StatusToneName
  title?: LocalizedLabel
  children: ReactNode
  icon?: LucideIcon
  /** Actions at the bottom - usually a single `ActionButton`. */
  actions?: ReactNode
}

const TONE_ICON: Partial<Record<StatusToneName, LucideIcon>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
}

/**
 * A message inside the page flow - explanation of a rule, deadline warning,
 * consequence of an action.
 *
 * Differs from a notification in that it doesn't disappear. Content the user
 * must read before continuing must not be transient.
 */
export function Callout({ tone = 'info', title, children, icon, actions }: CalloutProps) {
  const { t } = useI18n()
  const palette = liroVar.status[tone]
  const Icon = icon ?? TONE_ICON[tone] ?? Info

  return (
    <Box
      p="sm"
      style={{
        backgroundColor: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 'var(--liro-radius-md)',
      }}
    >
      <Group align="flex-start" gap="sm" wrap="nowrap">
        <Box style={{ color: palette.fg, display: 'flex', flexShrink: 0, marginTop: 1 }}>
          <Icon size={17} />
        </Box>
        <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
          {title && (
            <Text size="sm" fw={600} style={{ color: palette.fg }}>{t(title)}</Text>
          )}
          <Text size="sm" style={{ color: liroVar.text.primary }} component="div">
            {children}
          </Text>
          {actions && <Group gap="xs" mt={4}>{actions}</Group>}
        </Stack>
      </Group>
    </Box>
  )
}

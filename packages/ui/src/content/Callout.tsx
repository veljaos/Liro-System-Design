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
  /** Radnje na dnu - obicno jedno `ActionButton`. */
  actions?: ReactNode
}

const TONE_ICON: Partial<Record<StatusToneName, LucideIcon>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
}

/**
 * Poruka unutar toka stranice - objasnjenje pravila, upozorenje o roku,
 * posledica radnje.
 *
 * Razlikuje se od obavestenja (notification) po tome sto ne nestaje. Sadrzaj
 * koji korisnik mora da procita pre nego sto nastavi ne sme da bude prolazan.
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

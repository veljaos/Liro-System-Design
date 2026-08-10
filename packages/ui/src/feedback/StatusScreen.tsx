'use client'

import { Box, Button, Center, Stack, Text, Title } from '@mantine/core'
import type { LucideIcon } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { BrandMark } from '../brand/BrandMark'
import { useLiroAppOptional } from '../app/LiroAppProvider'

export interface StatusScreenAction {
  label: LocalizedLabel
  href?: string
  onClick?: () => void
}

export interface StatusScreenProps {
  icon: LucideIcon
  title: LocalizedLabel
  description: LocalizedLabel
  /** "404", "503" — label above the title. */
  eyebrow?: string
  tone?: StatusToneName
  action?: StatusScreenAction
  secondaryAction?: StatusScreenAction
  /**
   * Component for links. Defaults to the one from `LiroAppProvider`.
   *
   * Pass it manually only from client components — a function cannot cross
   * the server/client boundary, so `<NotFoundTemplate linkComponent={Link} />`
   * from `not-found.tsx` would break the build.
   */
  linkComponent?: ElementType
  children?: ReactNode
}

/**
 * Shared base for interrupted screens: 404, 500, 503, suspended account,
 * maintenance.
 *
 * Exists so these screens do not look like the default Next.js template. A
 * user who runs into an error should still see the product, not a blank
 * document with black text.
 */
export function StatusScreen({
  icon: Icon,
  title,
  description,
  eyebrow,
  tone = 'info',
  action,
  secondaryAction,
  linkComponent,
  children,
}: StatusScreenProps) {
  const { t } = useI18n()
  const app = useLiroAppOptional()
  const palette = liroVar.status[tone]

  const renderAction = (config: StatusScreenAction, variant: 'filled' | 'default') => {
    const label = t(config.label)

    if (config.href) {
      const Anchor = (linkComponent ?? app?.linkComponent ?? 'a') as ElementType
      return (
        <Button
          variant={variant}
          fullWidth
          renderRoot={(props) => <Anchor href={config.href} {...props} />}
        >
          {label}
        </Button>
      )
    }

    return <Button onClick={config.onClick} variant={variant} fullWidth>{label}</Button>
  }

  return (
    <Box style={{ minHeight: '100dvh', overflowX: 'hidden', backgroundColor: liroVar.surface.raised }}>
      <Center style={{ minHeight: '100dvh' }} px="md">
        <Stack align="center" gap="lg" maw={440} py="xl">
          <BrandMark size="lg" responsive={false} />

          <Box
            style={{
              width: 84,
              height: 84,
              borderRadius: 'var(--liro-radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: palette.solid,
              flexShrink: 0,
            }}
          >
            <Icon size={36} color={liroVar.text.onAccent} strokeWidth={1.75} />
          </Box>

          <Stack gap={4} align="center">
            {eyebrow && (
              <Text
                fw={700}
                size="sm"
                style={{
                  fontFamily: 'var(--liro-font-brand)',
                  letterSpacing: '2px',
                  color: liroVar.text.secondary,
                }}
              >
                {eyebrow}
              </Text>
            )}
            <Title order={2} ta="center">{t(title)}</Title>
          </Stack>

          <Text size="sm" ta="center" style={{ color: liroVar.text.secondary }}>
            {t(description)}
          </Text>

          {children}

          {(action || secondaryAction) && (
            <Stack gap="xs" w="100%" maw={280} mt="xs">
              {action && renderAction(action, 'filled')}
              {secondaryAction && renderAction(secondaryAction, 'default')}
            </Stack>
          )}
        </Stack>
      </Center>
    </Box>
  )
}

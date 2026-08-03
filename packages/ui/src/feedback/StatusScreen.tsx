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
  /** "404", "503" - oznaka iznad naslova. */
  eyebrow?: string
  tone?: StatusToneName
  action?: StatusScreenAction
  secondaryAction?: StatusScreenAction
  /**
   * Komponenta za linkove. Podrazumevano se uzima iz `LiroAppProvider`.
   *
   * Prosledjuj je rucno samo iz klijentskih komponenti - funkcija ne moze da
   * predje granicu server/klijent, pa bi `<NotFoundTemplate linkComponent={Link} />`
   * iz `not-found.tsx` srusio build.
   */
  linkComponent?: ElementType
  children?: ReactNode
}

/**
 * Zajednicka osnova za prekinute ekrane: 404, 500, 503, suspendovan nalog,
 * odrzavanje.
 *
 * Postoji da ovi ekrani ne bi izgledali kao podrazumevani Next.js template.
 * Korisnik koji naleti na gresku i dalje treba da vidi proizvod, a ne prazan
 * dokument sa crnim tekstom.
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

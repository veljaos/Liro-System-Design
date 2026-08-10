'use client'

import { Box, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { BrandMark } from '../brand/BrandMark'

export interface AuthShellProps {
  children: ReactNode
  /**
   * Image on the right side. Pass a `next/image` element for it to be
   * optimized; if omitted, the form takes the full width.
   */
  cover?: ReactNode
  /** Text below the form - terms of use, version, contact. */
  footer?: ReactNode
  caption?: LocalizedLabel
}

/**
 * Screen for sign-in, password recovery, and two-factor verification.
 *
 * The form is always on the left and always a fixed width of 360px. The
 * photo is decoration and disappears below the `sm` breakpoint — on a phone
 * it does not compete with the fields.
 */
export function AuthShell({ children, cover, footer, caption }: AuthShellProps) {
  const { t } = useI18n()

  return (
    <Box style={{ minHeight: '100dvh', display: 'flex', overflowX: 'hidden' }}>
      <Box
        style={{
          flex: cover ? '1 1 480px' : '1 1 100%',
          /* Without this, a flex item cannot shrink below its content,
             which produces horizontal scroll on a phone. */
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--liro-space-xl) var(--liro-space-lg)',
          backgroundColor: liroVar.surface.raised,
        }}
      >
        <Stack gap="xl" w={360} maw="100%">
          <Stack gap={4} align="center">
            <BrandMark size="lg" responsive={false} />
            {caption && (
              <Text size="xs" ta="center" style={{ color: liroVar.text.secondary }}>
                {t(caption)}
              </Text>
            )}
          </Stack>

          {children}

          {footer && (
            <Box style={{ color: liroVar.text.tertiary, fontSize: 'var(--liro-font-size-xs)', textAlign: 'center' }}>
              {footer}
            </Box>
          )}
        </Stack>
      </Box>

      {cover && (
        <Box
          visibleFrom="sm"
          pos="relative"
          style={{ flex: '1 1 55%', minWidth: 0, overflow: 'hidden', backgroundColor: liroVar.surface.sunken }}
        >
          {cover}
        </Box>
      )}
    </Box>
  )
}

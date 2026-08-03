'use client'

import { Box, Stack, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { BrandMark } from '../brand/BrandMark'

export interface AuthShellProps {
  children: ReactNode
  /**
   * Slika na desnoj strani. Prosledi `next/image` element da bi bila
   * optimizovana; ako se izostavi, forma zauzima celu sirinu.
   */
  cover?: ReactNode
  /** Tekst ispod forme - uslovi koriscenja, verzija, kontakt. */
  footer?: ReactNode
  caption?: LocalizedLabel
}

/**
 * Ekran za prijavu, oporavak lozinke i dvofaktornu potvrdu.
 *
 * Forma je uvek levo i uvek fiksne sirine od 360px. Fotografija je ukras i
 * nestaje ispod `sm` tacke preloma - na telefonu se ne takmici sa poljima.
 */
export function AuthShell({ children, cover, footer, caption }: AuthShellProps) {
  const { t } = useI18n()

  return (
    <Box style={{ minHeight: '100dvh', display: 'flex', overflowX: 'hidden' }}>
      <Box
        style={{
          flex: cover ? '1 1 480px' : '1 1 100%',
          /* Bez ovoga flex element ne sme da se skupi ispod svog sadrzaja,
             sto na telefonu proizvodi horizontalni skrol. */
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

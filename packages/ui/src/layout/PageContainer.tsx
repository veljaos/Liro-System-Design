'use client'

import { Box } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

export type PageWidth = 'narrow' | 'default' | 'wide' | 'full'

const MAX_WIDTH: Record<PageWidth, number | undefined> = {
  /** Formulari i tekst - preko 720px oko gubi red pri prelasku. */
  narrow: 720,
  /** Podrazumevano za stranice sa detaljima. */
  default: 1180,
  /** Tabele sa mnogo kolona. */
  wide: 1440,
  full: undefined,
}

export interface PageContainerProps {
  children: ReactNode
  width?: PageWidth
  /** Uklanja vertikalni razmak - za stranice koje same upravljaju vrhom. */
  flush?: boolean
}

/**
 * Mera i bocni razmak stranice.
 *
 * Razmaci su namerno velikodusni: 16px na telefonu, 32px na tabletu, 48px na
 * desktopu. Gust sadrzaj priljubljen uz ivicu ekrana deluje kao interni alat,
 * a ne kao proizvod - a razlika je samo u praznini oko njega.
 *
 * Programer ne bira razmak. Bira meru sadrzaja, i to iz cetiri ponudjene.
 */
export function PageContainer({ children, width = 'default', flush = false }: PageContainerProps) {
  return (
    <Box
      className="liro-page-container"
      data-flush={flush || undefined}
      style={{ backgroundColor: liroVar.surface.page }}
    >
      <Box mx="auto" style={{ maxWidth: MAX_WIDTH[width] }}>
        {children}
      </Box>
    </Box>
  )
}

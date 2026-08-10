import { Box } from '@mantine/core'
import type { ReactNode } from 'react'
import { liroVar } from '@liro/tokens'

/*
 * Deliberately without `'use client'`. This component has no state, no
 * effects, and does not read context — the directive would needlessly tie
 * it to the client tree.
 */

export type PageWidth = 'narrow' | 'default' | 'wide' | 'full'

const MAX_WIDTH: Record<PageWidth, number | undefined> = {
  /** Forms and text - beyond 720px the eye loses the line when wrapping. */
  narrow: 720,
  /** Default for detail pages. */
  default: 1180,
  /** Tables with many columns. */
  wide: 1440,
  full: undefined,
}

export interface PageContainerProps {
  children: ReactNode
  width?: PageWidth
  /** Removes vertical padding - for pages that manage their own top. */
  flush?: boolean
}

/**
 * Page measure and side padding.
 *
 * The padding is deliberately generous: 16px on a phone, 32px on a tablet,
 * 48px on desktop. Dense content pressed against the screen edge feels like
 * an internal tool, not a product — and the difference is only the empty
 * space around it.
 *
 * The developer does not choose the padding. They choose the content
 * measure, from four offered options.
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
'use client'

import { Box, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useLiroAppOptional } from '../app/LiroAppProvider'

export interface BrandMarkProps {
  /** Overrides the name from `LiroAppProvider`. */
  name?: string
  /** Shorter name shown below the `sm` breakpoint. */
  shortName?: string
  size?: 'sm' | 'md' | 'lg'
  /** When `false`, always shows the full name with no responsive swap. */
  responsive?: boolean
}

const SIZES = {
  sm: { fontSize: 'var(--liro-font-size-sm)' },
  md: { fontSize: 'var(--liro-font-size-md)' },
  lg: { fontSize: 'var(--liro-font-size-xl)' },
} as const

/**
 * Wordmark in the brand typeface. The only place Space Grotesk appears —
 * if it shows up anywhere else, that is a bug.
 */
export function BrandMark({ name, shortName, size = 'md', responsive = true }: BrandMarkProps) {
  const app = useLiroAppOptional()
  const full = name ?? app?.name ?? ''
  const short = shortName ?? app?.shortName ?? full

  if (app?.logo && !name) return <>{app.logo}</>

  const style = {
    fontFamily: 'var(--liro-font-brand)',
    fontWeight: 700,
    letterSpacing: 'var(--liro-tracking-caps)',
    color: liroVar.text.brand,
    whiteSpace: 'nowrap' as const,
    ...SIZES[size],
  }

  if (!responsive || full === short) {
    return <Text component="span" style={style}>{full}</Text>
  }

  return (
    <Text component="span" style={style}>
      <Box component="span" visibleFrom="sm">{full}</Box>
      <Box component="span" hiddenFrom="sm">{short}</Box>
    </Text>
  )
}

'use client'

import { Box, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useLiroAppOptional } from '../app/LiroAppProvider'

export interface BrandMarkProps {
  /** Nadjacava ime iz `LiroAppProvider`. */
  name?: string
  /** Krace ime koje se prikazuje ispod `sm` tacke preloma. */
  shortName?: string
  size?: 'sm' | 'md' | 'lg'
  /** Kada je `false`, uvek prikazuje puno ime bez responzivne zamene. */
  responsive?: boolean
}

const SIZES = {
  sm: { fontSize: 'var(--liro-font-size-sm)' },
  md: { fontSize: 'var(--liro-font-size-md)' },
  lg: { fontSize: 'var(--liro-font-size-xl)' },
} as const

/**
 * Wordmark u brend pismu. Jedino mesto na kojem se Space Grotesk pojavljuje -
 * ako se javi bilo gde drugde, to je greska.
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
    color: liroVar.brand.solid,
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

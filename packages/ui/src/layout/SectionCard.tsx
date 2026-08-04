'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { SectionCard as SectionCardView } from '../primitives/SectionCard'

export interface SectionCardProps {
  title?: LocalizedLabel
  description?: LocalizedLabel
  icon?: LucideIcon
  /** Dugmad u gornjem desnom uglu sekcije. */
  actions?: ReactNode
  children: ReactNode
  /** Uklanja unutrasnji razmak - za sekcije koje sadrze tabelu do ivice. */
  flush?: boolean
  withDivider?: boolean
}

export function SectionCard({
  title,
  description,
  icon,
  actions,
  children,
  flush = false,
  withDivider = true,
}: SectionCardProps) {
  const { t } = useI18n()

  return (
    <SectionCardView
      title={title ? t(title) : undefined}
      description={description ? t(description) : undefined}
      icon={icon}
      actions={actions}
      flush={flush}
      withDivider={withDivider}
    >
      {children}
    </SectionCardView>
  )
}
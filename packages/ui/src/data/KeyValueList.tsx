'use client'

import type { ReactNode } from 'react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { KeyValueList as KeyValueListView } from '../primitives/KeyValueList'

export interface KeyValueItem {
  label: LocalizedLabel
  value: ReactNode
  /** Takes up the full width - for addresses, notes, long names. */
  fullWidth?: boolean
  /** Right-aligns the value and enables tabular figures. */
  numeric?: boolean
}

export interface KeyValueListProps {
  items: KeyValueItem[]
  columns?: number
  loading?: boolean
}

export function KeyValueList({ items, columns = 2, loading = false }: KeyValueListProps) {
  const { t } = useI18n()

  return (
    <KeyValueListView
      columns={columns}
      loading={loading}
      items={items.map((item) => ({ ...item, label: t(item.label) }))}
    />
  )
}
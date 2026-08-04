'use client'

import type { ReactNode } from 'react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { KeyValueList as KeyValueListView } from '../primitives/KeyValueList'

export interface KeyValueItem {
  label: LocalizedLabel
  value: ReactNode
  /** Zauzima celu sirinu - za adrese, napomene, duge nazive. */
  fullWidth?: boolean
  /** Poravnava vrednost desno i ukljucuje tabularne cifre. */
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
'use client'

import { Group, Loader, Pagination, Select, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

export interface TablePaginationProps {
  page: number
  onPageChange: (page: number) => void
  pageSize: number
  totalCount: number
  /** Kada je prosledjeno, prikazuje izbor broja redova po strani. */
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  /** Prikazuje diskretan indikator dok stize sledeca strana. */
  isFetching?: boolean
}

const SHOWING: LocalizedLabel = { sr: 'Prikazano', 'sr-Cyrl': 'Приказано', en: 'Showing' }
const OF: LocalizedLabel = { sr: 'od', 'sr-Cyrl': 'од', en: 'of' }
const PER_PAGE: LocalizedLabel = { sr: 'po strani', 'sr-Cyrl': 'по страни', en: 'per page' }

export function TablePagination({
  page,
  onPageChange,
  pageSize,
  totalCount,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  isFetching = false,
}: TablePaginationProps) {
  const { t, formatNumber } = useI18n()

  if (totalCount === 0) return null

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalCount)

  return (
    <Group justify="space-between" wrap="wrap" gap="sm" px="md" pt="sm" pb="md">
      <Group gap="sm" wrap="nowrap">
        <Text size="xs" style={{ color: liroVar.text.secondary }}>
          {t(SHOWING)} {formatNumber(from)}–{formatNumber(to)} {t(OF)} {formatNumber(totalCount)}
          {isFetching && (
            <Loader size={10} ml={6} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
          )}
        </Text>

        {onPageSizeChange && (
          <Group gap={4} wrap="nowrap">
            <Select
              size="xs"
              w={72}
              value={String(pageSize)}
              onChange={(value) => value && onPageSizeChange(Number(value))}
              data={pageSizeOptions.map((option) => String(option))}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />
            <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(PER_PAGE)}</Text>
          </Group>
        )}
      </Group>

      {totalPages > 1 && (
        <Pagination value={page} onChange={onPageChange} total={totalPages} size="sm" />
      )}
    </Group>
  )
}

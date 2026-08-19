'use client'

import { Group, Loader, Pagination, Select, Text } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { useI18n, type TranslationKey } from '@liro/i18n'

export interface TablePaginationProps {
  page: number
  onPageChange: (page: number) => void
  pageSize: number
  totalCount: number
  /** When provided, shows the rows-per-page selector. */
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  /** Shows a discreet indicator while the next page is loading. */
  isFetching?: boolean
}

const SHOWING: TranslationKey = 'data.pagination.showing'
const OF: TranslationKey = 'data.pagination.of'
const PER_PAGE: TranslationKey = 'data.pagination.perPage'

// Accessibility (a11y) labels
const PAGE_SIZE_ARIA: TranslationKey = 'data.pagination.rowsPerPageAria'
const PAGE_ARIA: TranslationKey = 'data.pagination.pageAria'
const FIRST_PAGE_ARIA: TranslationKey = 'data.pagination.firstPageAria'
const PREV_PAGE_ARIA: TranslationKey = 'data.pagination.prevPageAria'
const NEXT_PAGE_ARIA: TranslationKey = 'data.pagination.nextPageAria'
const LAST_PAGE_ARIA: TranslationKey = 'data.pagination.lastPageAria'

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
              aria-label={t(PAGE_SIZE_ARIA)}
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
        <Pagination 
          value={page} 
          onChange={onPageChange} 
          total={totalPages} 
          size="sm"
          getItemProps={(p) => ({
            'aria-label': `${t(PAGE_ARIA)} ${p}`,
          })}
          getControlProps={(control) => {
            switch (control) {
              case 'first': return { 'aria-label': t(FIRST_PAGE_ARIA) }
              case 'previous': return { 'aria-label': t(PREV_PAGE_ARIA) }
              case 'next': return { 'aria-label': t(NEXT_PAGE_ARIA) }
              case 'last': return { 'aria-label': t(LAST_PAGE_ARIA) }
              default: return {}
            }
          }}
        />
      )}
    </Group>
  )
}
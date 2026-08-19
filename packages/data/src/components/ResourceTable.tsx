'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { Stack } from '@mantine/core'
import { Pencil, Trash2 } from 'lucide-react'
import {
  DataTable,
  TablePagination,
  Toolbar,
  type DataTableColumn,
  type DataTableFooter,
  type MobileCardConfig,
  type RowAction,
  type SortState,
} from '@liro/ui'
import { DeleteConfirmModal } from '@liro/ui'
import type { LocalizedLabel, TranslationKey } from '@liro/i18n'
import { useResourceList, useResourceMutations } from '../hooks'
import type { FilterValue } from '../types'

export interface ResourceTableProps<T extends Record<string, unknown>> {
  /** Table or view read from. */
  resource: string
  columns: DataTableColumn<T>[]
  /** How a row looks as a card on a phone. */
  mobile?: MobileCardConfig<T>
  /** Columns free-text search runs over; defaults to all text columns. */
  searchFields?: string[]
  /** Filters as a controlled value — the display components live on the application side. */
  filters?: Record<string, FilterValue | undefined>
  /** Filter elements shown in the bar above the table. */
  filterControls?: ReactNode
  /** Buttons on the right side of the bar. */
  toolbarActions?: ReactNode
  searchPlaceholder?: LocalizedLabel
  withSearch?: boolean

  getRowId?: (row: T) => string
  idField?: string
  select?: string
  pageSize?: number
  defaultSort?: SortState | null

  onRowClick?: (row: T) => void
  onEdit?: (row: T) => void
  allowDelete?: boolean
  /** When reading from a view with a JOIN, deletion must go to the base table. */
  deleteFrom?: string
  /** Extra actions in the row menu. */
  extraActions?: RowAction<T>[]

  emptyTitle?: LocalizedLabel
  emptyDescription?: LocalizedLabel
  emptyActionLabel?: LocalizedLabel
  onEmptyAction?: () => void

  /**
   * Selected rows. Held by the application because the selection survives a page change.
   */
  selected?: string[]
  onSelectionChange?: (ids: string[]) => void
  isRowSelectable?: (row: T) => boolean
  /** Row of totals; values come from the application, not from the current page. */
  footer?: DataTableFooter
  stickyFirstColumn?: boolean
  virtualized?: boolean

  /** Displaying the error is the application's responsibility — it knows which notification system it uses. */
  onError?: (error: Error) => void
}

const EDIT_LABEL: TranslationKey = 'data.table.edit'
const DELETE_LABEL: TranslationKey = 'data.table.delete'

/**
 * Table connected to a data source.
 *
 * Assembles `Toolbar`, `DataTable`, and `TablePagination` from `@liro/ui` and
 * feeds them through `DataProvider`. Display and fetching stay separate:
 * there is not a single display decision here, and there is not a single
 * network call in `@liro/ui`.
 */
export function ResourceTable<T extends Record<string, unknown>>({
  resource,
  columns,
  mobile,
  searchFields,
  filters,
  filterControls,
  toolbarActions,
  searchPlaceholder,
  withSearch = true,
  getRowId,
  idField = 'id',
  select,
  pageSize: initialPageSize = 25,
  defaultSort = null,
  onRowClick,
  onEdit,
  allowDelete = false,
  deleteFrom,
  extraActions,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  selected,
  onSelectionChange,
  isRowSelectable,
  footer,
  stickyFirstColumn,
  virtualized,
  onError,
}: ResourceTableProps<T>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 350)
  const [sort, setSort] = useState<SortState | null>(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  /* Every query change returns the user to the first page — otherwise they
     stay on page 7 of results that no longer exist. */
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters, sort, pageSize])

  const params = useMemo(
    () => ({
      page,
      pageSize,
      sort,
      search: debouncedSearch || undefined,
      searchFields,
      filters,
      select,
    }),
    [page, pageSize, sort, debouncedSearch, searchFields, filters, select],
  )

  const { data, isLoading, isFetching, error } = useResourceList<T>(resource, params)
  const { remove } = useResourceMutations(resource, { onError })

  useEffect(() => {
    if (error) onError?.(error)
  }, [error, onError])

  /*
   * Without `useMemo`, the function would be recreated on every render, and
   * since it is a dependency of the `useMemo` below, the action list would
   * be recomputed every time too.
   */
  const rowId = useMemo(
    () => getRowId ?? ((row: T) => String(row[idField])),
    [getRowId, idField],
  )

  const actions = useMemo<RowAction<T>[]>(() => {
    const list: RowAction<T>[] = [...(extraActions ?? [])]
    if (onEdit) {
      list.unshift({ label: EDIT_LABEL, icon: Pencil, onClick: onEdit })
    }
    if (allowDelete) {
      list.push({
        label: DELETE_LABEL,
        icon: Trash2,
        tone: 'danger',
        onClick: (row) => setPendingDelete(rowId(row)),
      })
    }
    return list
  }, [extraActions, onEdit, allowDelete, rowId])

  const confirmDelete = () => {
    if (!pendingDelete) return
    remove.mutate(
      { id: pendingDelete, options: { from: deleteFrom, idField } },
      { onSettled: () => setPendingDelete(null) },
    )
  }

  const hasQuery = Boolean(debouncedSearch) || Object.values(filters ?? {}).some(Boolean)

  return (
    <Stack gap="md">
      {(withSearch || filterControls || toolbarActions) && (
        <Toolbar
          search={withSearch ? search : undefined}
          onSearchChange={withSearch ? setSearch : undefined}
          searchPlaceholder={searchPlaceholder}
          filters={filterControls}
          actions={toolbarActions}
        />
      )}

      <DataTable<T>
        columns={columns}
        mobile={mobile}
        rows={data?.rows ?? []}
        getRowId={rowId}
        loading={isLoading}
        isFetching={isFetching && !isLoading}
        sort={sort}
        onSortChange={setSort}
        onRowClick={onRowClick}
        actions={actions.length > 0 ? actions : undefined}
        selected={selected}
        onSelectionChange={onSelectionChange}
        isRowSelectable={isRowSelectable}
        footer={footer}
        stickyFirstColumn={stickyFirstColumn}
        virtualized={virtualized}
        emptyVariant={error ? 'error' : hasQuery ? 'no-results' : 'empty'}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyActionLabel={emptyActionLabel}
        onEmptyAction={onEmptyAction}
      />

      <TablePagination
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalCount={data?.total ?? 0}
        isFetching={isFetching}
      />

      <DeleteConfirmModal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
      />
    </Stack>
  )
}
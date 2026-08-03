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
  type MobileCardConfig,
  type RowAction,
  type SortState,
} from '@liro/ui'
import { DeleteConfirmModal } from '@liro/ui'
import type { LocalizedLabel } from '@liro/i18n'
import { useResourceList, useResourceMutations } from '../hooks'
import type { FilterValue } from '../types'

export interface ResourceTableProps<T extends Record<string, unknown>> {
  /** Tabela ili view iz kojeg se cita. */
  resource: string
  columns: DataTableColumn<T>[]
  /** Kako red izgleda kao kartica na telefonu. */
  mobile?: MobileCardConfig<T>
  /** Kolone po kojima radi slobodna pretraga; podrazumevano sve tekstualne. */
  searchFields?: string[]
  /** Filteri kao kontrolisana vrednost - komponente prikaza su na strani aplikacije. */
  filters?: Record<string, FilterValue | undefined>
  /** Elementi filtera koji se prikazuju u traci iznad tabele. */
  filterControls?: ReactNode
  /** Dugmad sa desne strane trake. */
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
  /** Kada se cita iz view-a sa JOIN-om, brisanje mora u osnovnu tabelu. */
  deleteFrom?: string
  /** Dodatne radnje u meniju reda. */
  extraActions?: RowAction<T>[]

  emptyTitle?: LocalizedLabel
  emptyDescription?: LocalizedLabel
  emptyActionLabel?: LocalizedLabel
  onEmptyAction?: () => void

  /** Prikaz greske je odgovornost aplikacije - ona zna koji sistem obavestenja koristi. */
  onError?: (error: Error) => void
}

const EDIT_LABEL: LocalizedLabel = { sr: 'Izmeni', 'sr-Cyrl': 'Измени', en: 'Edit' }
const DELETE_LABEL: LocalizedLabel = { sr: 'Obriši', 'sr-Cyrl': 'Обриши', en: 'Delete' }

/**
 * Tabela povezana sa izvorom podataka.
 *
 * Sastavlja `Toolbar`, `DataTable` i `TablePagination` iz `@liro/ui` i puni ih
 * kroz `DataProvider`. Prikaz i dovlacenje ostaju razdvojeni: ovde nema
 * nijedne odluke o izgledu, a u `@liro/ui` nema nijednog mreznog poziva.
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
  onError,
}: ResourceTableProps<T>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 350)
  const [sort, setSort] = useState<SortState | null>(defaultSort)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  /* Svaka promena upita vraca korisnika na prvu stranu - inace ostane na
     strani 7 rezultata koji vise ne postoje. */
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

  const rowId = getRowId ?? ((row: T) => String(row[idField]))

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

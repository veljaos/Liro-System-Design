'use client'

import {
  ActionIcon,
  Box,
  Center,
  Checkbox,
  Group,
  Loader,
  Menu,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from '@mantine/core'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, type LucideIcon } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { useVirtualizer } from '@tanstack/react-virtual'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { EmptyState, type EmptyStateVariant } from '../feedback/EmptyState'

const RESIZE_LABEL: LocalizedLabel = {
  sr: 'Širina kolone',
  'sr-Cyrl': 'Ширина колоне',
  en: 'Column width',
}

export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'boolean'

export interface DataTableColumn<T> {
  /** Key in the row, or an arbitrary label if the column has `render`. */
  name: string
  label: LocalizedLabel
  type?: ColumnType
  currencyCode?: string
  sortable?: boolean
  width?: number | string
  /**
   * Resizing limits for this column, in pixels.
   *
   * Per column rather than global: a code column and a description column do not
   * have the same sensible range. Defaults are 64 and 640 - below 64 the header
   * label is unreadable, and above 640, roughly ninety characters at 14px, a line
   * of text stops being easy to read.
   */
  minWidth?: number
  maxWidth?: number
  /** Excludes this column from resizing. A code column rarely needs it. */
  resizable?: boolean
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T) => ReactNode
}

export interface RowAction<T> {
  label: LocalizedLabel
  icon?: LucideIcon
  onClick: (row: T) => void
  tone?: StatusToneName
  /** Hides the action for an individual row — e.g. a locked document. */
  hidden?: (row: T) => boolean
}

export interface SortState {
  field: string
  order: 'asc' | 'desc'
}

/**
 * Row of totals.
 *
 * Values come from the application, the table does not compute them. Reason:
 * as soon as pagination exists, the total of the current page is not the total
 * of the account — and the bookkeeper needs the latter. The server knows the
 * grand total, the table only knows what was sent to it.
 */
export interface DataTableFooter {
  /** Caption; sits in the first column if it has no value of its own. */
  label?: LocalizedLabel
  /** Values by column name. A number is formatted according to the column's type. */
  values: Record<string, ReactNode | number | null | undefined>
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  loading?: boolean
  /** Data is refreshing, but the old row is still on screen. */
  isFetching?: boolean
  sort?: SortState | null
  onSortChange?: (sort: SortState) => void
  onRowClick?: (row: T) => void
  actions?: RowAction<T>[]

  /**
   * Selected rows — controlled. The checkbox column appears only when BOTH
   * props are passed.
   *
   * The application holds them because the selection, as a rule, survives a
   * page change: the user checks three IOS statements on the first page, two
   * on the third, and then runs bulk processing over all five.
   */
  selected?: string[]
  onSelectionChange?: (ids: string[]) => void
  /** Disables selection of an individual row — e.g. an already-posted document. */
  isRowSelectable?: (row: T) => boolean

  /** Row of totals at the bottom. Sticks to the bottom edge while scrolling. */
  footer?: DataTableFooter

  emptyVariant?: EmptyStateVariant
  emptyTitle?: LocalizedLabel
  emptyDescription?: LocalizedLabel
  emptyActionLabel?: LocalizedLabel
  onEmptyAction?: () => void
  /** Number of skeleton rows while the first load is in progress. */
  skeletonRows?: number
  stickyHeader?: boolean

  /**
   * The first column (and the checkbox, if present) stay visible during
   * horizontal scroll. For tables with many columns, where without this you
   * lose track of which row is which.
   */
  stickyFirstColumn?: boolean
  /**
   * Lets the user drag column widths.
   *
   * Off by default. A resizable column needs a fixed table layout, which changes
   * how every column is measured - so it is a decision the screen makes, not a
   * behaviour every table gets.
   *
   * Useful where one column holds long text the reader wants to see: an account
   * name, a description, a client. Not useful on five short columns.
   *
   * Widths live in the component and reset when the column set changes. They are
   * deliberately not persisted - remembering them per user is an application
   * concern and needs somewhere to store them.
   */
  resizableColumns?: boolean

  /**
   * Renders only the rows that are in the viewport.
   *
   * Turn on only once the list is genuinely large — the chart of accounts has
   * 932 rows and without this creates 932 DOM nodes. Under a few hundred rows,
   * virtualization is pure overhead.
   *
   * Condition: all rows must be the same height. Content that wraps onto two
   * lines will overlap — in that case increase `rowHeight` or turn off
   * virtualization.
   */
  virtualized?: boolean
  /** Height of the scroll container when `virtualized`. */
  maxHeight?: number | string
  /** Height of a single row in pixels when `virtualized`. */
  rowHeight?: number

  /**
   * Phone display. A table with six columns on a 380px screen is unusable no
   * matter how well it scrolls — that is why below `sm` every row renders as a
   * card.
   *
   * Without this configuration, the first column is used as the title, the
   * second as the subtitle, and the rest as label/value pairs.
   */
  mobile?: MobileCardConfig<T>
}

export interface MobileCardConfig<T> {
  /** Column that carries the card title. */
  titleField?: string
  /** Column below the title — usually a code or a job title. */
  subtitleField?: string
  /** Columns shown as pairs; defaults to all the remaining ones. */
  fields?: string[]
  /** Badge in the top-right corner of the card. */
  badge?: (row: T) => ReactNode
}

const ACTIONS_LABEL: LocalizedLabel = { sr: 'Radnje', 'sr-Cyrl': 'Радње', en: 'Actions' }
const SELECT_ALL_LABEL: LocalizedLabel = { sr: 'Izaberi sve', 'sr-Cyrl': 'Изабери све', en: 'Select all' }
const SELECT_ROW_LABEL: LocalizedLabel = { sr: 'Izaberi red', 'sr-Cyrl': 'Изабери ред', en: 'Select row' }

const NUMERIC_TYPES: ColumnType[] = ['number', 'currency']

/** Width of the checkbox column; the same value serves as the offset for the sticky column. */
const SELECT_COL_WIDTH = 44

/**
 * A table with not a single call to the database.
 *
 * Takes rows and returns events — sorting, selection, row click, actions. That
 * way the same table works on top of Supabase, a REST API, or an in-memory
 * array. The layer that fetches data is `ResourceTable` in `@liro/data`, and
 * it just wraps this one.
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowId,
  loading = false,
  isFetching = false,
  sort,
  onSortChange,
  onRowClick,
  actions,
  selected,
  onSelectionChange,
  isRowSelectable,
  footer,
  emptyVariant = 'empty',
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  skeletonRows = 5,
  stickyHeader = false,
  stickyFirstColumn = false,
  resizableColumns = false,
  virtualized = false,
  maxHeight = 560,
  rowHeight = 44,
  mobile,
}: DataTableProps<T>) {
  const { t, formatNumber, formatCurrency, formatDate } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)

  /*
  * `hiddenFrom`/`visibleFrom` hide with CSS, but both trees get created
  * anyway. For 932 rows that is 932 cards nobody sees.
  *
  * The first render is always desktop, because the server does not know the
  * screen width. On a phone it switches over right after mounting.
  */

  const isMobile = useMediaQuery('(max-width: 47.99em)', false)

  const hasActions = Boolean(actions?.length)
  const selectable = Boolean(selected && onSelectionChange)

  const selectedSet = useMemo(() => new Set(selected ?? []), [selected])

  /*
  * A single pass without building arrays. This is computed on every render,
  * and a virtualized table renders on every scroll frame — two `filter`+`map`
  * passes over 932 rows per frame would be felt.
  */

  const { selectableCount, selectedOnPage } = useMemo(() => {
    if (!selectable) return { selectableCount: 0, selectedOnPage: 0 }
    let total = 0
    let chosen = 0
    for (const row of rows) {
      if (isRowSelectable && !isRowSelectable(row)) continue
      total += 1
      if (selectedSet.has(getRowId(row))) chosen += 1
    }
    return { selectableCount: total, selectedOnPage: chosen }
  }, [selectable, rows, isRowSelectable, getRowId, selectedSet])

  const allOnPageSelected = selectableCount > 0 && selectedOnPage === selectableCount
  const someOnPageSelected = selectedOnPage > 0 && !allOnPageSelected

  /*
   * The header checkbox only works over the current page, and the selection
   * from other pages is left untouched. Without this, "unselect all" would
   * silently wipe out what the user selected two pages earlier.
   */
  const toggleAll = () => {
    if (!onSelectionChange) return
    const current = selected ?? []
    /* The list is built only on click, not on every render. */
    const selectableIds = rows.filter((row) => isRowSelectable?.(row) ?? true).map(getRowId)
    if (allOnPageSelected) {
      const pageIds = new Set(selectableIds)
      onSelectionChange(current.filter((id) => !pageIds.has(id)))
    } else {
      onSelectionChange([...new Set([...current, ...selectableIds])])
    }
  }

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return
    const current = selected ?? []
    onSelectionChange(
      selectedSet.has(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !onSortChange) return
    const isCurrent = sort?.field === column.name
    onSortChange({
      field: column.name,
      order: isCurrent && sort?.order === 'asc' ? 'desc' : 'asc',
    })
  }

  const formatByType = (column: DataTableColumn<T>, value: unknown): ReactNode => {
    switch (column.type) {
      case 'currency':
        return formatCurrency(value as number, column.currencyCode ?? 'RSD')
      case 'number':
        return formatNumber(value as number)
      case 'date':
        return formatDate(value as string)
      case 'boolean':
        return value ? '✓' : '—'
      default:
        return String(value)
    }
  }

  const renderCell = (column: DataTableColumn<T>, row: T): ReactNode => {
    const value = row[column.name]
    if (column.render) return column.render(value, row)
    if (value === null || value === undefined || value === '') return '—'
    return formatByType(column, value)
  }

  const renderFooterCell = (column: DataTableColumn<T>): ReactNode => {
    if (!footer) return null
    const value = footer.values[column.name]
    if (value === null || value === undefined) return null
    /* A number is formatted like the cell above; everything else passes through as-is. */
    return typeof value === 'number' ? formatByType(column, value) : value
  }

  const alignOf = (column: DataTableColumn<T>) =>
    column.align ?? (NUMERIC_TYPES.includes(column.type ?? 'text') ? 'right' : 'left')

  type StickyProps = {
    'data-sticky-col'?: boolean
    'data-sticky-edge'?: boolean
    style?: CSSProperties
  }

  /*
   * Every column has a width from the start, not from the first drag.
   *
   * That is the part that took two attempts to get right. With `table-layout:
   * fixed` and explicit widths that sum to LESS than the table, the browser
   * distributes the difference across all columns - so shrinking one gave its
   * space to the others and their content shifted.
   *
   * With every column pinned AND the table's width set to the sum, there is
   * nothing left to distribute. Shrinking a column shrinks the table, and the
   * container scrolls. Same approach every real resizable table uses.
   */
  const DEFAULT_COL_WIDTH = 160
  const MIN_COL_WIDTH = 64
  const MAX_COL_WIDTH = 640

  const initialWidths = useMemo(() => {
    const result: Record<string, number> = {}
    for (const column of columns) {
      result[column.name] =
        typeof column.width === 'number' ? column.width : DEFAULT_COL_WIDTH
    }
    return result
  }, [columns])

  const [widths, setWidths] = useState<Record<string, number>>(initialWidths)

  /* Reset when the column set changes: a width for a column that no longer
     exists is dead state, and a new column would have none. */
  const columnKey = columns.map((column) => column.name).join('|')

  useEffect(() => {
    setWidths(initialWidths)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnKey])

  const canResize = (column: DataTableColumn<T>) =>
    resizableColumns && (column.resizable ?? true)

  const clampWidth = (column: DataTableColumn<T>, value: number) =>
    Math.min(
      Math.max(value, column.minWidth ?? MIN_COL_WIDTH),
      column.maxWidth ?? MAX_COL_WIDTH,
    )

  /* The table is exactly as wide as its columns, so the browser has no slack to
     redistribute. */
  const totalWidth = resizableColumns
    ? columns.reduce((sum, column) => sum + (widths[column.name] ?? DEFAULT_COL_WIDTH), 0) +
      (selectable ? SELECT_COL_WIDTH : 0) +
      (hasActions ? 48 : 0)
    : undefined

  /*
   * The drag is measured from the header cell's left edge.
   *
   * `clientX` minus that edge IS the width. Tracking a delta from where the
   * pointer went down drifts as soon as the layout reflows mid-drag, which it
   * does on the first move.
   *
   * `setPointerCapture` keeps the events arriving once the cursor leaves the
   * handle - which it always does, because the user drags faster than the layout
   * follows.
   */
  const startResize =
    (column: DataTableColumn<T>) => (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const cell = event.currentTarget.closest('th')
      if (!cell) return

      const left = cell.getBoundingClientRect().left
      const handle = event.currentTarget
      handle.setPointerCapture(event.pointerId)

      const onMove = (move: PointerEvent) => {
        setWidths((current) => ({
          ...current,
          [column.name]: clampWidth(column, move.clientX - left),
        }))
      }

      const onUp = () => {
        handle.releasePointerCapture(event.pointerId)
        handle.removeEventListener('pointermove', onMove)
        handle.removeEventListener('pointerup', onUp)
      }

      handle.addEventListener('pointermove', onMove)
      handle.addEventListener('pointerup', onUp)
    }

  const nudgeWidth = (column: DataTableColumn<T>, by: number) => {
    setWidths((current) => ({
      ...current,
      [column.name]: clampWidth(column, (current[column.name] ?? DEFAULT_COL_WIDTH) + by),
    }))
  }

  /* Pinning: the checkbox sits at 0, the first column right after it. */
  const stickyProps = (index: number): StickyProps => {
    if (!stickyFirstColumn || index !== 0) return {}
    return {
      'data-sticky-col': true,
      'data-sticky-edge': true,
      style: { left: selectable ? SELECT_COL_WIDTH : 0 },
    }
  }

  const selectStickyProps = stickyFirstColumn ? { 'data-sticky-col': true, style: { left: 0 } } : {}

  /*
   * The hook is called unconditionally (rules of hooks), but with `count: 0`
   * when virtualization was not requested — then it does nothing.
   */
  const virtualizer = useVirtualizer({
    count: virtualized ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 12,
  })

  const virtualItems = virtualized ? virtualizer.getVirtualItems() : []
  const firstItem = virtualItems[0]
  const lastItem = virtualItems[virtualItems.length - 1]
  const padTop = firstItem ? firstItem.start : 0
  const padBottom = lastItem ? virtualizer.getTotalSize() - lastItem.end : 0

  const bodyRows: { row: T; index: number }[] = virtualized
    ? virtualItems.flatMap((item) => {
        const row = rows[item.index]
        return row ? [{ row, index: item.index }] : []
      })
    : rows.map((row, index) => ({ row, index }))

  const colSpan = columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0)

  if (loading) {
    return (
      <Box p="md">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <Skeleton key={index} height={36} radius="sm" mb="xs" />
        ))}
      </Box>
    )
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        variant={emptyVariant}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    )
  }

  const renderTable = () => (
    <Table
      className="liro-table"
      /*
       * `fixed` only while resizing is on. With `auto` the browser sizes columns
       * to their content and overrides the dragged width on the next render -
       * and with `fixed` but no widths, every column gets an equal share and
       * content spills into its neighbour.
       */
      layout={resizableColumns ? 'fixed' : undefined}
      data-resizable={resizableColumns || undefined}
      /* Exactly as wide as its columns, so the browser has no slack to
         redistribute. Without this, shrinking one column handed its space to all
         the others and their content shifted. */
      w={totalWidth}
      highlightOnHover={Boolean(onRowClick)}
      stickyHeader={stickyHeader || virtualized}
    >
      <Table.Thead style={{ backgroundColor: liroVar.surface.sunken }}>
        <Table.Tr>
          {selectable && (
            <Table.Th w={SELECT_COL_WIDTH} {...selectStickyProps}>
              <Checkbox
                size="xs"
                checked={allOnPageSelected}
                indeterminate={someOnPageSelected}
                onChange={toggleAll}
                aria-label={t(SELECT_ALL_LABEL)}
              />
            </Table.Th>
          )}

          {columns.map((column, index) => {
            const isSorted = sort?.field === column.name
            const SortIcon = !isSorted ? ArrowUpDown : sort?.order === 'asc' ? ArrowUp : ArrowDown
            const sticky = stickyProps(index)

            return (
              <Table.Th
                key={column.name}
                w={resizableColumns ? widths[column.name] : column.width}
                ta={alignOf(column)}
                /*
                 * `aria-sort` is the only way to tell a screen reader that the
                 * column is sorted. The arrow icon does not exist for it.
                 */
                aria-sort={
                  !column.sortable
                    ? undefined
                    : !isSorted
                      ? 'none'
                      : sort?.order === 'asc'
                        ? 'ascending'
                        : 'descending'
                }
                {...sticky}
                /* `position` is needed for the absolute resize handle. When the
                   column is pinned, `sticky.style` overrides it with `sticky`,
                   which is also a positioning context - so both work. */
                style={{ whiteSpace: 'nowrap', position: 'relative', ...(sticky.style ?? {}) }}
              >
                {column.sortable && onSortChange ? (
                  <UnstyledButton
                    onClick={() => handleSort(column)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 'inherit',
                      fontWeight: 'inherit',
                      color: isSorted ? liroVar.text.brand : 'inherit',
                    }}
                  >
                    {t(column.label)}
                    <SortIcon size={13} />
                  </UnstyledButton>
                ) : (
                  t(column.label)
                )}

                {canResize(column) && (
                  /*
                   * `role="separator"` with `aria-valuenow`, reachable by keyboard.
                   * A handle that answers only to a mouse is a control a keyboard
                   * user cannot use at all - and unlike a button, there is no
                   * other route to the same result.
                   */
                  <Box
                    className="liro-col-resize"
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`${t(RESIZE_LABEL)}: ${t(column.label)}`}
                    aria-valuenow={Math.round(widths[column.name] ?? 0)}
                    aria-valuemin={column.minWidth ?? MIN_COL_WIDTH}
                    aria-valuemax={column.maxWidth ?? MAX_COL_WIDTH}
                    tabIndex={0}
                    onPointerDown={startResize(column)}
                    onKeyDown={(event) => {
                      const step = event.shiftKey ? 40 : 10
                      if (event.key === 'ArrowLeft') nudgeWidth(column, -step)
                      else if (event.key === 'ArrowRight') nudgeWidth(column, step)
                      else return
                      event.preventDefault()
                    }}
                  />
                )}
              </Table.Th>
            )
          })}

          {hasActions && <Table.Th w={48} />}
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {padTop > 0 && (
          <Table.Tr aria-hidden="true">
            <Table.Td colSpan={colSpan} style={{ height: padTop, padding: 0, border: 'none' }} />
          </Table.Tr>
        )}

        {bodyRows.map(({ row }) => {
          const id = getRowId(row)
          const isSelected = selectedSet.has(id)
          const rowSelectable = isRowSelectable?.(row) ?? true

          return (
            <Table.Tr
              key={id}
              data-selected={isSelected || undefined}
              tabIndex={onRowClick || selectable ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              /*
               * Enter opens the row, Space checks it — same as in Explorer and
               * Gmail. The `target === currentTarget` condition prevents a key
               * pressed over the checkbox or menu from also triggering the row.
               */
              onKeyDown={
                onRowClick || selectable
                  ? (event) => {
                      if (event.target !== event.currentTarget) return
                      if (event.key === 'Enter' && onRowClick) {
                        event.preventDefault()
                        onRowClick(row)
                        }
                        if (event.key === ' ' && selectable && rowSelectable) {
                          event.preventDefault()
                          toggleRow(id)
                      }
                    }
                  : undefined
              }
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                height: virtualized ? rowHeight : undefined,
              }}
            >
              {selectable && (
                <Table.Td {...selectStickyProps} onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    size="xs"
                    checked={isSelected}
                    disabled={!rowSelectable}
                    onChange={() => toggleRow(id)}
                    aria-label={t(SELECT_ROW_LABEL)}
                  />
                </Table.Td>
              )}

              {columns.map((column, index) => {
                const sticky = stickyProps(index)
                return (
                  <Table.Td
                    key={column.name}
                    ta={alignOf(column)}
                    data-numeric={NUMERIC_TYPES.includes(column.type ?? 'text') || undefined}
                    {...sticky}
                  >
                    {renderCell(column, row)}
                  </Table.Td>
                )
              })}

              {hasActions && (
                <Table.Td onClick={(event) => event.stopPropagation()}>
                  <RowActionsMenu actions={actions ?? []} row={row} label={t(ACTIONS_LABEL)} />
                </Table.Td>
              )}
            </Table.Tr>
          )
        })}

        {padBottom > 0 && (
          <Table.Tr aria-hidden="true">
            <Table.Td colSpan={colSpan} style={{ height: padBottom, padding: 0, border: 'none' }} />
          </Table.Tr>
        )}
      </Table.Tbody>

      {footer && (
        <Table.Tfoot>
          <Table.Tr>
            {selectable && <Table.Td {...selectStickyProps} />}
            {columns.map((column, index) => {
              const value = renderFooterCell(column)
              const sticky = stickyProps(index)
              return (
                <Table.Td key={column.name} ta={alignOf(column)} {...sticky}>
                  {value ?? (index === 0 && footer.label ? t(footer.label) : null)}
                </Table.Td>
              )
            })}
            {hasActions && <Table.Td />}
          </Table.Tr>
        </Table.Tfoot>
      )}
    </Table>
  )

  return (
    <Box pos="relative">
      {isFetching && (
        <Center pos="absolute" top={8} right={8} style={{ zIndex: 4 }}>
          <Loader size={14} />
        </Center>
      )}

      {isMobile ? (
        <MobileCards
          columns={columns}
          rows={rows}
          getRowId={getRowId}
          renderCell={renderCell}
          config={mobile}
          onRowClick={onRowClick}
          actions={actions}
          selectedSet={selectable ? selectedSet : undefined}
          onToggleRow={selectable ? toggleRow : undefined}
          isRowSelectable={isRowSelectable}
          virtualized={virtualized}
          maxHeight={maxHeight}
        />
      ) : virtualized ? (
        /* A container with its own scroll: the virtualizer needs a ref to the
          element that actually scrolls, and `Table.ScrollContainer` does not
          expose it. */
      <Box ref={scrollRef} style={{ maxHeight, overflow: 'auto' }}>
        {renderTable()}
      </Box>
    ) : (
      <Table.ScrollContainer minWidth={640}>{renderTable()}</Table.ScrollContainer>
    )}
    </Box>
  )
}

interface MobileCardsProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  renderCell: (column: DataTableColumn<T>, row: T) => ReactNode
  config?: MobileCardConfig<T>
  onRowClick?: (row: T) => void
  actions?: RowAction<T>[]
  selectedSet?: Set<string>
  onToggleRow?: (id: string) => void
  isRowSelectable?: (row: T) => boolean
  virtualized?: boolean
  maxHeight?: number | string
}

/** Estimated card height before the first measurement; the real one is measured after mounting. */
const CARD_ESTIMATE = 104

function MobileCards<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowId,
  renderCell,
  config,
  onRowClick,
  actions,
  selectedSet,
  onToggleRow,
  isRowSelectable,
  virtualized = false,
  maxHeight = 560,
}: MobileCardsProps<T>) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)

  const titleColumn = columns.find((column) => column.name === config?.titleField) ?? columns[0]
  const subtitleColumn = config?.subtitleField
    ? columns.find((column) => column.name === config.subtitleField)
    : columns[1]

  const detailColumns = config?.fields
    ? columns.filter((column) => config.fields?.includes(column.name))
    : columns.filter(
        (column) => column.name !== titleColumn?.name && column.name !== subtitleColumn?.name,
      )

  /*
   * Cards have a variable height — an address or a long name wraps onto two
   * lines. That is why the estimate is used only until the first measurement,
   * after which `measureElement` records the real height of each card.
   */
  const virtualizer = useVirtualizer({
    count: virtualized ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CARD_ESTIMATE,
    overscan: 6,
  })

  const renderCard = (row: T) => {
    const id = getRowId(row)
    const isSelected = selectedSet?.has(id) ?? false

    return (
      <Paper
        withBorder
        radius="md"
        p="sm"
        onClick={onRowClick ? () => onRowClick(row) : undefined}
        style={{
          cursor: onRowClick ? 'pointer' : 'default',
          backgroundColor: isSelected ? liroVar.surface.selected : liroVar.surface.raised,
          borderColor: isSelected ? liroVar.border.brand : liroVar.border.default,
        }}
      >
        <Group
          justify="space-between"
          wrap="nowrap"
          align="flex-start"
          mb={detailColumns.length ? 'xs' : 0}
        >
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            {onToggleRow && (
              <Box onClick={(event) => event.stopPropagation()}>
                <Checkbox
                  size="xs"
                  checked={isSelected}
                  disabled={!(isRowSelectable?.(row) ?? true)}
                  onChange={() => onToggleRow(id)}
                  aria-label={t(SELECT_ROW_LABEL)}
                />
              </Box>
            )}

            <Stack gap={0} style={{ minWidth: 0 }}>
              {/* `component="div"` everywhere `renderCell` is used: the return
                  value can be a badge or a date, which themselves render a <p>. */}
              {titleColumn && (
                <Text component="div" size="sm" fw={600} lineClamp={1}>
                  {renderCell(titleColumn, row)}
                </Text>
              )}
              {subtitleColumn && (
                <Text component="div" size="xs" style={{ color: liroVar.text.secondary }} lineClamp={1}>
                  {renderCell(subtitleColumn, row)}
                </Text>
              )}
            </Stack>
          </Group>

          <Group gap={4} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
            {config?.badge?.(row)}
            {actions && actions.length > 0 && (
              <RowActionsMenu actions={actions} row={row} label={t(ACTIONS_LABEL)} />
            )}
          </Group>
        </Group>

        {detailColumns.length > 0 && (
          <Stack gap={2}>
            {detailColumns.map((column) => (
              <Group key={column.name} justify="space-between" gap="sm" wrap="nowrap">
                <Text size="xs" style={{ color: liroVar.text.tertiary }}>
                  {t(column.label)}
                </Text>
                <Text
                  component="div"
                  size="xs"
                  fw={500}
                  ta="right"
                  data-numeric={
                    column.type === 'currency' || column.type === 'number' || undefined
                  }
                >
                  {renderCell(column, row)}
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Paper>
    )
  }

  if (!virtualized) {
    return (
      <Stack gap="xs" p="xs">
        {rows.map((row) => <Box key={getRowId(row)}>{renderCard(row)}</Box>)}
      </Stack>
    )
  }

  return (
    <Box ref={scrollRef} p="xs" style={{ maxHeight, overflowY: 'auto' }}>
      {/* A full-height frame keeps the scrollbar accurate; cards are positioned
          absolutely within it. */}
      <div style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((item) => {
          const row = rows[item.index]
          if (!row) return null

          return (
            <div
              key={getRowId(row)}
              data-index={item.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${item.start}px)`,
                paddingBottom: 8,
              }}
            >
              {renderCard(row)}
            </div>
          )
        })}
      </div>
    </Box>
  )
}


function RowActionsMenu<T>({ actions, row, label }: { actions: RowAction<T>[]; row: T; label: string }) {
  const { t } = useI18n()
  const visible = actions.filter((action) => !action.hidden?.(row))
  if (visible.length === 0) return null

  return (
    <Menu position="bottom-end" withinPortal shadow="md" radius="md">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size="md" aria-label={label}>
          <MoreVertical size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {visible.map((action, index) => {
          const Icon = action.icon
          const danger = action.tone === 'danger'
          return (
            <Menu.Item
              key={index}
              color={danger ? 'liro-red' : undefined}
              leftSection={Icon ? <Icon size={14} /> : undefined}
              onClick={() => action.onClick(row)}
            >
              <Text size="sm">{t(action.label)}</Text>
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
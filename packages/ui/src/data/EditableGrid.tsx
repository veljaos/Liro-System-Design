'use client'

import { Box, Group, NumberInput, Select, Table, Text, TextInput } from '@mantine/core'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { fromMinor, toMinor } from './money'

/**
 * Grid for row-by-row entry.
 *
 * Intended for a journal entry, an invoice line breakdown, and everything else
 * where line items are typed, not picked from a dialog. The entire input must
 * be possible without a mouse.
 *
 * Movement:
 *   Enter        next row, same column; on the last row creates a new one
 *   Shift+Enter  previous row
 *   Tab          next cell (left to the browser)
 *
 * The arrow keys are deliberately NOT taken over: in a number field they
 * change the value, in text they move the cursor. Taking them over would
 * remove behavior the user already expects.
 */

export type EditableColumnType = 'text' | 'number' | 'currency' | 'select'

export interface EditableColumn<T> {
  name: keyof T & string
  label: LocalizedLabel
  type?: EditableColumnType
  width?: number | string
  placeholder?: LocalizedLabel
  readOnly?: boolean
  /** Options for `select`; the account column gets them from the chart of accounts. */
  options?: { value: string; label: string }[]
  /** Sums the column in the totals row. */
  total?: boolean
  /** Error message for the cell, or `false` when the value is fine. */
  validate?: (value: unknown, row: T) => LocalizedLabel | false
}

/**
 * Two columns that must be equal.
 *
 * For a journal entry: `{ debit: 'duguje', credit: 'potrazuje' }`.
 */
export interface BalanceConfig<T> {
  debit: keyof T & string
  credit: keyof T & string
}

export interface EditableGridProps<T> {
  columns: EditableColumn<T>[]
  rows: T[]
  onChange: (rows: T[]) => void
  /** Creates an empty row. Called on Enter in the last row and by the button. */
  createRow: () => T
  getRowId: (row: T) => string
  balance?: BalanceConfig<T>
  /** Reports to the application whether the entry can be saved. The difference is in minor units. */
  onBalanceChange?: (balanced: boolean, differenceInMinor: number) => void
  /** Below this number, a row cannot be deleted. */
  minRows?: number
  maxRows?: number
  readOnly?: boolean
  currencyCode?: string
}

const ADD_ROW_LABEL: TranslationKey = 'data.editableGrid.addRow'
const DELETE_ROW_LABEL: TranslationKey = 'data.editableGrid.deleteRow'
const TOTAL_LABEL: TranslationKey = 'data.editableGrid.total'
const BALANCED_LABEL: TranslationKey = 'data.editableGrid.balanced'
const DIFFERENCE_LABEL: TranslationKey = 'data.editableGrid.difference'
const HINT_LABEL: TranslationKey = 'data.editableGrid.hint'

const cellKey = (row: number, col: number) => `${row}:${col}`

interface SelectCellProps {
  options: { value: string; label: string }[]
  value: string | null
  onCommit: (value: string | null) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  ariaLabel: string
  inputRef: (element: HTMLInputElement | null) => void
  onKeyDown: (event: KeyboardEvent) => void
}

/**
 * A list cell that accepts what was typed.
 *
 * Mantine's searchable `Select` filters as you type, but once focus leaves,
 * what was typed is lost. For the account column that is unusable: the
 * bookkeeper types `2020` and expects that to have selected the account.
 *
 * Commit happens on `onBlur`, not on Tab: blur fires on Tab, on Enter, and on
 * a click outside the cell — so one place covers all cases instead of us
 * wrestling with the combobox over individual keys.
 */
function SelectCell({
  options,
  value,
  onCommit,
  placeholder,
  disabled,
  error,
  ariaLabel,
  inputRef,
  onKeyDown,
}: SelectCellProps) {
  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''
  const [search, setSearch] = useState(selectedLabel)

  /* When the value arrives from outside (an existing entry was loaded), the text follows it. */
  useEffect(() => {
    setSearch(selectedLabel)
  }, [selectedLabel])

  const commit = () => {
    const query = search.trim().toLowerCase()
    if (!query) {
      onCommit(null)
      return
    }

    /*
     * The match order is deliberately like this: an exact code wins over
     * everything. `2020` must not select `20200` just because it is first in
     * the list.
     */
    const match =
      options.find((option) => option.value.toLowerCase() === query) ??
      options.find((option) => option.label.toLowerCase().startsWith(query)) ??
      options.find((option) => option.label.toLowerCase().includes(query))

    if (match) {
      onCommit(match.value)
      setSearch(match.label)
    } else {
      /* Nothing matches — revert the text to the last valid value. */
      setSearch(selectedLabel)
    }
  }

  return (
    <Select
      ref={inputRef}
      size="xs"
      variant="unstyled"
      disabled={disabled}
      error={error}
      aria-label={ariaLabel}
      data={options}
      value={value}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      onChange={onCommit}
      onBlur={commit}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      nothingFoundMessage="—"
      comboboxProps={{ withinPortal: true }}
    />
  )
}

export function EditableGrid<T extends Record<string, unknown>>({
  columns,
  rows,
  onChange,
  createRow,
  getRowId,
  balance,
  onBalanceChange,
  minRows = 1,
  maxRows,
  readOnly = false,
  currencyCode = 'RSD',
}: EditableGridProps<T>) {
  const { t, formatDecimal } = useI18n()

  const cellRefs = useRef(new Map<string, HTMLInputElement>())
  const pendingFocus = useRef<{ row: number; col: number } | null>(null)

  const registerRef = (key: string) => (element: HTMLInputElement | null) => {
    if (element) cellRefs.current.set(key, element)
    else cellRefs.current.delete(key)
  }

  const focusCell = useCallback((row: number, col: number) => {
    cellRefs.current.get(cellKey(row, col))?.focus()
  }, [])

  /*
   * The new row does not yet exist in the DOM at the moment we look for it,
   * so the desired cell is remembered and focused only after rendering.
   */
  useEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    pendingFocus.current = null
    focusCell(target.row, target.col)
  }, [rows, focusCell])

  const updateCell = (rowIndex: number, name: string, value: unknown) => {
    onChange(rows.map((row, index) => (index === rowIndex ? { ...row, [name]: value } : row)))
  }

  /*
  * A new row always focuses the first cell, regardless of where Enter was
  * pressed. Entry goes left to right, so that is the only place to continue from.
  */
  const addRow = () => {
    if (maxRows && rows.length >= maxRows) return
    pendingFocus.current = { row: rows.length, col: 0 }
    onChange([...rows, createRow()])
  }

  const removeRow = (rowIndex: number) => {
    if (rows.length <= minRows) return
    onChange(rows.filter((_, index) => index !== rowIndex))
  }

  const handleKeyDown = (event: KeyboardEvent, rowIndex: number, colIndex: number) => {
    if (event.key !== 'Enter') return

    /*
    * When the account list is open, Enter belongs to it — it selects an item,
    * it does not move the row. A second Enter (list already closed) moves it.
    */
    if ((event.currentTarget as HTMLElement).getAttribute('aria-expanded') === 'true') return

    event.preventDefault()

    if (event.shiftKey) {
      focusCell(Math.max(rowIndex - 1, 0), colIndex)
      return
    }

    if (rowIndex === rows.length - 1) {
      addRow()
      return
    }

    focusCell(rowIndex + 1, colIndex)
  }

  /* Totals in minor units; the display is only divided by 100 at formatting time. */
  const totals = useMemo(() => {
    const result: Record<string, number> = {}
    for (const column of columns) {
      if (!column.total) continue
      result[column.name] = rows.reduce((sum, row) => sum + toMinor(row[column.name]), 0)
    }
    return result
  }, [rows, columns])

  const difference = balance
    ? rows.reduce((sum, row) => sum + toMinor(row[balance.debit]) - toMinor(row[balance.credit]), 0)
    : 0
  const isBalanced = difference === 0

  useEffect(() => {
    onBalanceChange?.(isBalanced, difference)
  }, [isBalanced, difference, onBalanceChange])

  const hasTotals = columns.some((column) => column.total)
  const canDelete = !readOnly && rows.length > minRows

  const renderInput = (column: EditableColumn<T>, row: T, rowIndex: number, colIndex: number) => {
    const key = cellKey(rowIndex, colIndex)
    const value = row[column.name]
    const error = column.validate?.(value, row)
    const shared = {
      ref: registerRef(key),
      size: 'xs' as const,
      variant: 'unstyled' as const,
      disabled: readOnly || column.readOnly,
      error: Boolean(error),
      /* The column header is not connected to the field, so without this a
         screen reader just reads "input field" no matter what the column is. */
      'aria-label': `${t(column.label)}, red ${rowIndex + 1}`,
      onKeyDown: (event: KeyboardEvent) => handleKeyDown(event, rowIndex, colIndex),
    }

    if (column.type === 'select') {
      return (
        <SelectCell
          options={column.options ?? []}
          value={typeof value === 'string' ? value : null}
          onCommit={(next) => updateCell(rowIndex, column.name, next)}
          placeholder={column.placeholder ? t(column.placeholder) : undefined}
          disabled={readOnly || column.readOnly}
          error={Boolean(error)}
          ariaLabel={shared['aria-label']}
          inputRef={registerRef(key)}
          onKeyDown={shared.onKeyDown}
        />
      )
    }

    if (column.type === 'number' || column.type === 'currency') {
      return (
        <NumberInput
          {...shared}
          value={typeof value === 'number' || typeof value === 'string' ? value : ''}
          onChange={(next) => updateCell(rowIndex, column.name, next === '' ? null : Number(next))}
          placeholder={column.placeholder ? t(column.placeholder) : undefined}
          decimalScale={column.type === 'currency' ? 2 : undefined}
          fixedDecimalScale={column.type === 'currency'}
          decimalSeparator=","
          thousandSeparator="."
          hideControls
          ta="right"
        />
      )
    }

    return (
      <TextInput
        {...shared}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => updateCell(rowIndex, column.name, event.currentTarget.value)}
        placeholder={column.placeholder ? t(column.placeholder) : undefined}
      />
    )
  }

  return (
    <Box>
      <Table.ScrollContainer minWidth={640}>
        <Table className="liro-grid" withColumnBorders verticalSpacing={2}>
          <Table.Thead style={{ backgroundColor: liroVar.surface.sunken }}>
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th
                  key={column.name}
                  w={column.width}
                  ta={column.type === 'number' || column.type === 'currency' ? 'right' : 'left'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t(column.label)}
                </Table.Th>
              ))}
              {canDelete && <Table.Th w={44} />}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {rows.map((row, rowIndex) => (
              <Table.Tr key={getRowId(row)}>
                {columns.map((column, colIndex) => (
                  <Table.Td key={column.name} p={4}>
                    {renderInput(column, row, rowIndex, colIndex)}
                  </Table.Td>
                ))}

                {canDelete && (
                  <Table.Td p={4}>
                    <ActionButton
                      intent="delete"
                      iconOnly
                      size="xs"
                      label={DELETE_ROW_LABEL}
                      onClick={() => removeRow(rowIndex)}
                    />
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>

          {hasTotals && (
            <Table.Tfoot>
              <Table.Tr>
                {columns.map((column, index) => (
                  <Table.Td
                    key={column.name}
                    ta={column.total ? 'right' : 'left'}
                    data-numeric={column.total || undefined}
                  >
                    {column.total
                      ? formatDecimal(fromMinor(totals[column.name] ?? 0), 2)
                      : index === 0
                        ? t(TOTAL_LABEL)
                        : null}
                  </Table.Td>
                ))}
                {canDelete && <Table.Td />}
              </Table.Tr>
            </Table.Tfoot>
          )}
        </Table>
      </Table.ScrollContainer>

      {/* The grid runs to the edge of the card, but the bar below it is not a table. */}
      <Group justify="space-between" p="sm" wrap="wrap" gap="sm">
        <Group gap="xs">
          {!readOnly && (
            <ActionButton
              intent="create"
              size="xs"
              label={ADD_ROW_LABEL}
              disabled={Boolean(maxRows && rows.length >= maxRows)}
              onClick={addRow}
            />
          )}
          <Text size="xs" style={{ color: liroVar.text.tertiary }}>
            {t(HINT_LABEL)}
          </Text>
        </Group>

        {balance && (
          /*
           * `role="status"` tells the screen reader that the state changed.
           * Without it, a blind user would have no way to know the entry
           * became balanced.
           */
          <Text
            size="sm"
            fw={600}
            role="status"
            style={{ color: isBalanced ? liroVar.status.success.fg : liroVar.status.danger.fg }}
          >
            {isBalanced
              ? t(BALANCED_LABEL)
              : `${t(DIFFERENCE_LABEL)}: ${formatDecimal(fromMinor(difference), 2)}\u00A0${currencyCode}`}
          </Text>
        )}
      </Group>
    </Box>
  )
}
'use client'

import { Box, Group, NumberInput, Select, Table, Text, TextInput } from '@mantine/core'
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'

/**
 * Mreza za unos red po red.
 *
 * Namenjena nalogu za knjizenje, specifikaciji fakture i svemu ostalom gde se
 * stavke kucaju, a ne biraju iz dijaloga. Ceo unos mora biti moguc bez misa.
 *
 * Kretanje:
 *   Enter        sledeci red, ista kolona; na poslednjem redu pravi novi
 *   Shift+Enter  prethodni red
 *   Tab          sledeca celija (prepusteno pregledacu)
 *
 * Strelice se namerno NE preuzimaju: u polju za broj menjaju vrednost, u
 * tekstu pomeraju kurzor. Preuzimanje bi oduzelo ponasanje koje korisnik vec
 * ocekuje.
 */

export type EditableColumnType = 'text' | 'number' | 'currency' | 'select'

export interface EditableColumn<T> {
  name: keyof T & string
  label: LocalizedLabel
  type?: EditableColumnType
  width?: number | string
  placeholder?: LocalizedLabel
  readOnly?: boolean
  /** Opcije za `select`; kolona konta ih dobija iz kontnog plana. */
  options?: { value: string; label: string }[]
  /** Sabira kolonu u redu sa zbirovima. */
  total?: boolean
  /** Poruka greske za celiju, ili `false` kada je vrednost u redu. */
  validate?: (value: unknown, row: T) => LocalizedLabel | false
}

/**
 * Dve kolone koje moraju biti izjednacene.
 *
 * Za nalog za knjizenje: `{ debit: 'duguje', credit: 'potrazuje' }`.
 */
export interface BalanceConfig<T> {
  debit: keyof T & string
  credit: keyof T & string
}

export interface EditableGridProps<T> {
  columns: EditableColumn<T>[]
  rows: T[]
  onChange: (rows: T[]) => void
  /** Pravi prazan red. Pozива se na Enter u poslednjem redu i na dugme. */
  createRow: () => T
  getRowId: (row: T) => string
  balance?: BalanceConfig<T>
  /** Javlja aplikaciji da li se nalog moze sacuvati. Razlika je u parama. */
  onBalanceChange?: (balanced: boolean, differenceInMinor: number) => void
  /** Ispod ovog broja se red ne moze obrisati. */
  minRows?: number
  maxRows?: number
  readOnly?: boolean
  currencyCode?: string
}

const ADD_ROW_LABEL: LocalizedLabel = { sr: 'Dodaj red', 'sr-Cyrl': 'Додај ред', en: 'Add row' }
const DELETE_ROW_LABEL: LocalizedLabel = { sr: 'Obriši red', 'sr-Cyrl': 'Обриши ред', en: 'Delete row' }
const TOTAL_LABEL: LocalizedLabel = { sr: 'Ukupno', 'sr-Cyrl': 'Укупно', en: 'Total' }
const BALANCED_LABEL: LocalizedLabel = { sr: 'Nalog je u ravnoteži', 'sr-Cyrl': 'Налог је у равнотежи', en: 'Entry is balanced' }
const DIFFERENCE_LABEL: LocalizedLabel = { sr: 'Razlika', 'sr-Cyrl': 'Разлика', en: 'Difference' }
const HINT_LABEL: LocalizedLabel = {
  sr: 'Enter — sledeći red · Shift+Enter — prethodni · Enter u poslednjem redu pravi novi',
  'sr-Cyrl': 'Enter — следећи ред · Shift+Enter — претходни · Enter у последњем реду прави нови',
  en: 'Enter — next row · Shift+Enter — previous · Enter on last row adds one',
}

/**
 * Pretvara iznos u pare pre poredjenja.
 *
 * `0.1 + 0.2 !== 0.3` u JavaScript-u. Nalog od sto redova bi se razbalansirao
 * za dinar iz cistog zaokruzivanja, a knjigovodja bi trazio gresku koje nema.
 * Celi brojevi to iskljucuju.
 */
function toMinor(value: unknown): number {
  const num = typeof value === 'string' ? Number(value) : value
  if (typeof num !== 'number' || Number.isNaN(num)) return 0
  return Math.round(num * 100)
}

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
 * Celija sa spiskom koja prihvata otkucano.
 *
 * Mantine `Select` sa pretragom filtrira dok kucas, ali kada fokus ode -
 * otkucano se izgubi. Za kolonu konta je to neupotrebljivo: knjigovodja kuca
 * `2020` i ocekuje da je time izabrao konto.
 *
 * Potvrda ide na `onBlur`, a ne na Tab: blur se desava i na Tab, i na Enter, i
 * na klik izvan celije - pa jedno mesto pokriva sve slucajeve umesto da se
 * natezemo sa combobox-om oko pojedinacnih tastera.
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

  /* Kada vrednost stigne spolja (ucitan postojeci nalog), tekst je prati. */
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
     * Redosled poklapanja je namerno ovakav: tacna sifra pobedjuje sve.
     * `2020` ne sme da izabere `20200` samo zato sto je prvo u spisku.
     */
    const match =
      options.find((option) => option.value.toLowerCase() === query) ??
      options.find((option) => option.label.toLowerCase().startsWith(query)) ??
      options.find((option) => option.label.toLowerCase().includes(query))

    if (match) {
      onCommit(match.value)
      setSearch(match.label)
    } else {
      /* Nista se ne poklapa - vrati tekst na poslednju vazecu vrednost. */
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
   * Novi red jos ne postoji u DOM-u u trenutku kada ga trazimo, pa se zeljena
   * celija pamti i fokusira tek posle renderovanja.
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
  * Nov red uvek fokusira prvu celiju, bez obzira gde je Enter pritisnut.
  * Unos ide s leva nadesno, pa je to jedino mesto sa kojeg se nastavlja.
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
    * Kada je spisak konta otvoren, Enter pripada njemu — bira stavku, ne
    * pomera red. Drugi Enter (spisak vec zatvoren) pomera.
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

  /* Zbirovi u parama; prikaz se deli sa 100 tek pri formatiranju. */
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
      /* Zaglavlje kolone nije povezano sa poljem, pa citac ekrana bez ovoga
         cita samo "polje za unos" sto god da je kolona. */
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
                      ? formatDecimal((totals[column.name] ?? 0) / 100, 2)
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

      {/* Mreza ide do ivice kartice, ali traka ispod nje nije tabela. */}
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
           * `role="status"` javlja citacu ekrana da se stanje promenilo. Bez
           * njega slepi korisnik ne bi imao nacin da sazna da je nalog dosao u
           * ravnotezu.
           */
          <Text
            size="sm"
            fw={600}
            role="status"
            style={{ color: isBalanced ? liroVar.status.success.fg : liroVar.status.danger.fg }}
          >
            {isBalanced
              ? t(BALANCED_LABEL)
              : `${t(DIFFERENCE_LABEL)}: ${formatDecimal(difference / 100, 2)} ${currencyCode}`}
          </Text>
        )}
      </Group>
    </Box>
  )
}
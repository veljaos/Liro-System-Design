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
import { useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
import { useMediaQuery } from '@mantine/hooks'
import { useVirtualizer } from '@tanstack/react-virtual'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { EmptyState, type EmptyStateVariant } from '../feedback/EmptyState'

export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'boolean'

export interface DataTableColumn<T> {
  /** Kljuc u redu, ili proizvoljna oznaka ako kolona ima `render`. */
  name: string
  label: LocalizedLabel
  type?: ColumnType
  currencyCode?: string
  sortable?: boolean
  width?: number | string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T) => ReactNode
}

export interface RowAction<T> {
  label: LocalizedLabel
  icon?: LucideIcon
  onClick: (row: T) => void
  tone?: StatusToneName
  /** Sakriva radnju za pojedinacan red - npr. zakljucan dokument. */
  hidden?: (row: T) => boolean
}

export interface SortState {
  field: string
  order: 'asc' | 'desc'
}

/**
 * Red sa zbirovima.
 *
 * Vrednosti dolaze iz aplikacije, tabela ih ne racuna. Razlog: cim postoji
 * paginacija, zbir tekuce strane nije zbir naloga - a knjigovodji treba drugo.
 * Server zna ukupan zbir, tabela zna samo ono sto joj je poslato.
 */
export interface DataTableFooter {
  /** Natpis; stoji u prvoj koloni ako ona nema svoju vrednost. */
  label?: LocalizedLabel
  /** Vrednosti po imenu kolone. Broj se formatira prema tipu kolone. */
  values: Record<string, ReactNode | number | null | undefined>
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  loading?: boolean
  /** Podaci se osvezavaju, ali stari red je i dalje na ekranu. */
  isFetching?: boolean
  sort?: SortState | null
  onSortChange?: (sort: SortState) => void
  onRowClick?: (row: T) => void
  actions?: RowAction<T>[]

  /**
   * Izabrani redovi - kontrolisano. Kolona sa cekiranjem se pojavljuje samo
   * kada su prosledjena OBA propa.
   *
   * Drzi ih aplikacija jer izbor po pravilu prezivljava promenu strane:
   * korisnik cekira tri IOS-a na prvoj strani, dva na trecoj, i onda pokrece
   * masovnu obradu nad svih pet.
   */
  selected?: string[]
  onSelectionChange?: (ids: string[]) => void
  /** Onemogucava izbor pojedinacnog reda - npr. vec proknjizen dokument. */
  isRowSelectable?: (row: T) => boolean

  /** Red sa zbirovima na dnu. Lepi se za donju ivicu pri skrolovanju. */
  footer?: DataTableFooter

  emptyVariant?: EmptyStateVariant
  emptyTitle?: LocalizedLabel
  emptyDescription?: LocalizedLabel
  emptyActionLabel?: LocalizedLabel
  onEmptyAction?: () => void
  /** Broj redova skeleta dok traje prvo ucitavanje. */
  skeletonRows?: number
  stickyHeader?: boolean

  /**
   * Prva kolona (i cekiranje, ako postoji) ostaju vidljivi pri horizontalnom
   * skrolu. Za tabele sa mnogo kolona, gde se bez toga izgubi koji je red koji.
   */
  stickyFirstColumn?: boolean

  /**
   * Renderuje samo redove koji su u vidnom polju.
   *
   * Ukljuci tek kada je lista stvarno velika - kontni plan ima 932 reda i bez
   * ovoga pravi 932 DOM cvora. Ispod nekoliko stotina redova virtuelizacija je
   * cist trosak.
   *
   * Uslov: svi redovi moraju biti iste visine. Sadrzaj koji se prelama u dva
   * reda ce se preklopiti - u tom slucaju povecaj `rowHeight` ili iskljuci
   * virtuelizaciju.
   */
  virtualized?: boolean
  /** Visina okvira sa skrolom kada je `virtualized`. */
  maxHeight?: number | string
  /** Visina jednog reda u pikselima kada je `virtualized`. */
  rowHeight?: number

  /**
   * Prikaz na telefonu. Tabela sa sest kolona na ekranu od 380px je
   * neupotrebljiva bez obzira koliko se dobro skroluje - zato se ispod `sm`
   * svaki red prikazuje kao kartica.
   *
   * Bez ove konfiguracije koristi se prva kolona kao naslov, druga kao
   * podnaslov, a ostale kao parovi oznaka/vrednost.
   */
  mobile?: MobileCardConfig<T>
}

export interface MobileCardConfig<T> {
  /** Kolona koja nosi naslov kartice. */
  titleField?: string
  /** Kolona ispod naslova - obicno sifra ili radno mesto. */
  subtitleField?: string
  /** Kolone prikazane kao parovi; podrazumevano sve preostale. */
  fields?: string[]
  /** Oznaka u gornjem desnom uglu kartice. */
  badge?: (row: T) => ReactNode
}

const ACTIONS_LABEL: LocalizedLabel = { sr: 'Radnje', 'sr-Cyrl': 'Радње', en: 'Actions' }
const SELECT_ALL_LABEL: LocalizedLabel = { sr: 'Izaberi sve', 'sr-Cyrl': 'Изабери све', en: 'Select all' }
const SELECT_ROW_LABEL: LocalizedLabel = { sr: 'Izaberi red', 'sr-Cyrl': 'Изабери ред', en: 'Select row' }

const NUMERIC_TYPES: ColumnType[] = ['number', 'currency']

/** Sirina kolone sa cekiranjem; ista vrednost sluzi kao pomak za fiksiranu kolonu. */
const SELECT_COL_WIDTH = 44

/**
 * Tabela bez ijednog poziva ka bazi.
 *
 * Prima redove i vraca dogadjaje - sortiranje, izbor, klik na red, radnje.
 * Time ista tabela radi iznad Supabase-a, REST API-ja ili niza u memoriji.
 * Sloj koji dovlaci podatke je `ResourceTable` u `@liro/data` i samo je
 * obmotava.
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
  virtualized = false,
  maxHeight = 560,
  rowHeight = 44,
  mobile,
}: DataTableProps<T>) {
  const { t, formatNumber, formatCurrency, formatDate } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)

  /*
  * `hiddenFrom`/`visibleFrom` sakrivaju CSS-om, ali oba stabla svejedno
  * nastaju. Za 932 reda to je 932 kartice koje niko ne vidi.
  * 
  * Prvi render je uvek desktop, jer server ne zna sirinu ekrana. Na telefonu
  * se prebaci odmah posle montiranja.
  */

  const isMobile = useMediaQuery('(max-width: 47.99em)', false)

  const hasActions = Boolean(actions?.length)
  const selectable = Boolean(selected && onSelectionChange)

  const selectedSet = useMemo(() => new Set(selected ?? []), [selected])

  /*
  * Jedan prolaz bez pravljenja nizova. Ovo se racuna pri svakom renderu, a
  * virtuelizovana tabela renderuje na svaki kadar skrola - dva `filter`+`map`
  * nad 932 reda po kadru se osete.
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
   * Cekiranje zaglavlja radi samo nad tekucom stranom, a izbor sa ostalih
   * strana se ne dira. Bez toga bi "poništi sve" tiho obrisalo ono sto je
   * korisnik izabrao dve strane ranije.
   */
  const toggleAll = () => {
    if (!onSelectionChange) return
    const current = selected ?? []
    /* Lista se pravi tek na klik, ne na svakom renderu. */
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
    /* Broj se formatira kao i celija iznad; sve ostalo ide kroz kakvo jeste. */
    return typeof value === 'number' ? formatByType(column, value) : value
  }

  const alignOf = (column: DataTableColumn<T>) =>
    column.align ?? (NUMERIC_TYPES.includes(column.type ?? 'text') ? 'right' : 'left')

  type StickyProps = {
    'data-sticky-col'?: boolean
    'data-sticky-edge'?: boolean
    style?: CSSProperties
  }

  /* Fiksiranje: cekiranje ide na 0, prva kolona odmah iza njega. */
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
   * Hook se poziva bezuslovno (pravilo hukova), ali sa `count: 0` kada
   * virtuelizacija nije trazena - tada ne radi nista.
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
                w={column.width}
                ta={alignOf(column)}
                /*
                 * `aria-sort` je jedini nacin da citac ekrana kaze da je kolona
                 * sortirana. Ikonica strelice za njega ne postoji.
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
                style={{ whiteSpace: 'nowrap', ...(sticky.style ?? {}) }}
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
               * Enter otvara red, razmak ga cekira - isto kao u Explorer-u i
               * Gmail-u. Uslov `target === currentTarget` sprecava da taster
               * pritisnut nad cekiranjem ili menijem okine i red.
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
        /* Sopstveni okvir sa skrolom: virtualizatoru treba ref na element koji
          stvarno skroluje, a `Table.ScrollContainer` ga ne izlaze. */
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

/** Procena visine kartice pre prvog merenja; stvarna se izmeri po montiranju. */
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
   * Kartice imaju promenljivu visinu - adresa ili dug naziv se prelome u dva
   * reda. Zato se procena koristi samo do prvog merenja, a posle toga
   * `measureElement` upisuje stvarnu visinu svake kartice.
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
              {/* `component="div"` svuda gde ide `renderCell`: povratna vrednost
                  moze biti badge ili datum, koji i sami renderuju <p>. */}
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
      {/* Okvir pune visine drzi traku skrola tacnom; kartice se pozicioniraju
          apsolutno unutar njega. */}
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
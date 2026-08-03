'use client'

import { ActionIcon, Box, Center, Group, Loader, Menu, Paper, Skeleton, Stack, Table, Text, UnstyledButton } from '@mantine/core'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreVertical, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
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
  emptyVariant?: EmptyStateVariant
  emptyTitle?: LocalizedLabel
  emptyDescription?: LocalizedLabel
  emptyActionLabel?: LocalizedLabel
  onEmptyAction?: () => void
  /** Broj redova skeleta dok traje prvo ucitavanje. */
  skeletonRows?: number
  stickyHeader?: boolean
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

const NUMERIC_TYPES: ColumnType[] = ['number', 'currency']

/**
 * Tabela bez ijednog poziva ka bazi.
 *
 * Prima redove i vraca dogadjaje - sortiranje, klik na red, radnje. Time ista
 * tabela radi iznad Supabase-a, REST API-ja ili niza u memoriji. Sloj koji
 * dovlaci podatke dolazi u `@liro/data` (F2) i samo je obmotava.
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
  emptyVariant = 'empty',
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  skeletonRows = 5,
  stickyHeader = false,
  mobile,
}: DataTableProps<T>) {
  const { t, formatNumber, formatCurrency, formatDate } = useI18n()
  const hasActions = Boolean(actions?.length)

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !onSortChange) return
    const isCurrent = sort?.field === column.name
    onSortChange({
      field: column.name,
      order: isCurrent && sort?.order === 'asc' ? 'desc' : 'asc',
    })
  }

  const renderCell = (column: DataTableColumn<T>, row: T): ReactNode => {
    const value = row[column.name]
    if (column.render) return column.render(value, row)
    if (value === null || value === undefined || value === '') return '—'

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

  const alignOf = (column: DataTableColumn<T>) =>
    column.align ?? (NUMERIC_TYPES.includes(column.type ?? 'text') ? 'right' : 'left')

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

  return (
    <Box pos="relative">
      {isFetching && (
        <Center
          pos="absolute"
          top={8}
          right={8}
          style={{ zIndex: 1 }}
        >
          <Loader size={14} />
        </Center>
      )}

      <Box hiddenFrom="sm">
        <MobileCards
          columns={columns}
          rows={rows}
          getRowId={getRowId}
          renderCell={renderCell}
          config={mobile}
          onRowClick={onRowClick}
          actions={actions}
        />
      </Box>

      <Box visibleFrom="sm">
      <Table.ScrollContainer minWidth={640}>
        <Table highlightOnHover={Boolean(onRowClick)} stickyHeader={stickyHeader}>
          <Table.Thead style={{ backgroundColor: liroVar.surface.sunken }}>
            <Table.Tr>
              {columns.map((column) => {
                const isSorted = sort?.field === column.name
                const SortIcon = !isSorted ? ArrowUpDown : sort?.order === 'asc' ? ArrowUp : ArrowDown

                return (
                  <Table.Th
                    key={column.name}
                    w={column.width}
                    ta={alignOf(column)}
                    style={{ whiteSpace: 'nowrap' }}
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
            {rows.map((row) => (
              <Table.Tr
                key={getRowId(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <Table.Td
                    key={column.name}
                    ta={alignOf(column)}
                    data-numeric={NUMERIC_TYPES.includes(column.type ?? 'text') || undefined}
                  >
                    {renderCell(column, row)}
                  </Table.Td>
                ))}

                {hasActions && (
                  <Table.Td onClick={(event) => event.stopPropagation()}>
                    <RowActionsMenu actions={actions ?? []} row={row} label={t(ACTIONS_LABEL)} />
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      </Box>
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
}

function MobileCards<T extends Record<string, unknown>>({
  columns,
  rows,
  getRowId,
  renderCell,
  config,
  onRowClick,
  actions,
}: MobileCardsProps<T>) {
  const { t } = useI18n()

  const titleColumn = columns.find((column) => column.name === config?.titleField) ?? columns[0]
  const subtitleColumn = config?.subtitleField
    ? columns.find((column) => column.name === config.subtitleField)
    : columns[1]

  const detailColumns = config?.fields
    ? columns.filter((column) => config.fields?.includes(column.name))
    : columns.filter(
        (column) => column.name !== titleColumn?.name && column.name !== subtitleColumn?.name,
      )

  return (
    <Stack gap="xs" p="xs">
      {rows.map((row) => (
        <Paper
          key={getRowId(row)}
          withBorder
          radius="md"
          p="sm"
          onClick={onRowClick ? () => onRowClick(row) : undefined}
          style={{
            cursor: onRowClick ? 'pointer' : 'default',
            backgroundColor: liroVar.surface.raised,
            borderColor: liroVar.border.default,
          }}
        >
          <Group justify="space-between" wrap="nowrap" align="flex-start" mb={detailColumns.length ? 'xs' : 0}>
            <Stack gap={0} style={{ minWidth: 0 }}>
              {/* `component="div"` svuda gde ide `renderCell`: povratna vrednost
                  moze biti badge ili datum, koji i sami renderuju <p>. */}
              {titleColumn && (
                <Text component="div" size="sm" fw={600} lineClamp={1}>{renderCell(titleColumn, row)}</Text>
              )}
              {subtitleColumn && (
                <Text component="div" size="xs" style={{ color: liroVar.text.secondary }} lineClamp={1}>
                  {renderCell(subtitleColumn, row)}
                </Text>
              )}
            </Stack>

            <Group gap={4} wrap="nowrap" onClick={(event) => event.stopPropagation()}>
              {config?.badge?.(row)}
              {actions && actions.length > 0 && (
                <RowActionsMenu actions={actions} row={row} label={t({ sr: 'Radnje', en: 'Actions' })} />
              )}
            </Group>
          </Group>

          {detailColumns.length > 0 && (
            <Stack gap={2}>
              {detailColumns.map((column) => (
                <Group key={column.name} justify="space-between" gap="sm" wrap="nowrap">
                  <Text size="xs" style={{ color: liroVar.text.tertiary }}>{t(column.label)}</Text>
                  <Text component="div" size="xs" fw={500} ta="right" data-numeric={column.type === 'currency' || column.type === 'number' || undefined}>
                    {renderCell(column, row)}
                  </Text>
                </Group>
              ))}
            </Stack>
          )}
        </Paper>
      ))}
    </Stack>
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


'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { ActionIcon, Badge, Box, Group, Menu, Paper, ScrollArea, Stack, Text } from '@mantine/core'
import { GripVertical, MoveRight } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'

/**
 * Cards in columns, moved between them.
 *
 * A status flow you can see: invoices awaiting approval, tickets, documents in a
 * signing queue. The column IS the status, so moving a card is a state change -
 * which is why `onMove` is the only way anything happens here. The board holds no
 * state of its own; the application performs the move and sends the cards back.
 *
 * DRAG IS NOT ACCESSIBLE, and cannot be made so. Neither HTML5 drag-and-drop nor
 * pointer events reach the keyboard, and the "keyboard drag mode" some libraries
 * offer is a mode nobody discovers.
 *
 * So every card carries a "Move to" menu listing the other columns. That is not a
 * fallback - for a keyboard it is the better path, because it is visible, and it
 * is the only route for a screen reader. The mouse drags, the keyboard picks from
 * the menu, both call `onMove`.
 *
 * Cards are NOT reordered within a column. In a business flow the column is the
 * status and the order inside it belongs to the application - by date, by
 * deadline, by amount. Hand-sorting a queue of two hundred invoices is not a thing
 * anyone does.
 */

const MOVE_TO: TranslationKey = 'data.kanban.moveTo'
const DRAG_HINT: TranslationKey = 'data.kanban.dragHint'
const LIMIT_REACHED: TranslationKey = 'data.kanban.limitReached'

export interface KanbanCard {
  id: string
  title: string
  /** Second line: a client, an assignee. */
  subtitle?: string
  /** Right-hand figure: an amount, a deadline. Already formatted. */
  meta?: string
  tone?: StatusToneName
  /** Anything extra at the bottom - a badge, an avatar, an action. */
  footer?: ReactNode
}

export interface KanbanColumn {
  id: string
  label: LocalizedLabel
  cards: KanbanCard[]
  /**
   * Work-in-progress limit.
   *
   * Not decoration. A column of forty items "in progress" means nothing is in
   * progress, and the limit is what makes that visible. Over the limit the
   * heading and the count turn - but the move still goes through. The board
   * reports the problem; it does not block the work.
   */
  limit?: number
  tone?: StatusToneName
}

export interface KanbanBoardProps {
  columns: KanbanColumn[]
  /** The only way a card moves. The application performs it and returns new cards. */
  onMove: (cardId: string, toColumnId: string) => void
  onCardClick?: (card: KanbanCard) => void
  columnWidth?: number
  height?: number | string
}

export function KanbanBoard({
  columns,
  onMove,
  onCardClick,
  columnWidth = 280,
  height = 480,
}: KanbanBoardProps) {
  const { t, formatNumber } = useI18n()

  /* `dragging` is the card being carried, `offset` how far it has moved from
     where it was picked up, `over` the column under the pointer. */
  const [dragging, setDragging] = useState<{ cardId: string; fromColumn: string } | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [over, setOver] = useState<string | null>(null)
  const start = useRef({ x: 0, y: 0 })

  /*
   * The column is found from the element under the pointer, not from rectangles
   * measured at pick-up. Those are stale the moment the board scrolls sideways -
   * which it does, whenever the target column is off-screen.
   */
  const columnAt = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y)
    const column = element?.closest('[data-kanban-column]')
    return column?.getAttribute('data-kanban-column') ?? null
  }

  const startDrag =
    (card: KanbanCard, columnId: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const handle = event.currentTarget
      handle.setPointerCapture(event.pointerId)

      start.current = { x: event.clientX, y: event.clientY }
      setDragging({ cardId: card.id, fromColumn: columnId })
      setOffset({ x: 0, y: 0 })

      /*
       * The listeners go on the DOM element, not through React props.
       *
       * Declared as props on the same element that captured the pointer, the
       * events stop arriving as soon as the cursor leaves it - and it leaves
       * immediately, because the grip is fourteen pixels wide. The same approach
       * is used for column resizing in `DataTable`.
       */
      const handleMove = (move: PointerEvent) => {
        setOffset({ x: move.clientX - start.current.x, y: move.clientY - start.current.y })
        setOver(columnAt(move.clientX, move.clientY))
      }

      const handleUp = (up: PointerEvent) => {
        handle.releasePointerCapture(up.pointerId)
        handle.removeEventListener('pointermove', handleMove)
        handle.removeEventListener('pointerup', handleUp)

        const target = columnAt(up.clientX, up.clientY)
        if (target && target !== columnId) onMove(card.id, target)

        setDragging(null)
        setOver(null)
        setOffset({ x: 0, y: 0 })
      }

      handle.addEventListener('pointermove', handleMove)
      handle.addEventListener('pointerup', handleUp)
    }

  return (
    <ScrollArea type="hover" style={{ height }} viewportProps={{ tabIndex: 0 }}>
      {/* Padding inside the scroll area, not around it: the columns must scroll
          past the edge rather than stop short of it. */}
      <Group gap="md" align="flex-start" wrap="nowrap" p="md" style={{ minHeight: '100%' }}>
        {columns.map((column) => {
          const count = column.cards.length
          const overLimit = column.limit !== undefined && count > column.limit
          const isOver = over === column.id && dragging?.fromColumn !== column.id
          const tone = liroVar.status[column.tone ?? 'neutral']

          return (
            <Box
              key={column.id}
              data-kanban-column={column.id}
              style={{
                width: columnWidth,
                flexShrink: 0,
                borderRadius: 'var(--liro-radius-lg)',
                backgroundColor: liroVar.surface.sunken,
                /* The target column is outlined while a card is over it - a
                   border rather than a fill, so the cards inside stay readable. */
                border: `2px solid ${isOver ? liroVar.brand.solid : 'transparent'}`,
                padding: 'var(--liro-space-sm)',
                transition: 'border-color var(--liro-duration-base) var(--liro-easing-standard)',
              }}
            >
              <Group justify="space-between" wrap="nowrap" px={4} pb="xs">
                {/* Over the limit the heading takes the warning colour too: a
                    badge alone is easy to miss on a board of six columns. */}
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  truncate
                  style={{
                    letterSpacing: 'var(--liro-tracking-caps)',
                    color: overLimit ? liroVar.status.warning.fg : tone.fg,
                  }}
                >
                  {t(column.label)}
                </Text>

                <Badge
                  size="sm"
                  variant="light"
                  color={overLimit ? 'liro-orange' : 'liro-gray'}
                  aria-label={overLimit ? `${t(column.label)}: ${t(LIMIT_REACHED)}` : undefined}
                >
                  {column.limit === undefined
                    ? formatNumber(count)
                    : `${formatNumber(count)} / ${formatNumber(column.limit)}`}
                </Badge>
              </Group>

              <Stack gap="xs">
                {column.cards.map((card) => {
                  const isDragged = dragging?.cardId === card.id
                  const cardTone = liroVar.status[card.tone ?? 'neutral']

                  return (
                    <Paper
                      key={card.id}
                      withBorder
                      p="sm"
                      radius="md"
                      style={{
                        backgroundColor: liroVar.surface.raised,
                        borderColor: liroVar.border.default,
                        borderLeft: `3px solid ${cardTone.solid}`,
                        cursor: onCardClick ? 'pointer' : 'default',
                        /* The card follows the pointer through a transform rather
                           than a portal: no clone, no layout shift, and it keeps
                           its own styles. */
                        transform: isDragged
                          ? `translate(${offset.x}px, ${offset.y}px)`
                          : undefined,
                        opacity: isDragged ? 0.85 : 1,
                        boxShadow: isDragged ? 'var(--liro-shadow-lg)' : undefined,
                        /* Only the dragged card rises above the others. */
                        zIndex: isDragged ? 2 : undefined,
                        position: isDragged ? 'relative' : undefined,
                        /*
                        * The dragged card is transparent to hit-testing.
                        *
                        * `columnAt` uses `elementFromPoint`, and the card sits
                        * under the pointer the whole time. Without this it is
                        * what gets returned, and `closest()` then walks up the
                        * DOM - where the card is still a child of the SOURCE
                        * column, because it only moved by transform.
                        * 
                        * The result was that the target always came back as the
                        * source: no outline, no move, and an occasional hit when
                        * the pointer strayed off the card's own edge.
                        */
                        pointerEvents: isDragged ? 'none' : undefined,
                        touchAction: 'none',
                      }}
                      onClick={onCardClick ? () => onCardClick(card) : undefined}
                    >
                      <Group gap={4} wrap="nowrap" align="flex-start">
                        <Box
                          className="liro-kanban-grip"
                          aria-hidden
                          onPointerDown={startDrag(card, column.id)}
                          title={t(DRAG_HINT)}
                        >
                          <GripVertical size={14} />
                        </Box>

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={500} truncate>
                            {card.title}
                          </Text>

                          {card.subtitle && (
                            <Text size="xs" truncate style={{ color: liroVar.text.tertiary }}>
                              {card.subtitle}
                            </Text>
                          )}

                          {card.meta && (
                            <Text
                              size="xs"
                              mt={4}
                              data-numeric
                              style={{ color: liroVar.text.secondary }}
                            >
                              {card.meta}
                            </Text>
                          )}

                          {card.footer && <Box mt="xs">{card.footer}</Box>}
                        </Box>

                        {/*
                          The keyboard path. Not a fallback - it is visible, which
                          drag is not, and it is the only route for a screen reader.
                        */}
                        <Menu
                          position="bottom-end"
                          withArrow
                          transitionProps={{ transition: 'pop' }}
                        >
                          <Menu.Target>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              /* The card may itself be clickable; opening the menu
                                 must not also open the record. */
                              onClick={(event) => event.stopPropagation()}
                              aria-label={`${t(MOVE_TO)}: ${card.title}`}
                            >
                              <MoveRight size={14} />
                            </ActionIcon>
                          </Menu.Target>

                          <Menu.Dropdown>
                            <Menu.Label>{t(MOVE_TO)}</Menu.Label>
                            {columns
                              .filter((target) => target.id !== column.id)
                              .map((target) => (
                                <Menu.Item key={target.id} onClick={() => onMove(card.id, target.id)}>
                                  {t(target.label)}
                                </Menu.Item>
                              ))}
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </Paper>
                  )
                })}
              </Stack>
            </Box>
          )
        })}
      </Group>
    </ScrollArea>
  )
}
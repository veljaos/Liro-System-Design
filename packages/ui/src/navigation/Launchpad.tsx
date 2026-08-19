'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ElementType } from 'react'
import { Group, Paper, SimpleGrid, Stack, Text, Tooltip, UnstyledButton } from '@mantine/core'
import { Lock, type LucideIcon } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'
import { useCan, useLiroAppOptional } from '../app/LiroAppProvider'

/**
 * Launchpad — tiles.
 *
 * The shape is carried over from `ModuleGrid` in Liro Business App, down to
 * the detail: `Paper withBorder radius="md" p="md"`, an icon in a box top
 * left, a badge top right, a title `size="sm" fw={700}`, below it a
 * **subtitle**.
 *
 * Below the title sits a subtitle, not a number. A number felt like a good
 * idea, but it broke the grid's rhythm — in the original application a tile
 * is an entry point into a module, not a metric. When a number is needed, it
 * goes as a badge top right, where `PRO` and `UNAVAILABLE` already sit.
 *
 * The class is `liro-module-card`, the same as in the original application.
 * Because of it, the rule `.liro-module-card:hover .liro-module-icon` works,
 * giving the icon a blue background and white color on hover — previously the
 * class `liro-tile` was there, so that rule never matched.
 */

export interface LaunchpadTile {
  id: string
  title: LocalizedLabel
  /** Subtitle below the title — one sentence about what the module does. */
  subtitle?: LocalizedLabel
  icon?: LucideIcon
  href?: string
  onClick?: () => void
  /**
   * Module tier: `PRO`, `ENTERPRISE`.
   *
   * Deliberately NOT arbitrary text. Numbers like "11 overdue" were tried and
   * removed — they break the grid's rhythm and turn the tile into a metric,
   * when it is an entry point into a module. Top right holds only the tier or
   * a lock.
   */
  tier?: 'pro' | 'enterprise'
  /** The tile exists but the user does not have access rights. */
  permission?: string
}

export interface LaunchpadProps {
  tiles: LaunchpadTile[]
  columns?: number
  linkComponent?: ElementType
  withNumberShortcuts?: boolean
  /**
   * Editing mode.
   *
   * Dragging works ONLY while this is on. Outside of it, tiles are plain
   * links — otherwise a user who wants to open a module drags it instead of
   * clicking, which is the most common complaint about boards like this.
   *
   * The application turns it on with an "Edit layout" button and persists the
   * order through `onReorder`.
   */
  editing?: boolean
  onReorder?: (ids: string[]) => void
}

const TIER_COLOR: Record<'pro' | 'enterprise', string> = {
  pro: 'var(--liro-text-brand)',
  enterprise: 'var(--liro-status-premium-fg)',
}

const LOCKED: TranslationKey = 'nav.launchpad.locked'
const LOCKED_LABEL: TranslationKey = 'nav.locked.badge'

export function Launchpad({
  tiles,
  columns = 3,
  linkComponent,
  withNumberShortcuts = true,
  editing = false,
  onReorder,
}: LaunchpadProps) {
  const { t } = useI18n()
  const app = useLiroAppOptional()
  const can = useCan()
  const containerRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(0)
  const [order, setOrder] = useState<string[] | null>(null)
  const dragId = useRef<string | null>(null)

  const Link = (linkComponent ?? app?.linkComponent ?? 'a') as ElementType

  const ordered = useMemo(() => {
    if (!order) return tiles
    const map = new Map(tiles.map((tile) => [tile.id, tile]))
    const sorted = order.map((id) => map.get(id)).filter(Boolean) as LaunchpadTile[]
    /* New tiles the user has not yet arranged go at the end. */
    const missing = tiles.filter((tile) => !order.includes(tile.id))
    return [...sorted, ...missing]
  }, [tiles, order])

  const visible = useMemo(
    () => ordered.map((tile) => ({ tile, locked: !can(tile.permission) })),
    [ordered, can],
  )

  /*
  * `useCallback` is not decoration: `activate` is used inside the
  * `useEffect` below. Without it, the function would be new on every render,
  * so it would either be missing from the dependencies (and capture a stale
  * `visible`), or the keyboard listener would detach and reattach on every
  * render.
  */
 const activate = useCallback(
  (index: number) => {
    const entry = visible[index]
    if (!entry || entry.locked) return
    if (entry.tile.onClick) entry.tile.onClick()
    else if (entry.tile.href) window.location.href = entry.tile.href
  },
  [visible],
  )

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (withNumberShortcuts && /^[1-9]$/.test(event.key)) {
        const index = Number(event.key) - 1
        if (index < visible.length) {
          event.preventDefault()
          setFocused(index)
          activate(index)
        }
        return
      }

      const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[event.key]
      if (step !== undefined) {
        event.preventDefault()
        setFocused((current) => Math.min(Math.max(current + step, 0), visible.length - 1))
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        activate(focused)
      }
    }

    const node = containerRef.current
    node?.addEventListener('keydown', handler)
    return () => node?.removeEventListener('keydown', handler)
  }, [visible, columns, focused, withNumberShortcuts, activate])

  const handleDrop = (targetId: string) => {
    const sourceId = dragId.current
    dragId.current = null
    if (!sourceId || sourceId === targetId) return

    const ids = visible.map((entry) => entry.tile.id)
    const from = ids.indexOf(sourceId)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) return

    ids.splice(to, 0, ...ids.splice(from, 1))
    setOrder(ids)
    onReorder?.(ids)
  }

  return (
    <div ref={containerRef} tabIndex={0} style={{ outline: 'none' }}>
      <SimpleGrid cols={{ base: 1, xs: 2, sm: columns }} spacing="md">
        {visible.map(({ tile, locked }, index) => {
          const Icon = tile.icon
          const isFocused = index === focused

          const card = (
            <Paper
              withBorder
              radius="md"
              p="md"
              className={`liro-module-card${locked ? ' is-locked' : ''}`}
              draggable={editing && !locked}
              onDragStart={() => {
                dragId.current = tile.id
              }}
              onDragOver={(event) => {
                if (editing) event.preventDefault()
              }}
              onDrop={() => {
                if (editing) handleDrop(tile.id)
              }}
              onMouseEnter={() => setFocused(index)}
              style={{
                backgroundColor: liroVar.surface.raised,
                borderColor: isFocused ? liroVar.border.brand : liroVar.border.default,
                height: '100%',
                cursor: editing && !locked ? 'grab' : undefined,
              }}
            >
              <Stack gap="xs" align="flex-start">
                <Group justify="space-between" w="100%" wrap="nowrap">
                  {Icon && <span className="liro-module-icon"><Icon size={20} /></span>}

                  {locked ? (
                    <Group gap={4} wrap="nowrap" style={{ color: liroVar.text.tertiary }}>
                      <Lock size={12} />
                      <Text size="xs" fw={800} style={{ letterSpacing: 'var(--liro-tracking-caps)' }}>
                        {t(LOCKED_LABEL)}
                      </Text>
                    </Group>
                  ) : tile.tier ? (
                    <Text
                      size="xs"
                      fw={800}
                      style={{ letterSpacing: 'var(--liro-tracking-caps)', color: TIER_COLOR[tile.tier] }}
                    >
                      {tile.tier.toUpperCase()}
                    </Text>
                  ) : null}
                </Group>

                <Text size="sm" fw={700} mt={4}>{t(tile.title)}</Text>

                {tile.subtitle && (
                  <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(tile.subtitle)}</Text>
                )}
              </Stack>
            </Paper>
          )

          if (locked) {
            return (
              <Tooltip key={tile.id} label={t(LOCKED)} withArrow>
                <div>{card}</div>
              </Tooltip>
            )
          }

          if (tile.href && !tile.onClick) {
            return (
              <Link key={tile.id} href={tile.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                {card}
              </Link>
            )
          }

          return (
            /*
            * `UnstyledButton` renders a real `<button>`: it brings the role,
            * keyboard focus, and triggering on Enter and Space without a
            * single manual handler. With `<div onClick>`, the tile only
            * existed for the mouse.
            */
           <UnstyledButton
              key={tile.id}
              onClick={tile.onClick}
              style={{ display: 'block', width: '100%', textAlign: 'inherit' }}
            >
              {card}
            </UnstyledButton>
          )
        })}
      </SimpleGrid>
    </div>
  )
}

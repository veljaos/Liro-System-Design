'use client'

import { useEffect, useMemo, useRef, useState, type ElementType } from 'react'
import { Group, Paper, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core'
import { Lock, type LucideIcon } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { useCan, useLiroAppOptional } from '../app/LiroAppProvider'

/**
 * Ulazna tabla — pločice.
 *
 * Oblik je preuzet iz `ModuleGrid`-a u Liro Business App-u, do detalja:
 * `Paper withBorder radius="md" p="md"`, ikonica u kutiji gore levo, oznaka
 * gore desno, naslov `size="sm" fw={700}`, ispod njega **podnaslov**.
 *
 * Ispod naslova stoji podnaslov, ne brojka. Brojka je delovala kao dobra ideja,
 * ali je razbila ritam mreze - u izvornoj aplikaciji je plocica ulaz u modul, a
 * ne pokazatelj. Kada brojka zatreba, ide kao oznaka gore desno, gde vec stoje
 * `PRO` i `NEDOSTUPNO`.
 *
 * Klasa je `liro-module-card`, ista kao u izvornoj aplikaciji. Zbog nje radi
 * pravilo `.liro-module-card:hover .liro-module-icon` koje ikonici pri prelazu
 * daje plavu pozadinu i belu boju - ranije je stajala klasa `liro-tile`, pa se
 * to pravilo nikada nije poklopilo.
 */

export interface LaunchpadTile {
  id: string
  title: LocalizedLabel
  /** Podnaslov ispod naslova — jedna rečenica o tome šta modul radi. */
  subtitle?: LocalizedLabel
  icon?: LucideIcon
  href?: string
  onClick?: () => void
  /**
   * Nivo modula: `PRO`, `ENTERPRISE`.
   *
   * Namerno NIJE proizvoljan tekst. Brojke tipa „11 u docnji" su probane i
   * uklonjene - razbijaju ritam mreze i pretvaraju plocicu u pokazatelj, a ona
   * je ulaz u modul. Gore desno stoji samo nivo ili katanac.
   */
  tier?: 'pro' | 'enterprise'
  /** Pločica postoji ali korisnik nema pravo pristupa. */
  permission?: string
}

export interface LaunchpadProps {
  tiles: LaunchpadTile[]
  columns?: number
  linkComponent?: ElementType
  withNumberShortcuts?: boolean
  /**
   * Režim uređivanja.
   *
   * Prevlačenje radi SAMO dok je uključen. Van njega su pločice obične veze —
   * inače korisnik koji hoće da otvori modul povuče ga umesto da klikne, i to
   * je najčešća zamerka na ovakve table.
   *
   * Aplikacija ga uključuje dugmetom „Uredi raspored" i čuva redosled kroz
   * `onReorder`.
   */
  editing?: boolean
  onReorder?: (ids: string[]) => void
}

const TIER_COLOR: Record<'pro' | 'enterprise', string> = {
  pro: 'var(--liro-text-brand)',
  enterprise: 'var(--liro-status-premium-fg)',
}

const LOCKED: LocalizedLabel = {
  sr: 'Nemate pravo pristupa ovom modulu.',
  'sr-Cyrl': 'Немате право приступа овом модулу.',
  en: 'You do not have access to this module.',
}

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
    /* Nove pločice koje korisnik još nije rasporedio idu na kraj. */
    const missing = tiles.filter((tile) => !order.includes(tile.id))
    return [...sorted, ...missing]
  }, [tiles, order])

  const visible = useMemo(
    () => ordered.map((tile) => ({ tile, locked: !can(tile.permission) })),
    [ordered, can],
  )

  const activate = (index: number) => {
    const entry = visible[index]
    if (!entry || entry.locked) return
    if (entry.tile.onClick) entry.tile.onClick()
    else if (entry.tile.href) window.location.href = entry.tile.href
  }

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
  }, [visible, columns, focused, withNumberShortcuts])

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
                        {t({ sr: 'NEDOSTUPNO', en: 'UNAVAILABLE' })}
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
            <div key={tile.id} onClick={tile.onClick}>
              {card}
            </div>
          )
        })}
      </SimpleGrid>
    </div>
  )
}

'use client'

import { Fragment, useMemo, useState } from 'react'
import { Badge, Box, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { ChevronDown, ChevronRight, Minus, Plus, PencilLine } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Obrasci strukture — treći sloj.
 *
 * Poslednja tri obrasca koja se ponavljaju u svakom poslovnom sistemu:
 *
 *   hijerarhija       organizaciona sema, sastavnica proizvoda, kontni plan,
 *                     kategorije, prostorije po zgradama
 *   poredjenje verzija  revizije ugovora, izmene specifikacije, sta je
 *                     promenjeno izmedju dva stanja zapisa
 *   raspodela kapaciteta  ko radi na cemu kroz vreme, zauzece masina, sala,
 *                     vozila, ljudi
 *
 * Sa prethodnih sedam ovo cini deset obrazaca. Ne tvrdim da pokrivaju bas sve,
 * ali kroz svaku industriju koju smo prosli - proizvodnja, nabavka, prodaja,
 * usluge, compliance, facility, istrazivanje - nije se pojavio ekran koji se
 * ne svodi na neki od njih.
 */

// ---------------------------------------------------------------------------
// Hijerarhija
// ---------------------------------------------------------------------------

export interface StructureNode {
  id: string
  label: string
  /** Šifra, pozicija, oznaka konta — prikazuje se pre naziva. */
  code?: string
  /** Sporedni podatak desno: količina, broj ljudi, saldo. */
  value?: string
  /** Uloga ili tip čvora — „Rukovodilac", „Sklop", „Sintetika". */
  kind?: string
  tone?: StatusToneName
  children?: StructureNode[]
}

export interface StructureTreeProps {
  nodes: StructureNode[]
  /** Nivoi otvoreni pri prvom prikazu. */
  defaultExpandedDepth?: number
  onNodeClick?: (node: StructureNode) => void
  /** Natpis iznad kolone sa vrednostima. */
  valueLabel?: string
}

/**
 * Hijerarhijska struktura.
 *
 * Organizaciona sema, sastavnica proizvoda, kontni plan, kategorije artikala,
 * prostorije po zgradama - sve su stabla gde cvor nosi sifru, naziv i jednu
 * brojku.
 *
 * Uvlacenje se crta linijama a ne samo razmakom: na dubini od cetiri nivoa
 * razmak prestaje da pokazuje kome cvor pripada.
 */
export function StructureTree({
  nodes,
  defaultExpandedDepth = 1,
  onNodeClick,
  valueLabel,
}: StructureTreeProps) {
  const initial = useMemo(() => {
    const open = new Set<string>()
    const walk = (items: StructureNode[], depth: number) => {
      for (const item of items) {
        if (depth < defaultExpandedDepth && item.children?.length) open.add(item.id)
        if (item.children) walk(item.children, depth + 1)
      }
    }
    walk(nodes, 0)
    return open
  }, [nodes, defaultExpandedDepth])

  const [expanded, setExpanded] = useState<Set<string>>(initial)

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const render = (items: StructureNode[], depth: number): React.ReactNode =>
    items.map((node) => {
      const hasChildren = Boolean(node.children?.length)
      const open = expanded.has(node.id)
      const tone = node.tone ? liroVar.status[node.tone] : null

      return (
        <Fragment key={node.id}>
          <Group
            gap={0}
            wrap="nowrap"
            style={{
              borderBottom: `1px solid ${liroVar.border.subtle}`,
              minHeight: 34,
            }}
          >
            {/* Vodilice: jedna okomita crta po nivou dubine. */}
            {Array.from({ length: depth }).map((_, index) => (
              <Box
                key={index}
                style={{
                  width: 18,
                  alignSelf: 'stretch',
                  borderRight: `1px solid ${liroVar.border.default}`,
                  flexShrink: 0,
                }}
              />
            ))}

            <UnstyledButton
              onClick={() => (hasChildren ? toggle(node.id) : onNodeClick?.(node))}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                minWidth: 0,
              }}
            >
              <Box style={{ width: 14, display: 'flex', color: liroVar.text.tertiary, flexShrink: 0 }}>
                {hasChildren ? (open ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : null}
              </Box>

              {node.code && (
                <Text size="xs" ff="monospace" style={{ color: liroVar.text.tertiary, flexShrink: 0 }}>
                  {node.code}
                </Text>
              )}

              <Text size="sm" fw={hasChildren ? 600 : 400} style={{ minWidth: 0 }}>
                {node.label}
              </Text>

              {node.kind && (
                <Badge
                  size="xs"
                  variant="light"
                  radius="sm"
                  color="liro-gray"
                  style={tone ? { backgroundColor: tone.bg, color: tone.fg } : undefined}
                >
                  {node.kind}
                </Badge>
              )}
            </UnstyledButton>

            {node.value && (
              <Text size="sm" data-numeric pr="sm" style={{ flexShrink: 0 }}>
                {node.value}
              </Text>
            )}
          </Group>

          {hasChildren && open && render(node.children ?? [], depth + 1)}
        </Fragment>
      )
    })

  return (
    <Stack gap={0}>
      {valueLabel && (
        <Group justify="flex-end" pr="sm" pb={4}>
          <Text
            size="xs"
            fw={700}
            style={{
              color: liroVar.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: 'var(--liro-tracking-caps)',
            }}
          >
            {valueLabel}
          </Text>
        </Group>
      )}
      {render(nodes, 0)}
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Poređenje verzija
// ---------------------------------------------------------------------------

export type ChangeKind = 'added' | 'removed' | 'changed' | 'unchanged'

export interface FieldChange {
  label: LocalizedLabel
  /** Vrednost u starijoj verziji. */
  before?: string | null
  /** Vrednost u novijoj verziji. */
  after?: string | null
  /** Kada se izostavi, izračunava se iz `before` i `after`. */
  kind?: ChangeKind
  /** Grupa u kojoj polje stoji — „Zaglavlje", „Stavke", „Uslovi". */
  group?: string
}

export interface VersionCompareProps {
  changes: FieldChange[]
  /** Oznaka starije verzije — „v3 · 12.03.2026." */
  beforeLabel: string
  afterLabel: string
  /** Sakriva nepromenjena polja; podrazumevano su sakrivena. */
  showUnchanged?: boolean
  onToggleUnchanged?: (show: boolean) => void
}

function resolveKind(change: FieldChange): ChangeKind {
  if (change.kind) return change.kind
  const before = change.before ?? null
  const after = change.after ?? null
  if (before === after) return 'unchanged'
  if (before === null || before === '') return 'added'
  if (after === null || after === '') return 'removed'
  return 'changed'
}

/*
 * Boja opisuje SUDBINU vrednosti, ne vrstu izmene.
 *
 * Ranije je izmenjena vrednost bila narandzasta, pa je nova vrednost izgledala
 * kao upozorenje. Sada: stara vrednost je uvek precrtana i tiha, nova je uvek
 * naglasena i u boji teksta. Crveno postoji samo tamo gde je nesto zaista
 * nestalo, zeleno samo tamo gde je nesto zaista dodato.
 */
const CHANGE_TONE: Record<ChangeKind, StatusToneName> = {
  added: 'success',
  removed: 'danger',
  changed: 'info',
  unchanged: 'neutral',
}

const CHANGE_ICON = { added: Plus, removed: Minus, changed: PencilLine, unchanged: Minus }

/**
 * Poredjenje dve verzije zapisa.
 *
 * Revizija ugovora, izmena specifikacije proizvoda, ispravka poreske prijave,
 * promena cenovnika - svugde je pitanje isto: sta se tacno promenilo.
 *
 * Nepromenjena polja su podrazumevano sakrivena. Ugovor ima cetrdeset polja, a
 * promenila su se tri; prikazati svih cetrdeset znaci sakriti onih troje medju
 * ostalima.
 */
export function VersionCompare({
  changes,
  beforeLabel,
  afterLabel,
  showUnchanged = false,
  onToggleUnchanged,
}: VersionCompareProps) {
  const { t } = useI18n()

  const resolved = useMemo(
    () => changes.map((change) => ({ change, kind: resolveKind(change) })),
    [changes],
  )

  const visible = showUnchanged ? resolved : resolved.filter((item) => item.kind !== 'unchanged')
  const hidden = resolved.length - visible.length

  const groups = useMemo(() => {
    const map = new Map<string, typeof visible>()
    for (const item of visible) {
      const key = item.change.group ?? ''
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return [...map.entries()]
  }, [visible])

  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs">
          <Badge variant="light" color="liro-gray" radius="sm">{beforeLabel}</Badge>
          <ChevronRight size={14} style={{ color: liroVar.text.tertiary }} />
          <Badge variant="light" color="liro-blue" radius="sm">{afterLabel}</Badge>
        </Group>

        {hidden > 0 && onToggleUnchanged && (
          <UnstyledButton onClick={() => onToggleUnchanged(true)}>
            <Text size="xs" style={{ color: liroVar.text.brand }}>
              {t({ sr: `Prikaži još ${hidden} nepromenjenih`, en: `Show ${hidden} unchanged` })}
            </Text>
          </UnstyledButton>
        )}
      </Group>

      {groups.map(([group, items]) => (
        <Stack key={group || 'default'} gap={0}>
          {group && (
            <Text
              size="xs"
              fw={700}
              mb={4}
              style={{
                color: liroVar.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: 'var(--liro-tracking-caps)',
              }}
            >
              {group}
            </Text>
          )}

          {items.map(({ change, kind }, index) => {
            const tone = liroVar.status[CHANGE_TONE[kind]]
            const Icon = CHANGE_ICON[kind]

            return (
              <Group
                key={index}
                gap="sm"
                wrap="nowrap"
                align="flex-start"
                py={8}
                style={{ borderBottom: `1px solid ${liroVar.border.subtle}` }}
              >
                <Box
                  style={{
                    display: 'flex',
                    color: tone.fg,
                    flexShrink: 0,
                    marginTop: 2,
                    opacity: kind === 'unchanged' ? 0.35 : 1,
                  }}
                >
                  <Icon size={13} />
                </Box>

                <Text size="sm" fw={500} w={180} style={{ flexShrink: 0 }}>
                  {t(change.label)}
                </Text>

                <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }} align="flex-start">
                  {kind !== 'added' && (
                    <Text
                      size="sm"
                      style={{
                        color: liroVar.text.tertiary,
                        textDecoration: kind === 'unchanged' ? 'none' : 'line-through',
                        flex: 1,
                        minWidth: 0,
                        wordBreak: 'break-word',
                      }}
                    >
                      {change.before || '—'}
                    </Text>
                  )}

                  {kind !== 'unchanged' && kind !== 'removed' && (
                    <>
                      {kind === 'changed' && (
                        <ChevronRight size={13} style={{ color: liroVar.text.tertiary, flexShrink: 0, marginTop: 3 }} />
                      )}
                      <Text
                        size="sm"
                        fw={600}
                        style={{
                          /* Izmenjena vrednost je obican naglasen tekst - boja bi
                             sugerisala ishod kojeg nema. Zeleno je rezervisano za
                             stvarno dodavanje. */
                          color: kind === 'added' ? tone.fg : liroVar.text.primary,
                          flex: 1,
                          minWidth: 0,
                          wordBreak: 'break-word',
                        }}
                      >
                        {change.after || '—'}
                      </Text>
                    </>
                  )}
                </Group>
              </Group>
            )
          })}
        </Stack>
      ))}

      {visible.length === 0 && (
        <Text size="sm" c="dimmed">
          {t({ sr: 'Nema razlika između verzija.', en: 'No differences between versions.' })}
        </Text>
      )}
    </Stack>
  )
}

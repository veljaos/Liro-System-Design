'use client'

import { Fragment, useMemo, useState } from 'react'
import { Badge, Box, Group, Stack, Text, UnstyledButton } from '@mantine/core'
import { ChevronDown, ChevronRight, Minus, Plus, PencilLine } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel, type TranslationKey } from '@liro/i18n'

const SHOW_UNCHANGED: TranslationKey = 'patterns.versionCompare.showUnchanged'
const NO_DIFFERENCES: TranslationKey = 'patterns.versionCompare.noDifferences'

/**
 * Structure patterns — third layer.
 *
 * The last three patterns that repeat in every business system:
 *
 *   hierarchy          org chart, product bill of materials, chart of
 *                      accounts, categories, rooms across buildings
 *   version comparison  contract revisions, spec changes, what changed
 *                      between two states of a record
 *   capacity distribution  who works on what over time, occupancy of
 *                      machines, halls, vehicles, people
 *
 * Together with the previous seven, this makes ten patterns. I do not claim
 * they cover absolutely everything, but across every industry we have gone
 * through — manufacturing, procurement, sales, services, compliance,
 * facility, research — no screen has appeared that does not reduce to one of
 * them.
 */

// ---------------------------------------------------------------------------
// Hierarchy
// ---------------------------------------------------------------------------

export interface StructureNode {
  id: string
  label: string
  /** Code, position, account number — shown before the name. */
  code?: string
  /** Secondary data on the right: quantity, headcount, balance. */
  value?: string
  /** Role or node type — "Manager", "Assembly", "Control account". */
  kind?: string
  tone?: StatusToneName
  children?: StructureNode[]
}

export interface StructureTreeProps {
  nodes: StructureNode[]
  /** Levels open on first display. */
  defaultExpandedDepth?: number
  onNodeClick?: (node: StructureNode) => void
  /** Label above the values column. */
  valueLabel?: string
}

/**
 * Hierarchical structure.
 *
 * An org chart, a product bill of materials, a chart of accounts, item
 * categories, rooms across buildings — all of these are trees where a node
 * carries a code, a name, and one number.
 *
 * Indentation is drawn with lines, not just spacing: at a depth of four
 * levels, spacing alone stops showing which node belongs to which.
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
            {/* Guides: one vertical line per depth level. */}
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
// Version comparison
// ---------------------------------------------------------------------------

export type ChangeKind = 'added' | 'removed' | 'changed' | 'unchanged'

export interface FieldChange {
  label: LocalizedLabel
  /** Value in the older version. */
  before?: string | null
  /** Value in the newer version. */
  after?: string | null
  /** When omitted, computed from `before` and `after`. */
  kind?: ChangeKind
  /** Group the field sits in — "Header", "Line items", "Terms". */
  group?: string
}

export interface VersionCompareProps {
  changes: FieldChange[]
  /** Label of the older version — "v3 · 12.03.2026." */
  beforeLabel: string
  afterLabel: string
  /** Hides unchanged fields; hidden by default. */
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
 * Color describes the FATE of the value, not the kind of change.
 *
 * Previously a changed value was orange, so the new value looked like a
 * warning. Now: the old value is always struck through and muted, the new
 * one is always emphasized and in the text color. Red exists only where
 * something truly disappeared, green only where something was truly added.
 */
const CHANGE_TONE: Record<ChangeKind, StatusToneName> = {
  added: 'success',
  removed: 'danger',
  changed: 'info',
  unchanged: 'neutral',
}

const CHANGE_ICON = { added: Plus, removed: Minus, changed: PencilLine, unchanged: Minus }

/**
 * Comparison of two versions of a record.
 *
 * A contract revision, a product spec change, a tax return correction, a
 * price list change — the question is always the same: what exactly changed.
 *
 * Unchanged fields are hidden by default. A contract has forty fields, and
 * three changed; showing all forty means hiding those three among the rest.
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
              {t(SHOW_UNCHANGED, undefined, { hidden })}
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
                          /* A changed value is plain emphasized text — color
                             would suggest an outcome that is not there. Green
                             is reserved for a genuine addition. */
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
          {t(NO_DIFFERENCES)}
        </Text>
      )}
    </Stack>
  )
}

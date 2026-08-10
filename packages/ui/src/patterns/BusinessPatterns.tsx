'use client'

import { Fragment, useMemo, type ReactNode } from 'react'
import { Box, Divider, Group, Progress, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core'
import { Check, ChevronRight, CircleDashed, CircleDot, Clock, Minus, X, type LucideIcon } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { PersonAvatar } from '../primitives/PersonAvatar'

/**
 * Business domain patterns.
 *
 * This file exists because of one decision: we do NOT build components by
 * domain.
 *
 * Enumerating domains — hospitality, KYC, AML, manufacturing, research — leads
 * to a list that is never finished, and to code that gets duplicated because a
 * "KYC check" was written separately from "quality control" even though they
 * are the same thing.
 *
 * What actually repeats is the pattern. Every business system has:
 *
 *   status flow        draft -> submitted -> approved -> closed
 *   approval chain      who confirmed, who is next, who rejected
 *   checklist           a set of checks with an outcome and evidence
 *   score                a number in a range with zones and a decision threshold
 *
 * A hotel reservation, a client KYC check, a manufacturing order, and a
 * research project application use these same four patterns — only the
 * configuration and labels differ. That is why these components are
 * data-driven: tomorrow a new domain gets described, not programmed.
 */

// ---------------------------------------------------------------------------
// Status flow
// ---------------------------------------------------------------------------

export interface WorkflowStep {
  id: string
  label: LocalizedLabel
  /** Short explanation of what happens in this step. */
  description?: LocalizedLabel
  /** Who completed the step and when — shown below the name. */
  meta?: string
  icon?: LucideIcon
}

export type WorkflowStepState = 'done' | 'current' | 'upcoming' | 'skipped' | 'failed'

export interface WorkflowStatusProps {
  steps: WorkflowStep[]
  /** Id of the step the record is currently on. */
  currentId: string
  /** Steps that were skipped or rejected — override the computed state. */
  states?: Partial<Record<string, WorkflowStepState>>
  orientation?: 'horizontal' | 'vertical'
  onStepClick?: (step: WorkflowStep) => void
}

const STATE_TONE: Record<WorkflowStepState, StatusToneName> = {
  done: 'success',
  current: 'info',
  upcoming: 'neutral',
  skipped: 'neutral',
  failed: 'danger',
}

const STATE_ICON: Record<WorkflowStepState, LucideIcon> = {
  done: Check,
  current: CircleDot,
  upcoming: CircleDashed,
  skipped: Minus,
  failed: X,
}

/**
 * Status flow of a record.
 *
 * Shows where the record is and what comes next. Steps are described as data,
 * so the same piece of code draws invoice approval, a KYC check, and a
 * reservation path.
 *
 * Horizontal for three to five steps in a header; vertical when the steps
 * carry an explanation or when there are more of them.
 */
export function WorkflowStatus({
  steps,
  currentId,
  states,
  orientation = 'horizontal',
  onStepClick,
}: WorkflowStatusProps) {
  const { t } = useI18n()
  const currentIndex = Math.max(steps.findIndex((step) => step.id === currentId), 0)

  const resolved = useMemo(
    () =>
      steps.map((step, index) => {
        const override = states?.[step.id]
        const state: WorkflowStepState =
          override ?? (index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming')
        return { step, state }
      }),
    [steps, currentIndex, states],
  )

  if (orientation === 'vertical') {
    return (
      <Stack gap={0}>
        {resolved.map(({ step, state }, index) => {
          const Icon = step.icon ?? STATE_ICON[state]
          const tone = liroVar.status[STATE_TONE[state]]
          const last = index === resolved.length - 1

          return (
            <Group key={step.id} gap="sm" align="flex-start" wrap="nowrap">
              <Stack gap={0} align="center" style={{ flexShrink: 0 }}>
                <ThemeIcon size={26} radius="xl" variant="light" color="gray" style={{ backgroundColor: tone.bg, color: tone.fg }}>
                  <Icon size={14} />
                </ThemeIcon>
                {!last && (
                  <Box w={2} h={38} style={{ backgroundColor: liroVar.border.default }} />
                )}
              </Stack>

              <Stack gap={2} pb={last ? 0 : 'md'} style={{ minWidth: 0 }}>
                <Text size="sm" fw={state === 'current' ? 700 : 500}>{t(step.label)}</Text>
                {step.description && (
                  <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(step.description)}</Text>
                )}
                {step.meta && (
                  <Text size="xs" style={{ color: liroVar.text.tertiary }}>{step.meta}</Text>
                )}
              </Stack>
            </Group>
          )
        })}
      </Stack>
    )
  }

  return (
    <Group gap={0} wrap="nowrap" style={{ overflowX: 'auto' }}>
      {resolved.map(({ step, state }, index) => {
        const Icon = step.icon ?? STATE_ICON[state]
        const tone = liroVar.status[STATE_TONE[state]]

        return (
          <Fragment key={step.id}>
            {index > 0 && (
              <Box px={6} style={{ color: liroVar.text.tertiary, display: 'flex', flexShrink: 0 }}>
                <ChevronRight size={14} />
              </Box>
            )}

            <Group
              gap={6}
              wrap="nowrap"
              px="xs"
              py={4}
              onClick={onStepClick ? () => onStepClick(step) : undefined}
              style={{
                flexShrink: 0,
                borderRadius: 'var(--liro-radius-md)',
                backgroundColor: state === 'current' ? tone.bg : 'transparent',
                cursor: onStepClick ? 'pointer' : 'default',
              }}
            >
              <ThemeIcon size={20} radius="xl" variant="light" color="gray" style={{ backgroundColor: tone.bg, color: tone.fg }}>
                <Icon size={12} />
              </ThemeIcon>
              <Text
                size="sm"
                fw={state === 'current' ? 700 : 400}
                style={{ color: state === 'upcoming' ? liroVar.text.tertiary : liroVar.text.primary, whiteSpace: 'nowrap' }}
              >
                {t(step.label)}
              </Text>
            </Group>
          </Fragment>
        )
      })}
    </Group>
  )
}

// ---------------------------------------------------------------------------
// Approval chain
// ---------------------------------------------------------------------------

export type ApprovalDecision = 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped'

export interface ApprovalEntry {
  id: string
  /** Who is deciding. */
  name: string
  /** Role or level — "Manager", "Director", "Compliance". */
  role?: string
  avatarUrl?: string | null
  decision: ApprovalDecision
  /** Already-formatted decision time. */
  decidedAt?: string
  /** Justification — required when rejecting. */
  comment?: string
}

export interface ApprovalChainProps {
  entries: ApprovalEntry[]
  /** When `true`, everyone must approve; otherwise one is enough. */
  requiresAll?: boolean
}

const DECISION_TONE: Record<ApprovalDecision, StatusToneName> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  delegated: 'info',
  skipped: 'neutral',
}

const DECISION_LABEL: Record<ApprovalDecision, LocalizedLabel> = {
  pending: { sr: 'Čeka odluku', 'sr-Cyrl': 'Чека одлуку', en: 'Awaiting decision' },
  approved: { sr: 'Odobreno', 'sr-Cyrl': 'Одобрено', en: 'Approved' },
  rejected: { sr: 'Odbijeno', 'sr-Cyrl': 'Одбијено', en: 'Rejected' },
  delegated: { sr: 'Prosleđeno', 'sr-Cyrl': 'Прослеђено', en: 'Delegated' },
  skipped: { sr: 'Preskočeno', 'sr-Cyrl': 'Прескочено', en: 'Skipped' },
}

const DECISION_ICON: Record<ApprovalDecision, LucideIcon> = {
  pending: Clock,
  approved: Check,
  rejected: X,
  delegated: ChevronRight,
  skipped: Minus,
}

/**
 * Approval chain.
 *
 * Who confirmed, who is next, who rejected and why. The same pattern covers
 * invoice approval, a payment order, a KYC decision, and vacation approval.
 *
 * The justification is shown only when it exists, but on rejection the
 * absence of a justification is a sign of a process error — that is why it is
 * visually highlighted.
 */
export function ApprovalChain({ entries, requiresAll = true }: ApprovalChainProps) {
  const { t } = useI18n()

  return (
    <Stack gap="xs">
      <Text size="xs" style={{ color: liroVar.text.tertiary }}>
        {t(
          requiresAll
            ? { sr: 'Potrebna je saglasnost svih učesnika.', en: 'All approvals are required.' }
            : { sr: 'Dovoljna je saglasnost jednog učesnika.', en: 'A single approval is enough.' },
        )}
      </Text>

      {entries.map((entry) => {
        const tone = liroVar.status[DECISION_TONE[entry.decision]]
        const Icon = DECISION_ICON[entry.decision]
        const missingReason = entry.decision === 'rejected' && !entry.comment

        return (
          <Group
            key={entry.id}
            gap="sm"
            wrap="nowrap"
            align="flex-start"
            p="xs"
            style={{
              border: `1px solid ${entry.decision === 'pending' ? tone.border : liroVar.border.default}`,
              borderRadius: 'var(--liro-radius-md)',
              backgroundColor: entry.decision === 'pending' ? tone.bg : liroVar.surface.raised,
            }}
          >
            <PersonAvatar name={entry.name} src={entry.avatarUrl} size={30} />

            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" fw={600}>{entry.name}</Text>
                {entry.role && (
                  <Text size="xs" style={{ color: liroVar.text.tertiary }}>· {entry.role}</Text>
                )}
              </Group>

              {entry.comment && (
                <Text size="xs" style={{ color: liroVar.text.secondary }}>{entry.comment}</Text>
              )}
              {missingReason && (
                <Text size="xs" style={{ color: liroVar.status.danger.fg }}>
                  {t({ sr: 'Nedostaje obrazloženje odluke.', en: 'Decision reason is missing.' })}
                </Text>
              )}
            </Stack>

            <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
              <Group gap={4} wrap="nowrap" style={{ color: tone.fg }}>
                <Icon size={13} />
                <Text size="xs" fw={600}>{t(DECISION_LABEL[entry.decision])}</Text>
              </Group>
              {entry.decidedAt && (
                <Text size="xs" style={{ color: liroVar.text.tertiary }}>{entry.decidedAt}</Text>
              )}
            </Stack>
          </Group>
        )
      })}
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Checklist
// ---------------------------------------------------------------------------

export type CheckOutcome = 'pass' | 'fail' | 'warning' | 'pending' | 'na'

export interface CheckItem {
  id: string
  label: LocalizedLabel
  outcome: CheckOutcome
  /** What exactly was checked and what proves it. */
  detail?: string
  /** A check that must pass for the whole set to pass. */
  blocking?: boolean
}

export interface CheckGroup {
  title: LocalizedLabel
  items: CheckItem[]
}

export interface ChecklistProps {
  groups: CheckGroup[]
  /** Shows a progress bar and a total above the list. */
  withSummary?: boolean
  onItemClick?: (item: CheckItem) => void
}

const OUTCOME_TONE: Record<CheckOutcome, StatusToneName> = {
  pass: 'success',
  fail: 'danger',
  warning: 'warning',
  pending: 'neutral',
  na: 'neutral',
}

const OUTCOME_ICON: Record<CheckOutcome, LucideIcon> = {
  pass: Check,
  fail: X,
  warning: CircleDot,
  pending: Clock,
  na: Minus,
}

/**
 * Checklist of checks.
 *
 * One component covers a client KYC/AML check, quality control on a
 * manufacturing order, incoming goods inspection, and a documentation audit —
 * because in all four cases it is a set of checks with an outcome and
 * evidence.
 *
 * `blocking` exists because not all checks are equal: one unfinished blocking
 * check means the whole set has not passed, regardless of the others.
 */
export function Checklist({ groups, withSummary = true, onItemClick }: ChecklistProps) {
  const { t } = useI18n()

  const summary = useMemo(() => {
    const items = groups.flatMap((group) => group.items)
    const relevant = items.filter((item) => item.outcome !== 'na')
    const passed = relevant.filter((item) => item.outcome === 'pass').length
    const failed = relevant.filter((item) => item.outcome === 'fail').length
    const blocked = relevant.some((item) => item.blocking && item.outcome !== 'pass')
    return { total: relevant.length, passed, failed, blocked }
  }, [groups])

  return (
    <Stack gap="md">
      {withSummary && summary.total > 0 && (
        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              {summary.passed} / {summary.total} {t({ sr: 'provera prošlo', en: 'checks passed' })}
            </Text>
            <Text
              size="xs"
              fw={600}
              style={{ color: summary.blocked ? liroVar.status.danger.fg : liroVar.status.success.fg }}
            >
              {summary.blocked
                ? t({ sr: 'Blokirano', 'sr-Cyrl': 'Блокирано', en: 'Blocked' })
                : t({ sr: 'Prolazi', 'sr-Cyrl': 'Пролази', en: 'Passing' })}
            </Text>
          </Group>
          <Progress
            value={(summary.passed / summary.total) * 100}
            size="sm"
            radius="xl"
            color={summary.failed > 0 ? 'liro-red' : summary.passed === summary.total ? 'liro-green' : 'liro-blue'}
            aria-label={t({
              sr: 'Udeo prošlih provera',
              'sr-Cyrl': 'Удео прошлих провера',
              en: 'Share of passed checks',
            })}
          />
        </Stack>
      )}

      {groups.map((group, groupIndex) => (
        <Stack key={groupIndex} gap={6}>
          <Text
            size="xs"
            fw={700}
            style={{
              color: liroVar.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: 'var(--liro-tracking-caps)',
            }}
          >
            {t(group.title)}
          </Text>

          {group.items.map((item) => {
            const tone = liroVar.status[OUTCOME_TONE[item.outcome]]
            const Icon = OUTCOME_ICON[item.outcome]

            return (
              <Group
                key={item.id}
                gap="sm"
                wrap="nowrap"
                align="flex-start"
                py={6}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
              >
                <ThemeIcon
                  size={20}
                  radius="xl"
                  variant="light"
                  color="gray"
                  style={{ backgroundColor: tone.bg, color: tone.fg, flexShrink: 0, marginTop: 1 }}
                >
                  <Icon size={12} />
                </ThemeIcon>

                <Stack gap={1} style={{ minWidth: 0 }}>
                  <Group gap={6} wrap="nowrap">
                    <Text
                      size="sm"
                      style={{ color: item.outcome === 'na' ? liroVar.text.tertiary : liroVar.text.primary }}
                    >
                      {t(item.label)}
                    </Text>
                    {item.blocking && (
                      <Tooltip label={t({ sr: 'Obavezna provera', en: 'Blocking check' })} withArrow>
                        <Text size="xs" fw={700} style={{ color: liroVar.status.danger.fg }}>*</Text>
                      </Tooltip>
                    )}
                  </Group>
                  {item.detail && (
                    <Text size="xs" style={{ color: liroVar.text.secondary }}>{item.detail}</Text>
                  )}
                </Stack>
              </Group>
            )
          })}
        </Stack>
      ))}
    </Stack>
  )
}

// ---------------------------------------------------------------------------
// Score with zones
// ---------------------------------------------------------------------------

export interface ScoreBand {
  /** Upper bound of the zone, inclusive. */
  upTo: number
  label: LocalizedLabel
  tone: StatusToneName
}

export interface ScoreMeterProps {
  value: number
  min?: number
  max?: number
  bands: ScoreBand[]
  label?: LocalizedLabel
  /** Explanation of what the score means and where it comes from. */
  description?: LocalizedLabel
  /** Items that contributed to the score. */
  factors?: { label: LocalizedLabel; weight: number }[]
  children?: ReactNode
}

/**
 * Score in a range with zones.
 *
 * Client risk in AML, creditworthiness, a supplier rating, project health in
 * research — all of these are a number in a range with decision thresholds.
 *
 * Zones are described as data because the thresholds differ by regulation and
 * by company; the component does not assume any of them.
 */
export function ScoreMeter({
  value,
  min = 0,
  max = 100,
  bands,
  label,
  description,
  factors,
  children,
}: ScoreMeterProps) {
  const { t, formatDecimal } = useI18n()

  const band = useMemo(
    () => [...bands].sort((a, b) => a.upTo - b.upTo).find((item) => value <= item.upTo) ?? bands[bands.length - 1],
    [bands, value],
  )

  const tone = band ? liroVar.status[band.tone] : liroVar.status.neutral
  const percent = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100)

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end">
        <Stack gap={2}>
          {label && (
            <Text size="xs" fw={700} style={{ color: liroVar.text.tertiary, textTransform: 'uppercase', letterSpacing: 'var(--liro-tracking-caps)' }}>
              {t(label)}
            </Text>
          )}
          <Group gap="xs" align="baseline">
            <Text size="xl" fw={700} data-numeric>{formatDecimal(value, 0)}</Text>
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>/ {formatDecimal(max, 0)}</Text>
          </Group>
        </Stack>

        {band && (
          <Box
            px="xs"
            py={3}
            style={{
              backgroundColor: tone.bg,
              color: tone.fg,
              border: `1px solid ${tone.border}`,
              borderRadius: 'var(--liro-radius-xs)',
              fontSize: 'var(--liro-font-size-xs)',
              fontWeight: 700,
            }}
          >
            {t(band.label)}
          </Box>
        )}
      </Group>

      {/* Zones are drawn as segments — the decision threshold is visible without reading numbers. */}
      <Box pos="relative">
        <Group gap={2} wrap="nowrap">
          {[...bands]
            .sort((a, b) => a.upTo - b.upTo)
            .map((item, index, all) => {
              const previous = index === 0 ? min : (all[index - 1]?.upTo ?? min)
              const width = ((item.upTo - previous) / (max - min)) * 100
              return (
                <Box
                  key={index}
                  h={8}
                  style={{
                    width: `${width}%`,
                    backgroundColor: liroVar.status[item.tone].bg,
                    borderRadius: 2,
                  }}
                />
              )
            })}
        </Group>
        <Box
          pos="absolute"
          top={-3}
          style={{
            left: `${percent}%`,
            width: 3,
            height: 14,
            backgroundColor: tone.solid,
            borderRadius: 2,
            transform: 'translateX(-1.5px)',
          }}
        />
      </Box>

      {description && (
        <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(description)}</Text>
      )}

      {factors && factors.length > 0 && (
        <>
          <Divider />
          <Stack gap={4}>
            {factors.map((factor, index) => (
              <Group key={index} justify="space-between" wrap="nowrap">
                <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(factor.label)}</Text>
                <Text
                  size="xs"
                  fw={600}
                  data-numeric
                  style={{ color: factor.weight < 0 ? liroVar.status.danger.fg : liroVar.status.success.fg }}
                >
                  {factor.weight > 0 ? '+' : ''}{factor.weight}
                </Text>
              </Group>
            ))}
          </Stack>
        </>
      )}

      {children}
    </Stack>
  )
}

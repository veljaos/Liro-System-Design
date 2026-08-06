'use client'

import { Fragment, useMemo, type ReactNode } from 'react'
import { Avatar, Box, Divider, Group, Progress, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core'
import { Check, ChevronRight, CircleDashed, CircleDot, Clock, Minus, X, type LucideIcon } from 'lucide-react'
import { liroVar, type StatusToneName } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * Obrasci poslovnih domena.
 *
 * Ovaj fajl postoji zbog jedne odluke: NE pravimo komponente po domenima.
 *
 * Nabrajanje domena - hospitality, KYC, AML, proizvodnja, istrazivanje - vodi u
 * spisak koji nikada nije gotov, i u kod koji se duplira jer je „KYC provera"
 * napisana odvojeno od „kontrole kvaliteta" iako su ista stvar.
 *
 * Ono sto se stvarno ponavlja su obrasci. Svaki poslovni sistem ima:
 *
 *   tok stanja        nacrt -> poslato -> odobreno -> zakljuceno
 *   lanac odobrenja   ko je potvrdio, ko je na redu, ko je odbio
 *   kontrolnu listu   skup provera sa ishodom i dokazom
 *   ocenu             broj u opsegu sa zonama i pragom odluke
 *
 * Rezervacija u hotelu, KYC provera klijenta, nalog za proizvodnju i prijava
 * istrazivackog projekta koriste ista cetiri obrasca - razlikuju se samo
 * konfiguracija i natpisi. Zato su ove komponente vodjene podacima: sutra se
 * novi domen opisuje, ne programira.
 */

// ---------------------------------------------------------------------------
// Tok stanja
// ---------------------------------------------------------------------------

export interface WorkflowStep {
  id: string
  label: LocalizedLabel
  /** Kratko objašnjenje šta se u ovom koraku dešava. */
  description?: LocalizedLabel
  /** Ko je i kada završio korak — prikazuje se ispod naziva. */
  meta?: string
  icon?: LucideIcon
}

export type WorkflowStepState = 'done' | 'current' | 'upcoming' | 'skipped' | 'failed'

export interface WorkflowStatusProps {
  steps: WorkflowStep[]
  /** Id koraka na kojem se zapis trenutno nalazi. */
  currentId: string
  /** Koraci koji su preskočeni ili odbijeni — nadjačavaju izračunato stanje. */
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
 * Tok stanja zapisa.
 *
 * Prikazuje gde se zapis nalazi i sta sledi. Koraci se opisuju kao podaci, pa
 * isti komad koda crta odobravanje fakture, KYC proveru i putanju rezervacije.
 *
 * Vodoravno za tri do pet koraka u zaglavlju; uspravno kada koraci nose
 * objasnjenje ili kada ih ima vise.
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
// Lanac odobrenja
// ---------------------------------------------------------------------------

export type ApprovalDecision = 'pending' | 'approved' | 'rejected' | 'delegated' | 'skipped'

export interface ApprovalEntry {
  id: string
  /** Ko odlučuje. */
  name: string
  /** Uloga ili nivo — „Rukovodilac", „Direktor", „Compliance". */
  role?: string
  avatarUrl?: string | null
  decision: ApprovalDecision
  /** Već formatirano vreme odluke. */
  decidedAt?: string
  /** Obrazloženje — obavezno kod odbijanja. */
  comment?: string
}

export interface ApprovalChainProps {
  entries: ApprovalEntry[]
  /** Kada je `true`, svi moraju odobriti; inače je dovoljan jedan. */
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
 * Lanac odobrenja.
 *
 * Ko je potvrdio, ko je na redu, ko je odbio i zasto. Isti obrazac pokriva
 * odobrenje fakture, nalog za isplatu, KYC odluku i odobrenje godisnjeg odmora.
 *
 * Obrazlozenje se prikazuje samo kada postoji, ali kod odbijanja izostanak
 * obrazlozenja je znak greske u procesu - zato je vizuelno istaknuto.
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
            <Avatar src={entry.avatarUrl ?? undefined} size={30} radius="xl" color="liro-blue">
              {entry.name.slice(0, 2).toUpperCase()}
            </Avatar>

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
// Kontrolna lista
// ---------------------------------------------------------------------------

export type CheckOutcome = 'pass' | 'fail' | 'warning' | 'pending' | 'na'

export interface CheckItem {
  id: string
  label: LocalizedLabel
  outcome: CheckOutcome
  /** Šta je tačno provereno i čime je dokazano. */
  detail?: string
  /** Provera koja mora proći da bi ceo skup prošao. */
  blocking?: boolean
}

export interface CheckGroup {
  title: LocalizedLabel
  items: CheckItem[]
}

export interface ChecklistProps {
  groups: CheckGroup[]
  /** Prikazuje traku napretka i zbir iznad liste. */
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
 * Kontrolna lista provera.
 *
 * Jedna komponenta pokriva KYC/AML proveru klijenta, kontrolu kvaliteta na
 * proizvodnom nalogu, prijemnu kontrolu robe i reviziju dokumentacije - jer je
 * u sva cetiri slucaja rec o skupu provera sa ishodom i dokazom.
 *
 * `blocking` postoji zato sto nisu sve provere jednake: jedna nezavrsena
 * blokirajuca provera znaci da ceo skup nije prosao, bez obzira na ostale.
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
// Ocena sa zonama
// ---------------------------------------------------------------------------

export interface ScoreBand {
  /** Gornja granica zone, uključivo. */
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
  /** Objašnjenje šta ocena znači i odakle dolazi. */
  description?: LocalizedLabel
  /** Stavke koje su doprinele oceni. */
  factors?: { label: LocalizedLabel; weight: number }[]
  children?: ReactNode
}

/**
 * Ocena u opsegu sa zonama.
 *
 * Rizik klijenta u AML-u, kreditna sposobnost, ocena dobavljaca, zdravlje
 * projekta u istrazivanju - sve su broj u opsegu sa pragovima odluke.
 *
 * Zone se opisuju podacima jer se pragovi razlikuju po propisu i po firmi;
 * komponenta ne pretpostavlja nijedan.
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

      {/* Zone se crtaju kao segmenti — prag odluke se vidi bez čitanja brojeva. */}
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

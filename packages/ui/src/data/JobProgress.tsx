'use client'

import { useEffect, useState } from 'react'
import { Box, Group, Paper, Progress, Stack, Text } from '@mantine/core'
import { Check, CircleAlert, CircleX, Clock, Loader } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton } from '../actions/ActionButton'
import { StatusBadge } from '../feedback/StatusBadge'

/**
 * State of a job running on the server.
 *
 * Bulk processing takes minutes. Without feedback, the user does not know
 * whether the job is working, how much is left, and what to do when it
 * fails — so they start it again, and again.
 *
 * The component does not call the server. The application decides how to
 * track the job (`useCall` in a loop, Supabase realtime, SSE) and just passes
 * in the state.
 */

export type JobState = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface JobPhase {
  id: string
  label: LocalizedLabel
  state: 'pending' | 'active' | 'done' | 'failed'
  /** Short note - "412 of 746", "3 skipped". */
  note?: string
}

export interface JobProgressProps {
  state: JobState
  title: LocalizedLabel
  description?: LocalizedLabel
  /** Processed and total. Without `total`, the bar is indeterminate. */
  processed?: number
  total?: number
  /** Number of items that failed — shown even when the job succeeded. */
  failed?: number
  phases?: JobPhase[]
  startedAt?: Date | string | null
  /** Error message when the job fails. */
  error?: string | null
  onCancel?: () => void
  onRetry?: () => void
  onDownload?: () => void
  downloadLabel?: LocalizedLabel
}

const STATE_LABEL: Record<JobState, LocalizedLabel> = {
  queued: { sr: 'U redu za obradu', 'sr-Cyrl': 'У реду за обраду', en: 'Queued' },
  running: { sr: 'Obrada u toku', 'sr-Cyrl': 'Обрада у току', en: 'Running' },
  succeeded: { sr: 'Završeno', 'sr-Cyrl': 'Завршено', en: 'Completed' },
  failed: { sr: 'Nije uspelo', 'sr-Cyrl': 'Није успело', en: 'Failed' },
  cancelled: { sr: 'Otkazano', 'sr-Cyrl': 'Отказано', en: 'Cancelled' },
}

const STATE_TONE = {
  queued: 'neutral',
  running: 'info',
  succeeded: 'success',
  failed: 'danger',
  cancelled: 'neutral',
} as const

const CANCEL_LABEL: LocalizedLabel = { sr: 'Prekini', 'sr-Cyrl': 'Прекини', en: 'Cancel' }
const RETRY_LABEL: LocalizedLabel = { sr: 'Pokušaj ponovo', 'sr-Cyrl': 'Покушај поново', en: 'Retry' }
const DOWNLOAD_LABEL: LocalizedLabel = { sr: 'Preuzmi rezultat', 'sr-Cyrl': 'Преузми резултат', en: 'Download result' }
const ELAPSED_LABEL: LocalizedLabel = { sr: 'Proteklo', 'sr-Cyrl': 'Протекло', en: 'Elapsed' }

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function PhaseIcon({ state }: { state: JobPhase['state'] }) {
  if (state === 'done') return <Check size={14} style={{ color: liroVar.status.success.fg }} />
  if (state === 'failed') return <CircleX size={14} style={{ color: liroVar.status.danger.fg }} />
  if (state === 'active') return <Loader size={14} style={{ color: liroVar.text.brand }} />
  return <Clock size={14} style={{ color: liroVar.text.tertiary }} />
}

export function JobProgress({
  state,
  title,
  description,
  processed,
  total,
  failed = 0,
  phases,
  startedAt,
  error,
  onCancel,
  onRetry,
  onDownload,
  downloadLabel,
}: JobProgressProps) {
  const { t, formatNumber } = useI18n()

  /*
   * The clock ticks only on the client and only while the job is running.
   *
   * `Date.now()` during render would give one value on the server and
   * another in the browser, and React would report a hydration mismatch.
   * That is why the initial value is set only in an effect — the server
   * renders it empty, the client fills it in.
   */
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (state !== 'running' || !startedAt) {
      setNow(null)
      return
    }
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [state, startedAt])

  const started = startedAt ? new Date(startedAt).getTime() : null
  const elapsed = now !== null && started !== null ? formatElapsed(now - started) : null

  const percent =
    total && total > 0 && processed !== undefined
      ? Math.min(100, Math.round((processed / total) * 100))
      : null

  const isActive = state === 'running' || state === 'queued'

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{ backgroundColor: liroVar.surface.raised, borderColor: liroVar.border.default }}
      /*
       * `role="status"` tells a screen reader about every text change
       * inside. Without it, a blind user would not even find out the job
       * finished.
       */
      role="status"
      aria-live="polite"
    >
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fw={600} size="sm">{t(title)}</Text>
            {description && (
              <Text size="xs" style={{ color: liroVar.text.secondary }}>{t(description)}</Text>
            )}
          </Stack>
          <StatusBadge tone={STATE_TONE[state]} label={STATE_LABEL[state]} />
        </Group>

        {isActive && (
          <Progress
            value={percent ?? 100}
            /* Without a known total, the bar is full and animated — it shows
               that something is working, but does not lie about progress. */
            animated={percent === null || state === 'running'}
            striped={percent === null}
            size="sm"
            radius="xl"
            aria-label={t(title)}
          />
        )}

        <Group gap="lg" wrap="wrap">
          {processed !== undefined && (
            <Text size="xs" style={{ color: liroVar.text.secondary }}>
              {formatNumber(processed)}
              {total !== undefined ? ` / ${formatNumber(total)}` : ''}
              {percent !== null ? ` · ${percent}%` : ''}
            </Text>
          )}

          {failed > 0 && (
            <Group gap={4} wrap="nowrap">
              <CircleAlert size={13} style={{ color: liroVar.status.warning.fg }} />
              <Text size="xs" style={{ color: liroVar.status.warning.fg }}>
                {t({ sr: 'Neuspelo', 'sr-Cyrl': 'Неуспело', en: 'Failed' })}: {formatNumber(failed)}
              </Text>
            </Group>
          )}

          {elapsed && (
            <Text size="xs" style={{ color: liroVar.text.tertiary }}>
              {t(ELAPSED_LABEL)}: {elapsed}
            </Text>
          )}
        </Group>

        {phases && phases.length > 0 && (
          <Stack gap={4}>
            {phases.map((phase) => (
              <Group key={phase.id} gap="xs" wrap="nowrap">
                <Box style={{ display: 'flex', flexShrink: 0 }}>
                  <PhaseIcon state={phase.state} />
                </Box>
                <Text
                  size="xs"
                  fw={phase.state === 'active' ? 600 : 400}
                  style={{
                    color:
                      phase.state === 'pending' ? liroVar.text.tertiary : liroVar.text.primary,
                  }}
                >
                  {t(phase.label)}
                </Text>
                {phase.note && (
                  <Text size="xs" style={{ color: liroVar.text.tertiary }}>· {phase.note}</Text>
                )}
              </Group>
            ))}
          </Stack>
        )}

        {error && state === 'failed' && (
          <Text size="xs" style={{ color: liroVar.status.danger.fg }}>{error}</Text>
        )}

        {(onCancel || onRetry || onDownload) && (
          <Group gap="xs" justify="flex-end">
            {isActive && onCancel && (
              <ActionButton intent="cancel" size="xs" label={CANCEL_LABEL} onClick={onCancel} />
            )}
            {state === 'failed' && onRetry && (
              <ActionButton intent="refresh" size="xs" label={RETRY_LABEL} onClick={onRetry} />
            )}
            {state === 'succeeded' && onDownload && (
              <ActionButton
                intent="download"
                size="xs"
                label={downloadLabel ?? DOWNLOAD_LABEL}
                onClick={onDownload}
              />
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  )
}
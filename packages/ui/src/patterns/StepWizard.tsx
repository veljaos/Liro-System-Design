'use client'

import { useMemo, type ReactNode } from 'react'
import { Box, Group, Modal, Progress, Stack, Stepper, Text } from '@mantine/core'
import { CircleCheck, CircleX, Loader } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { ActionButton, ActionGroup } from '../actions/ActionButton'

/**
 * Step wizard.
 *
 * A pattern that repeats across several flows in Liro Business App —
 * signing a document, pairing a device, generating a filing. It is the same
 * everywhere: a sequence of steps in a modal, forward and back, then a final
 * success or error state.
 *
 * Two rules the component enforces:
 *
 * A step that runs on the server has no buttons. While waiting for a
 * response, "Back" would leave the record in a half-finished state, and
 * "Next" would have nothing to do.
 *
 * The final state is not a step but an outcome. There is no going back from
 * success; the only way out is closing or a new action.
 */

export interface WizardStep {
  id: string
  label: LocalizedLabel
  description?: LocalizedLabel
  content: ReactNode
  /** Blocks "Next" until the step is filled in. */
  canContinue?: boolean
  /** The step is waiting on the server — hides the buttons and shows a progress bar. */
  busy?: boolean
  /** Hides "Back" — for steps after which there is no going back. */
  withoutBack?: boolean
  /** Label on the continue button; defaults to "Next". */
  nextLabel?: LocalizedLabel
}

export interface WizardOutcome {
  kind: 'success' | 'error'
  title: LocalizedLabel
  description?: LocalizedLabel
  /** Action after the outcome — open the document, try again. */
  action?: { label: LocalizedLabel; onClick: () => void }
}

export interface StepWizardProps {
  opened: boolean
  onClose: () => void
  title: LocalizedLabel
  steps: WizardStep[]
  /** Index of the active step; controlled. */
  active: number
  onActiveChange: (index: number) => void
  /** When set, the outcome is shown instead of the steps. */
  outcome?: WizardOutcome | null
  onFinish?: () => void
  finishLabel?: LocalizedLabel
  size?: string | number
}

export function StepWizard({
  opened,
  onClose,
  title,
  steps,
  active,
  onActiveChange,
  outcome,
  onFinish,
  finishLabel,
  size = 'lg',
}: StepWizardProps) {
  const { t } = useI18n()
  const step = steps[active]
  const isLast = active === steps.length - 1
  const busy = Boolean(step?.busy)

  const progress = useMemo(
    () => ((active + 1) / Math.max(steps.length, 1)) * 100,
    [active, steps.length],
  )

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700} size="sm">{t(title)}</Text>}
      size={size}
      /* While a step is working, the modal does not close accidentally — the record would be left half-done. */
      closeOnClickOutside={!busy}
      closeOnEscape={!busy}
      withCloseButton={!busy}
    >
      {outcome ? (
        <Stack gap="md" align="center" py="lg">
          <Box
            style={{
              color: outcome.kind === 'success' ? liroVar.status.success.fg : liroVar.status.danger.fg,
              display: 'flex',
            }}
          >
            {outcome.kind === 'success' ? <CircleCheck size={44} strokeWidth={1.5} /> : <CircleX size={44} strokeWidth={1.5} />}
          </Box>

          <Stack gap={4} align="center">
            <Text fw={700}>{t(outcome.title)}</Text>
            {outcome.description && (
              <Text size="sm" ta="center" style={{ color: liroVar.text.secondary, maxWidth: 380 }}>
                {t(outcome.description)}
              </Text>
            )}
          </Stack>

          <ActionGroup>
            <ActionButton intent="cancel" label={{ sr: 'Zatvori', en: 'Close' }} onClick={onClose} />
            {outcome.action && (
              <ActionButton
                intent={outcome.kind === 'success' ? 'view' : 'refresh'}
                label={outcome.action.label}
                onClick={outcome.action.onClick}
              />
            )}
          </ActionGroup>
        </Stack>
      ) : (
        <Stack gap="md">
          <Stepper active={active} size="xs" iconSize={26}>
            {steps.map((item) => (
              <Stepper.Step
                key={item.id}
                label={t(item.label)}
                description={item.description ? t(item.description) : undefined}
              />
            ))}
          </Stepper>

          {busy && (
            <Progress
              value={progress}
              size="xs"
              radius="xl"
              animated
              aria-label={t({
                sr: 'Napredak koraka',
                'sr-Cyrl': 'Напредак корака',
                en: 'Step progress',
              })}
            />
          )}

          <Box mih={120}>{step?.content}</Box>

          {busy ? (
            <Group justify="center" gap="xs">
              <Loader size={14} />
              <Text size="sm" style={{ color: liroVar.text.secondary }}>
                {t({ sr: 'Obrada u toku…', 'sr-Cyrl': 'Обрада у току…', en: 'Working…' })}
              </Text>
            </Group>
          ) : (
            <ActionGroup>
              {active > 0 && !step?.withoutBack && (
                <ActionButton intent="back" onClick={() => onActiveChange(active - 1)} />
              )}
              <ActionButton
                intent={isLast ? 'submit' : 'confirm'}
                label={
                  step?.nextLabel ??
                  (isLast ? (finishLabel ?? { sr: 'Završi', en: 'Finish' }) : { sr: 'Dalje', en: 'Next' })
                }
                disabled={step?.canContinue === false}
                onClick={() => (isLast ? onFinish?.() : onActiveChange(active + 1))}
              />
            </ActionGroup>
          )}
        </Stack>
      )}
    </Modal>
  )
}

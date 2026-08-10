'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Box, Button, Divider, Group, Stack, Stepper, Text } from '@mantine/core'
import { Modal } from '@mantine/core'
import { AlertTriangle } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { FieldList } from './AutoForm'
import { buildPayload, hasErrorAt, useConditionValues, useServerErrorSync } from './formEngine'
import { collectAllNodes, isLayoutField, type FieldSchema } from './types'
import { createLiroResolver, type StandardSchemaV1 } from './validation'

/**
 * A single form split into steps, on a full page.
 *
 * Difference from `StepWizard` in `@liro/ui`: there the steps are a process
 * (sign, then submit, then wait for the server); here it is one record filled
 * in over several sessions. That is why this one has a draft, protection
 * against leaving with unsaved changes, and a return to the step where the
 * error is — and that one has none of it.
 *
 * Three decisions the component enforces:
 *
 * While going through the steps, only the current one is validated. An error
 * in a step the user has not yet reached is not an error, just a field not
 * filled in yet.
 *
 * On the last step, the whole record is validated. Nothing can pass
 * unchecked just because the user skipped backward.
 *
 * When validation fails on an earlier step, the user is taken back there. A
 * disabled button with no visible reason is the worst possible outcome.
 */

export interface FormWizardStep {
  id: string
  label: LocalizedLabel
  description?: LocalizedLabel
  schema: FieldSchema[]
  /** Partial schema validated before moving on. */
  validationSchema?: StandardSchemaV1
}

export interface FormWizardProps {
  steps: FormWizardStep[]
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: LocalizedLabel
  /** Schema for the whole record; validated before submitting, not per step. */
  validationSchema?: StandardSchemaV1
  /**
   * Called after typing stops, with all values.
   *
   * Deliberately does not save by itself: the design system does not know
   * whether the draft goes to Supabase, `localStorage`, or nowhere. When the
   * prop is not passed, the form does not subscribe to changes and pays
   * nothing.
   */
  onDraftChange?: (values: Record<string, unknown>) => void
  /** Delay in milliseconds before saving the draft. */
  draftDelay?: number
  /** Time of the last saved draft; shown in the footer. */
  draftSavedAt?: Date | null
  /** Reports that the form has unsaved changes — for route guarding in the application. */
  onDirtyChange?: (dirty: boolean) => void
  serverErrors?: { field: string; message: string }[]
  formError?: string | null
  footer?: ReactNode
}

const DEFAULT_SUBMIT: LocalizedLabel = { sr: 'Sačuvaj', 'sr-Cyrl': 'Сачувај', en: 'Save' }
const CANCEL: LocalizedLabel = { sr: 'Odustani', 'sr-Cyrl': 'Одустани', en: 'Cancel' }
const BACK: LocalizedLabel = { sr: 'Nazad', 'sr-Cyrl': 'Назад', en: 'Back' }
const NEXT: LocalizedLabel = { sr: 'Dalje', 'sr-Cyrl': 'Даље', en: 'Next' }
const REQUIRED: LocalizedLabel = {
  sr: 'Polje je obavezno',
  'sr-Cyrl': 'Поље је обавезно',
  en: 'This field is required',
}
const DRAFT_SAVED: LocalizedLabel = { sr: 'Nacrt sačuvan', 'sr-Cyrl': 'Нацрт сачуван', en: 'Draft saved' }

const DISCARD_TITLE: LocalizedLabel = {
  sr: 'Nesačuvane izmene',
  'sr-Cyrl': 'Несачуване измене',
  en: 'Unsaved changes',
}

const DISCARD_TEXT: LocalizedLabel = {
  sr: 'Uneli ste podatke koji nisu sačuvani. Ako izađete, biće izgubljeni.',
  'sr-Cyrl': 'Унели сте податке који нису сачувани. Ако изађете, биће изгубљени.',
  en: 'You have unsaved data. Leaving now will discard it.',
}

const DISCARD_CONFIRM: LocalizedLabel = { sr: 'Izađi bez čuvanja', 'sr-Cyrl': 'Изађи без чувања', en: 'Discard and leave' }
const STAY: LocalizedLabel = { sr: 'Ostani', 'sr-Cyrl': 'Остани', en: 'Stay' }

export function FormWizard({
  steps,
  defaultValues,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel,
  validationSchema,
  onDraftChange,
  draftDelay = 900,
  draftSavedAt,
  onDirtyChange,
  serverErrors,
  formError,
  footer,
}: FormWizardProps) {
  const { t, formatDate } = useI18n()

  const [active, setActive] = useState(0)
  /* Furthest step reached — jumping backward is allowed, forward is not. */
  const [reached, setReached] = useState(0)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const isLast = active === steps.length - 1
  const activeStep = steps[active]

  const allSchema = useMemo(() => steps.flatMap((step) => step.schema), [steps])
  const allNodes = useMemo(() => collectAllNodes(allSchema), [allSchema])

  /*
  * Default values for ALL fields, even when the application did not provide
  * them.
  *
  * `isDirty` is computed by comparing against `defaultValues`. A field that
  * is not there does not take part in the comparison, so the form stays
  * "clean" even though the user entered something — and then the
  * leave-protection does not work either.
  */
 const initialValues = useMemo(() => {
  const base: Record<string, unknown> = {}
  for (const field of allNodes) {
    if (isLayoutField(field)) continue
    base[field.name] = defaultValues?.[field.name] ?? ''
    }
  return base
  }, [allNodes, defaultValues])

  const scopeValidation = isLast ? validationSchema : activeStep?.validationSchema

  /*
  * Validation scope: the current step, and on the last one, the whole record.
  *
  * Computed inside `useMemo`, not above it: `?? []` would create a new array
  * on every render and thereby break the memoization that depends on it.
  */
  const scopeNodes = useMemo(
    () => collectAllNodes(isLast ? allSchema : (activeStep?.schema ?? [])),
    [isLast, allSchema, activeStep],
  )

  const requiredMessage = t(REQUIRED)

  const resolver = useMemo(
    () => createLiroResolver(scopeNodes, { required: requiredMessage }, scopeValidation),
    [scopeNodes, requiredMessage, scopeValidation],
  )

  const form = useForm<Record<string, unknown>>({
    defaultValues: initialValues,
    mode: 'onTouched',
    resolver,
  })

  /* Conditions are tracked across ALL steps: a field in the third step may
     depend on a value entered in the first. */
  const conditionValues = useConditionValues(allNodes, form)
  useServerErrorSync(serverErrors, allSchema, form)

  /* The subscription to all values exists only when the application saves a draft. */
  const watchedForDraft = useWatch({ control: form.control, disabled: !onDraftChange })

  useEffect(() => {
    if (!onDraftChange) return
    const timer = setTimeout(() => onDraftChange(form.getValues()), draftDelay)
    return () => clearTimeout(timer)
  }, [watchedForDraft, onDraftChange, draftDelay, form])

  /*
  * `dirtyFields` gets populated even when `isDirty` fails, so it serves as a
  * fallback. Both are read during render — RHF builds its subscription based
  * on the fields that were read.
  */
 const { isDirty: formIsDirty, dirtyFields } = form.formState
 const isDirty = formIsDirty || Object.keys(dirtyFields).length > 0

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  /*
   * Protection against closing the tab. Navigation within the application
   * cannot be intercepted from here — only the application's router knows
   * about that, so the state is reported to it through `onDirtyChange`.
   */
  useEffect(() => {
    if (!isDirty || submitting) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, submitting])

  const goNext = async () => {
    const valid = await form.trigger()
    if (!valid) return
    const next = Math.min(active + 1, steps.length - 1)
    setActive(next)
    setReached((current) => Math.max(current, next))
  }

  const handleSubmit = form.handleSubmit(
    async (values) => {
      await onSubmit(buildPayload(allSchema, values, conditionValues))
    },
    (errors) => {
      const bad = steps.findIndex((step) =>
        collectAllNodes(step.schema).some(
          (field) => !isLayoutField(field) && hasErrorAt(errors, field.name),
        ),
      )
      if (bad >= 0 && bad !== active) setActive(bad)
    },
  )

  const rootMessage =
    formError ?? (form.formState.errors as { root?: { message?: string } }).root?.message ?? null

  return (
    <form
      noValidate
      /*
       * Enter in a field moves to the next step instead of submitting the
       * form. Submitting the record on Enter from the first step would be a
       * surprise, not a shortcut.
       */
      onSubmit={
        isLast
          ? handleSubmit
          : (event) => {
              event.preventDefault()
              void goNext()
            }
      }
    >
      <Stack gap="lg">
        <Stepper
          active={active}
          onStepClick={(index) => index <= reached && setActive(index)}
          size="sm"
          allowNextStepsSelect={false}
        >
          {steps.map((step) => (
            <Stepper.Step
              key={step.id}
              label={t(step.label)}
              description={step.description ? t(step.description) : undefined}
            />
          ))}
        </Stepper>

        <Divider />

        {rootMessage && (
          <Group
            gap="xs"
            wrap="nowrap"
            align="flex-start"
            p="sm"
            style={{
              backgroundColor: liroVar.status.danger.bg,
              border: `1px solid ${liroVar.status.danger.border}`,
              borderRadius: 'var(--liro-radius-md)',
              color: liroVar.status.danger.fg,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <Text size="sm">{rootMessage}</Text>
          </Group>
        )}

        {/*
          Fields from all steps stay in the same `useForm`, but only the
          current one is shown. Unmounted fields would lose their value when
          coming back.
        */}
        <Box mih={220}>
          <Stack gap="md">
            <FieldList
              schema={activeStep?.schema ?? []}
              control={form.control}
              conditionValues={conditionValues}
              form={form}
            />
          </Stack>
        </Box>

        {footer}

        <Group justify="space-between" wrap="wrap" gap="sm">
          <Text size="xs" style={{ color: liroVar.text.tertiary }}>
            {draftSavedAt
              ? `${t(DRAFT_SAVED)} · ${formatDate(draftSavedAt, { hour: '2-digit', minute: '2-digit' })}`
              : ''}
          </Text>

          <Group gap="xs">
            {onCancel && (
              <Button
                variant="default"
                type="button"
                onClick={() => (isDirty ? setConfirmingCancel(true) : onCancel())}
                disabled={submitting}
              >
                {t(CANCEL)}
              </Button>
            )}

            {active > 0 && (
              <Button
                variant="default"
                type="button"
                onClick={() => setActive((current) => current - 1)}
                disabled={submitting}
              >
                {t(BACK)}
              </Button>
            )}

            <Button type="submit" loading={submitting}>
              {isLast ? t(submitLabel ?? DEFAULT_SUBMIT) : t(NEXT)}
            </Button>
          </Group>
        </Group>
      </Stack>

      <Modal
        opened={confirmingCancel}
        onClose={() => setConfirmingCancel(false)}
        title={<Text fw={700} size="sm">{t(DISCARD_TITLE)}</Text>}
        size="sm"
        centered
      >
        <Stack gap="md">
          <Text size="sm">{t(DISCARD_TEXT)}</Text>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={() => setConfirmingCancel(false)}>
              {t(STAY)}
            </Button>
            <Button
              color="red"
              onClick={() => {
                setConfirmingCancel(false)
                onCancel?.()
              }}
            >
              {t(DISCARD_CONFIRM)}
            </Button>
          </Group>
        </Stack>
      </Modal>

    </form>
  )
}
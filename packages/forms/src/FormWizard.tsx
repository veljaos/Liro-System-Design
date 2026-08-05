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
 * Jedna forma podeljena na korake, na punoj stranici.
 *
 * Razlika u odnosu na `StepWizard` iz `@liro/ui`: tamo su koraci procesa
 * (potpisi, pa posalji, pa cekaj server), ovde je jedan zapis koji se popunjava
 * u vise navrata. Zato ovde postoji nacrt, cuvanje od izlaska sa nesacuvanim
 * izmenama i povratak na korak u kojem je greska - a tamo ne postoji nista od
 * toga.
 *
 * Tri odluke koje komponenta sprovodi:
 *
 * Dok se ide kroz korake, proverava se samo tekuci. Greska u koraku do kojeg
 * korisnik jos nije stigao nije greska nego jos nepopunjeno polje.
 *
 * Na poslednjem koraku proverava se ceo zapis. Nista ne moze proci
 * neprovereno samo zato sto je korisnik preskocio unazad.
 *
 * Kada provera padne na ranijem koraku, korisnik se vraca tamo. Onemoguceno
 * dugme bez vidljivog razloga je najgori mogucí ishod.
 */

export interface FormWizardStep {
  id: string
  label: LocalizedLabel
  description?: LocalizedLabel
  schema: FieldSchema[]
  /** Delimicna sema koja se proverava pre prelaska dalje. */
  validationSchema?: StandardSchemaV1
}

export interface FormWizardProps {
  steps: FormWizardStep[]
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: LocalizedLabel
  /** Sema celog zapisa; proverava se pre slanja, ne po koraku. */
  validationSchema?: StandardSchemaV1
  /**
   * Poziva se posle prestanka kucanja, sa svim vrednostima.
   *
   * Namerno ne cuva sam: dizajn sistem ne zna da li nacrt ide u Supabase,
   * `localStorage` ili nigde. Kada prop nije prosledjen, forma se ne
   * pretplacuje na promene i ne placa nista.
   */
  onDraftChange?: (values: Record<string, unknown>) => void
  /** Zadrska u milisekundama pre cuvanja nacrta. */
  draftDelay?: number
  /** Vreme poslednjeg sacuvanog nacrta; prikazuje se u podnozju. */
  draftSavedAt?: Date | null
  /** Javlja da forma ima nesacuvane izmene - za cuvanje rute u aplikaciji. */
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
  /* Najdalji dosegnut korak - unazad se sme skakati, unapred ne. */
  const [reached, setReached] = useState(0)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const isLast = active === steps.length - 1
  const activeStep = steps[active]

  const allSchema = useMemo(() => steps.flatMap((step) => step.schema), [steps])
  const allNodes = useMemo(() => collectAllNodes(allSchema), [allSchema])

  /*
  * Podrazumevane vrednosti za SVA polja, i kad ih aplikacija nije dala.
  *
  * `isDirty` se racuna poredjenjem sa `defaultValues`. Polje koje tamo ne
  * postoji ne ucestvuje u poredjenju, pa forma ostaje "cista" iako je
  * korisnik nesto uneo - a onda ni cuvanje od izlaska ne radi.
  */
 const initialValues = useMemo(() => {
  const base: Record<string, unknown> = {}
  for (const field of allNodes) {
    if (isLayoutField(field)) continue
    base[field.name] = defaultValues?.[field.name] ?? ''
    }
  return base
  }, [allNodes, defaultValues])


  /* Opseg provere: tekuci korak, a na poslednjem ceo zapis. */
  const scopeSchema = isLast ? allSchema : (activeStep?.schema ?? [])
  const scopeValidation = isLast ? validationSchema : activeStep?.validationSchema

  const scopeNodes = useMemo(() => collectAllNodes(scopeSchema), [scopeSchema])
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

  /* Uslovi se prate nad SVIM koracima: polje u trecem koraku sme da zavisi od
     vrednosti unete u prvom. */
  const conditionValues = useConditionValues(allNodes, form)
  useServerErrorSync(serverErrors, allSchema, form)

  /* Pretplata na sve vrednosti postoji samo kada aplikacija cuva nacrt. */
  const watchedForDraft = useWatch({ control: form.control, disabled: !onDraftChange })

  useEffect(() => {
    if (!onDraftChange) return
    const timer = setTimeout(() => onDraftChange(form.getValues()), draftDelay)
    return () => clearTimeout(timer)
  }, [watchedForDraft, onDraftChange, draftDelay, form])

  /*
  * `dirtyFields` se puni i kada `isDirty` zakaze, pa sluzi kao rezerva.
  * Oba se citaju u renderu - RHF pretplatu pravi na osnovu procitanih polja.
  */
 const { isDirty: formIsDirty, dirtyFields } = form.formState
 const isDirty = formIsDirty || Object.keys(dirtyFields).length > 0

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  /*
   * Cuvanje od zatvaranja kartice. Kretanje unutar aplikacije se ne moze
   * presresti odavde - to zna samo ruter aplikacije, pa mu se stanje javlja
   * kroz `onDirtyChange`.
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
       * Enter u polju pomera na sledeci korak umesto da salje formu. Slanje
       * zapisa na Enter iz prvog koraka bi bilo iznenadjenje, ne precica.
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
          Polja svih koraka ostaju u istom `useForm`, ali se prikazuje samo
          tekuci. Odmontirana polja bi izgubila vrednost pri povratku.
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
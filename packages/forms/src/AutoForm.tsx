'use client'

import { Button, Collapse, Divider, Group, SimpleGrid, Stack, Tabs, Text, UnstyledButton } from '@mantine/core'
import { useForm, type Control, type UseFormReturn } from 'react-hook-form'
import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import type { FieldError } from '@liro/data'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { liroVar } from '@liro/tokens'
import { FormField } from './FormField'
import { collectAllNodes, type FieldSchema } from './types'
import { buildPayload, useConditionValues, useServerErrorSync } from './formEngine'
import { createLiroResolver, type StandardSchemaV1 } from './validation'

export interface AutoFormProps {
  schema: FieldSchema[]
  /** Filled in means an edit, empty means a new entry. */
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: LocalizedLabel
  cancelLabel?: LocalizedLabel
  /** Extra content between the fields and the buttons. */
  footer?: ReactNode
  /** Hides the button bar — when the form lives in a modal with its own footer. */
  withoutActions?: boolean
  /**
   * Errors returned by the server, by field.
   *
   * Client-side validation is never complete: PIB uniqueness, rules only the
   * database knows, checks on another system. When the server says which
   * field is wrong, the error must sit next to that field — a general message
   * at the top does not connect to the input and the user has to hunt for
   * their mistake.
   *
   * Passed in from `fieldErrorsOf(error)` in `@liro/data`.
   */
  serverErrors?: FieldError[]
  /** Message that applies to the whole record, not to a single field. */
  formError?: string | null
  /**
   * Schema for the whole record — Zod, Valibot, or anything that implements
   * Standard Schema.
   *
   * Rules from `FieldSchema` (`required`, `validate`) still apply and run
   * BEFORE the schema, so existing forms keep working unchanged. The schema
   * adds what a single field cannot know on its own: relationships between
   * fields and rules shared with the server.
   *
   * An error with no path applies to the whole record and is shown in the bar
   * at the top.
   */
  validationSchema?: StandardSchemaV1
}

const DEFAULT_SUBMIT: LocalizedLabel = { sr: 'Sačuvaj', 'sr-Cyrl': 'Сачувај', en: 'Save' }
const DEFAULT_CANCEL: LocalizedLabel = { sr: 'Odustani', 'sr-Cyrl': 'Одустани', en: 'Cancel' }

/**
 * A form described by a schema.
 *
 * Values are read through `useWatch` only where a field genuinely depends on
 * another. Watching the whole form on every change is the most common reason
 * a form with forty fields starts lagging behind typing.
 */
export function AutoForm({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel,
  cancelLabel,
  footer,
  withoutActions = false,
  serverErrors,
  formError,
  validationSchema,
}: AutoFormProps) {
  const { t } = useI18n()

  /*
   * Conditions are, as a rule, tracked precisely — `conditionFields` says
   * which fields `condition` reads, so the form does not re-render on every
   * keystroke. If a field has `condition` without `conditionFields`, we
   * cannot guess what it reads, so the whole form is watched. It works
   * correctly, just slower — that is why `conditionFields` is worth
   * specifying on large forms.
   */
  const nodes = useMemo(() => collectAllNodes(schema), [schema])

  const requiredMessage = t({
    sr: 'Polje je obavezno',
    'sr-Cyrl': 'Поље је обавезно',
    en: 'This field is required',
  })

  /*
  * When RHF is given a `resolver`, it skips `required` and `validate` from
  * `register`. That is why the adapter runs them itself — without this, every
  * existing form would silently stop checking for required fields.
  */
 const resolver = useMemo(
  () => createLiroResolver(nodes, { required: requiredMessage }, validationSchema),
  [nodes, requiredMessage, validationSchema],
)

const form = useForm<Record<string, unknown>>({
  defaultValues: defaultValues ?? {},
  mode: 'onTouched',
  resolver,
})

const conditionValues = useConditionValues(nodes, form)
useServerErrorSync(serverErrors, schema, form)

  const handleSubmit = form.handleSubmit(async (values) => {
   await onSubmit(buildPayload(schema, values, conditionValues))
  })

  /* A schema error with no path and a server error share the same bar — the
  user does not care where it came from. */

  /*
  * `root` is not a declared field in `FieldErrors<Record<string, unknown>>`,
  * so it is read through a narrow local type instead of `as string`.
  */
 const schemaRootMessage = (form.formState.errors as { root?: { message?: string } }).root?.message
 const rootMessage = formError ?? schemaRootMessage ?? null

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="md">
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

        <FieldList schema={schema} control={form.control} conditionValues={conditionValues} form={form} />

        {footer}

        {!withoutActions && (
          <Group justify="flex-end" mt="sm">
            {onCancel && (
              <Button variant="default" onClick={onCancel} disabled={submitting} type="button">
                {t(cancelLabel ?? DEFAULT_CANCEL)}
              </Button>
            )}
            <Button type="submit" loading={submitting}>
              {t(submitLabel ?? DEFAULT_SUBMIT)}
            </Button>
          </Group>
        )}
      </Stack>
    </form>
  )
}

/**
 * Collapsible section.
 *
 * Closed by default: fields that are rarely touched should not take up
 * screen space, but they must be one click away.
 */
function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title?: LocalizedLabel
  defaultOpen?: boolean
  children: ReactNode
}) {
  const { t } = useI18n()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Stack gap="xs">
      <UnstyledButton
        onClick={() => setOpen((state) => !state)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: liroVar.text.secondary }}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Text size="sm" fw={600}>{t(title)}</Text>
      </UnstyledButton>
      <Divider mt={-4} />
      <Collapse expanded={open}>
        <Stack gap="md" pt="xs">{children}</Stack>
      </Collapse>
    </Stack>
  )
}

interface FieldListProps {
  schema: FieldSchema[]
  control: Control<Record<string, unknown>>
  conditionValues: Record<string, unknown>
  form: UseFormReturn<Record<string, unknown>>
}

export function FieldList({ schema, control, conditionValues, form }: FieldListProps) {
  const { t } = useI18n()

  return (
    <>
      {schema.map((field) => {
        if (field.condition && !field.condition(conditionValues)) return null

        if (field.type === 'row') {
          const children = field.fields ?? []
          return (
            <SimpleGrid key={field.name} cols={{ base: 1, sm: children.length || 1 }} spacing="md">
              <FieldList schema={children} control={control} conditionValues={conditionValues} form={form} />
            </SimpleGrid>
          )
        }

        if (field.type === 'section') {
          const body = (
            <FieldList
              schema={field.fields ?? []}
              control={control}
              conditionValues={conditionValues}
              form={form}
            />
          )

          if (field.collapsible) {
            return (
              <CollapsibleSection key={field.name} title={field.title} defaultOpen={field.defaultOpen}>
                {body}
              </CollapsibleSection>
            )
          }

          return (
            <Stack key={field.name} gap="md">
              {field.title && (
                <>
                  <Text size="sm" fw={600} style={{ color: liroVar.text.secondary }}>
                    {t(field.title)}
                  </Text>
                  <Divider mt={-8} />
                </>
              )}
              {body}
            </Stack>
          )
        }

        if (field.type === 'tabs') {
          const tabs = field.tabs ?? []
          if (tabs.length === 0) return null
          return (
            <Tabs key={field.name} defaultValue="0" radius="md">
              <Tabs.List mb="md">
                {tabs.map((tab, index) => (
                  <Tabs.Tab key={index} value={String(index)}>
                    {t(tab.label)}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
              {tabs.map((tab, index) => (
                <Tabs.Panel key={index} value={String(index)}>
                  <Stack gap="md">
                    <FieldList
                      schema={tab.fields}
                      control={control}
                      conditionValues={conditionValues}
                      form={form}
                    />
                  </Stack>
                </Tabs.Panel>
              ))}
            </Tabs>
          )
        }

        return <FormField key={field.name} field={field} control={control} />
      })}
    </>
  )
}
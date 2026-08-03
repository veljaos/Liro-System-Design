'use client'

import { Button, Divider, Group, SimpleGrid, Stack, Tabs, Text } from '@mantine/core'
import { useForm, useWatch, type Control, type UseFormReturn } from 'react-hook-form'
import { useEffect, useMemo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { liroVar } from '@liro/tokens'
import { FormField } from './FormField'
import { collectAllNodes, flattenFields, type FieldSchema } from './types'

export interface AutoFormProps {
  schema: FieldSchema[]
  /** Popunjeno znaci izmena, prazno znaci nov unos. */
  defaultValues?: Record<string, unknown>
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: LocalizedLabel
  cancelLabel?: LocalizedLabel
  /** Dodatni sadrzaj izmedju polja i dugmadi. */
  footer?: ReactNode
  /** Sakriva traku sa dugmadima - kada forma zivi u modalu sa svojim podnozjem. */
  withoutActions?: boolean
  /**
   * Greske koje je vratio server, po polju.
   *
   * Klijentska validacija nikada nije potpuna: jedinstvenost PIB-a, pravila
   * koja zna samo baza, provere na drugom sistemu. Kada server kaze koje polje
   * ne valja, greska mora da stoji uz to polje - opsta poruka na vrhu se ne
   * povezuje sa unosom i korisnik trazi gde je pogresio.
   *
   * Prosledjuje se iz `fieldErrorsOf(error)` iz `@liro/data`.
   */
  serverErrors?: { field: string; message: string }[]
  /** Poruka koja se odnosi na ceo zapis, ne na jedno polje. */
  formError?: string | null
}

const DEFAULT_SUBMIT: LocalizedLabel = { sr: 'Sačuvaj', 'sr-Cyrl': 'Сачувај', en: 'Save' }
const DEFAULT_CANCEL: LocalizedLabel = { sr: 'Odustani', 'sr-Cyrl': 'Одустани', en: 'Cancel' }

/**
 * Forma opisana šemom.
 *
 * Vrednosti se citaju kroz `useWatch` samo tamo gde neko polje zaista zavisi
 * od drugog. Pracenje cele forme na svaku promenu je najcesci razlog zbog
 * kojeg formular sa cetrdeset polja pocne da kasni za kucanjem.
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
}: AutoFormProps) {
  const { t } = useI18n()

  const form = useForm<Record<string, unknown>>({
    defaultValues: defaultValues ?? {},
    mode: 'onTouched',
  })

  /*
   * Uslovi se po pravilu prate ciljano - `conditionFields` kaze koja polja
   * `condition` cita, pa se forma ne prerenderuje na svaki pritisak tastera.
   * Ako neko polje ima `condition` bez `conditionFields`, ne mozemo da
   * pogodimo sta cita, pa pratimo celu formu. Radi ispravno, samo sporije -
   * zato `conditionFields` vredi navesti na velikim formama.
   */
  const nodes = useMemo(() => collectAllNodes(schema), [schema])

  const needsFullWatch = useMemo(
    () => nodes.some((field) => field.condition && !field.conditionFields?.length),
    [nodes],
  )

  const conditionFields = useMemo(() => {
    const names = new Set<string>()
    for (const field of nodes) {
      for (const name of field.conditionFields ?? []) names.add(name)
    }
    return [...names]
  }, [nodes])

  const allValues = useWatch({ control: form.control, disabled: !needsFullWatch })

  const watched = useWatch({
    control: form.control,
    name: conditionFields.length > 0 ? conditionFields : ['__liro_no_conditions__'],
    disabled: needsFullWatch || conditionFields.length === 0,
  })

  const conditionValues = useMemo(() => {
    if (needsFullWatch) return (allValues ?? {}) as Record<string, unknown>
    const values: Record<string, unknown> = {}
    conditionFields.forEach((name, index) => {
      values[name] = (watched as unknown[])?.[index]
    })
    return values
  }, [needsFullWatch, allValues, conditionFields, watched])

  /*
   * Greske sa servera se upisuju u stanje forme, a ne prikazuju posebno.
   * Time se ponasaju isto kao lokalne: nestaju kada korisnik ispravi polje i
   * blokiraju ponovno slanje dok stoje.
   */
  useEffect(() => {
    if (!serverErrors?.length) return
    const known = new Set(flattenFields(schema).map((field) => field.name))
    for (const error of serverErrors) {
      if (known.has(error.field)) {
        form.setError(error.field, { type: 'server', message: error.message })
      }
    }
    /* Fokusiramo prvo pogodjeno polje - na formi sa cetrdeset polja greska
       ispod pregiba se inace ne primeti. */
    const first = serverErrors.find((error) => known.has(error.field))
    if (first) form.setFocus(first.field)
  }, [serverErrors, schema, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    /* Polja koja su sakrivena uslovom ne treba da putuju u bazu - inace se
       cuva vrednost koju korisnik nije ni video. */
    const visible = new Set(
      flattenFields(schema)
        .filter((field) => !field.condition || field.condition(conditionValues))
        .filter((field) => !field.readOnly)
        .map((field) => field.name),
    )

    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(values)) {
      if (visible.has(key)) payload[key] = value
    }

    await onSubmit(payload)
  })

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Stack gap="md">
        {formError && (
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
            <Text size="sm">{formError}</Text>
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

interface FieldListProps {
  schema: FieldSchema[]
  control: Control<Record<string, unknown>>
  conditionValues: Record<string, unknown>
  form: UseFormReturn<Record<string, unknown>>
}

function FieldList({ schema, control, conditionValues, form }: FieldListProps) {
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
              <FieldList
                schema={field.fields ?? []}
                control={control}
                conditionValues={conditionValues}
                form={form}
              />
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

'use client'

import { Button, Collapse, Divider, Group, SimpleGrid, Stack, Tabs, Text, UnstyledButton } from '@mantine/core'
import { useForm, useWatch, type Control, type UseFormReturn } from 'react-hook-form'
import { useMemo, useState, type ReactNode } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'
import { liroVar } from '@liro/tokens'
import { FormField } from './FormField'
import { collectAllNodes, type FieldSchema } from './types'
import { buildPayload, useConditionValues, useServerErrorSync } from './formEngine'
import { createLiroResolver, type StandardSchemaV1 } from './validation'

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
  /**
   * Sema celog zapisa - Zod, Valibot ili bilo sta sto implementira Standard
   * Schema.
   * 
   * Pravila iz `FieldSchema` (`required`, `validate`) i dalje vaze i izvrsavaju
   * se PRE seme, pa postojece forme rade nepromenjeno. Sema dodaje ono sto
   * polje samo ne moze da zna: odnose izmedju polja i pravila koja se dele sa
   * serverom.
   * 
   * Greska bez putanje odnosi se na ceo zapis i prikazuje se u traci na vrhu.
   */
  validationSchema?: StandardSchemaV1
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
  validationSchema,
}: AutoFormProps) {
  const { t } = useI18n()

  /*
   * Uslovi se po pravilu prate ciljano - `conditionFields` kaze koja polja
   * `condition` cita, pa se forma ne prerenderuje na svaki pritisak tastera.
   * Ako neko polje ima `condition` bez `conditionFields`, ne mozemo da
   * pogodimo sta cita, pa pratimo celu formu. Radi ispravno, samo sporije -
   * zato `conditionFields` vredi navesti na velikim formama.
   */
  const nodes = useMemo(() => collectAllNodes(schema), [schema])

  const requiredMessage = t({
    sr: 'Polje je obavezno',
    'sr-Cyrl': 'Поље је обавезно',
    en: 'This field is required',
  })

  /*
  * Kada RHF dobije `resolver`, on preskace `required` i `validate` iz
  * `register`. Zato ih adapter sam izvrsava - bez toga bi svaka postojeca
  * forma tiho prestala da proverava obaveznost.
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

  /* Greska iz seme bez putanje i greska sa servera dele istu traku - korisniku
  je svejedno odakle je stigla. */
 
  /*
  * `root` nije deklarisano polje u `FieldErrors<Record<string, unknown>>`,
  * pa se cita kroz uzak lokalni tip umesto kroz `as string`.
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
 * Sklopiva sekcija.
 *
 * Podrazumevano zatvorena: polja koja se retko diraju ne treba da zauzimaju
 * ekran, ali moraju biti nadohvat jednog klika.
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

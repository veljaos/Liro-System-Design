'use client'

import { useEffect, useMemo } from 'react'
import { useWatch, type UseFormReturn } from 'react-hook-form'
import type { FieldError } from '@liro/data'
import { resolveFieldError, useI18n } from '@liro/i18n'
import { collectAllNodes, flattenFields, type FieldSchema } from './types'

/**
 * Parts that `AutoForm` and `FormWizard` share.
 *
 * Extracted before the second consumer appeared, not after: two copies of
 * this logic would drift apart the first time someone fixed only one.
 */

/**
 * Values that `condition` functions read.
 *
 * Tracked precisely — `conditionFields` says which fields `condition` reads,
 * so the form does not re-render on every keystroke. If a field has
 * `condition` without `conditionFields`, we cannot guess what it reads, so
 * the whole form is watched. It works correctly, just slower — that is why
 * `conditionFields` is worth specifying on large forms.
 */
export function useConditionValues(
  nodes: FieldSchema[],
  form: UseFormReturn<Record<string, unknown>>,
): Record<string, unknown> {
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

  return useMemo(() => {
    if (needsFullWatch) return (allValues ?? {}) as Record<string, unknown>
    const values: Record<string, unknown> = {}
    conditionFields.forEach((name, index) => {
      values[name] = (watched as unknown[])?.[index]
    })
    return values
  }, [needsFullWatch, allValues, conditionFields, watched])
}

/**
 * Writes server errors into the form's state.
 *
 * They are not shown separately but behave the same as local ones: they
 * disappear when the user fixes the field, and block resubmission while
 * they stand.
 */
export function useServerErrorSync(
  serverErrors: FieldError[] | undefined,
  schema: FieldSchema[],
  form: UseFormReturn<Record<string, unknown>>,
): void {
  const { locale } = useI18n()

  useEffect(() => {
    if (!serverErrors?.length) return
    const known = new Set(flattenFields(schema).map((field) => field.name))
    for (const error of serverErrors) {
      if (known.has(error.field)) {
        /*
         * Translated here, not by the caller.
         *
         * The message ends up inside React Hook Form's own state, so it must be
         * finished text by this point. Leaving it to the caller would be thirty
         * screens each deciding how to turn a code into a sentence.
         */
        form.setError(error.field, {
          type: 'server',
          message: resolveFieldError(error, locale),
        })
      }
    }
    /* We focus the first affected field — on a form with forty fields, an
       error below the fold otherwise goes unnoticed. */
    const first = serverErrors.find((error) => known.has(error.field))
    if (first) form.setFocus(first.field)
  }, [serverErrors, schema, form, locale])
}

/**
 * Values ready to submit.
 *
 * Fields hidden by a condition should not travel to the database — otherwise
 * a value the user never even saw gets saved.
 */
export function buildPayload(
  schema: FieldSchema[],
  values: Record<string, unknown>,
  conditionValues: Record<string, unknown>,
): Record<string, unknown> {
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
  return payload
}

/** Whether an error exists at a dotted path (`adresa.grad`). */
export function hasErrorAt(errors: unknown, path: string): boolean {
  let node: unknown = errors
  for (const part of path.split('.')) {
    if (typeof node !== 'object' || node === null) return false
    node = (node as Record<string, unknown>)[part]
  }
  return node !== undefined
}

export { collectAllNodes }
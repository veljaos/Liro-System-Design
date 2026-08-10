import type { FieldErrors, Resolver } from 'react-hook-form'
import { isLayoutField, type FieldSchema } from './types'

/**
 * Whole-record-level validation.
 *
 * Deliberately without Zod in the dependencies. `StandardSchemaV1` is the
 * shared signature that Zod 4, Valibot, and ArkType already implement, so the
 * application brings its own validator, and the design system does not know
 * which one it is.
 *
 * The value is not that the form validates more, but that the same schema can
 * run in both an API route and a test. The rule "PIB has nine digits" then
 * exists in one place, not three.
 */

interface StandardIssue {
  readonly message: string
  readonly path?: readonly (PropertyKey | { readonly key: PropertyKey })[] | undefined
}

type StandardResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: readonly StandardIssue[] }

export interface StandardSchemaV1<Output = unknown> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>
  }
}

/** Messages the adapter uses when a field does not have its own. */
export interface ValidationMessages {
  required: string
}

/**
 * Empty is: `null`, `undefined`, an empty string, an empty array, `false`.
 *
 * `false` is on the list because a required checkbox field means "must be
 * checked". `0` is NOT on it — zero is a value, not the absence of a value,
 * and that is a distinction that constantly matters in bookkeeping.
 */
function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (typeof value === 'boolean') return value === false
  if (Array.isArray(value)) return value.length === 0
  return false
}

function pathToName(path: StandardIssue['path']): string {
  if (!path || path.length === 0) return ''
  return path
    .map((segment) =>
      typeof segment === 'object' && segment !== null && 'key' in segment ? segment.key : segment,
    )
    .join('.')
}

/**
 * Writes an error at a dotted path.
 *
 * `adresa.grad` must become `{ adresa: { grad: … } }` — React Hook Form reads
 * errors nested, not by a flat key with a dot.
 *
 * The first error per field wins: rules from `FieldSchema` run before the
 * schema, so the user gets "This field is required" instead of the message
 * Zod composed on its own.
 */
function assignError(
  target: Record<string, unknown>,
  path: string,
  error: { type: string; message: string },
): void {
  const parts = path.split('.')
  let node = target

  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = parts[index]!
    const next = node[key]
    if (typeof next !== 'object' || next === null) node[key] = {}
    node = node[key] as Record<string, unknown>
  }

  const last = parts[parts.length - 1]!
  if (node[last] === undefined) node[last] = error
}

export function createLiroResolver(
  fields: FieldSchema[],
  messages: ValidationMessages,
  schema?: StandardSchemaV1,
): Resolver<Record<string, unknown>> {
  return async (values) => {
    const errors: Record<string, unknown> = {}

    /* 1. Rules from the field schema. These run first because their messages are more readable. */
    for (const field of fields) {
      if (isLayoutField(field)) continue
      /* A hidden field is not validated — otherwise the form would demand
         input in a field the user cannot see and has no way to fill in. */
      if (field.condition && !field.condition(values)) continue

      const value = values[field.name]

      if (field.required && isEmpty(value)) {
        assignError(errors, field.name, { type: 'required', message: messages.required })
        continue
      }

      if (field.validate) {
        const result = field.validate(value, values)
        if (result !== true) {
          assignError(errors, field.name, { type: 'validate', message: result })
        }
      }
    }

    /* 2. Whole-record schema — rules between fields and everything a single field cannot see. */
    if (schema) {
      const result = await schema['~standard'].validate(values)
      if (result.issues) {
        for (const issue of result.issues) {
          const name = pathToName(issue.path)
          /*
           * An error with no path applies to the whole record ("the period
           * overlaps an existing one"). RHF has `root` for that, and
           * `AutoForm` shows it in the same bar as server errors.
           */
          assignError(errors, name || 'root', { type: 'schema', message: issue.message })
        }
      }
    }

    /*
    * Two separate returns, not one with a ternary: `ResolverResult` is a
    * union of two shapes, so TypeScript must see which one is returned.
    */
   if (Object.keys(errors).length > 0) {
    /* When there are errors, RHF expects empty values — `onSubmit` is not called. */
    return { values: {}, errors: errors as unknown as FieldErrors<Record<string, unknown>> }
  }

  return { values, errors: {} }

  }
}
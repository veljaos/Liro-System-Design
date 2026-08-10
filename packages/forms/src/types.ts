import type { ReactNode } from 'react'
import type { LocalizedLabel, Locale } from '@liro/i18n'
import type { FilterValue } from '@liro/data'

/**
 * A form described as data.
 *
 * The reason is the same as with tables: an employee entry screen has about
 * forty fields, and writing them by hand means forty chances for spacing,
 * size, or error display to differ from the neighboring screen. The schema
 * reduces that to one array that can be read, tested, and generated.
 */

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'switch'
  | 'relation'
  | 'multi-relation'
  | 'localized-text'
  | 'upload'
  | 'custom'
  /** Layouts — have no value of their own. */
  | 'row'
  | 'section'
  | 'tabs'

export interface FieldOption {
  value: string
  label: LocalizedLabel
  disabled?: boolean
}

export interface RelationConfig {
  /** Table or view the values are picked from. */
  resource: string
  /** Column shown to the user. */
  labelField: string
  /** Column that gets saved; defaults to `id`. */
  valueField?: string
  select?: string
  /** Columns the dropdown search runs over. */
  searchFields?: string[]
  /** Fixed filters — e.g. only active partners. */
  filters?: Record<string, FilterValue | undefined>
  /**
   * Ties the list to another field's value: when `field` changes, the list
   * is filtered by `column`. Typically client -> its branches.
   */
  dependsOn?: { field: string; column: string }
  /** When the label needs to combine multiple columns, e.g. "PIB - Name". */
  format?: (row: Record<string, unknown>) => string
}

export interface NumberConfig {
  min?: number
  max?: number
  step?: number
  decimalScale?: number
  prefix?: string
  suffix?: string
  /** Separates thousands — enabled by default for `currency`. */
  thousandSeparator?: boolean
}

export interface UploadConfig {
  bucket?: string
  folder?: string
  /** MIME types or extensions, e.g. `application/pdf,.docx`. */
  accept?: string
  /** Maximum allowed size in bytes. */
  maxSize?: number
}

export interface TabConfig {
  label: LocalizedLabel
  fields: FieldSchema[]
}

export interface FieldSchema {
  /** Key in the form data. For layouts it only serves as the React key. */
  name: string
  type: FieldType
  label?: LocalizedLabel
  /** Helper text below the field. */
  description?: LocalizedLabel
  placeholder?: LocalizedLabel
  required?: boolean
  disabled?: boolean
  /** The value is shown but not sent when saving. */
  readOnly?: boolean

  options?: FieldOption[]
  relation?: RelationConfig
  number?: NumberConfig
  upload?: UploadConfig
  /** Number of rows for `textarea`. */
  rows?: number
  /** Languages `localized-text` shows; defaults to all three. */
  locales?: Locale[]

  /** Fields inside `row` and `section`. */
  fields?: FieldSchema[]
  tabs?: TabConfig[]
  /** Title of a `section` layout. */
  title?: LocalizedLabel
  /**
   * The section can be collapsed; closed by default.
   *
   * Used to keep five to seven fields on screen, with the rest under
   * "Advanced options". The number of visible choices directly lengthens
   * decision time, so hiding rarely used fields is a gain, not a loss.
   */
  collapsible?: boolean
  /** When `true`, the collapsible section is open on first display. */
  defaultOpen?: boolean

  /**
   * Shows the field only when the condition holds. Receives the current
   * values of the whole form. A hidden field does not take part in the
   * required check.
   */
  condition?: (values: Record<string, unknown>) => boolean
  /**
   * Fields that `condition` reads. Without this, the form would have to
   * watch every change of every field, which noticeably slows down input on
   * large forms.
   */
  conditionFields?: string[]

  /** Extra validation; return `true` or an error message. */
  validate?: (value: unknown, values: Record<string, unknown>) => true | string

  /** How many columns the field occupies within a `row`. */
  span?: number

  /** For `type: 'custom'` — full control over the display. */
  render?: (props: CustomFieldProps) => ReactNode
}

export interface CustomFieldProps {
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  error?: string
  disabled?: boolean
}

/** All schema nodes, including layouts — for collecting conditions. */
export function collectAllNodes(schema: FieldSchema[]): FieldSchema[] {
  const out: FieldSchema[] = []
  for (const field of schema) {
    out.push(field)
    if (field.type === 'tabs') {
      for (const tab of field.tabs ?? []) out.push(...collectAllNodes(tab.fields))
    } else if (field.fields) {
      out.push(...collectAllNodes(field.fields))
    }
  }
  return out
}

/** Fields that carry a value — as opposed to layouts. */
export const LAYOUT_TYPES: FieldType[] = ['row', 'section', 'tabs']

export function isLayoutField(field: FieldSchema): boolean {
  return LAYOUT_TYPES.includes(field.type)
}

/** Flat list of all fields with a value, including nested ones. */
export function flattenFields(schema: FieldSchema[]): FieldSchema[] {
  const out: FieldSchema[] = []
  for (const field of schema) {
    if (field.type === 'tabs') {
      for (const tab of field.tabs ?? []) out.push(...flattenFields(tab.fields))
    } else if (isLayoutField(field)) {
      out.push(...flattenFields(field.fields ?? []))
    } else {
      out.push(field)
    }
  }
  return out
}

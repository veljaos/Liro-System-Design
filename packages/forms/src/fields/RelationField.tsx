'use client'

import { useMemo, useState } from 'react'
import { Select, MultiSelect } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useResourceList } from '@liro/data'
import { useI18n, type TranslationKey } from '@liro/i18n'
import type { RelationConfig } from '../types'

const SELECT_PREVIOUS_FIRST: TranslationKey = 'forms.relation.selectPreviousFirst'
const LOADING: TranslationKey = 'forms.relation.loading'
const NO_RESULTS: TranslationKey = 'forms.relation.noResults'

interface RelationFieldProps {
  relation: RelationConfig
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  error?: string
  multiple?: boolean
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  onBlur: () => void
  /** Value of the field this list depends on (`relation.dependsOn`). */
  dependencyValue?: unknown
}

const PAGE_SIZE = 50

/**
 * A dropdown that fetches values through `DataProvider`.
 *
 * Search goes to the server, not through a loaded array. The partner
 * register in Liro has thousands of rows; fetching all of them when the form
 * opens is both slow and unnecessary.
 */
export function RelationField({
  relation,
  label,
  placeholder,
  description,
  required,
  disabled,
  error,
  multiple = false,
  value,
  onChange,
  onBlur,
  dependencyValue,
}: RelationFieldProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebouncedValue(search, 300)

  const valueField = relation.valueField ?? 'id'
  const blockedByDependency =
    Boolean(relation.dependsOn) && (dependencyValue === undefined || dependencyValue === null || dependencyValue === '')

  const filters = useMemo(() => {
    const base = { ...(relation.filters ?? {}) }
    if (relation.dependsOn && dependencyValue) {
      base[relation.dependsOn.column] = dependencyValue as string
    }
    return base
  }, [relation.filters, relation.dependsOn, dependencyValue])

  const { data, isLoading } = useResourceList<Record<string, unknown>>(
    relation.resource,
    {
      page: 1,
      pageSize: PAGE_SIZE,
      search: debouncedSearch || undefined,
      searchFields: relation.searchFields ?? [relation.labelField],
      filters,
      select: relation.select,
      sort: { field: relation.labelField, order: 'asc' },
    },
    { enabled: !blockedByDependency },
  )

  const options = useMemo(
    () =>
      (data?.rows ?? []).map((row) => ({
        value: String(row[valueField]),
        label: relation.format ? relation.format(row) : String(row[relation.labelField] ?? ''),
      })),
    [data, valueField, relation],
  )

  const shared = {
    label,
    placeholder: blockedByDependency ? t(SELECT_PREVIOUS_FIRST) : placeholder,
    description,
    withAsterisk: required,
    disabled: disabled || blockedByDependency,
    error,
    searchable: true,
    searchValue: search,
    onSearchChange: setSearch,
    nothingFoundMessage: isLoading ? t(LOADING) : t(NO_RESULTS),
    data: options,
    onBlur,
    comboboxProps: { withinPortal: true },
  }

  if (multiple) {
    return (
      <MultiSelect
        {...shared}
        value={Array.isArray(value) ? value : []}
        onChange={(next) => onChange(next)}
        clearable
      />
    )
  }

  return (
    <Select
      {...shared}
      value={typeof value === 'string' ? value : null}
      onChange={(next) => onChange(next)}
      clearable={!required}
    />
  )
}

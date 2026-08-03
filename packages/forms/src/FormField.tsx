'use client'

import { Checkbox, MultiSelect, NumberInput, PasswordInput, Select, Switch, Textarea, TextInput } from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { Controller, useWatch, type Control } from 'react-hook-form'
import { useI18n } from '@liro/i18n'
import type { FieldSchema } from './types'
import { parseSerbianDate } from './date'
import { RelationField } from './fields/RelationField'
import { LocalizedTextField } from './fields/LocalizedTextField'
import { UploadField } from './fields/UploadField'

interface FormFieldProps {
  field: FieldSchema
  control: Control<Record<string, unknown>>
}

/**
 * Prevodi jedno polje šeme u Mantine kontrolu.
 *
 * Sva polja idu kroz `Controller` iz react-hook-form-a, pa se ponasanje
 * (dodir, greska, resetovanje) ne razlikuje od tipa do tipa.
 */
export function FormField({ field, control }: FormFieldProps) {
  const { t } = useI18n()

  const dependencyName = field.relation?.dependsOn?.field
  const dependencyValue = useWatch({
    control,
    name: dependencyName ?? '__liro_no_dependency__',
    disabled: !dependencyName,
  })

  const label = t(field.label)
  const description = t(field.description) || undefined
  const placeholder = t(field.placeholder) || undefined

  return (
    <Controller
      control={control}
      name={field.name}
      rules={{
        required: field.required
          ? t({ sr: 'Polje je obavezno', 'sr-Cyrl': 'Поље је обавезно', en: 'This field is required' })
          : false,
        validate: field.validate
          ? (value, values) => field.validate!(value, values as Record<string, unknown>)
          : undefined,
      }}
      render={({ field: control_, fieldState }) => {
        const error = fieldState.error?.message
        const disabled = field.disabled || field.readOnly
        const shared = {
          label,
          description,
          placeholder,
          withAsterisk: field.required,
          disabled,
          error,
          onBlur: control_.onBlur,
        }

        switch (field.type) {
          case 'textarea':
            return (
              <Textarea
                {...shared}
                value={(control_.value as string) ?? ''}
                onChange={(event) => control_.onChange(event.currentTarget.value)}
                autosize
                minRows={field.rows ?? 3}
              />
            )

          case 'password':
            return (
              <PasswordInput
                {...shared}
                value={(control_.value as string) ?? ''}
                onChange={(event) => control_.onChange(event.currentTarget.value)}
              />
            )

          case 'number':
          case 'currency':
            return (
              <NumberInput
                {...shared}
                value={(control_.value as number | string) ?? ''}
                onChange={(value) => control_.onChange(value === '' ? null : value)}
                min={field.number?.min}
                max={field.number?.max}
                step={field.number?.step}
                decimalScale={field.number?.decimalScale ?? (field.type === 'currency' ? 2 : undefined)}
                fixedDecimalScale={field.type === 'currency'}
                thousandSeparator={
                  (field.number?.thousandSeparator ?? field.type === 'currency') ? '.' : undefined
                }
                decimalSeparator=","
                prefix={field.number?.prefix}
                suffix={field.number?.suffix}
              />
            )

          case 'date':
            return (
              <DateInput
                {...shared}
                value={(control_.value as string) ?? null}
                onChange={(value) => control_.onChange(value)}
                /* Prihvata i `010326` i `1.3.2026` - v. date.ts */
                dateParser={parseSerbianDate}
                valueFormat="DD.MM.YYYY"
                clearable={!field.required}
              />
            )

          case 'select':
            return (
              <Select
                {...shared}
                value={(control_.value as string) ?? null}
                onChange={(value) => control_.onChange(value)}
                data={(field.options ?? []).map((option) => ({
                  value: option.value,
                  label: t(option.label),
                  disabled: option.disabled,
                }))}
                searchable={(field.options?.length ?? 0) > 8}
                clearable={!field.required}
                comboboxProps={{ withinPortal: true }}
              />
            )

          case 'multi-select':
            return (
              <MultiSelect
                {...shared}
                value={(control_.value as string[]) ?? []}
                onChange={(value) => control_.onChange(value)}
                data={(field.options ?? []).map((option) => ({
                  value: option.value,
                  label: t(option.label),
                  disabled: option.disabled,
                }))}
                searchable
                clearable
                comboboxProps={{ withinPortal: true }}
              />
            )

          case 'checkbox':
            return (
              <Checkbox
                label={label}
                description={description}
                disabled={disabled}
                error={error}
                checked={Boolean(control_.value)}
                onChange={(event) => control_.onChange(event.currentTarget.checked)}
                onBlur={control_.onBlur}
              />
            )

          case 'switch':
            return (
              <Switch
                label={label}
                description={description}
                disabled={disabled}
                error={error}
                checked={Boolean(control_.value)}
                onChange={(event) => control_.onChange(event.currentTarget.checked)}
                onBlur={control_.onBlur}
              />
            )

          case 'relation':
          case 'multi-relation':
            if (!field.relation) return <></>
            return (
              <RelationField
                relation={field.relation}
                label={label}
                description={description}
                placeholder={placeholder}
                required={field.required}
                disabled={disabled}
                error={error}
                multiple={field.type === 'multi-relation'}
                value={(control_.value as string | string[] | null) ?? null}
                onChange={(value) => control_.onChange(value)}
                onBlur={control_.onBlur}
                dependencyValue={dependencyValue}
              />
            )

          case 'localized-text':
            return (
              <LocalizedTextField
                label={label}
                description={description}
                required={field.required}
                disabled={disabled}
                error={error}
                locales={field.locales}
                value={(control_.value as Record<string, string>) ?? null}
                onChange={(value) => control_.onChange(value)}
                onBlur={control_.onBlur}
              />
            )

          case 'upload':
            return (
              <UploadField
                label={label}
                description={description}
                placeholder={placeholder}
                required={field.required}
                disabled={disabled}
                error={error}
                config={field.upload}
                value={(control_.value as string) ?? null}
                onChange={(value) => control_.onChange(value)}
                onBlur={control_.onBlur}
              />
            )

          case 'custom':
            return (
              <>
                {field.render?.({
                  value: control_.value,
                  onChange: control_.onChange,
                  onBlur: control_.onBlur,
                  error,
                  disabled,
                })}
              </>
            )

          default:
            return (
              <TextInput
                {...shared}
                type={field.type === 'email' ? 'email' : 'text'}
                value={(control_.value as string) ?? ''}
                onChange={(event) => control_.onChange(event.currentTarget.value)}
              />
            )
        }
      }}
    />
  )
}

'use client'

import { Input, Stack, Tabs, TextInput } from '@mantine/core'
import { localeName, useI18n, type Locale } from '@liro/i18n'

/*
 * Tabs are labelled with `localeName`, not a table.
 *
 * `@liro/i18n` derives the endonym from CLDR - `Srpski`, `Српски`, `العربية` -
 * which is what a language tab should say, and it works for a locale an
 * application registered itself.
 *
 * The old table had three entries and a `Record<Locale, string>` type that broke
 * the moment `Locale` opened up. Two places doing the same job is one place too
 * many.
 */
const DEFAULT_LOCALES: Locale[] = ['sr-Latn', 'sr-Cyrl', 'en']

interface LocalizedTextFieldProps {
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  error?: string
  locales?: Locale[]
  value: Partial<Record<Locale, string>> | null
  onChange: (value: Partial<Record<Locale, string>>) => void
  onBlur: () => void
}

/**
 * One field per language, in tabs.
 *
 * The value is stored as `{ 'sr-Latn': '…', 'sr-Cyrl': '…' }` - the same shape
 * `LocalizedLabel` expects, so content entered here can be passed directly
 * to any component from `@liro/ui`.
 */
export function LocalizedTextField({
  label,
  description,
  required,
  disabled,
  error,
  locales = DEFAULT_LOCALES,
  value,
  onChange,
  onBlur,
}: LocalizedTextFieldProps) {
  const { locale } = useI18n()
  const current = value ?? {}
  const defaultTab = locales.includes(locale) ? locale : locales[0]

  return (
    <Input.Wrapper label={label} description={description} withAsterisk={required} error={error}>
      <Stack gap={4} mt={4}>
        <Tabs defaultValue={defaultTab} variant="outline" radius="md">
          <Tabs.List>
            {locales.map((item) => (
              <Tabs.Tab key={item} value={item} fz="xs">
                {localeName(item)}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {locales.map((item) => (
            <Tabs.Panel key={item} value={item} pt="xs">
              <TextInput
                value={current[item] ?? ''}
                onChange={(event) => onChange({ ...current, [item]: event.currentTarget.value })}
                onBlur={onBlur}
                disabled={disabled}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    </Input.Wrapper>
  )
}

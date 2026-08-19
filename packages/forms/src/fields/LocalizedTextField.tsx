'use client'

import { Input, Stack, Tabs, TextInput } from '@mantine/core'
import { useI18n, type Locale } from '@liro/i18n'

/*
 * Not a `LocalizedLabel` - the script/language TAB label is fixed regardless
 * of the UI's own locale, so it stays a table rather than catalog keys.
 */
/* eslint-disable no-restricted-syntax -- not a LocalizedLabel map, see comment above */
const LOCALE_NAMES: Record<Locale, string> = {
  'sr-Latn': 'Latinica',
  'sr-Cyrl': 'Ћирилица',
  en: 'English',
}
/* eslint-enable no-restricted-syntax */

const ALL_LOCALES: Locale[] = ['sr-Latn', 'sr-Cyrl', 'en']

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
  locales = ALL_LOCALES,
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
                {LOCALE_NAMES[item]}
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

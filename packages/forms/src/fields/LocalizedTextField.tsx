'use client'

import { Input, Stack, Tabs, TextInput } from '@mantine/core'
import { useI18n, type Locale } from '@liro/i18n'

const LOCALE_NAMES: Record<Locale, string> = {
  sr: 'Latinica',
  'sr-Cyrl': 'Ћирилица',
  en: 'English',
}

const ALL_LOCALES: Locale[] = ['sr', 'sr-Cyrl', 'en']

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
 * Jedno polje po jeziku, u tabovima.
 *
 * Vrednost se cuva kao `{ sr: '…', 'sr-Cyrl': '…' }` - isti oblik koji
 * `LocalizedLabel` ocekuje, pa se sadrzaj unet ovde moze direktno proslediti
 * bilo kojoj komponenti iz `@liro/ui`.
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

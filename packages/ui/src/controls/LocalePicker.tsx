'use client'

import { ActionIcon, Menu } from '@mantine/core'
import { Check, Languages } from 'lucide-react'
import { LOCALES, localeName, useI18n, type Locale, type LocalizedLabel } from '@liro/i18n'

/**
 * Language picker.
 *
 * A menu, not a toggle. `ColorSchemeToggle` is a toggle because it has two
 * states; there are three languages today and forty-three planned.
 *
 * The list comes from `LOCALES`, so adding a language does not mean editing this
 * component.
 */

const LABEL: LocalizedLabel = {
  sr: 'Jezik',
  'sr-Cyrl': 'Језик',
  en: 'Language',
}

export interface LocalePickerProps {
  size?: 'sm' | 'md' | 'lg'
}

export function LocalePicker({ size = 'md' }: LocalePickerProps) {
  const { locale, setLocale, t } = useI18n()

  /*
   * No `mounted` dance here, unlike `ColorSchemeToggle`.
   *
   * The colour scheme is written into the DOM by `ColorSchemeScript` before
   * hydration, so the client knows it on the first render and the server did
   * not. The language arrives as `initialLocale`, which the server read from the
   * same cookie — both sides start from the same value and there is nothing to
   * reconcile.
   */
  return (
    <Menu position="bottom-end" withArrow transitionProps={{ transition: 'pop' }}>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color="gray"
          size={size}
          radius="md"
          aria-label={`${t(LABEL)}: ${localeName(locale)}`}
        >
          <Languages size={18} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t(LABEL)}</Menu.Label>
        {LOCALES.map((option: Locale) => {
          const current = option === locale

          return (
            <Menu.Item
              key={option}
              onClick={() => setLocale(option)}
              /*
               * `menuitemradio`, not `menuitem`.
               *
               * `aria-checked` is not allowed on `menuitem`, and without it a
               * screen reader cannot tell which language is active — the tick is
               * visible only to the eye. `menu` permits `menuitemradio`.
               */
              role="menuitemradio"
              aria-checked={current}
              leftSection={
                current ? <Check size={15} /> : <span style={{ display: 'inline-block', width: 15 }} />
              }
            >
              {/*
                The name in its own language. `lang` is set so a screen reader
                switches voice for that item instead of reading Arabic with a
                Serbian one.
              */}
              <span lang={option}>{localeName(option)}</span>
            </Menu.Item>
          )
        })}
      </Menu.Dropdown>
    </Menu>
  )
}
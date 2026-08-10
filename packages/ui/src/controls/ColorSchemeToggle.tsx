'use client'

import { useEffect, useState } from 'react'
import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { Moon, Sun } from 'lucide-react'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

const TO_DARK: LocalizedLabel = { sr: 'Uključi tamnu temu', 'sr-Cyrl': 'Укључи тамну тему', en: 'Switch to dark theme' }
const TO_LIGHT: LocalizedLabel = { sr: 'Uključi svetlu temu', 'sr-Cyrl': 'Укључи светлу тему', en: 'Switch to light theme' }

export interface ColorSchemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
}

export function ColorSchemeToggle({ size = 'md' }: ColorSchemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme()
  /*
   * `getInitialValueInEffect: true` is required.
   *
   * Without it, the hook on the client immediately reads the remembered
   * scheme from the cookie, while the server rendered the default — so the
   * first render differs and React reports a failed hydration. This way
   * both start from the same value, and the real scheme is applied in an
   * effect, after hydration.
   */
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const { t } = useI18n()

  /*
   * `getInitialValueInEffect` is not enough.
   *
   * `ColorSchemeScript` sets `data-mantine-color-scheme` before hydration, so
   * the client already knows the scheme on the first render, while the
   * server did not — the icon and `aria-label` differ and React reports a
   * failed hydration.
   *
   * That is why we render the same content until mounted, and the real icon
   * only after.
   */
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const goingDark = mounted ? computed === 'light' : true

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size={size}
      radius="md"
      suppressHydrationWarning
      onClick={() => setColorScheme(goingDark ? 'dark' : 'light')}
      aria-label={t(goingDark ? TO_DARK : TO_LIGHT)}
    >
      {goingDark ? <Moon size={18} /> : <Sun size={18} />}
    </ActionIcon>
  )
}

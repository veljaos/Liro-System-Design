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
   * `getInitialValueInEffect: true` je obavezno.
   *
   * Bez njega hook na klijentu odmah procita zapamcenu semu iz kolacica, a
   * server je renderovao podrazumevanu - pa se prvi render razlikuje i React
   * prijavi neuspelu hidrataciju. Ovako oba pocnu od iste vrednosti, a stvarna
   * sema se primeni u efektu, posle hidratacije.
   */
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const { t } = useI18n()

  /*
   * `getInitialValueInEffect` nije dovoljan.
   *
   * `ColorSchemeScript` postavi `data-mantine-color-scheme` pre hidratacije, pa
   * klijent u prvom renderu vec zna semu, a server je nije znao - ikonica i
   * `aria-label` se razlikuju i React prijavi neuspelu hidrataciju.
   *
   * Zato do montiranja crtamo uvek isti sadrzaj, a stvarnu ikonicu tek posle.
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

'use client'

import { MantineProvider, type MantineProviderProps, type MantineThemeOverride } from '@mantine/core'
import { useMemo, type ReactNode } from 'react'
import { createLiroTheme } from './createLiroTheme'
import { liroCssVariablesResolver } from './cssVariablesResolver'

export interface LiroThemeProviderProps extends Omit<MantineProviderProps, 'theme' | 'children'> {
  children: ReactNode
  /** Dopune teme za konkretnu aplikaciju. Spajaju se sa Liro osnovom. */
  theme?: MantineThemeOverride
}

/**
 * Jedna tacka ulaza za temu. Aplikacija je koristi umesto `MantineProvider`
 * da ne bi svaka od njih iznova povezivala resolver i podrazumevanu semu.
 *
 * Ne zaboravi `<ColorSchemeScript />` u `<head>` - bez njega prvi frame
 * bljesne pogresnom semom.
 */
export function LiroThemeProvider({
  children,
  theme,
  defaultColorScheme = 'light',
  ...rest
}: LiroThemeProviderProps) {
  const resolved = useMemo(() => createLiroTheme(theme), [theme])

  return (
    <MantineProvider
      theme={resolved}
      cssVariablesResolver={liroCssVariablesResolver}
      defaultColorScheme={defaultColorScheme}
      {...rest}
    >
      {children}
    </MantineProvider>
  )
}

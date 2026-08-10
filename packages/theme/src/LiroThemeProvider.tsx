'use client'

import { MantineProvider, type MantineProviderProps, type MantineThemeOverride } from '@mantine/core'
import { useMemo, type ReactNode } from 'react'
import { createLiroTheme } from './createLiroTheme'
import { liroCssVariablesResolver } from './cssVariablesResolver'

export interface LiroThemeProviderProps extends Omit<MantineProviderProps, 'theme' | 'children'> {
  children: ReactNode
  /** Theme overrides for the specific application. Merged with the Liro base. */
  theme?: MantineThemeOverride
}

/**
 * A single entry point for the theme. The application uses it instead of
 * `MantineProvider` so that each one does not have to wire up the resolver
 * and the default scheme again.
 *
 * Do not forget `<ColorSchemeScript />` in `<head>` — without it, the first
 * frame flashes the wrong scheme.
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

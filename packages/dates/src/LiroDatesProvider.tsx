'use client'

import { DatesProvider } from '@mantine/dates'
import type { ReactNode } from 'react'
import { useI18n } from '@liro/i18n'

/**
 * Configures all Mantine date components at once.
 *
 * Without it, every calendar in the system starts on Sunday, because that is
 * Mantine's default. The work week in Serbia starts on Monday, and that is a
 * decision that should exist in one place — not as `firstDayOfWeek={1}` in
 * thirty places, where it gets forgotten on the thirty-first.
 */
export function LiroDatesProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n()

  return (
    <DatesProvider
      settings={{
        locale: locale === 'en' ? 'en' : 'sr',
        firstDayOfWeek: 1,
        weekendDays: [0, 6],
        /* Display is always DD.MM.YYYY; input also accepts the shortened
           form via `parseSerbianDate`. */
        consistentWeeks: true,
      }}
    >
      {children}
    </DatesProvider>
  )
}

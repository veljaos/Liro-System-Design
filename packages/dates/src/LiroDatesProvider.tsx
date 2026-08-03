'use client'

import { DatesProvider } from '@mantine/dates'
import type { ReactNode } from 'react'
import { useI18n } from '@liro/i18n'

/**
 * Podešava sve Mantine komponente za datume odjednom.
 *
 * Bez njega svaki kalendar u sistemu počinje nedeljom, jer je to Mantine
 * podrazumevana vrednost. Radna nedelja u Srbiji počinje ponedeljkom, i to je
 * odluka koja treba da postoji na jednom mestu - ne kao `firstDayOfWeek={1}`
 * na trideset mesta, gde se na trideset prvom zaboravi.
 */
export function LiroDatesProvider({ children }: { children: ReactNode }) {
  const { locale } = useI18n()

  return (
    <DatesProvider
      settings={{
        locale: locale === 'en' ? 'en' : 'sr',
        firstDayOfWeek: 1,
        weekendDays: [0, 6],
        /* Prikaz je uvek DD.MM.YYYY; unos prihvata i skraceni oblik kroz
           `parseSerbianDate`. */
        consistentWeeks: true,
      }}
    >
      {children}
    </DatesProvider>
  )
}

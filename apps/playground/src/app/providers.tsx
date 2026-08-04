'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { LiroProviders } from '@liro/preset'
import type { Locale } from '@liro/i18n'
import { createMemoryFileStorage } from '@liro/data'
import { LiroCodeHighlightProvider } from '@liro/editor'
import { demoProvider } from '@/lib/demo-data'
import { navigation } from '@/lib/navigation'

/* Skladiste u memoriji - fajlovi zive do osvezavanja stranice. */
const demoStorage = createMemoryFileStorage({ delay: 400 })

/**
 * Ovako izgleda koren svake Liro aplikacije posle Koraka 1: jedan provider i
 * cetiri vrednosti. Sve sto je bilo devet ugnjezdenih slojeva sada zivi u
 * `@liro/preset`.
 *
 * `LiroCodeHighlightProvider` ostaje ovde jer je specifican za dokumentaciju -
 * poslovne aplikacije ne prikazuju izvorni kod, pa ne treba da nose shiki.
 */
export function Providers({ children, initialLocale = 'sr' }: { children: ReactNode; initialLocale?: Locale }) {
  return (
    <LiroProviders
      app={{
        name: 'Liro Design System',
        shortName: 'Liro DS',
        homeHref: '/',
        linkComponent: Link,
        navigation,
      }}
      data={demoProvider}
      files={demoStorage}
      initialLocale={initialLocale}
    >
      <LiroCodeHighlightProvider>{children}</LiroCodeHighlightProvider>
    </LiroProviders>
  )
}
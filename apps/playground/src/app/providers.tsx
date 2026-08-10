'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { LiroProviders } from '@liro/preset'
import type { Locale } from '@liro/i18n'
import { createMemoryFileStorage } from '@liro/data'
import { LiroCodeHighlightProvider } from '@liro/editor'
import { demoProvider } from '@/lib/demo-data'
import { navigation } from '@/lib/navigation'

/* In-memory storage — files live until the page is refreshed. */
const demoStorage = createMemoryFileStorage({ delay: 400 })

/**
 * This is what the root of every Liro application looks like after Step 1:
 * one provider and four values. Everything that used to be nine nested
 * layers now lives in `@liro/preset`.
 *
 * `LiroCodeHighlightProvider` stays here because it is specific to the
 * documentation — business applications do not display source code, so they
 * should not carry shiki.
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
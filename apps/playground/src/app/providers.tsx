'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { LiroThemeProvider } from '@liro/theme'
import { I18nProvider } from '@liro/i18n'
import { LiroDataProvider, LiroFileStorageProvider, createMemoryFileStorage } from '@liro/data'
import { LiroDatesProvider } from '@liro/dates'
import { LiroCodeHighlightProvider } from '@liro/editor'
import { LiroAppProvider } from '@liro/ui'
import { demoProvider } from '@/lib/demo-data'
import { navigation } from '@/lib/navigation'

/**
 * Pun niz providera - isti redosled koji svaka Liro aplikacija treba da ima.
 *
 * `QueryClient` se pravi u stanju komponente, ne kao modulska promenljiva:
 * na serveru bi jedan klijent bio deljen izmedju svih zahteva i keš jednog
 * korisnika bi procurio drugom.
 */
/* Skladiste u memoriji - fajlovi zive do osvezavanja stranice. */
const demoStorage = createMemoryFileStorage({ delay: 400 })

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
      }),
  )

  return (
    <LiroThemeProvider>
      {/* Obavestenja idu odmah ispod teme da bi ih svaki sloj ispod mogao pozvati. */}
      <Notifications position="bottom-right" limit={4} autoClose={4000} />
      <I18nProvider initialLocale="sr">
        <QueryClientProvider client={queryClient}>
          <LiroDataProvider provider={demoProvider}>
            <LiroAppProvider
              config={{
                name: 'Liro Design System',
                shortName: 'Liro DS',
                homeHref: '/',
                linkComponent: Link,
                navigation,
              }}
            >
              <LiroFileStorageProvider storage={demoStorage}>
                <LiroDatesProvider>
                <ModalsProvider>
                    <LiroCodeHighlightProvider>{children}</LiroCodeHighlightProvider>
                  </ModalsProvider>
              </LiroDatesProvider>
              </LiroFileStorageProvider>
            </LiroAppProvider>
          </LiroDataProvider>
        </QueryClientProvider>
      </I18nProvider>
    </LiroThemeProvider>
  )
}

'use client'

import { useState, type ReactNode } from 'react'
import type { MantineThemeOverride } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LiroThemeProvider } from '@liro/theme'
import { I18nProvider, type Locale } from '@liro/i18n'
import {
  LiroDataProvider,
  LiroFileStorageProvider,
  type DataProvider,
  type FileStorage,
} from '@liro/data'
import { LiroDatesProvider } from '@liro/dates'
import { LiroAppProvider, type LiroAppConfig } from '@liro/ui'

/**
 * Ceo niz providera u jednoj komponenti.
 *
 * Redosled nije stvar ukusa: `LiroDatesProvider` cita jezik iz `useI18n`, pa
 * mora biti unutar `I18nProvider`-a; `Notifications` mora biti unutar teme da
 * bi dobio boje. Kada je ovo prepisano u svakoj aplikaciji, jedna od njih pre
 * ili kasnije zameni dva sloja i kalendar krene od nedelje.
 */

export interface LiroProvidersProps {
  children: ReactNode
  /** Ime, navigacija, dozvole i `linkComponent` konkretne aplikacije. */
  app: LiroAppConfig
  /** Supabase, REST ili niz u memoriji - dizajn sistem ne zna razliku. */
  data: DataProvider
  /** Skladiste priloga. Izostavi ako aplikacija nema fajlove. */
  files?: FileStorage
  /**
   * Prosledi sa servera (iz profila ili kolacica). Nikada ne citaj
   * `localStorage` ovde - server bi renderovao jedan jezik, klijent drugi.
   */
  initialLocale?: Locale
  /** Dopune Mantine teme za konkretnu aplikaciju. */
  theme?: MantineThemeOverride
  /**
   * Prosledi svoj `QueryClient` samo ako aplikaciji treba drugacija
   * podrazumevana politika keša.
   */
  queryClient?: QueryClient
}

function FileStorageBoundary({
  storage,
  children,
}: {
  storage?: FileStorage
  children: ReactNode
}) {
  if (!storage) return <>{children}</>
  return <LiroFileStorageProvider storage={storage}>{children}</LiroFileStorageProvider>
}

export function LiroProviders({
  children,
  app,
  data,
  files,
  initialLocale = 'sr',
  theme,
  queryClient,
}: LiroProvidersProps) {
  /*
   * Klijent se pravi u stanju komponente, ne kao modulska promenljiva: na
   * serveru bi jedan klijent bio deljen izmedju svih zahteva i kes jednog
   * korisnika bi procurio drugom.
   */
  const [fallbackClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
        },
      }),
  )

  return (
    <LiroThemeProvider theme={theme}>
      <Notifications position="bottom-right" limit={4} autoClose={4000} />
      <I18nProvider initialLocale={initialLocale}>
        <QueryClientProvider client={queryClient ?? fallbackClient}>
          <LiroDataProvider provider={data}>
            <LiroAppProvider config={app}>
              <FileStorageBoundary storage={files}>
                <LiroDatesProvider>
                  <ModalsProvider>{children}</ModalsProvider>
                </LiroDatesProvider>
              </FileStorageBoundary>
            </LiroAppProvider>
          </LiroDataProvider>
        </QueryClientProvider>
      </I18nProvider>
    </LiroThemeProvider>
  )
}
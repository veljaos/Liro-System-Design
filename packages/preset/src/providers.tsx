'use client'

import { useState, type ReactNode } from 'react'
import { Notifications } from '@mantine/notifications'
import { DirectionProvider, type MantineThemeOverride } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LiroThemeProvider } from '@liro/theme'
import { DEFAULT_LOCALE, I18nProvider, type Catalog, type Locale } from '@liro/i18n'
import {
  LiroDataProvider,
  LiroFileStorageProvider,
  type DataProvider,
  type FileStorage,
} from '@liro/data'
import { LiroDatesProvider } from '@liro/dates'
import { LiroAppProvider, type LiroAppConfig } from '@liro/ui'

/**
 * The whole chain of providers in one component.
 *
 * The order is not a matter of taste: `LiroDatesProvider` reads the language
 * from `useI18n`, so it must be inside `I18nProvider`; `Notifications` must
 * be inside the theme to get colors. When this is copy-pasted into every
 * application, sooner or later one of them swaps two layers and the calendar
 * starts on Sunday.
 */

export interface LiroProvidersProps {
  children: ReactNode
  /** Name, navigation, permissions, and `linkComponent` of the specific application. */
  app: LiroAppConfig
  /** Supabase, REST, or an in-memory array — the design system does not know the difference. */
  data: DataProvider
  /** Attachment storage. Omit if the application has no files. */
  files?: FileStorage
  /**
   * Pass from the server (from a profile or a cookie). Never read
   * `localStorage` here — the server would render one language, the client
   * another.
   */
  initialLocale?: Locale
  /** From `getServerCatalog(locale)`. Prevents a hydration mismatch on a lazy locale. */
  initialCatalog?: Catalog
  /** Mantine theme overrides for the specific application. */
  theme?: MantineThemeOverride
  /**
   * Pass your own `QueryClient` only if the application needs a different
   * default cache policy.
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
  initialLocale = DEFAULT_LOCALE,
  initialCatalog,
  theme,
  queryClient,
}: LiroProvidersProps) {
  /*
   * The client is created in component state, not as a module-level
   * variable: on the server, one client would be shared across all
   * requests, and one user's cache would leak into another's.
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
    /*
     * `DirectionProvider` above everything, because Mantine reads the direction
     * when it builds the theme - placed lower, the components below would keep the
     * old direction.
     *
     * Present before any right-to-left catalog exists, deliberately: adding
     * `ar.json` later must not mean reviewing every margin in the system.
     */
    <DirectionProvider>
      <LiroThemeProvider theme={theme}>
        <Notifications position="bottom-right" limit={4} autoClose={4000} />
        <I18nProvider initialLocale={initialLocale} initialCatalog={initialCatalog}>
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
    </DirectionProvider>
  )
}
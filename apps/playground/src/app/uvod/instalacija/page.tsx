'use client'

import { Box, Code, List, Stack, Text, Title } from '@mantine/core'
import { liroVar } from '@liro/tokens'
import { Callout } from '@liro/ui'
import { DocsPage, DocsShell } from '@/components/DocsShell'

function Snippet({ children }: { children: string }) {
  return (
    <Box
      component="pre"
      p="md"
      style={{
        backgroundColor: liroVar.surface.sunken,
        border: `1px solid ${liroVar.border.default}`,
        borderRadius: 'var(--liro-radius-lg)',
        fontSize: 'var(--liro-font-size-sm)',
        fontFamily: 'var(--liro-font-mono)',
        overflowX: 'auto',
        margin: 0,
      }}
    >
      {children}
    </Box>
  )
}

export default function InstallPage() {
  return (
    <DocsShell>
      <DocsPage
        toc={[
          { id: 'instalacija', title: 'Instalacija' },
          { id: 'next-config', title: 'next.config.ts' },
          { id: 'stilovi', title: 'Redosled stilova' },
          { id: 'provajderi', title: 'Provajderi' },
        ]}
      >
        <Stack gap="xl">
          <Stack gap="md">
            <Title order={1}>Uključivanje u aplikaciju</Title>
            <Text size="lg" style={{ color: liroVar.text.secondary }}>
              Četiri koraka od praznog Next projekta do prvog ekrana.
            </Text>
          </Stack>

          <Stack gap="md" id="instalacija" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>1. Instalacija</Title>
            <Snippet>{`pnpm add @liro/theme @liro/ui @liro/data @liro/forms @liro/templates \\
  @liro/dates @liro/charts @liro/i18n @liro/tokens

pnpm add @mantine/core @mantine/hooks @mantine/dates @mantine/notifications \\
  @mantine/modals @mantine/spotlight @mantine/charts recharts \\
  @tanstack/react-query react-hook-form lucide-react`}</Snippet>
          </Stack>

          <Stack gap="md" id="next-config" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>2. next.config.ts</Title>
            <Text>
              Paketi se objavljuju kao TypeScript izvor, bez build koraka, pa ih Next kompajlira
              zajedno sa aplikacijom.
            </Text>
            <Snippet>{`const nextConfig: NextConfig = {
  transpilePackages: [
    '@liro/tokens', '@liro/theme', '@liro/i18n', '@liro/ui', '@liro/dates',
    '@liro/data', '@liro/forms', '@liro/templates', '@liro/charts',
    '@liro/schedule', '@liro/editor', '@liro/files',
  ],
}`}</Snippet>
          </Stack>

          <Stack gap="md" id="stilovi" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>3. Redosled stilova</Title>
            <Callout tone="warning" title={{ sr: 'Redosled je bitan' }}>
              Mantine → tokeni → globalni stilovi → stilovi komponenti. Obrnut redosled znači da
              Mantine nadjačava tokene, a stilovi grafikona pre core stilova pomeraju oblačiće.
            </Callout>
            <Snippet>{`import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/charts/styles.css'
import '@liro/tokens/css'
import '@liro/theme/styles.css'
import '@liro/ui/styles.css'
import './globals.css'`}</Snippet>
          </Stack>

          <Stack gap="md" id="provajderi" style={{ scrollMarginTop: 80 }}>
            <Title order={2}>4. Provajderi</Title>
            <Text>Ugnježđuju se ovim redom:</Text>
            <Snippet>{`<LiroThemeProvider>
  <Notifications position="bottom-right" />
  <I18nProvider initialLocale="sr">
    <QueryClientProvider client={queryClient}>
      <LiroDataProvider provider={dataProvider}>
        <LiroFileStorageProvider storage={fileStorage}>
          <LiroDatesProvider>
            <LiroAppProvider config={{ name: 'Liro ERP', linkComponent: Link, navigation }}>
              <ModalsProvider>{children}</ModalsProvider>
            </LiroAppProvider>
          </LiroDatesProvider>
        </LiroFileStorageProvider>
      </LiroDataProvider>
    </QueryClientProvider>
  </I18nProvider>
</LiroThemeProvider>`}</Snippet>

            <Text>Uz to u <Code>&lt;head&gt;</Code> ide <Code>&lt;ColorSchemeScript /&gt;</Code>, inače prvi frame bljesne pogrešnom temom.</Text>

            <List size="sm" spacing={4}>
              <List.Item><Code>LiroDataProvider</Code> — bez njega tabele i relacije ne rade.</List.Item>
              <List.Item><Code>LiroFileStorageProvider</Code> — opcion; bez njega prilozi javljaju da nisu podešeni.</List.Item>
              <List.Item><Code>LiroDatesProvider</Code> — postavlja ponedeljak kao prvi dan nedelje.</List.Item>
            </List>
          </Stack>
        </Stack>
      </DocsPage>
    </DocsShell>
  )
}

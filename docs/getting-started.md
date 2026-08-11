# Getting started

Four steps from an empty Next project to the first screen.

## 1. Install

```
pnpm add @liro/preset
```

`@liro/preset` is the only **Liro** package you import directly — everything else
arrives through it.

**You must also install the Mantine set yourself.** Every `@mantine/*` subpackage
declares `@mantine/core` and `@mantine/hooks` as peers with an *exact* version,
so pinning them inside `@liro/preset` would give you two copies of
`@mantine/core`, two React contexts, an unapplied theme — and no error at all.
They are `peerDependencies`, which turns a silent failure into a build failure.

```
pnpm add @mantine/core @mantine/hooks @mantine/dates @mantine/modals \
         @mantine/notifications @mantine/spotlight @mantine/nprogress \
         @mantine/carousel @mantine/charts @mantine/code-highlight \
         @mantine/dropzone @mantine/schedule @mantine/tiptap \
         @xyflow/react react-dom
```

If the application validates Serbian identifiers — tax number, personal number,
company number, bank account, payment reference — add the country package too:

```
pnpm add @liro/serbia
```

## 2. `next.config.ts`

Packages publish TypeScript source, with no build step, so Next compiles them
together with the application.

```ts
import { withLiro } from '@liro/preset/next'

export default withLiro()
```

`withLiro()` fills in `transpilePackages` for every Liro package and adds
`optimizePackageImports`. **Do not list the packages by hand.** A partial list
fails on the first import from a package you forgot, and the failure reads like a
broken package rather than a missing entry.

`withLiro(config)` merges an existing config, so your own options survive.

## 3. Styles

```tsx
import '@liro/preset/styles.css'
import './globals.css'
```

**One import, not sixteen.** `@liro/preset/styles.css` pulls in Mantine, its
add-ons, React Flow, the Liro tokens and the theme **in that order**, and that
order is the only thing holding the appearance of the system together:

```
Mantine core → Mantine add-ons → React Flow → Liro tokens → Liro theme → Liro components
```

Reverse it and Mantine overrides the tokens, leaving dark mode half-applied. Put
the chart styles before the core styles and tooltips shift. Your own
`globals.css` comes last so it can override everything.

## 4. Providers

```tsx
import { ColorSchemeScript } from '@mantine/core'
import { LiroProviders } from '@liro/preset'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <LiroProviders initialLocale="sr">{children}</LiroProviders>
      </body>
    </html>
  )
}
```

`<ColorSchemeScript />` in the `<head>` is not optional: without it the first
frame flashes the wrong scheme.

`LiroProviders` carries the theme, i18n, the data provider, file storage, dates,
modals, notifications and a React Query client. Pass what you have:

| Prop | Effect when omitted |
| --- | --- |
| `data` | tables and relation fields have no source and report it |
| `files` | attachments report that storage is not configured |
| `app` | navigation and permissions are unavailable |
| `initialLocale` | defaults to `sr` |

The query client is created in component state, never as a module variable — on
the server one client shared between requests would leak one user's cache into
another's response.

## Appendix — the provider chain by hand

`LiroProviders` exists so you do not have to do this. It is written out here
because the **order** is a rule of the system, and anyone who needs to insert a
provider of their own has to know where it goes.

```tsx
<LiroThemeProvider>
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
</LiroThemeProvider>
```

- `LiroThemeProvider` is outermost because everything below it reads the theme.
- `I18nProvider` sits above the data layer: an error message coming back from the
  provider is already localised by the time a component displays it.
- `LiroDatesProvider` sets the first day of the week and the calendar locale.
  Without it, individual date pickers fall back to their own defaults and two
  calendars on one screen can start the week on different days.
- `ModalsProvider` is innermost so a modal opened from a screen still sees every
  context above it.

## Next

- [The rules of the system](../AGENTS.md) — read before writing a screen
- [Navigation patterns](navigation-patterns.md) — when a modal, when a drawer,
  when a page
- [Intent families](intents/README.md) — why each action has the colour it has
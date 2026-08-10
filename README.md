# Liro Design System

A shared visual layer for every Liro application — Liro Business App, Liro ERP,
Liro CRM, Liro Payroll.

**Before navigating the codebase, read these:**

- **[`AGENTS.md`](AGENTS.md)** — the rules of the system. Read before changing
  anything.
- **[`docs/intents/`](docs/intents/)** — why each action intent is the way it is.

## Structure

```
packages/
  tokens/         @liro/tokens         colours, typography, spacing, shadows, motion
  theme/          @liro/theme          Mantine theme + global styles
  i18n/           @liro/i18n           localised labels and formatting
  ui/             @liro/ui             presentational components
  dates/          @liro/dates          dates, accounting periods, deadlines
  charts/         @liro/charts         charts with the Liro palette and formatting
  schedule/       @liro/schedule       calendar of runs and deadlines
  editor/         @liro/editor         rich text and code display
  files/          @liro/files          drag-and-drop and attachment display
  process/        @liro/process        process diagrams (React Flow)
  pdf/            @liro/pdf            PDF preview and stamp placement
  data/           @liro/data           adapter layer and React hooks
  data-supabase/  @liro/data-supabase  Supabase implementation
  forms/          @liro/forms          engine for schema-described forms
  templates/      @liro/templates      application shell and ready-made pages
  preset/         @liro/preset         meta-package: Next config + provider chain
  serbia/         @liro/serbia         Serbian identifiers — optional, see below
apps/
  playground/     living documentation (Next 16)
```

`@liro/preset` is the only **Liro** package an application imports directly — the
rest arrive through it. It is not, however, the only package an application
installs: see [Using it in an application](#using-it-in-an-application).

`@liro/serbia` is a **country package** and is optional. The core must not import
it, and ESLint enforces that. A product outside that market does not install it.

## Why there is no build step

Packages publish TypeScript source, not a compiled `dist/`. Every Liro
application is Next.js, so Next does the compiling through `transpilePackages`.
That removes three classes of problem at once: a duplicated ESM/CJS build, lost
`'use client'` directives during bundling, and source maps that point nowhere.

The only generated artefact is `packages/tokens/src/styles/tokens.css`, produced
from the TypeScript definitions and committed to the repository. **After editing
`semantic.ts` you must run `pnpm tokens:build`** — otherwise the CSS variables
carry the old value and nothing reports an error.

## Development

```powershell
pnpm install
pnpm dev            # playground on http://localhost:3100
pnpm tokens:build   # regenerate tokens.css after editing tokens
pnpm props          # regenerate the API reference from the code

pnpm lint
pnpm typecheck
pnpm test
pnpm build

pnpm a11y           # axe-core, WCAG 2.1 AA, both themes
pnpm e2e            # visual regression + console errors
pnpm e2e:update     # accept new baselines
```

`pnpm e2e` builds the application before serving it, so it works on a fresh
clone. Its baselines are suffixed `-win32` and therefore **do not run in CI** —
`pnpm a11y` does.

## Token layers

Three layers, and a rule about who may use what:

| Layer | Example | Who uses it |
| --- | --- | --- |
| Primitives | `palette.blue[6]` | only `semantic.ts` and the Mantine theme |
| Semantic | `liroVar.text.secondary` | components |
| CSS variables | `var(--liro-text-secondary)` | stylesheets |

A component that writes `#0078D4` or `palette.blue[6]` has broken the rule. It
writes `liroVar.brand.solid` — and gets dark mode for free.

**`brand.solid` is a background, `text.brand` is text.** They move in opposite
directions between themes and must never share a token. That mistake has been
made twice; see `AGENTS.md`.

## Using it in an application

### Install

```powershell
pnpm add @liro/preset
```

**You must also install the Mantine set yourself.** Every `@mantine/*` subpackage
declares `@mantine/core` and `@mantine/hooks` as peers with an *exact* version,
so pinning them inside `@liro/preset` would give you two copies of
`@mantine/core`, two React contexts, an unapplied theme — and no error at all.
They are `peerDependencies`, which turns a silent failure into a build failure.

```powershell
pnpm add @mantine/core @mantine/hooks @mantine/dates @mantine/modals \
         @mantine/notifications @mantine/spotlight @mantine/nprogress \
         @mantine/carousel @mantine/charts @mantine/code-highlight \
         @mantine/dropzone @mantine/schedule @mantine/tiptap \
         @xyflow/react react-dom
```

### `next.config.ts`

```ts
import { withLiro } from '@liro/preset/next'

export default withLiro()
```

`withLiro()` fills in `transpilePackages` for all Liro packages and adds
`optimizePackageImports`. **Do not list the packages by hand** — a partial list
fails on the first import from a package you forgot, and the failure looks like a
broken package rather than a missing entry.

`withLiro(config)` merges an existing config, so your own options survive.

### `src/app/layout.tsx`

```tsx
import '@liro/preset/styles.css'
import './globals.css'

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

**One CSS import, not sixteen.** `@liro/preset/styles.css` imports Mantine, its
add-ons, React Flow, the Liro tokens and the theme **in that order**. The order is
the only thing holding the appearance of the system together: reverse it and
Mantine overrides the tokens, leaving dark mode half-applied. Your own
`globals.css` comes last so it can override everything.

`LiroProviders` carries the theme, i18n, the data provider, file storage, modals,
notifications and a React Query client. Pass `app`, `data` and `files` when you
have them; a fallback query client is created in component state — never as a
module variable, because on the server one client shared between requests would
leak one user's cache to another.

## Publishing

Packages are intended for GitHub Packages under the `@liro` scope.

```powershell
pnpm changeset    # describe the change
pnpm release      # publish
```

**Nothing has been published yet.** All packages sit at `0.1.0`. The blocker is
the registry, not the code: on `npm.pkg.github.com` the scope must be the account
that owns the repository, and there is no `liro` organisation. See `HANDOFF.md`
section 9, which also describes how to verify that the `exports` maps work
outside the monorepo **without** a registry.

An application installing the packages needs an `.npmrc` with:

```
@liro:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Plan

- [x] **F0** — tokens and theme
- [x] **F1** — `@liro/i18n` and `@liro/ui`
- [x] **F2** — `@liro/data` and `@liro/data-supabase`
- [x] **F2b** — `@liro/forms`
- [x] **F3** — `@liro/templates` and the full `AppConfig`
- [x] **F4** — playground
- [x] **F5** — accessibility: 118 / 118, both themes
- [ ] **F6** — documentation in the GOV.UK pattern
- [ ] **F7** — internationalisation, 43 BCP-47 locales
- [ ] **F8** — migration of Liro Business App, `create-liro-app`

The reasoning behind F2, F2b and F3 is summarised in
[`docs/architecture.md`](docs/architecture.md).
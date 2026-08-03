# Liro Design System

Zajednički vizuelni sloj za sve Liro aplikacije — Liro Business App, Liro ERP, Liro CRM, Liro Payroll.

## Struktura

```
packages/
  tokens/    @liro/tokens   boje, tipografija, spacing, senke, motion
  theme/     @liro/theme    Mantine tema + globalni stilovi
  i18n/      @liro/i18n     lokalizovane labele i formatiranje
  ui/        @liro/ui       prezentacione komponente
  dates/     @liro/dates    datumi, obračunski periodi, rokovi
  charts/    @liro/charts   grafikoni sa Liro paletom i formatiranjem
  schedule/  @liro/schedule kalendar obračuna i rokova
  editor/    @liro/editor   bogati tekst i prikaz koda
  files/     @liro/files    prevlačenje i prikaz priloga
  process/   @liro/process  dijagrami procesa (React Flow)
  pdf/       @liro/pdf      pregled PDF-a i izbor pozicije pečata
  data/      @liro/data     adapter sloj i React kuke
  data-supabase/  @liro/data-supabase  Supabase implementacija
  forms/     @liro/forms    motor formi opisanih šemom
  templates/ @liro/templates  okvir aplikacije i gotove stranice
apps/
  playground/  živa dokumentacija (Next 16)
```

Naredni paket (`@liro/templates`) dolazi u sledećoj fazi.

## Zašto nema build koraka

Paketi objavljuju TypeScript izvorni kod, a ne kompajlirani `dist/`. Sve Liro
aplikacije su Next.js, pa Next preuzima kompajliranje preko `transpilePackages`.
Time nestaju tri klase problema: dupli ESM/CJS build, gubitak `'use client'`
direktiva pri bundlovanju, i source mape koje pokazuju u prazno.

Jedini generisani artefakt je `packages/tokens/src/styles/tokens.css`, koji se
pravi iz TypeScript definicija i commit-uje u repo.

## Razvoj

```powershell
pnpm install
pnpm dev            # playground na http://localhost:3100
pnpm tokens:build   # regeneriši tokens.css posle izmene tokena
pnpm typecheck
pnpm build
```

## Slojevi tokena

Tri sloja, i pravilo o tome ko sme šta da koristi:

| Sloj | Primer | Ko ga koristi |
| --- | --- | --- |
| Primitivi | `palette.blue[6]` | samo `semantic.ts` i Mantine tema |
| Semantički | `liroVar.text.secondary` | komponente |
| CSS varijable | `var(--liro-text-secondary)` | stilovi, CSS moduli |

Komponenta koja piše `#0078D4` ili `palette.blue[6]` prekršila je pravilo.
Piše `liroVar.brand.solid` — i time dobija dark režim besplatno.

## Korišćenje u aplikaciji

Instalacija:

```powershell
pnpm add @liro/theme @liro/tokens
```

`next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@liro/tokens', '@liro/theme'],
}

export default nextConfig
```

`src/app/layout.tsx`:

```tsx
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@liro/tokens/css'
import '@liro/theme/styles.css'
import './globals.css'

import { ColorSchemeScript } from '@mantine/core'
import { LiroThemeProvider } from '@liro/theme'
import { Space_Grotesk } from 'next/font/google'

const brandFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-brand',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={brandFont.variable}>
        <LiroThemeProvider>{children}</LiroThemeProvider>
      </body>
    </html>
  )
}
```

Redosled uvoza CSS-a je bitan: Mantine → tokeni → globalni stilovi → stilovi
aplikacije. Obrnut redosled znači da Mantine nadjačava tokene.

## Objavljivanje

Paketi idu na GitHub Packages pod `@liro` scope-om.

```powershell
pnpm changeset          # opiši izmenu
pnpm version-packages   # podigni verzije
pnpm release            # objavi
```

Aplikacija koja instalira pakete treba `.npmrc` sa:

```
@liro:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Plan

- [x] **F0** — tokeni i tema
- [x] **F1** — `@liro/i18n` i `@liro/ui` ([izmene API-ja](docs/migracija-f1.md))
- [x] **F2** — `@liro/data` i `@liro/data-supabase` ([opis](docs/adapter-f2.md))
- [x] **F2b** — `@liro/forms` ([opis](docs/forme-f2b.md))
- [x] **F3** — `@liro/templates` i pun `AppConfig` ([opis](docs/sabloni-f3.md))
- [x] **F4** — playground ([opis](docs/playground-f4.md))
- [ ] **F5** — migracija Liro Business App-a, `create-liro-app`

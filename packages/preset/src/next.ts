import type { NextConfig } from 'next'

/**
 * Spisak paketa koji se objavljuju kao TypeScript izvor, pa ih Next mora
 * kompajlirati zajedno sa aplikacijom.
 *
 * Ranije je ovaj niz stajao prepisan u svakoj aplikaciji. To znaci da se pri
 * dodavanju novog paketa moralo setiti da se dopise na tri-cetiri mesta - a
 * simptom zaborava nije greska nego tiho slomljen ekran.
 */
export const LIRO_PACKAGES = [
  '@liro/tokens',
  '@liro/theme',
  '@liro/i18n',
  '@liro/ui',
  '@liro/data',
  '@liro/data-supabase',
  '@liro/forms',
  '@liro/templates',
  '@liro/charts',
  '@liro/dates',
  '@liro/editor',
  '@liro/files',
  '@liro/pdf',
  '@liro/process',
  '@liro/schedule',
  '@liro/validators',
  '@liro/preset',
] as const

/**
 * Obmotava `next.config.ts` aplikacije.
 *
 * Pored `transpilePackages`, ukljucuje i `optimizePackageImports`. Bez toga
 * uvoz jedne komponente iz `@liro/ui` povlaci ceo barrel od ~190 izvoza u
 * klijentski paket.
 */
export function withLiro(config: NextConfig = {}): NextConfig {
  const existing = config.transpilePackages ?? []
  const experimental = config.experimental ?? {}

  return {
    ...config,
    transpilePackages: [...new Set([...existing, ...LIRO_PACKAGES])],
    experimental: {
      ...experimental,
      optimizePackageImports: [
        ...new Set([
          ...(experimental.optimizePackageImports ?? []),
          ...LIRO_PACKAGES,
          '@mantine/core',
          '@mantine/hooks',
          'lucide-react',
        ]),
      ],
    },
  }
}
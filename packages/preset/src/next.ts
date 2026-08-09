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
  '@liro/preset',
] as const

/**
 * Paketi po drzavi.
 * 
 * Nisu deo jezgra. Jezgro ih NE SME uvoziti - to je pravilo koje ESLint
 * sprovodi. Ovde stoje zato sto navodjenje u `transpilePackages` nije uvoz nego
 * uzorak za poredjenje sa putanjama: Next ga tiho preskoci ako paket nije
 * instaliran. Tako aplikacija koja ga instalira ne mora nista da dopisuje, a
 * ona koja ne instalira nista ne gubi
 */

export const LIRO_COUNTRY_PACKAGES = ['@liro/serbia'] as const

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
    transpilePackages: [...new Set([...existing, ...LIRO_PACKAGES, ...LIRO_COUNTRY_PACKAGES])],
    experimental: {
      ...experimental,
      optimizePackageImports: [
        ...new Set([
          ...(experimental.optimizePackageImports ?? []),
          ...LIRO_PACKAGES,
          ...LIRO_COUNTRY_PACKAGES,
          '@mantine/core',
          '@mantine/hooks',
          'lucide-react',
        ]),
      ],
    },
  }
}
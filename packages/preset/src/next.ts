import type { NextConfig } from 'next'

/**
 * List of packages published as TypeScript source, so Next must compile
 * them together with the application.
 *
 * This array used to be copy-pasted into every application. That meant that
 * adding a new package required remembering to add it in three or four
 * places — and the symptom of forgetting is not an error but a silently
 * broken screen.
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
 * Country packages.
 *
 * Not part of the core. The core must NOT import them — that is a rule
 * ESLint enforces. They are listed here because naming something in
 * `transpilePackages` is not an import but a pattern matched against paths:
 * Next silently skips it if the package is not installed. That way an
 * application that installs it does not have to add anything, and one that
 * does not install it loses nothing.
 */

export const LIRO_COUNTRY_PACKAGES = ['@liro/serbia'] as const

/**
 * Wraps the application's `next.config.ts`.
 *
 * Besides `transpilePackages`, it also includes `optimizePackageImports`.
 * Without it, importing one component from `@liro/ui` pulls the entire
 * barrel of ~190 exports into the client bundle.
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
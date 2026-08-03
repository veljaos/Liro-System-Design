import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /*
   * Paketi dizajn sistema se objavljuju kao TypeScript izvor, bez build koraka.
   * Next ih kompajlira zajedno sa aplikacijom - zato ovaj spisak. Isti mora da
   * stoji u svakoj Liro aplikaciji.
   */
  transpilePackages: [
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
    '@liro/schedule'
  ],
}

export default nextConfig
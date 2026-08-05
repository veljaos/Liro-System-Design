import { defineConfig } from 'vitest/config'

/**
 * Jedan konfiguracioni fajl za ceo monorepo.
 *
 * Testiraju se iskljucivo ciste funkcije - one koje tiho lome podatke i koje se
 * ne vide dok ne bude kasno. Komponente se proveravaju snimcima ekrana
 * (Playwright), ne jedinicnim testovima: DOM test komponente uglavnom proverava
 * da Mantine i dalje radi, sto nije nas posao.
 */
export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.ts'],
    environment: 'node',
    reporters: 'default',
  },
})
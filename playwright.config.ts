import { defineConfig, devices } from '@playwright/test'

/**
 * Vizuelna regresija i provera konzole nad katalogom.
 *
 * Radi nad PROIZVODNIM buildom, ne nad `dev` serverom: dev ubacuje HMR skripte
 * i sopstvena upozorenja, pa bi provera konzole prijavljivala sum umesto
 * gresaka.
 *
 * Snimci se NE porede u CI-ju. Renderovanje teksta se razlikuje izmedju
 * Windows-a i Linux-a, pa bi svaki snimak napravljen lokalno pao na serveru.
 * Kada zatreba i u CI-ju, resenje je Docker sa istom slikom - ne isключivanje
 * provere.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  /* Po ruti, ne po celom prolazu. Spora ruta vise ne obara ostale. */
  timeout: 45_000,
  workers: 4,
  retries: 0,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3100',
    viewport: { width: 1440, height: 900 },
    /* Isti jezik i sema u svakom pokretanju - inace snimci nisu uporedivi. */
    locale: 'sr-RS',
    colorScheme: 'light',
  },

  expect: {
    toHaveScreenshot: {
      /*
      * Antialiasing daje sitne razlike i bez ijedne izmene u kodu, a krive u
      * grafikonima najvise. 2% je prag ispod kojeg covek ne primeti razliku,
      * a iznad kojeg se pomak sigurno vidi.
      */
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'pnpm --filter @liro/playground exec next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
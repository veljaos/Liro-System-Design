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
    /* Isti jezik i sema u svakom pokretanju - inace snimci nisu uporedivi. */
    locale: 'sr-RS',
    colorScheme: 'light',
  },

  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      /*
      * Dva praga, svaki za svoju vrstu suma.
      * 
      * `threshold` je razlika PO PIKSELU u boji. Podrazumevanih 0.2 pokriva
      * antialiasing - sitno kolebanje na ivici slova ne prelazi tu granicu, a
      * stvarna promena boje je prelazi uvek.
      * 
      * `maxDiffPixelRatio` je koliko piksela sme da se razlikuje. Ranijih 2%
      * je bilo preveliko: promena boje svih dugmadi u sistemu je oko 0.07%
      * `fullPage` snimka, pa je prosla neprimeceno na svih 116 snimaka.
      * 
      * Krive u grafikonima se pokrivaju maskom, ne pragom.
      */
      threshold: 0.2,
      maxDiffPixelRatio: 0.001,
      animations: 'disabled',
    },
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], colorScheme: 'light' } },
    { name: 'chromium-dark', use: { ...devices['Desktop Chrome'], colorScheme: 'dark' } },
  ],
  webServer: {
    command: 'pnpm --filter @liro/playground exec next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
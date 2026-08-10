import { defineConfig, devices } from '@playwright/test'

/**
 * Visual regression and console checks over the catalog.
 *
 * Runs against the PRODUCTION build, not the `dev` server: dev injects HMR
 * scripts and its own warnings, so the console check would report noise
 * instead of errors.
 *
 * Snapshots are NOT compared in CI. Text rendering differs between Windows
 * and Linux, so every snapshot made locally would fail on the server. If it
 * is ever needed in CI too, the fix is Docker with the same image — not
 * turning the check off.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  /* Per route, not per whole run. A slow route no longer brings down the others. */
  timeout: 45_000,
  workers: 4,
  retries: 0,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:3100',
    /* Same language and scheme on every run — otherwise snapshots are not comparable. */
    locale: 'sr-RS',
    colorScheme: 'light',
  },

  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      /*
      * Two thresholds, each for its own kind of noise.
      *
      * `threshold` is the PER-PIXEL difference in color. The default 0.2
      * covers antialiasing — a slight wobble at a glyph's edge does not cross
      * that boundary, while a real color change always does.
      *
      * `maxDiffPixelRatio` is how many pixels are allowed to differ. The
      * earlier 2% was too large: a color change on every button in the system
      * is about 0.07% of a `fullPage` snapshot, so it passed unnoticed on all
      * 116 snapshots.
      *
      * Curves in charts are covered with a mask, not a threshold.
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
    /*
    * The build is part of starting the server, not an assumption.
    *
    * `next start` requires a ready `.next`, which is in `.gitignore` — so on a
    * fresh clone and on a CI runner it does not exist. Turbo caches the
    * build, so a repeat call finishes in a few seconds when nothing changed.
    *
    * With `reuseExistingServer`, this is skipped when `pnpm dev` is already
    * running on 3100.
    */
    command: 'pnpm build && pnpm --filter @liro/playground exec next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
import { test, type Page } from '@playwright/test'

/** CSS that stops every animation and transition on the page. */
export const NO_MOTION = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`

/** Routes that need longer to settle after the first paint. */
export const SLOW_TO_SETTLE = [
  '/category/charts',
  '/category/charts-advanced',
  '/category/form-inputs',
  '/category/stats',
  '/examples/dashboard',
  '/examples/report-run',
]

export function isDark(): boolean {
  return test.info().project.name.endsWith('-dark')
}

/**
 * Waits for the page to stop growing.
 *
 * A fixed wait does not work when data arrives through an adapter: 500 ms is
 * sometimes enough and sometimes not, so a `fullPage` snapshot ends up only
 * as tall as the window. That baseline then gets captured wrong and the test
 * becomes a coin flip.
 *
 * Two consecutive identical measurements mean rendering is done.
 */
async function waitForStableHeight(page: Page, timeout = 6000) {
  const startedAt = Date.now()
  let previous = -1

  while (Date.now() - startedAt < timeout) {
    const height = await page.evaluate(() => document.body.scrollHeight)
    if (height === previous && height > 0) return
    previous = height
    await page.waitForTimeout(250)
  }
}

/**
 * Loads a page ready for checking.
 *
 * Without `networkidle`: Next prefetches upcoming routes, so the network
 * often never settles. The theme is chosen by writing to `localStorage`
 * BEFORE the page's scripts run.
 */
export async function open(page: Page, route: string) {
  if (isDark()) {
    await page.addInitScript(() => {
      window.localStorage.setItem('mantine-color-scheme-value', 'dark')
    })
  }

  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({ content: NO_MOTION })
  await page.waitForTimeout(SLOW_TO_SETTLE.includes(route) ? 2500 : 500)
  await waitForStableHeight(page)
}
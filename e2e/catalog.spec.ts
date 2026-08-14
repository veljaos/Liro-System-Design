import { expect, test, type ConsoleMessage, type Page } from '@playwright/test'
import { CATEGORY_SLUGS, ROUTES } from './routes'
import { SLOW_TO_SETTLE, isDark, open } from './page'

/**
 * One test per route.
 *
 * Two things this test catches that no other check can:
 *
 * Console errors — above all a hydration mismatch. Such an error does not
 * fail the build or the typecheck; it is only seen if someone happens to open
 * the console.
 *
 * Visual shifts — a change to one token touches a hundred components at once.
 */

/** Messages that are not ours and mean nothing. */
const IGNORED = [
  'was preloaded using link preload',
  'Download the React DevTools',
  'favicon',
  'Failed to load resource',
]

function collectErrors(page: Page): string[] {
  const errors: string[] = []

  page.on('console', (message: ConsoleMessage) => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (IGNORED.some((pattern) => text.includes(pattern))) return
    errors.push(text)
  })

  /* An uncaught exception does not arrive through `console` — it is caught separately. */
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

  return errors
}

for (const route of ROUTES) {
  test(`no console errors: ${route}`, async ({ page }) => {
    test.skip(isDark(), 'checked in the light theme')

    const errors = collectErrors(page)
    await open(page, route)
    expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([])
  })
}

/*
 * Routes with virtualized lists.
 *
 * \`fullPage\` on a virtualized list is meaningless: content outside the
 * viewport does not exist in the DOM, so the snapshot differs on every run
 * depending on how many rows happened to be rendered. For these, only the
 * visible part is captured, which is stable.
 */
const VIRTUALIZED = ['/examples/table-large', '/examples/mass-processing']

for (const route of ROUTES) {
  test(`appearance unchanged: ${route}`, async ({ page }) => {
    await open(page, route)

    const name = `${route.replace(/^\//, '').replace(/\//g, '_') || 'home'}.png`
    await expect(page).toHaveScreenshot(name, {
      fullPage: !VIRTUALIZED.includes(route),
      /*
      * Only the curves are masked instead of excluding the route from the check.
      *
      * Recharts draws the SVG in several passes, and the final result differs
      * by a pixel or so from run to run. A test that sometimes fails and
      * sometimes passes is worse than none — you learn to skip it, and then
      * you miss the real error.
      *
      * We lose the check on the curves. We keep the titles, cards, legends,
      * axes, and the whole page layout — and that is exactly where a shift
      * becomes visible when a token changes.
      */
      mask: [
        /*
        * The today marker in `CapacityTimeline` is drawn from `new Date()`, so
        * the snapshot is valid for one day and fails every day after - and once
        * the demo range ends, it disappears and the snapshot fails forever.
        * 
        * Masked rather than removed from the demo: the marker is a feature of
        * the component and the catalog should show it.
        * 
        * The locator matches nothing on the other routes, which is fine - a
        * mask that finds no element is a no-op.
        */
        page.locator('[data-today-marker]'),
        ...(SLOW_TO_SETTLE.includes(route)
          ? [page.locator('.recharts-wrapper, .mantine-Chart-root, .recharts-responsive-container')]
          : []),
       ], 
    })
  })
}

test('route list matches navigation', async ({ page }) => {
  test.skip(isDark(), 'checked in the light theme')

  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)

  const hrefs = await page
    .locator('a[href^="/category/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))

  const found = [...new Set(hrefs)].map((href) => href.replace('/category/', '')).filter(Boolean)
  const missing = found.filter((slug) => !CATEGORY_SLUGS.includes(slug))

  expect(missing, `add to e2e/routes.ts: ${missing.join(', ')}`).toEqual([])
})
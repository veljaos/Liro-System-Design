import { expect, test, type ConsoleMessage, type Page } from '@playwright/test'
import { CATEGORY_SLUGS, ROUTES } from './routes'
import { SLOW_TO_SETTLE, isDark, open } from './page'

/**
 * Jedan test po ruti.
 *
 * Dve stvari koje ovaj test hvata, a nijedna druga provera ne moze:
 *
 * Greske u konzoli — pre svega neslaganje pri hidrataciji. Takva greska ne
 * obara ni build ni typecheck; vidi se samo ako neko slucajno otvori konzolu.
 *
 * Vizuelne pomake — izmena jednog tokena dodirne sto komponenti odjednom.
 */

/** Poruke koje nisu nase i ne znace nista. */
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

  /* Neuhvacen izuzetak ne stize kroz `console` — hvata se posebno. */
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))

  return errors
}

for (const route of ROUTES) {
  test(`bez grešaka u konzoli: ${route}`, async ({ page }) => {
    test.skip(isDark(), 'provereno u svetloj temi')

    const errors = collectErrors(page)
    await open(page, route)
    expect(errors, `greške u konzoli:\n${errors.join('\n')}`).toEqual([])
  })
}

/*
 * Rute sa virtuelizovanim listama.
 *
 * \`fullPage\` na virtuelizovanoj listi je besmislen: sadrzaj van vidnog polja
 * ne postoji u DOM-u, pa se snimak razlikuje pri svakom pokretanju u
 * zavisnosti od toga koliko se redova zateklo renderovano. Za njih se snima
 * samo vidljivi deo, koji jeste stabilan.
 */
const VIRTUALIZED = ['/examples/table-large', '/examples/mass-processing']

for (const route of ROUTES) {
  test(`izgled se nije promenio: ${route}`, async ({ page }) => {
    await open(page, route)

    const name = `${route.replace(/^\//, '').replace(/\//g, '_') || 'home'}.png`
    await expect(page).toHaveScreenshot(name, {
      fullPage: !VIRTUALIZED.includes(route),
      /*
      * Same krive se prekrivaju umesto da se ruta izuzme iz provere.
      *
      * Recharts iscrtava SVG u nekoliko prolaza i krajnji rezultat se razlikuje
      * za koji piksel od pokretanja do pokretanja. Test koji nekad padne a
      * nekad prodje je gori od nikakvog - naucis da ga preskacis, pa propustis
      * pravu gresku.
      *
      * Gubimo proveru krivih. Zadrzavamo naslove, kartice, legende, ose i ceo
      * raspored stranice - a bas se tu pomak i vidi kada se promeni token.
      */
      mask: SLOW_TO_SETTLE.includes(route)
      ? [page.locator('.recharts-wrapper, .mantine-Chart-root, .recharts-responsive-container')]
      : [],
    })
  })
}

test('spisak ruta prati navigaciju', async ({ page }) => {
  test.skip(isDark(), 'provereno u svetloj temi')
 
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(600)

  const hrefs = await page
    .locator('a[href^="/category/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))

  const found = [...new Set(hrefs)].map((href) => href.replace('/category/', '')).filter(Boolean)
  const missing = found.filter((slug) => !CATEGORY_SLUGS.includes(slug))

  expect(missing, `dopiši u e2e/routes.ts: ${missing.join(', ')}`).toEqual([])
})
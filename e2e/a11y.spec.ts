import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ROUTES } from './routes'
import { open } from './page'

/**
 * Provera pristupačnosti po WCAG 2.1 AA.
 *
 * `axe-core` je isti alat koji koriste revizori. Ne hvata sve — procenjuje se
 * da automatska provera nadje oko trecine problema — ali ono sto nadje su
 * cinjenice, ne misljenja: kontrast ispod praga, polje bez naziva, dugme bez
 * pristupacnog imena.
 *
 * Pokrece se odvojeno (`pnpm a11y`), ne uz vizuelnu proveru, jer traje duze i
 * jer se popravlja u talasima.
 *
 * Radi u OBE teme. Kontrast je jedino pravilo koje zavisi od boja, pa se
 * greska u tamnoj temi ne bi videla u svetloj.
 */

/**
 * Pravila koja su privremeno dozvoljena.
 *
 * Spisak se SKRACUJE, nikad ne produzava. Svaki upisan red je dug, a ne
 * odluka — uz njega mora stajati razlog i sta se ceka.
 */
const ALLOWED: string[] = [
]

const KNOWN: Record<string, string[]> = {
  '/category/schedule': ['color-contrast'], // dani van meseca u Mantine kalendaru
  '/category/messages': ['color-contrast'], // mehurici poruka — pozadina u primeru
  '/category/content-blocks': ['label'],    // skriveni input[type=file] u Dropzone
  '/category/overlays': ['aria-allowed-attr'], // Anchor kao okidac Popover-a
}

interface Finding {
  rule: string
  impact: string
  help: string
  elements: string[]
}

for (const route of ROUTES) {
  test(`pristupačnost: ${route}`, async ({ page }) => {
    await open(page, route)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const findings: Finding[] = results.violations
      .filter((violation) => !ALLOWED.includes(violation.id))
      .filter((violation) => !(KNOWN[route] ?? []).includes(violation.id))
      .map((violation) => ({
        rule: violation.id,
        impact: violation.impact ?? 'unknown',
        help: violation.help,
        /* Najvise tri primera po pravilu — ceo spisak zatrpa ispis. */
        elements: violation.nodes.slice(0, 3).map((node) => {
          const html = node.html.replace(/\s+/g, ' ').slice(0, 160)
          return `${node.target.join(' ')}\n    ${html}`
        }),
      }))

    const report = findings
      .map(
        (finding) =>
          `\n[${finding.impact}] ${finding.rule} — ${finding.help}\n  ${finding.elements.join('\n  ')}`,
      )
      .join('\n')

    expect(findings, `problemi pristupačnosti na ${route}:${report}`).toEqual([])
  })
}
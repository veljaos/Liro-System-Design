import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { ROUTES } from './routes'
import { open } from './page'

/**
 * Accessibility check per WCAG 2.1 AA.
 *
 * `axe-core` is the same tool auditors use. It does not catch everything —
 * an automated check is estimated to find about a third of problems — but
 * what it finds are facts, not opinions: contrast below the threshold, a
 * field with no name, a button with no accessible name.
 *
 * Run separately (`pnpm a11y`), not alongside the visual check, because it
 * takes longer and is fixed in waves.
 *
 * Runs in BOTH themes. Contrast is the only rule that depends on colors, so
 * an error in the dark theme would not show up in the light one.
 */

/**
 * Rules that are temporarily allowed.
 *
 * The list only SHRINKS, never grows. Every entry is a debt, not a decision —
 * it must be accompanied by a reason and what is being waited on.
 */
const ALLOWED: string[] = [
]

const KNOWN: Record<string, string[]> = {
  '/category/schedule': ['color-contrast'], // days outside the month in the Mantine calendar
  '/category/content-blocks': ['label'],    // hidden input[type=file] in Dropzone
  '/category/overlays': ['aria-allowed-attr'], // Anchor as the Popover trigger
}

interface Finding {
  rule: string
  impact: string
  help: string
  elements: string[]
}

for (const route of ROUTES) {
  test(`accessibility: ${route}`, async ({ page }) => {
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
        /* At most three examples per rule — the full list floods the output. */
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

    expect(findings, `accessibility problems on ${route}:${report}`).toEqual([])
  })
}
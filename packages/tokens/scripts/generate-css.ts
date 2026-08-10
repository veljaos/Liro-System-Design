/**
 * Generates `src/styles/tokens.css` from the TypeScript definitions.
 *
 * TS is the source of truth; CSS is a derived artifact committed so the
 * package works without a build step. Run `pnpm tokens:build` after every
 * token change.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { palette } from '../src/primitives/colors'
import { darkTokens, lightTokens } from '../src/semantic'
import { schemeCssVars, staticCssVars, toCssVarName } from '../src/css-var-names'

const here = dirname(fileURLToPath(import.meta.url))
const outFile = join(here, '..', 'src', 'styles', 'tokens.css')

function block(vars: Record<string, string>, indent = '  '): string {
  return Object.entries(vars)
    .map(([name, value]) => `${indent}${name}: ${value};`)
    .join('\n')
}

function paletteVars(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, ramp] of Object.entries(palette)) {
    ramp.forEach((value, index) => {
      out[toCssVarName(['palette', name, String(index)])] = value
    })
  }
  return out
}

const css = `/* Generated from packages/tokens/src - do not edit by hand. */
/* Run: pnpm tokens:build */

:root {
${block(paletteVars())}

${block(staticCssVars())}
}

:root,
[data-mantine-color-scheme='light'] {
${block(schemeCssVars(lightTokens, 'light'))}
}

[data-mantine-color-scheme='dark'] {
${block(schemeCssVars(darkTokens, 'dark'))}
}
`

mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, css, 'utf8')
console.log(`Written ${outFile}`)

/**
 * Generise `src/styles/tokens.css` iz TypeScript definicija.
 *
 * TS je izvor istine; CSS je izvedeni artefakt koji se commit-uje da bi paket
 * radio bez build koraka. Pokreni `pnpm tokens:build` posle svake izmene tokena.
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

const css = `/* Generisano iz packages/tokens/src - ne menjaj rucno. */
/* Pokreni: pnpm tokens:build */

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
console.log(`Upisano ${outFile}`)

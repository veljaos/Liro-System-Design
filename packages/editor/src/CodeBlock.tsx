'use client'

import { CodeHighlight, CodeHighlightTabs } from '@mantine/code-highlight'
import { liroVar } from '@liro/tokens'

/**
 * Prikaz koda.
 *
 * U poslovnoj aplikaciji ovo nije ukras - koristi se za XML prijave (PPP-PD,
 * PP OD-O), JSON odgovore SEF-a i tela zahteva u dnevniku integracija. Kada
 * nesto ne prodje, knjigovodja i programer gledaju isti ekran, pa citljivost
 * i mogucnost kopiranja nisu opciono.
 */

export interface CodeBlockProps {
  code: string
  language?: string
  /** Prikazuje brojeve linija - obavezno za XML koji se salje poreskoj. */
  withLineNumbers?: boolean
  /** Ogranicava visinu; duge datoteke dobijaju skrol umesto beskrajne stranice. */
  maxHeight?: number
  withCopyButton?: boolean
}

export function CodeBlock({
  code,
  language = 'xml',
  withLineNumbers = true,
  maxHeight = 420,
  withCopyButton = true,
}: CodeBlockProps) {
  return (
    <CodeHighlight
      code={code}
      language={language}
      withLineNumbers={withLineNumbers}
      withCopyButton={withCopyButton}
      radius="md"
      style={{
        maxHeight,
        overflow: 'auto',
        border: `1px solid ${liroVar.border.default}`,
      }}
    />
  )
}

export interface CodeTab {
  fileName: string
  code: string
  language?: string
}

/** Vise datoteka u karticama - npr. zahtev i odgovor jedne integracije. */
export function CodeBlockTabs({ tabs, maxHeight = 420 }: { tabs: CodeTab[]; maxHeight?: number }) {
  return (
    <CodeHighlightTabs
      code={tabs}
      withCopyButton
      radius="md"
      style={{ maxHeight, overflow: 'auto', border: `1px solid ${liroVar.border.default}` }}
    />
  )
}

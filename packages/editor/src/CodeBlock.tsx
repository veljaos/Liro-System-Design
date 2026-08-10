'use client'

import { CodeHighlight, CodeHighlightTabs } from '@mantine/code-highlight'
import { liroVar } from '@liro/tokens'

/**
 * Code display.
 *
 * In a business application this is not decoration — it is used for XML
 * filings (PPP-PD, PP OD-O), SEF's JSON responses, and request bodies in the
 * integration log. When something fails, the bookkeeper and the developer
 * look at the same screen, so readability and the ability to copy are not
 * optional.
 */

export interface CodeBlockProps {
  code: string
  language?: string
  /** Shows line numbers — required for XML sent to the tax authority. */
  withLineNumbers?: boolean
  /** Limits the height; long files get scroll instead of an endless page. */
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

/** Multiple files in tabs — e.g. the request and response of one integration. */
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

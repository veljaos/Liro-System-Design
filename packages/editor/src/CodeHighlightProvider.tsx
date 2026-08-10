'use client'

import { CodeHighlightAdapterProvider, createShikiAdapter } from '@mantine/code-highlight'
import type { ReactNode } from 'react'

/**
 * Code coloring.
 *
 * Without this, Mantine uses `plainTextAdapter` and the code is black — as
 * readable as terminal output. A two-hundred-line XML tax filing is not
 * readable that way.
 *
 * Shiki is loaded only when needed (`await import`), so it does not enter
 * the application's initial bundle. The themes follow the light and dark
 * scheme.
 */
const shikiAdapter = createShikiAdapter(async () => {
  const { createHighlighter } = await import('shiki')
  return createHighlighter({
    langs: ['tsx', 'typescript', 'javascript', 'json', 'xml', 'html', 'css', 'bash', 'sql'],
    themes: ['github-light', 'github-dark'],
  })
})

export function LiroCodeHighlightProvider({ children }: { children: ReactNode }) {
  return <CodeHighlightAdapterProvider adapter={shikiAdapter}>{children}</CodeHighlightAdapterProvider>
}

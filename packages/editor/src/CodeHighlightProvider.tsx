'use client'

import { CodeHighlightAdapterProvider, createShikiAdapter } from '@mantine/code-highlight'
import type { ReactNode } from 'react'

/**
 * Bojenje koda.
 *
 * Bez ovoga Mantine koristi `plainTextAdapter` i kod je crn - citljiv koliko i
 * ispis iz terminala. XML poreske prijave od dvesta linija se tako ne cita.
 *
 * Shiki se ucitava tek kada zatreba (`await import`), pa ne ulazi u pocetni
 * paket aplikacije. Teme prate svetlu i tamnu semu.
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

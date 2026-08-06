import { Box } from '@mantine/core'
import { liroVar } from '@liro/tokens'

/**
 * Blok sa kodom u dokumentaciji.
 *
 * Postoji kao komponenta a ne kao stil na licu mesta zato sto nosi tri stvari
 * koje se lako zaborave kad se blok prepise rukom:
 *
 *   `tabIndex` - `overflowX: auto` pravi oblast koju mis moze da pomeri a
 *   tastatura ne. To je `scrollable-region-focusable` po WCAG 2.1.
 *
 *   `role="group"` - `<pre>` je uloga `generic`, na kojoj `aria-label` NIJE
 *   dozvoljen. Bez uloge bi ime bilo prijavljeno kao `aria-prohibited-attr`.
 *   `group` prima ime a ne pravi orijentir - `region` bi napravio.
 *
 *   ime - bez njega je to mesto na koje tastatura stane a citac ekrana nema
 *   sta da procita.
 */
export function Snippet({ children, label = 'Primer koda' }: { children: string; label?: string }) {
  return (
    <Box
      component="pre"
      p="md"
      tabIndex={0}
      role="group"
      aria-label={label}
      style={{
        backgroundColor: liroVar.surface.sunken,
        border: `1px solid ${liroVar.border.default}`,
        borderRadius: 'var(--liro-radius-lg)',
        fontSize: 'var(--liro-font-size-sm)',
        fontFamily: 'var(--liro-font-mono)',
        overflowX: 'auto',
        margin: 0,
      }}
    >
      {children}
    </Box>
  )
}
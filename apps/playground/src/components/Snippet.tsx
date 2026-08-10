import { Box } from '@mantine/core'
import { liroVar } from '@liro/tokens'

/**
 * Code block in the documentation.
 *
 * Exists as a component rather than as an inline style because it carries
 * three things that are easily forgotten when the block is copied by hand:
 *
 *   `tabIndex` - `overflowX: auto` creates an area the mouse can scroll but
 *   the keyboard cannot. That is `scrollable-region-focusable` per WCAG 2.1.
 *
 *   `role="group"` - `<pre>` has the role `generic`, on which `aria-label`
 *   is NOT allowed. Without a role, the name would be reported as
 *   `aria-prohibited-attr`. `group` accepts a name without creating a
 *   landmark — `region` would.
 *
 *   a name - without it, this is a place the keyboard can land on while a
 *   screen reader has nothing to read.
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
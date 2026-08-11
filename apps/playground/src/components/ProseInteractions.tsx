'use client'

import { useEffect } from 'react'

/**
 * Copy buttons for code blocks in the documentation.
 *
 * The buttons are rendered by the server as part of the markdown HTML, so they
 * are present in the first paint and nothing shifts. This component only adds
 * behaviour, through ONE delegated listener rather than thirty-six.
 *
 * Renders nothing.
 */
export function ProseInteractions() {
  useEffect(() => {
    const root = document.querySelector('.liro-prose')
    if (!root) return

    const onClick = async (event: Event) => {
      const button = (event.target as HTMLElement).closest('.liro-code-copy')
      if (!(button instanceof HTMLButtonElement)) return

      const code = button.parentElement?.querySelector('code')?.textContent
      if (!code) return

      await navigator.clipboard.writeText(code)

      /*
       * The label changes, not just the icon.
       *
       * `aria-live="polite"` on the button means a screen reader announces the
       * new text; a purely visual change would tell a sighted user it worked and
       * leave everyone else guessing.
       */
      button.textContent = 'Copied'
      button.setAttribute('aria-label', 'Code copied')
      button.dataset.copied = 'true'

      window.setTimeout(() => {
        button.textContent = 'Copy'
        button.setAttribute('aria-label', 'Copy code')
        delete button.dataset.copied
      }, 2000)
    }

    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [])

  return null
}
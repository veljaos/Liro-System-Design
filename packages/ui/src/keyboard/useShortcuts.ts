'use client'

import { useEffect, useRef } from 'react'

export interface Shortcut {
  /** E.g. `'mod+n'`, `'shift+?'`, `'Escape'`. `mod` is Ctrl on Windows, Cmd on Mac. */
  keys: string
  handler: (event: KeyboardEvent) => void
  /**
   * By default, shortcuts do not trigger while focus is in an input field —
   * otherwise typing the letter "n" in a name would open a new record. Turn
   * this on only for shortcuts that must work during input too, like Escape
   * or Ctrl+S.
   */
  allowInInput?: boolean
  enabled?: boolean
}

function matches(event: KeyboardEvent, keys: string): boolean {
  const parts = keys.toLowerCase().split('+')
  const key = parts[parts.length - 1] ?? ''
  const needsMod = parts.includes('mod')
  const needsShift = parts.includes('shift')
  const needsAlt = parts.includes('alt')

  const modPressed = event.ctrlKey || event.metaKey
  if (needsMod !== modPressed) return false
  if (needsShift !== event.shiftKey) return false
  if (needsAlt !== event.altKey) return false

  return event.key.toLowerCase() === key
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

/**
 * Registers document-level shortcuts.
 *
 * Power users in bookkeeping work for hours without a mouse. Shortcuts are
 * therefore not an add-on but a primary way of working — and they must be
 * the same across all Liro applications, because the habit carries over
 * between products.
 */
export function useShortcuts(shortcuts: Shortcut[]): void {
  const ref = useRef(shortcuts)
  ref.current = shortcuts

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of ref.current) {
        if (shortcut.enabled === false) continue
        if (!shortcut.allowInInput && isTypingTarget(event.target)) continue
        if (!matches(event, shortcut.keys)) continue
        event.preventDefault()
        shortcut.handler(event)
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}

/**
 * Agreed-upon shortcuts for the whole system. A module introducing its own
 * shortcut should first check whether something with the same meaning
 * already exists here.
 */
export const STANDARD_SHORTCUTS = {
  newRecord: { keys: 'mod+n', display: ['Ctrl', 'N'] },
  save: { keys: 'mod+s', display: ['Ctrl', 'S'], allowInInput: true },
  search: { keys: 'mod+k', display: ['Ctrl', 'K'] },
  close: { keys: 'Escape', display: ['Esc'], allowInInput: true },
  edit: { keys: 'mod+e', display: ['Ctrl', 'E'] },
  print: { keys: 'mod+p', display: ['Ctrl', 'P'] },
  help: { keys: 'shift+?', display: ['Shift', '?'] },
  nextPage: { keys: 'alt+arrowright', display: ['Alt', '→'] },
  previousPage: { keys: 'alt+arrowleft', display: ['Alt', '←'] },
} as const

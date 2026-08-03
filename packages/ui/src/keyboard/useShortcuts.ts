'use client'

import { useEffect, useRef } from 'react'

export interface Shortcut {
  /** Npr. `'mod+n'`, `'shift+?'`, `'Escape'`. `mod` je Ctrl na Windows-u, Cmd na Mac-u. */
  keys: string
  handler: (event: KeyboardEvent) => void
  /**
   * Podrazumevano se precice ne okidaju dok je fokus u polju za unos - inace
   * bi kucanje slova "n" u imenu otvaralo novi zapis. Ukljuci samo za precice
   * koje moraju da rade i tokom unosa, kao Escape ili Ctrl+S.
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
 * Registruje precice na nivou dokumenta.
 *
 * Power korisnici u knjigovodstvu rade satima bez misa. Precice zato nisu
 * dodatak nego osnovni nacin rada - i moraju biti iste u svim Liro
 * aplikacijama, jer se navika prenosi izmedju proizvoda.
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
 * Dogovorene precice za ceo sistem. Modul koji uvodi svoju precicu treba prvo
 * da proveri da li ovde vec postoji nesto sa istim znacenjem.
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

'use client'

import { Kbd } from '@mantine/core'
import { Fragment } from 'react'

export interface ShortcutHintProps {
  /** Npr. `['Ctrl', 'N']` ili `['?']`. */
  keys: string[]
  /** Za prikaz unutar tamnog opisa, gde standardni Kbd nema kontrast. */
  inverted?: boolean
  size?: 'xs' | 'sm'
}

/**
 * Prikaz precice.
 *
 * Precice se prikazuju uvek kada postoje - korisnik koji radi ceo dan u
 * aplikaciji nauci one koje vidi, a nikada ne otkrije one koje su sakrivene u
 * dokumentaciji.
 */
export function ShortcutHint({ keys, inverted = false, size = 'xs' }: ShortcutHintProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, whiteSpace: 'nowrap' }}>
      {keys.map((key, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <span style={{ fontSize: 10, opacity: 0.6 }}>+</span>
          )}
          <Kbd
            size={size}
            style={
              inverted
                ? { backgroundColor: 'rgba(255,255,255,0.16)', color: 'inherit', borderColor: 'transparent' }
                : undefined
            }
          >
            {key}
          </Kbd>
        </Fragment>
      ))}
    </span>
  )
}

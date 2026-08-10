'use client'

import { Kbd } from '@mantine/core'
import { Fragment } from 'react'

export interface ShortcutHintProps {
  /** E.g. `['Ctrl', 'N']` or `['?']`. */
  keys: string[]
  /** For display inside a dark description, where the standard Kbd has no contrast. */
  inverted?: boolean
  size?: 'xs' | 'sm'
}

/**
 * Shortcut display.
 *
 * Shortcuts are shown whenever they exist - a user who works in the
 * application all day learns the ones they see, and never discovers the
 * ones hidden away in documentation.
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

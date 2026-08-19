'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Box } from '@mantine/core'
import { useI18n, type TranslationKey } from '@liro/i18n'

/**
 * Two panels with a divider the user drags.
 *
 * For a screen where two things are read together: a PDF on the left and the
 * form being filled from it on the right, a list beside a detail, a document
 * beside its journal entry.
 *
 * The point is that the SPLIT is the user's decision. One person wants to see
 * the whole document, the next wants a wide form, and neither is wrong - so the
 * component holds a ratio rather than a fixed width.
 */

const DIVIDER_LABEL: TranslationKey = 'ui.splitPanel.divider'

export interface SplitPanelProps {
  left: ReactNode
  right: ReactNode
  /** Starting share of the left panel, 0 to 1. */
  defaultRatio?: number
  /** Controlled ratio. With it, `onRatioChange` is required. */
  ratio?: number
  onRatioChange?: (ratio: number) => void
  /** How small either side may get, as a share. Stops a panel disappearing. */
  minRatio?: number
  height?: number | string
}

export function SplitPanel({
  left,
  right,
  defaultRatio = 0.5,
  ratio: controlled,
  onRatioChange,
  minRatio = 0.2,
  height = '100%',
}: SplitPanelProps) {
  const { t } = useI18n()
  const container = useRef<HTMLDivElement>(null)
  const [internal, setInternal] = useState(defaultRatio)
  const [dragging, setDragging] = useState(false)

  const ratio = controlled ?? internal

  const set = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, minRatio), 1 - minRatio)
      if (controlled === undefined) setInternal(clamped)
      onRatioChange?.(clamped)
    },
    [controlled, minRatio, onRatioChange],
  )

  /*
   * Pointer events, not mouse events.
   *
   * `setPointerCapture` keeps the drag working when the cursor leaves the
   * divider - which it always does, because the user drags faster than the
   * layout follows. With mouse events the drag silently stops mid-way.
   *
   * It also covers touch and pen without a second code path.
   */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !container.current) return
    const box = container.current.getBoundingClientRect()
    set((event.clientX - box.left) / box.width)
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(false)
  }

  /*
   * While dragging, text selection is disabled on the whole document.
   *
   * Without it the drag selects every paragraph it passes over, and the user
   * ends up with half the page highlighted. Set on `body` rather than on the
   * panels, because the pointer capture means the move events keep arriving
   * even when the cursor is outside them.
   */
  useEffect(() => {
    if (!dragging) return
    const previous = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.userSelect = previous
    }
  }, [dragging])

  /*
   * The keyboard moves the divider too.
   *
   * A divider that only responds to a mouse is a control a keyboard user cannot
   * reach at all - and unlike a button, there is no other way to do the same
   * thing. `Home` and `End` go to the limits, `Enter` returns to the middle.
   */
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.02

    if (event.key === 'ArrowLeft') set(ratio - step)
    else if (event.key === 'ArrowRight') set(ratio + step)
    else if (event.key === 'Home') set(minRatio)
    else if (event.key === 'End') set(1 - minRatio)
    else if (event.key === 'Enter') set(0.5)
    else return

    event.preventDefault()
  }

  return (
    <Box ref={container} style={{ display: 'flex', height, minHeight: 0, width: '100%' }}>
      <Box style={{ width: `${ratio * 100}%`, minWidth: 0, overflow: 'auto' }}>{left}</Box>

      {/*
        `role="separator"` with `aria-valuenow` is the pattern for a resizable
        divider. Without the value, a screen reader announces a separator that
        moves and never says where it is.
      */}
      <Box
        className="liro-split-divider"
        role="separator"
        aria-orientation="vertical"
        aria-label={t(DIVIDER_LABEL)}
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={Math.round(minRatio * 100)}
        aria-valuemax={Math.round((1 - minRatio) * 100)}
        tabIndex={0}
        data-dragging={dragging || undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onKeyDown={onKeyDown}
      />

      <Box style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{right}</Box>
    </Box>
  )
}
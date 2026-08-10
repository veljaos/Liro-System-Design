'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Box, Group, Text, UnstyledButton } from '@mantine/core'
import { ListTree } from 'lucide-react'
import { liroVar } from '@liro/tokens'
import { useI18n, type LocalizedLabel } from '@liro/i18n'

/**
 * List of headings on the page, sticky to the side.
 *
 * Tracks scroll position. This is not decoration — a list that only shows the
 * last CLICKED heading fails to answer the question it exists for: where am I
 * right now.
 */

const ON_THIS_PAGE: LocalizedLabel = {
  sr: 'Na ovoj stranici',
  'sr-Cyrl': 'На овој страници',
  en: 'On this page',
}

export interface TocItem {
  /** `id` of the heading on the page. Must exist in the DOM. */
  id: string
  title: string
  /** Indentation level. 1 is the default. */
  level?: 1 | 2
}

export interface TableOfContentsProps {
  items: TocItem[]
  label?: LocalizedLabel
  /** Offset from the top for the sticky position. Account for the header height. */
  top?: number
  width?: number
  /**
   * Tracks scroll position via `IntersectionObserver`.
   *
   * Turn off when the headings from `items` are NOT on the page — in the
   * catalog, in an example, in the component's own documentation. In that
   * case the observer would look for an `id` that does not exist and the list
   * would be left with no active item.
   */
  trackScroll?: boolean
}

export function TableOfContents({
  items,
  label,
  top = 80,
  width = 200,
  trackScroll = true,
}: TableOfContentsProps) {
  const { t } = useI18n()
  const [active, setActive] = useState<string | null>(null)
  const headingId = useId()

  /*
  * A click locks tracking.
  *
  * The document's last sections fit in the final screen, so a click on any of
  * them scrolls the page to the bottom — and the bottom rule would override
  * what the person actually clicked. Without this, those items could not be
  * selected at all.
  *
  * Unlocks when the user THEMSELVES scrolls the page, not on a timer: a timer
  * would jump to the bottom after half a second anyway, and that reads as a jolt.
  */
  const lockedRef = useRef(false)

  /*
   * The dependency is the ARRAY OF IDs joined into a string, not `items`.
   *
   * `items` is an array the parent creates on every render, so an effect with
   * it in the dependencies would create and tear down the observer on every
   * render. This is the same mistake already made twice in this repo — the
   * chart formatters and `rowId` in `ResourceTable`.
   */
  const key = items.map((item) => item.id).join('|')

  useEffect(() => {
    if (!trackScroll || items.length === 0) return

    const ids = items.map((item) => item.id)
    let frame = 0

    const update = () => {
      frame = 0

      if (lockedRef.current) return

      /*
      * The bottom of the page is a special case, not an edge.
      *
      * The document's last headings stay on the final screen and never reach
      * the top — the page stops scrolling before that. Without this rule, the
      * active item stays whichever one last managed to pass, so the last two
      * or three never get their turn. Moving the threshold does not fix this:
      * wherever you place it, the last few items stay below it.
      */
     const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2

    if (atBottom) {
      /*
      * The last heading that ENTERED the screen, not blindly the last one in
      * the array — the page can end with content that has no heading.
      */
      let lastVisible: string | null = null
      for (const id of ids) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top < window.innerHeight) lastVisible = id
      }
      setActive(lastVisible ?? ids[ids.length - 1] ?? null)
      return
    }

    /*
    * The active one is the LAST heading that crossed the threshold, not the
    * first visible one. `break` is correct because the items are in document
    * order, so the first one that has not crossed means none after it have
    * either.
    */
    let current: string | null = null
    for (const id of ids) {
      const element = document.getElementById(id)
      if (!element) continue
      if (element.getBoundingClientRect().top > top + 8) break
      current = id
    }

    setActive(current ?? ids[0] ?? null)
  }

  /*
  * `requestAnimationFrame` as a gate: without it, `getBoundingClientRect`
  * would be called for every heading on every scroll event. That is a layout
  * measurement, the most expensive thing you can do in that loop.
  */
  const onScroll = () => {
    if (frame) return
    frame = requestAnimationFrame(update)
  }

  /* Only movement that comes from the person unlocks tracking. The `scroll`
    event does not serve that purpose — a click on an item triggers it too. */
  const unlock = () => {
    lockedRef.current = false
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  window.addEventListener('wheel', unlock, { passive: true })
  window.addEventListener('touchmove', unlock, { passive: true })
  window.addEventListener('keydown', unlock)

  return () => {
    if (frame) cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    window.removeEventListener('wheel', unlock)
    window.removeEventListener('touchmove', unlock)
    window.removeEventListener('keydown', unlock)
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [key, top, trackScroll])

  if (items.length === 0) return null

  return (
    <Box
      component="nav"
      visibleFrom="lg"
      /* A named landmark. The page already has an `AppShell.Navbar`, and a
         screen reader cannot tell apart two unnamed `<nav>` elements. */
      aria-labelledby={headingId}
      style={{ position: 'sticky', top, width, flexShrink: 0, alignSelf: 'flex-start' }}
    >
      <Group gap={6} mb={8} wrap="nowrap">
        <ListTree size={14} aria-hidden style={{ color: liroVar.text.tertiary, flexShrink: 0 }} />
        <Text
          id={headingId}
          size="xs"
          fw={700}
          style={{
            color: liroVar.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: 'var(--liro-tracking-caps)',
          }}
        >
          {t(label ?? ON_THIS_PAGE)}
        </Text>
      </Group>

      {items.map((item) => {
        const isActive = active === item.id

        return (
          <UnstyledButton
            key={item.id}
            component="a"
            href={`#${item.id}`}
            onClick={() => {
              lockedRef.current = true
              setActive(item.id)
            }}
            /* `location`, not `page`: the item leads to a part of THIS page,
               not to another page. */
            aria-current={isActive ? 'location' : undefined}
            style={{
              display: 'block',
              padding: item.level === 2 ? '4px 0 4px 24px' : '4px 0 4px 12px',
              borderLeft: `2px solid ${isActive ? liroVar.brand.solid : liroVar.border.default}`,
              fontSize: 'var(--liro-font-size-sm)',
              color: isActive ? liroVar.text.brand : liroVar.text.secondary,
              fontWeight: isActive ? 600 : 400,
            }}
          >
            {item.title}
          </UnstyledButton>
        )
      })}
    </Box>
  )
}
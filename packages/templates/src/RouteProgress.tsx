'use client'

import { NavigationProgress, nprogress } from '@mantine/nprogress'
import { useEffect, useRef } from 'react'
import { INTENT_FAMILY_COLOR } from '@liro/tokens'

/**
 * Progress bar on page navigation.
 *
 * Next shows `loading.tsx` only once the new route starts loading, and
 * between the click and that moment there is no feedback at all. On a
 * slower connection that is half a second in which the user does not know
 * whether the click registered — so they click again.
 *
 * The application passes `pathname` from its router; the bar starts on
 * change and finishes when the new page mounts.
 */
export function RouteProgress({ pathname }: { pathname: string }) {
  const previous = useRef(pathname)

  useEffect(() => {
    if (previous.current !== pathname) {
      previous.current = pathname
      nprogress.complete()
    }
  }, [pathname])

  return <NavigationProgress color={INTENT_FAMILY_COLOR.primary} size={2} />
}

/** Starts the bar manually — call it on a link click or before a long action. */
export const startRouteProgress = () => nprogress.start()
export const completeRouteProgress = () => nprogress.complete()

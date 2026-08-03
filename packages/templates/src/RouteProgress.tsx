'use client'

import { NavigationProgress, nprogress } from '@mantine/nprogress'
import { useEffect, useRef } from 'react'
import { INTENT_FAMILY_COLOR } from '@liro/tokens'

/**
 * Traka napretka pri promeni stranice.
 *
 * Next prikazuje `loading.tsx` tek kada nova ruta pocne da se ucitava, a
 * izmedju klika i tog trenutka nema nikakve povratne informacije. Na sporijoj
 * vezi to je pola sekunde u kojoj korisnik ne zna da li je klik registrovan -
 * pa klikne ponovo.
 *
 * Aplikacija prosledjuje `pathname` iz svog rutera; traka krene na promenu i
 * zavrsi kada se nova stranica montira.
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

/** Pokrece traku rucno - pozovi pri kliku na link ili pre duge radnje. */
export const startRouteProgress = () => nprogress.start()
export const completeRouteProgress = () => nprogress.complete()

import { test, type Page } from '@playwright/test'

/** CSS koji zaustavlja svaku animaciju i prelaz na stranici. */
export const NO_MOTION = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    scroll-behavior: auto !important;
  }
`

/** Rute kojima treba duze da se smire posle prvog iscrtavanja. */
export const SLOW_TO_SETTLE = [
  '/category/charts',
  '/category/charts-advanced',
  '/category/form-inputs',
  '/category/stats',
  '/examples/dashboard',
  '/examples/report-run',
]

export function isDark(): boolean {
  return test.info().project.name.endsWith('-dark')
}

/**
 * Ucitavanje stranice spremne za proveru.
 *
 * Bez `networkidle`: Next unapred dovlaci naredne rute, pa se mreza cesto
 * nikada ne smiri. Tema se bira upisom u `localStorage` PRE skripti stranice.
 */
export async function open(page: Page, route: string) {
  if (isDark()) {
    await page.addInitScript(() => {
      window.localStorage.setItem('mantine-color-scheme-value', 'dark')
    })
  }

  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({ content: NO_MOTION })
  await page.waitForTimeout(SLOW_TO_SETTLE.includes(route) ? 2500 : 500)
}
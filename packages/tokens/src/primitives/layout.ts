/**
 * Breakpoint-i prate Mantine podrazumevane vrednosti (em, ne px) da ne bismo
 * imali dva razlicita sistema tacaka preloma u istoj aplikaciji.
 */
export const breakpoint = {
  xs: '36em',
  sm: '48em',
  md: '62em',
  lg: '75em',
  xl: '88em',
} as const

/** Fiksne visine hroma aplikacije - koriste ih i layout i sticky elementi. */
export const size = {
  headerHeight: '56px',
  navbarWidth: '260px',
  navbarWidthCollapsed: '64px',
  contentMaxWidth: '1440px',
  controlHeight: '36px',
  controlHeightSm: '30px',
} as const

/**
 * Jedna skala z-indeksa za ceo sistem. Ako negde zatreba broj koji nije ovde,
 * to je znak da je struktura layouta pogresna - ne da fali token.
 */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 100,
  header: 200,
  drawer: 300,
  modal: 400,
  popover: 500,
  toast: 600,
  tooltip: 700,
} as const

export const layout = { breakpoint, size, zIndex } as const

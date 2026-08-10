/**
 * Breakpoints follow Mantine's default values (em, not px) so we don't end
 * up with two different breakpoint systems in the same application.
 */
export const breakpoint = {
  xs: '36em',
  sm: '48em',
  md: '62em',
  lg: '75em',
  xl: '88em',
} as const

/** Fixed chrome heights for the application - used by both layout and sticky elements. */
export const size = {
  headerHeight: '56px',
  navbarWidth: '260px',
  navbarWidthCollapsed: '64px',
  contentMaxWidth: '1440px',
  controlHeight: '36px',
  controlHeightSm: '30px',
} as const

/**
 * A single z-index scale for the whole system. If a number is ever needed
 * that isn't here, that's a sign the layout structure is wrong - not that a
 * token is missing.
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

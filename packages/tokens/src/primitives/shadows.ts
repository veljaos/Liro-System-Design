/**
 * Senke. Fluent pristup: povrsine su ravne dok se ne pomeraju.
 * Sve preko `lg` znaci da element lebdi iznad stranice (modal, dropdown).
 */
export const shadow = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.06)',
  sm: '0 1px 4px rgba(0, 0, 0, 0.08)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.10)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.14)',
} as const

/** Iste senke u dark rezimu moraju biti dublje da bi se uopste videle. */
export const shadowDark = {
  none: 'none',
  xs: '0 1px 2px rgba(0, 0, 0, 0.35)',
  sm: '0 1px 4px rgba(0, 0, 0, 0.40)',
  md: '0 2px 8px rgba(0, 0, 0, 0.45)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.50)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.60)',
} as const

export type ShadowKey = keyof typeof shadow
